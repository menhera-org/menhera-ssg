
import * as process from 'node:process';
import * as child_process from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { globSync } from 'glob';

export {};

process.chdir(import.meta.dirname);
process.chdir('../..');

function runBuild(): void {
  child_process.execSync('npm run build', { stdio: 'inherit' });
}

// Runtime for Window
process.chdir('./packages/runtime-window');
runBuild();
process.chdir('../..');

// Runtime for Worker
process.chdir('./packages/runtime-worker');
runBuild();
process.chdir('../..');

// Runtime for ServiceWorker
process.chdir('./packages/runtime-sw');
runBuild();
process.chdir('../..');

const ASSET_DIR = './packages/ssg/assets';
fs.rmSync(ASSET_DIR, { recursive: true, force: true });
fs.mkdirSync(ASSET_DIR, { recursive: true });

const assets = globSync('./packages/runtime-*/dist/*');

for (const assetPath of assets) {
  fs.copyFileSync(assetPath, path.join(ASSET_DIR, path.basename(assetPath)));
}
