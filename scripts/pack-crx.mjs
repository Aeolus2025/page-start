import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crx3 from 'crx3';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));

const tag = process.env.GITHUB_REF_NAME || `v${pkg.version}`;
const safeTag = String(tag).replace(/[^0-9A-Za-z._-]/g, '_');

const distDir = path.join(rootDir, 'dist');
const outDir = path.join(rootDir, 'release-assets');
await fs.mkdir(outDir, { recursive: true });

// Ensure dist & manifest exist
const manifestPath = path.join(distDir, 'manifest.json');
await fs.access(manifestPath);

// Experimental: generate / reuse a temporary key each run (NOT stable for upgrades)
const keyPath = path.join(outDir, `experimental-${safeTag}.pem`);
const crxPath = path.join(outDir, `page-start-${safeTag}-experimental.crx`);

await crx3([manifestPath], {
  keyPath,
  crxPath,
});

console.log(`[pack-crx] ${path.basename(crxPath)}`);

