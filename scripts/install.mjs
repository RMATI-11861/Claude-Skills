#!/usr/bin/env node
// Installs the always-on layers into the user's Claude Code config: the CLAUDE.md block,
// the machine facts, the path rules, outputStyle and skillOverrides.
// Dry run by default. --apply writes, keeping a timestamped backup of every file it changes.
// --force replaces an outputStyle the user already chose. Skills are installed with the skills CLI.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { ROOT, timestamp } from './lib.mjs';

const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR?.trim() || join(homedir(), '.claude');
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const BEGIN = '<!-- claude-skills:begin -->';
const END = '<!-- claude-skills:end -->';
const MACHINE_MARK = '<!-- claude-skills:machine (edit freely; install never rewrites this section) -->';

const readLf = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const readIfExists = (file) => (existsSync(file) ? readLf(file) : null);

function claudeMdChange() {
  const file = join(CLAUDE_DIR, 'CLAUDE.md');
  const block = `${BEGIN}\n${readLf(join(ROOT, 'claude-md', 'global.md')).trim()}\n${END}`;
  let text = readIfExists(file) ?? '';
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start === -1 && end === -1) {
    text = text.trim() ? `${text.trimEnd()}\n\n${block}\n` : `${block}\n`;
  } else if (start !== -1 && end > start) {
    text = text.slice(0, start) + block + text.slice(end + END.length);
  } else {
    throw new Error(`${file} has unbalanced claude-skills markers; fix them by hand`);
  }
  if (!text.includes(MACHINE_MARK)) {
    text = `${text.trimEnd()}\n\n${MACHINE_MARK}\n${readLf(join(ROOT, 'claude-md', 'machine.md')).trim()}\n`;
  }
  return { file, text, what: 'claude-skills block and machine facts' };
}

function ruleChanges() {
  const dir = join(ROOT, 'rules');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ file: join(CLAUDE_DIR, 'rules', name), text: readLf(join(dir, name)), what: 'path rule' }));
}

function settingsChange() {
  const file = join(CLAUDE_DIR, 'settings.json');
  const wanted = JSON.parse(readLf(join(ROOT, 'settings', 'user-settings.json')));
  const current = readIfExists(file);
  let settings = {};
  if (current !== null) {
    try {
      settings = JSON.parse(current);
    } catch (error) {
      throw new Error(`${file} is not valid JSON (${error.message}); nothing was changed`);
    }
  }
  const notes = ['outputStyle and skillOverrides'];
  if (wanted.outputStyle && settings.outputStyle && settings.outputStyle !== wanted.outputStyle && !FORCE) {
    notes.push(`keeps outputStyle "${settings.outputStyle}"; --force sets "${wanted.outputStyle}"`);
  } else if (wanted.outputStyle) {
    settings.outputStyle = wanted.outputStyle;
  }
  settings.skillOverrides = { ...settings.skillOverrides, ...wanted.skillOverrides };
  return { file, text: `${JSON.stringify(settings, null, 2)}\n`, what: notes.join('; ') };
}

let changes;
try {
  changes = [claudeMdChange(), ...ruleChanges(), settingsChange()];
} catch (error) {
  console.error(`install aborted: ${error.message}`);
  process.exit(1);
}

const stamp = timestamp();
for (const { file, text, what } of changes) {
  const current = readIfExists(file);
  if (current === text) {
    console.log(`unchanged ${file}`);
    continue;
  }
  console.log(`${current === null ? 'create   ' : 'update   '} ${file} (${what})`);
  if (!APPLY) continue;
  mkdirSync(dirname(file), { recursive: true });
  if (current !== null) copyFileSync(file, `${file}.bak-${stamp}`);
  writeFileSync(file, text, 'utf8');
}

console.log(APPLY
  ? `\nDone. Backups end with .bak-${stamp}. Start a new session to load the changes.`
  : '\nDry run: nothing was written. Re-run with --apply.');
console.log("Skills: $env:DISABLE_TELEMETRY='1'; npx.cmd --yes skills add ./ -g -a claude-code --copy -y");
