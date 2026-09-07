/**
 * Custom build script using esbuild directly.
 * Produces dist/index.html, dist/main.js, dist/styles.css
 */
import esbuild from 'esbuild';
import fs from 'fs';

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// 1. Build Tailwind CSS
console.log('Building Tailwind CSS...');
const cssInput = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');\n@tailwind base;\n@tailwind components;\n@tailwind utilities;`;
fs.writeFileSync('src/_tw_input.css', cssInput);

import { execSync } from 'child_process';
execSync('npx tailwindcss -i src/_tw_input.css -o dist/styles.css --minify', { stdio: 'inherit' });

// Append custom CSS (scrollbar, slider, body styles)
const customCss = `
:root { color-scheme: light dark; }
html { scroll-behavior: smooth; }
body { background-color: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased; }
.dark body { background-color: #020617; color: #f1f5f9; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.dark ::-webkit-scrollbar-thumb { background: #334155; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
input[type="range"] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 9999px; background: #e2e8f0; outline: none; }
.dark input[type="range"] { background: #334155; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #1d61f1; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.2); border: 2px solid white; transition: transform 0.1s; }
.dark input[type="range"]::-webkit-slider-thumb { border-color: #0f172a; }
input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #1d61f1; cursor: pointer; border: 2px solid white; }
.dark input[type="range"]::-moz-range-thumb { border-color: #0f172a; }
@keyframes fadeIn { 0% { opacity: 0 } 100% { opacity: 1 } }
@keyframes slideUp { 0% { opacity: 0; transform: translateY(8px) } 100% { opacity: 1; transform: translateY(0) } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-up { animation: slideUp 0.4s ease-out; }
`;
fs.appendFileSync('dist/styles.css', customCss);

// 2. Bundle JS with esbuild
console.log('Bundling JS with esbuild...');
await esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'esm',
  minify: true,
  outfile: 'dist/main.js',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  jsx: 'automatic',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  legalComments: 'none',
});

// 3. Copy favicon
fs.copyFileSync('public/favicon.svg', 'dist/favicon.svg');

// 4. Generate index.html
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Screener for Indian mutual funds — filter by fund age, max drawdown, expense ratio and consistency to find durable performers." />
    <link rel="stylesheet" href="/styles.css" />
    <title>FundLens · Mutual Fund Screener</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>`;
fs.writeFileSync('dist/index.html', html);

// 5. Add netlify redirects for SPA
fs.writeFileSync('dist/_redirects', '/*    /index.html   200\n');

// cleanup
fs.unlinkSync('src/_tw_input.css');

console.log('✅ Build complete! Output in dist/');
