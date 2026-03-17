import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(rootDir, '..');
const distManifestPath = path.join(projectRoot, 'dist', 'manifest.json');

let raw;
try {
  raw = await fs.readFile(distManifestPath, 'utf8');
} catch {
  throw new Error('dist/manifest.json not found. Did you run `npm run build`?');
}

const manifest = JSON.parse(raw);

if (manifest.manifest_version !== 3) throw new Error('manifest_version must be 3');
if (!manifest.name) throw new Error('manifest.name is required');
if (!manifest.version) throw new Error('manifest.version is required');
if (!manifest.chrome_url_overrides?.newtab) throw new Error('chrome_url_overrides.newtab is required');

