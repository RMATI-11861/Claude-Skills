#!/usr/bin/env node
// Checks which skill Claude invokes first for each prompt in evals/triggers.json.
// Usage: node scripts/eval-triggers.mjs [--skill <name>] [--model opus] [--effort high] [--budget 0.5] [--no-retry]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, childEnv, copyFixture, parseArgs, removeDir, runClaude, saveResults, skillBaseName } from './lib.mjs';

const options = parseArgs(process.argv.slice(2));
const model = options.model ?? 'opus';
const effort = options.effort ?? 'high';
const budget = String(options.budget ?? '0.5');
const cases = JSON.parse(readFileSync(join(ROOT, 'evals', 'triggers.json'), 'utf8'))
  .filter((testCase) => !options.skill || testCase.expect === options.skill);

// Read-only tools stay allowed so Claude can look around before choosing a skill, as in a real session;
// edits and shell commands are denied. The variadic --allowedTools must stay last.
const FLAGS = [
  '--model', model, '--effort', effort, '--permission-mode', 'dontAsk', '--max-turns', '5',
  '--max-budget-usd', budget, '--no-session-persistence', '--output-format', 'stream-json', '--verbose',
  '--allowedTools', 'Skill', 'Read', 'Glob', 'Grep',
];

function attempt(testCase) {
  const cwd = copyFixture();
  try {
    const run = runClaude(testCase.prompt, FLAGS, { cwd, env: childEnv() });
    const invoked = run.skills.map(skillBaseName);
    const pass = testCase.expect === 'none' ? invoked.length === 0 : invoked[0] === testCase.expect;
    return {
      pass,
      skills: run.skills,
      cost: run.result?.total_cost_usd ?? 0,
      version: run.init?.claude_code_version ?? null,
      error: run.stderr || null,
    };
  } finally {
    removeDir(cwd);
  }
}

const report = [];
let totalCost = 0;
for (const testCase of cases) {
  const attempts = [attempt(testCase)];
  if (!attempts[0].pass && !options['no-retry']) attempts.push(attempt(testCase), attempt(testCase));
  const passes = attempts.filter((result) => result.pass).length;
  const pass = passes * 2 > attempts.length;
  const cost = attempts.reduce((sum, result) => sum + result.cost, 0);
  totalCost += cost;
  report.push({ ...testCase, pass, passes, attempts });
  const got = attempts.map((result) => `[${result.skills.join(', ') || 'none'}]`).join(' ');
  console.log(`${pass ? 'PASS' : 'FAIL'} ${passes}/${attempts.length}  expect=${testCase.expect}  got=${got}  $${cost.toFixed(2)}  ${testCase.prompt.slice(0, 60)}`);
  for (const result of attempts.filter((item) => item.error)) console.log(`     no result: ${result.error.trim().split('\n').pop()}`);
}

const failed = report.filter((entry) => !entry.pass).length;
const file = saveResults('triggers', { model, effort, report });
console.log(`\n${report.length - failed}/${report.length} passed, cost $${totalCost.toFixed(2)}, details in ${file}`);
process.exitCode = failed ? 1 : 0;
