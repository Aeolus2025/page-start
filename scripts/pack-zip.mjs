import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));

const tag = process.env.GITHUB_REF_NAME || `v${pkg.version}`;
const safeTag = String(tag).replace(/[^0-9A-Za-z._-]/g, '_');

const distDir = path.join(rootDir, 'dist');
const outDir = path.join(rootDir, 'release-assets');
await fs.mkdir(outDir, { recursive: true });

// Ensure dist exists
await fs.access(distDir);

const zipName = `page-start-${safeTag}-dist.zip`;
const zipPath = path.join(outDir, zipName);

// Use system zip (available on ubuntu-latest). On other systems this may need adapting.
await execFileAsync('zip', ['-r', '-q', zipPath, 'dist'], { cwd: rootDir });

console.log(`[pack-zip] ${zipName}`);

