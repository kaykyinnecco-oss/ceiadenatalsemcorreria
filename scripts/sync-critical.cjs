const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8').split('/* CRITICAL START')[1].split('*/').slice(1).join('*/').split('/* CRITICAL END */')[0].trim();
const file = path.join(root, 'index.html');
const html = fs.readFileSync(file, 'utf8');
const style = `<style id="critical-css">${css}</style>`;
fs.writeFileSync(file, html.includes('id="critical-css"') ? html.replace(/<style id="critical-css">[\s\S]*?<\/style>/, style) : html.replace('<!-- CRITICAL_CSS -->', style));
console.log(`CSS crítico atualizado: ${Buffer.byteLength(css)} bytes. Sem build na publicação.`);
