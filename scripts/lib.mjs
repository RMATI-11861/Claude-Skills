// Shared helpers for the repo scripts.
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Parses "--key value" pairs and bare "--flag" switches.
export function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i].replace(/^--/, '');
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = value;
      i += 1;
    }
  }
  return options;
}

export function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}

export function copyFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'claude-skills-eval-'));
  cpSync(join(ROOT, 'evals', 'fixture'), dir, { recursive: true });
  return dir;
}

export function removeDir(dir) {
  rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
}

// Variables that bind a process to the parent Claude Code session (SDK, IDE bridge, nesting guard).
const PARENT_SESSION_VARS = /^(CLAUDECODE$|CLAUDE_CODE_|CLAUDE_AGENT_SDK_|CLAUDE_PID$|MCP_CONNECTION_NONBLOCKING$)/;

export function childEnv(extra = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (PARENT_SESSION_VARS.test(key)) delete env[key];
  }
  return { ...env, DISABLE_AUTOUPDATER: '1', ...extra };
}

// Runs one headless Claude Code session and returns its parsed stream-json events.
export function runClaude(prompt, flags, { cwd, env, timeoutMs = 900_000 }) {
  const child = spawnSync('claude', ['-p', prompt, ...flags], {
    cwd,
    env,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    timeout: timeoutMs,
    windowsHide: true,
  });
  if (child.error) throw new Error(`claude did not run: ${child.error.message}`);
  const run = parseStream(child.stdout);
  run.stderr = run.result ? '' : child.stderr.slice(-2000);
  return run;
}

export function parseStream(stdout) {
  const run = { init: null, result: null, skills: [] };
  for (const line of stdout.split('\n')) {
    if (!line.startsWith('{')) continue;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event.type === 'system' && event.subtype === 'init') run.init = event;
    if (event.type === 'result') run.result = event;
    if (event.type !== 'assistant') continue;
    for (const block of event.message?.content ?? []) {
      if (block.type === 'tool_use' && block.name === 'Skill') run.skills.push(String(block.input?.skill ?? ''));
    }
  }
  return run;
}

// "/xlsx" and "anthropic-skills:xlsx" both compare as "xlsx".
export const skillBaseName = (name) => name.replace(/^\//, '').split(':').pop();

export function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function saveResults(prefix, data) {
  const dir = join(ROOT, 'evals', 'results');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${prefix}-${timestamp()}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return file;
}
