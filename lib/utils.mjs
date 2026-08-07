import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

export async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

export async function writeTextFile(path, content) {
  await ensureDir(dirname(path));
  await writeFile(path, content, 'utf8');
}

export async function readJson(path) {
  const raw = await readFile(path, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}: ${error.message}`);
  }
}

export async function writeJson(path, value) {
  await writeTextFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function toAbsolutePath(path) {
  return resolve(process.cwd(), path);
}

export function seconds(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function slugify(input) {
  return String(input || 'autocut')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .toLowerCase() || 'autocut';
}

export function escapeHtml(input) {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function shellQuote(path) {
  return `'${String(path).replaceAll("'", "'\\''")}'`;
}

export async function run(command, args = [], options = {}) {
  const { cwd = process.cwd(), env = process.env, allowFailure = false, input } = options;
  return await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      const result = { code, stdout, stderr, command, args };
      if (code !== 0 && !allowFailure) {
        reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}\n${stderr || stdout}`));
        return;
      }
      resolvePromise(result);
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

export async function commandExists(command) {
  const probe = process.platform === 'win32' ? 'where' : 'sh';
  const args = process.platform === 'win32' ? [command] : ['-lc', `command -v ${command}`];
  const result = await run(probe, args, { allowFailure: true });
  return result.code === 0;
}

export function parseNumberFlag(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
