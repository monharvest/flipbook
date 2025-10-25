#!/usr/bin/env node
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

function exists(p) {
  return fs.existsSync(p);
}

async function copyFile(src, dest) {
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(src, dest);
  console.log('copied', src, '->', dest);
}

async function copyDir(srcDir, destDir) {
  if (!exists(srcDir)) return;
  await fsp.mkdir(destDir, { recursive: true });
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const ent of entries) {
    const src = path.join(srcDir, ent.name);
    const dest = path.join(destDir, ent.name);
    if (ent.isDirectory()) {
      await copyDir(src, dest);
    } else if (ent.isFile()) {
      await copyFile(src, dest);
    }
  }
}

async function main() {
  const root = process.cwd();
  const out = path.join(root, 'out');
  console.log('Creating out/ at', out);
  await fsp.rm(out, { recursive: true, force: true });
  await fsp.mkdir(out, { recursive: true });

  // Prefer prerendered index in .next/server/app
  const nextServerApp = path.join(root, '.next', 'server', 'app');
  const nextServerPages = path.join(root, '.next', 'server', 'pages');
  const nextStatic = path.join(root, '.next', 'static');
  const publicDir = path.join(root, 'public');

  // Copy index.html from .next/server/app if present
  const indexHtml = path.join(nextServerApp, 'index.html');
  if (exists(indexHtml)) {
    await copyFile(indexHtml, path.join(out, 'index.html'));
  } else {
    console.warn('No .next/server/app/index.html found');
  }

  // Copy not-found as 404
  const notFound = path.join(nextServerApp, '_not-found.html');
  if (exists(notFound)) {
    await copyFile(notFound, path.join(out, '404.html'));
  } else if (exists(path.join(nextServerPages, '404.html'))) {
    await copyFile(path.join(nextServerPages, '404.html'), path.join(out, '404.html'));
  }

  // Copy 500 if present
  if (exists(path.join(nextServerPages, '500.html'))) {
    await copyFile(path.join(nextServerPages, '500.html'), path.join(out, '500.html'));
  }

  // Copy _next static
  if (exists(nextStatic)) {
    await copyDir(nextStatic, path.join(out, '_next', 'static'));
  }

  // Also copy .next/server/static (if any) and .next/server/app assets
  const nextServerStatic = path.join(root, '.next', 'server', 'static');
  if (exists(nextServerStatic)) {
    await copyDir(nextServerStatic, path.join(out, '_next', 'server', 'static'));
  }

  // Copy any prerendered html files under .next/server/app (like pages folder)
  if (exists(nextServerApp)) {
    // copy index and any other html files (e.g., page/*.html)
    const entries = await fsp.readdir(nextServerApp, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const subdir = path.join(nextServerApp, ent.name);
        // copy html files inside
        await copyDir(subdir, path.join(out, ent.name));
      }
    }
  }

  // Copy public assets
  if (exists(publicDir)) {
    await copyDir(publicDir, out);
  }

  console.log('out/ prepared. You can now deploy the out/ folder to Cloudflare Pages.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
