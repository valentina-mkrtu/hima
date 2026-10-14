// Creates a self-contained copy you can open or share without any dependencies.
import {readFile, writeFile} from 'node:fs/promises';
const base = new URL('./', import.meta.url);
const [html, css, js] = await Promise.all(['index.html','styles.css','app.js'].map(name => readFile(new URL(name, base), 'utf8')));
const result = html.replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`).replace('<script src="app.js"></script>', `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`);
await writeFile(new URL('Dayweave.html', base), result);
console.log('Built Dayweave.html — no server or installation needed.');
