#!/usr/bin/env node
// Compares token use on fixed tasks with the layers off ("base") and on ("installed").
// Usage: node scripts/bench-tokens.mjs [--runs 3] [--model opus] [--effort high] [--budget 2] [--max-total 20]
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  ROOT, childEnv, copyFixture, median, parseArgs, removeDir, runClaude, saveResults, skillBaseName,
} from './lib.mjs';

const options = parseArgs(process.argv.slice(2));
const runs = Number(options.runs ?? 3);
const model = options.model ?? 'opus';
const effort = options.effort ?? 'high';
const budget = String(options.budget ?? '2');
const maxTotal = Number(options['max-total'] ?? 20);

const REPO_SKILLS = readdirSync(join(ROOT, 'skills'));
const TASKS = [
  {
    id: 'fix',
    prompt: 'O total do carrinho ignora o desconto. Corrija o bug e rode os testes.',
    check: (tests) => tests.fail === 0 && tests.pass >= 3,
  },
  { id: 'explain', prompt: 'Explique o que src/cart.js faz.', check: null },
  {
    id: 'feature',
    prompt: 'Adicione validação em addItem (quantidade inteira positiva e preço não negativo) com testes. Não mexa em total.',
    check: (tests) => tests.pass >= 4 && tests.fail <= 1,
  },
];
const ARMS = {
  base: {
    settings: { outputStyle: 'default', skillOverrides: Object.fromEntries(REPO_SKILLS.map((name) => [name, 'off'])) },
    env: { CLAUDE_CODE_DISABLE_CLAUDE_MDS: '1' },
    style: 'default',
  },
  installed: { settings: { outputStyle: 'Concise' }, env: {}, style: 'Concise' },
};
// Commands the agent may run in the throwaway fixture copy. The variadic --allowedTools must stay last.
const ALLOWED_TOOLS = [
  'Skill', 'Bash(node *)', 'Bash(npm *)', 'Bash(tail *)', 'Bash(head *)', 'Bash(grep *)',
  'PowerShell(node *)', 'PowerShell(npm *)', 'PowerShell(Select-Object *)', 'PowerShell(Select-String *)',
  'PowerShell(Get-Content *)',
];

const settingsDir = mkdtempSync(join(tmpdir(), 'claude-skills-bench-'));
for (const [name, arm] of Object.entries(ARMS)) {
  arm.file = join(settingsDir, `${name}.json`);
  writeFileSync(arm.file, JSON.stringify(arm.settings), 'utf8');
}

const flagsFor = (arm) => [
  '--model', model, '--effort', effort, '--permission-mode', 'acceptEdits', '--settings', arm.file,
  '--max-turns', '30', '--max-budget-usd', budget, '--no-session-persistence', '--output-format', 'stream-json',
  '--verbose', '--allowedTools', ...ALLOWED_TOOLS,
];

function testCounts(cwd) {
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap'], { cwd, encoding: 'utf8' });
  const count = (label) => Number(new RegExp(`^# ${label} (\\d+)`, 'm').exec(run.stdout)?.[1] ?? 0);
  return { pass: count('pass'), fail: count('fail') };
}

function measure(task, armName) {
  const arm = ARMS[armName];
  const cwd = copyFixture();
  try {
    const run = runClaude(task.prompt, flagsFor(arm), { cwd, env: childEnv(arm.env) });
    const result = run.result ?? {};
    const usage = result.usage ?? {};
    const perModel = Object.values(result.modelUsage ?? {});
    const tests = testCounts(cwd);
    return {
      task: task.id,
      arm: armName,
      version: run.init?.claude_code_version ?? null,
      style: run.init?.output_style ?? null,
      repoSkillsListed: (run.init?.skills ?? []).filter((name) => REPO_SKILLS.includes(skillBaseName(name))).length,
      skillsInvoked: run.skills,
      outputTokens: perModel.reduce((sum, entry) => sum + (entry.outputTokens ?? 0), 0) || (usage.output_tokens ?? 0),
      inputTokens: (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0),
      cost: result.total_cost_usd ?? 0,
      turns: result.num_turns ?? 0,
      denials: (result.permission_denials ?? []).length,
      subtype: result.subtype ?? 'no-result',
      tests,
      checkPassed: task.check ? task.check(tests) : null,
    };
  } finally {
    removeDir(cwd);
  }
}

const samples = [];
let spent = 0;
runLoop: for (let round = 1; round <= runs; round += 1) {
  for (const task of TASKS) {
    for (const armName of Object.keys(ARMS)) {
      if (spent >= maxTotal) {
        console.log(`stopped: spent $${spent.toFixed(2)}, limit --max-total ${maxTotal}`);
        break runLoop;
      }
      const sample = measure(task, armName);
      spent += sample.cost;
      samples.push(sample);
      console.log(`round ${round} ${task.id.padEnd(8)}${armName.padEnd(10)}out=${sample.outputTokens} in=${sample.inputTokens} `
        + `$${sample.cost.toFixed(3)} turns=${sample.turns} style=${sample.style} denials=${sample.denials} ${sample.subtype}`);
    }
  }
}
removeDir(settingsDir);

// Discard runs that were blocked, cut short or ran on a different CLI version than the first.
const version = samples.find((sample) => sample.version)?.version;
const valid = samples.filter((sample) => sample.denials === 0 && sample.version === version && sample.subtype === 'success');
const isolation = samples.filter((sample) => sample.style !== ARMS[sample.arm].style
  || (sample.arm === 'base' && sample.repoSkillsListed > 0));

const percent = (now, before) => `${now >= before ? '+' : ''}${(((now - before) / before) * 100).toFixed(0)}%`;
const rows = [];
for (const task of TASKS) {
  for (const armName of Object.keys(ARMS)) {
    const group = valid.filter((sample) => sample.task === task.id && sample.arm === armName);
    const checked = group.filter((sample) => sample.checkPassed !== null);
    rows.push({
      task: task.id,
      arm: armName,
      runs: group.length,
      outputTokens: median(group.map((sample) => sample.outputTokens)),
      inputTokens: median(group.map((sample) => sample.inputTokens)),
      cost: median(group.map((sample) => sample.cost)),
      turns: median(group.map((sample) => sample.turns)),
      checks: checked.length ? `${checked.filter((sample) => sample.checkPassed).length}/${checked.length}` : 'n/a',
    });
  }
}

const cell = (value, width, digits = 0) => (value === null ? '-' : value.toFixed(digits)).padEnd(width);
console.log('\ntask    arm       runs out_tok  in_tok    cost    turns checks');
for (const row of rows) {
  console.log(`${row.task.padEnd(8)}${row.arm.padEnd(10)}${String(row.runs).padEnd(5)}${cell(row.outputTokens, 9)}`
    + `${cell(row.inputTokens, 10)}${cell(row.cost, 8, 3)}${cell(row.turns, 6)}${row.checks}`);
}
for (const task of TASKS) {
  const base = rows.find((row) => row.task === task.id && row.arm === 'base');
  const installed = rows.find((row) => row.task === task.id && row.arm === 'installed');
  if (base.outputTokens && installed.outputTokens) {
    console.log(`${task.id}: output tokens ${percent(installed.outputTokens, base.outputTokens)}, cost ${percent(installed.cost, base.cost)}`);
  }
}
console.log(`\nvalid runs ${valid.length}/${samples.length} (discarded: denials, version change or no success), spent $${spent.toFixed(2)}`);
if (isolation.length) console.log(`warning: ${isolation.length} runs did not get the intended arm (check style and skills in the results file)`);
console.log(`details in ${saveResults('bench', { model, effort, version, rows, samples })}`);
