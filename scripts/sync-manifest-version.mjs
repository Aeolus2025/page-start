import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(rootDir, '..');

const pkgPath = path.join(projectRoot, 'package.json');
const manifestPath = path.join(projectRoot, 'public', 'manifest.json');

const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

if (!pkg?.version || typeof pkg.version !== 'string') {
  throw new Error('package.json version is missing');
}

manifest.version = pkg.version;

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
