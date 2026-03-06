
import * as process from 'node:process';
import * as child_process from 'node:child_process';

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
