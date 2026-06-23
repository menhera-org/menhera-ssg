#!/usr/bin/env node

import {micromark} from 'micromark';
import {gfmHtml, gfm} from 'micromark-extension-gfm';
import {frontmatter, frontmatterHtml} from 'micromark-extension-frontmatter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import YAML from 'yaml'
import * as path from 'node:path';
import * as fs from 'node:fs';
import { globSync } from 'glob';
import { CssVars, SiteConfig, Config, MenheraSsgFrontmatter } from '../index.js';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { encode } from 'html-entities';

export {};

const DOMPurify = createDOMPurify(new JSDOM('').window);

const CONFIG_PATH = './menhera-ssg.json';
const configJson = fs.readFileSync(CONFIG_PATH, 'utf-8');
const config: Config = JSON.parse(configJson);

const NAV_PATH = './menhera-ssg.nav.md';
const navMd = fs.readFileSync(NAV_PATH, 'utf-8');

const nav = DOMPurify.sanitize(micromark(navMd, {
  extensions: [gfm(), frontmatter()],
  htmlExtensions: [gfmHtml(), frontmatterHtml()],
  allowDangerousHtml: true,
}));

const FOOTER_PATH = './menhera-ssg.footer.md';
const footerMd = fs.readFileSync(FOOTER_PATH, 'utf-8');

const footer = DOMPurify.sanitize(micromark(footerMd, {
  extensions: [gfm(), frontmatter()],
  htmlExtensions: [gfmHtml(), frontmatterHtml()],
  allowDangerousHtml: true,
}));

const ASSETS_DIR = path.resolve(import.meta.dirname, '../../assets');
const DIST_DIR = './dist';

const assets = globSync(path.join(ASSETS_DIR, '*'), { nodir: true });
const publicFiles = globSync('./public/**/*', { nodir: true });

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

const nojekyllPath = path.join(DIST_DIR, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('written: ', nojekyllPath);
if (fs.existsSync('./CNAME')) {
  const destPath = path.join(DIST_DIR, 'CNAME');
  fs.copyFileSync('./CNAME', destPath);
  console.log('copied: ', destPath);
}

for (const file of publicFiles) {
  const relativePath = path.relative('./public', file);
  const destPath = path.join(DIST_DIR, relativePath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(file, destPath);
  console.log('copied: ', destPath);
}

for (const asset of assets) {
  const basename = path.basename(asset);
  const destPath = path.join(DIST_DIR, basename);
  fs.copyFileSync(asset, destPath);
  console.log('asset: ', destPath);
}

const mdFiles = globSync('./src/**/*.md', { nodir: true });

const absUrl = (url: string, base: string) => (new URL(url, base)).href;

function compileMarkdown(source: string, path: string) {
  const tree = fromMarkdown(source, {
    extensions: [frontmatter(['yaml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml'])]
  });

  // The frontmatter is the first child if present.
  const node = tree.children.find(n => n.type === 'yaml');
  const metadata: MenheraSsgFrontmatter = node ? YAML.parse(node.value) : {};

  const content = DOMPurify.sanitize(micromark(source, {
    extensions: [gfm(), frontmatter()],
    htmlExtensions: [gfmHtml(), frontmatterHtml()],
    allowDangerousHtml: true,
  }));

  const url = absUrl(path, config.site_config.base_url ?? '').replace(/\/index\.html$/, '/');

  const html = `
<!DOCTYPE html>
<html lang="${encode(metadata.lang ?? 'en')}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${encode(metadata.title)} | ${encode(config.site_config.site_name)}</title>
<link rel="icon" href="${encode(config.site_config.favicon_url)}" />
<meta name="robots" content="${(metadata.is404 ?? false) ? 'noindex, nofollow' : 'index, follow'}" />
<meta property="og:title" content="${encode(metadata.title ?? '')}" />
<meta property="og:locale" content="${encode(metadata.lang ?? 'en')}" />
<meta name="description" content="${encode(metadata.description)}" />
<meta property="og:description" content="${encode(metadata.description)}" />
<link rel="canonical" href="${encode(url)}" />
<meta property="og:url" content="${encode(url)}" />
<meta property="og:site_name" content="${encode(config.site_config.site_name)}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="${encode(absUrl(metadata.eye_catch_image ?? config.site_config.branding_logo_url ?? '', config.site_config.base_url ?? ''))}" />
<meta name="twitter:card" content="summary" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' https://fonts.googleapis.com; script-src 'self'; worker-src 'self'; manifest-src 'self'; font-src 'self' https://fonts.gstatic.com; img-src 'self'; base-uri 'none';" />
<link rel="stylesheet" crossorigin="anonymous" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Noto+Sans+JP:wght@100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900" />
<script type="application/json" id="config">
${JSON.stringify(config)}
</script>
</head>
<body>
<main id="main" slot="main">
<h1 id="page-heading">${encode(metadata.title)}</h1>
${metadata.eye_catch_image ? `<img alt="eyecatch" src="${encode(metadata.eye_catch_image)}" />` : ''}
${content}
</main>
<nav id="nav" slot="nav">
${nav}
</nav>
<div id="footer" slot="footer">
${footer}
</div>
<script src="/menhera-window.js"></script>
</body>
</html>
`;
  return html.trimStart();
}

for (const file of mdFiles) {
  const relativePath = path.relative('./src', file).replace(/\.md$/i, '.html');
  const destPath = path.join(DIST_DIR, relativePath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const html = compileMarkdown(fs.readFileSync(file, 'utf-8'), relativePath);
  fs.writeFileSync(destPath, html);
  console.log('written: ', destPath);
}
