#!/usr/bin/env node
// Validates skills, path rules and repo conventions.
// Usage: node scripts/validate.mjs [--cross-check]
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { ROOT } from './lib.mjs';

const SKILLS_DIR = join(ROOT, 'skills');
const ALLOWED_KEYS = new Set(['name', 'description', 'license']);
const DESCRIPTION_MAX = 125;
const DESCRIPTION_MAX_BY_SKILL = { 'lean-code': 140 };
const LISTING_MAX = 2000;
const BODY_MAX_LINES = 500;
const BODY_WARN_LINES = 120;
const TEXT_FILE = /\.(md|txt|json|ya?ml|js|mjs|cjs|ts|ps1|psm1|psd1|sh|py|sql|cs)$|^\.git(attributes|ignore)$/;
const SKIP_DIRS = new Set(['.git', 'node_modules', 'results']);
const MARKDOWN_LINK = /\]\(([^)\s]+)\)/g;
const CODE_PATH = /`((?:references|assets|scripts)\/[^`\s]+)`/g;

// Names taken by Claude Code built-ins, bundled skills, synced claude.ai skills and common commands.
const RESERVED = new Set([
  'add-dir', 'agents', 'anthropic-skills', 'artifact-capabilities', 'artifact-design', 'artifact-diagramming',
  'artifacts', 'batch', 'btw', 'bug', 'checkup', 'claude-api', 'clear', 'code-review', 'compact', 'config',
  'context', 'cost', 'dataviz', 'debug', 'docs', 'doctor', 'docx', 'effort', 'exit', 'export', 'fast',
  'feedback', 'fewer-permission-prompts', 'google-workspace', 'help', 'hooks', 'ide', 'import-memory', 'init',
  'keybindings-help', 'login', 'logout', 'loop', 'mcp', 'memory', 'model', 'morning', 'output-style', 'pdf',
  'permissions', 'plan', 'plugin', 'plugin-authoring', 'plugins', 'pptx', 'pr-comments', 'quit', 'recap',
  'release-notes', 'resume', 'review', 'rewind', 'run', 'run-skill-generator', 'schedule', 'security-review',
  'simplify', 'skill-creator', 'skill-doctor', 'skills', 'status', 'statusline', 'synced', 'tasks',
  'terminal-setup', 'theme', 'todos', 'update-config', 'upgrade', 'usage', 'verify', 'vim', 'workflow-authoring',
  'workflows', 'xlsx',
]);

const errors = [];
const warnings = [];
const display = (file) => relative(ROOT, file).split(sep).join('/') || '.';
const fail = (file, message) => errors.push(`${display(file)}: ${message}`);
const warn = (file, message) => warnings.push(`${display(file)}: ${message}`);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

// Returns the file as text, or null when it is not valid UTF-8. Flags BOMs and CRLF endings.
function readText(file) {
  const bytes = readFileSync(file);
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) fail(file, 'UTF-8 BOM; save without BOM');
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    fail(file, 'not valid UTF-8');
    return null;
  }
  if (text.includes('\r')) fail(file, 'CRLF line endings; use LF');
  return text.replace(/\r\n/g, '\n');
}

function parseFrontmatter(file, text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) {
    fail(file, 'frontmatter must start on line 1 and be closed by ---');
    return null;
  }
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = /^([a-z][a-z0-9-]*): (.+)$/.exec(line);
    if (!field) {
      fail(file, `unsupported frontmatter line "${line}"; use one "key: value" per line`);
      continue;
    }
    const [, key, value] = field;
    if (key in fields) fail(file, `duplicate key "${key}"`);
    if (!ALLOWED_KEYS.has(key)) fail(file, `key "${key}" is not allowed (use: ${[...ALLOWED_KEYS].join(', ')})`);
    fields[key] = value;
  }
  return { fields, body: text.slice(match[0].length) };
}

function checkName(file, folder, name) {
  if (!name) {
    fail(file, 'missing name');
    return;
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail(file, `name "${name}" must use lowercase letters, digits and single hyphens`);
  if (name.length > 64) fail(file, `name is ${name.length} chars (max 64)`);
  if (name !== folder) fail(file, `name "${name}" must equal its folder "${folder}"`);
  if (/claude|anthropic/.test(name)) fail(file, 'name must not contain "claude" or "anthropic"');
  if (RESERVED.has(name)) fail(file, `name "${name}" collides with a built-in, bundled or synced skill or command`);
}

function checkDescription(file, folder, raw) {
  if (!raw) {
    fail(file, 'missing description');
    return '';
  }
  const quoted = /^"([^"\\]+)"$/.exec(raw);
  if (!quoted) {
    fail(file, 'description must be one double-quoted string without inner quotes or backslashes');
    return '';
  }
  const description = quoted[1];
  const max = DESCRIPTION_MAX_BY_SKILL[folder] ?? DESCRIPTION_MAX;
  if (description.length > max) fail(file, `description is ${description.length} chars (max ${max})`);
  if (/[<>]/.test(description)) fail(file, 'description must not contain < or >');
  if (description.includes(': ')) fail(file, 'description must not contain ": "');
  return description;
}

// Links must stay inside the skill and resolve; reference files must not chain to other references.
function checkReferences(file, text, skillDir, { isReference }) {
  for (const [, target] of text.matchAll(MARKDOWN_LINK)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    if (target.includes('\\')) {
      fail(file, `link "${target}" uses backslashes`);
      continue;
    }
    const path = resolve(dirname(file), target.split('#')[0]);
    if (!path.startsWith(skillDir + sep)) fail(file, `link "${target}" leaves the skill folder`);
    else if (!existsSync(path)) fail(file, `broken link "${target}"`);
    else if (isReference && path.endsWith('.md')) warn(file, `links to another reference "${target}"; keep references one level deep`);
  }
  if (isReference) return;
  for (const [, target] of text.matchAll(CODE_PATH)) {
    if (!target.includes('<') && !existsSync(join(skillDir, target))) fail(file, `mentions missing file "${target}"`);
  }
}

function checkSkill(dir) {
  const folder = basename(dir);
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) {
    fail(dir, 'missing SKILL.md');
    return null;
  }
  for (const other of walk(dir).filter((path) => path !== file)) {
    if (basename(other) === 'SKILL.md') fail(other, 'only one SKILL.md per skill folder');
    if (!TEXT_FILE.test(basename(other))) continue;
    const text = readText(other);
    if (text !== null && other.endsWith('.md')) checkReferences(other, text, dir, { isReference: true });
  }
  const text = readText(file);
  const parsed = text === null ? null : parseFrontmatter(file, text);
  if (!parsed) return null;
  const { fields, body } = parsed;
  checkName(file, folder, fields.name);
  const description = checkDescription(file, folder, fields.description);
  const lines = body.split('\n').length;
  if (lines > BODY_MAX_LINES) fail(file, `body has ${lines} lines (max ${BODY_MAX_LINES})`);
  else if (lines > BODY_WARN_LINES) warn(file, `body has ${lines} lines (target ${BODY_WARN_LINES} or fewer)`);
  checkReferences(file, body, dir, { isReference: false });
  return { name: fields.name ?? folder, description };
}

// Every visible skill's name and description is sent in each session; user-only skills cost nothing.
function checkListing(skills) {
  const settingsFile = join(ROOT, 'settings', 'user-settings.json');
  const overrides = JSON.parse(readText(settingsFile) ?? '{}').skillOverrides ?? {};
  const names = new Set(skills.map((skill) => skill.name));
  for (const name of Object.keys(overrides)) {
    if (!names.has(name)) fail(settingsFile, `skillOverrides names unknown skill "${name}"`);
  }
  const hidden = (name) => ['user-invocable-only', 'off'].includes(overrides[name]);
  const cost = skills
    .filter((skill) => !hidden(skill.name))
    .reduce((sum, skill) => sum + skill.name.length + skill.description.length + 5, 0);
  if (cost > LISTING_MAX) fail(SKILLS_DIR, `listing cost ${cost} chars exceeds ${LISTING_MAX}`);
  return cost;
}

function checkRules() {
  const dir = join(ROOT, 'rules');
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).filter((entry) => entry.endsWith('.md'))) {
    const file = join(dir, name);
    const text = readText(file);
    if (text !== null && !/^---\npaths:\n(?: {2}- "[^"\n]+"\n)+---\n/.test(text)) {
      fail(file, 'needs frontmatter with a "paths:" list of double-quoted globs');
    }
  }
}

function checkRepoFiles() {
  for (const file of walk(ROOT)) {
    const name = basename(file);
    if ((name === 'CLAUDE.md' || name === 'AGENTS.md') && dirname(file) !== ROOT) {
      fail(file, 'instruction file below the repo root; Claude Code would load it as instructions');
    }
    if (!file.startsWith(SKILLS_DIR + sep) && TEXT_FILE.test(name)) readText(file);
  }
}

function findFile(dir, name) {
  if (!existsSync(dir)) return null;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(path, name);
      if (found) return found;
    } else if (entry.name === name) {
      return path;
    }
  }
  return null;
}

// Optional second opinion from skill-creator's quick_validate.py, which uses a real YAML parser.
// PyYAML has no wheel for the newest Python, so pin a version that has one.
const UV_PYTHON = ['run', '--no-project', '--python', '3.14', '--with', 'pyyaml', 'python', '-X', 'utf8'];
const lastLine = (run) => `${run.stdout ?? ''}${run.stderr ?? ''}`.trim().split('\n').pop();

function crossCheck(skillDirs) {
  const validator = findFile(join(homedir(), '.claude', 'skills', 'synced'), 'quick_validate.py');
  if (!validator) {
    warn(ROOT, 'quick_validate.py not found under ~/.claude/skills/synced; cross-check skipped');
    return;
  }
  const probe = spawnSync('uv', [...UV_PYTHON, '-c', 'import yaml'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    warn(ROOT, `uv could not provide Python with PyYAML (${probe.error?.message ?? lastLine(probe)}); cross-check skipped`);
    return;
  }
  for (const dir of skillDirs) {
    const run = spawnSync('uv', [...UV_PYTHON, validator, dir], { encoding: 'utf8' });
    if (run.status !== 0) fail(dir, `quick_validate: ${lastLine(run)}`);
  }
}

const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(SKILLS_DIR, entry.name));
const skills = skillDirs.map(checkSkill).filter(Boolean);
const listing = checkListing(skills);
checkRules();
checkRepoFiles();
if (process.argv.includes('--cross-check')) crossCheck(skillDirs);

for (const message of warnings) console.log(`warn  ${message}`);
for (const message of errors) console.log(`error ${message}`);
console.log(`${skills.length} skills, listing ${listing}/${LISTING_MAX} chars, ${errors.length} errors, ${warnings.length} warnings`);
process.exitCode = errors.length ? 1 : 0;
