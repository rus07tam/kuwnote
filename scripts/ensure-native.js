#!/usr/bin/env node
import { createRequire } from 'module';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);

const platform = process.platform;
const arch = process.arch;

const requiredPackages = [];

if (platform === 'darwin') {
  if (arch === 'arm64') {
    requiredPackages.push(
      '@tauri-apps/cli-darwin-arm64',
      '@rollup/rollup-darwin-arm64',
      'lightningcss-darwin-arm64',
      '@esbuild/darwin-arm64'
    );
  } else {
    requiredPackages.push(
      '@tauri-apps/cli-darwin-x64',
      '@rollup/rollup-darwin-x64',
      'lightningcss-darwin-x64',
      '@esbuild/darwin-x64'
    );
  }
} else if (platform === 'win32') {
  if (arch === 'x64') {
    requiredPackages.push(
      '@tauri-apps/cli-win32-x64-msvc',
      '@rollup/rollup-win32-x64-msvc',
      'lightningcss-win32-x64-msvc',
      '@esbuild/win32-x64'
    );
  }
} else if (platform === 'linux') {
  if (arch === 'x64') {
    requiredPackages.push(
      '@tauri-apps/cli-linux-x64-gnu',
      '@rollup/rollup-linux-x64-gnu'
    );
  }
}

const missing = [];
for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
  } catch {
    missing.push(pkg);
  }
}

if (missing.length > 0) {
  console.log(`[kuwnote] Resolving missing platform native bindings: ${missing.join(', ')}...`);
  try {
    execSync(`npm install --no-save ${missing.join(' ')}`, {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('[kuwnote] Successfully installed platform native bindings.');
  } catch (err) {
    console.warn(`[kuwnote] Warning: Failed to install optional bindings (${err.message}). You can manually run: npm install ${missing.join(' ')}`);
  }
}
