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

// Ensure dist exists
await fs.access(distDir);

// Experimental: generate a temporary key each run (NOT stable for upgrades)
const keyPath = path.join(outDir, `experimental-${safeTag}.pem`);
const crxPath = path.join(outDir, `page-start-${safeTag}-experimental.crx`);

const crx = crx3({
  rootDirectory: distDir,
  privateKey: keyPath,
});

// This will create a key if missing and then pack.
await crx.loadContents();
const buffer = await crx.pack();
await fs.writeFile(crxPath, buffer);

// Update manifest inside CRX package
await crx.update();

console.log(`[pack-crx] ${path.basename(crxPath)}`);

