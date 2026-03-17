import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseVersionFromTag(tag) {
  if (!tag || typeof tag !== 'string') return null;
  const m = tag.match(/^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/);
  return m ? m[1] : null;
}

const tag = process.env.GITHUB_REF_NAME;
const version = parseVersionFromTag(tag);
if (!version) {
  throw new Error(
    `Invalid tag "${tag}". Expected format: vX.Y.Z (example: v1.2.3 or v1.2.3-beta.1)`,
  );
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const pkgPath = path.join(rootDir, 'package.json');
const manifestPath = path.join(rootDir, 'public', 'manifest.json');

const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
pkg.version = version;
await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
manifest.version = version;
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`[sync-version-from-tag] version = ${version}`);

