/**
 * Copies the Vite build from site/dist into the repository root, which is what
 * GitHub Pages serves for a user site (main branch, / root).
 *
 * Only generated files are touched: the previous assets/ directory is cleared
 * first, and the source tree, workflows and git metadata are never removed.
 */
import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '..', 'dist');
const root = resolve(here, '..', '..');

// Anything in the repo root that is not build output.
const KEEP = new Set(['.git', '.github', '.gitignore', 'site', 'README.md', 'CNAME', 'node_modules']);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(dist))) {
  console.error('No build found at site/dist. Run `npm run build` first.');
  process.exit(1);
}

// Clear the previously published output.
for (const entry of await readdir(root)) {
  if (KEEP.has(entry)) continue;
  await rm(join(root, entry), { recursive: true, force: true });
}

// Copy the fresh build up.
for (const entry of await readdir(dist)) {
  await cp(join(dist, entry), join(root, entry), { recursive: true });
}

// Jekyll would otherwise ignore Vite's hashed asset folders.
await mkdir(root, { recursive: true });
await writeFile(join(root, '.nojekyll'), '');

console.log('Published site/dist → repository root.');
