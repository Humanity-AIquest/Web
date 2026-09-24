// Builds the print PDF from the living doc's HTML export, rendering mermaid diagrams.
// Usage (from a scratch dir holding doc.html = the doc's HTML export, and package/dist/mermaid.min.js
// from `npm pack mermaid@11`): node build-pdf.js <output.pdf>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
let body = fs.readFileSync('doc.html', 'utf8');
body = body.replace(/<span data-atom="mention"[^>]*>[^<]*<\/span>/g, 'Humanity-AI.Quest');
const dec = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
body = body.replace(/flowchart LR/g, 'flowchart TD').replace(/(G\d)\{([^}]*)\}/g, '$1[$2]');
body = body.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (m, c) => `<div class="mermaid">${dec(c)}</div>`);
const css = `
@page { size: A4; margin: 20mm 18mm 22mm; }
body { font-family: "DejaVu Serif", Georgia, serif; color:#101820; font-size:10.5pt; line-height:1.5; }
h1 { font-size:26pt; margin:0 0 4pt; color:#07101F; }
h1 + p { color:#555; margin-bottom:18pt; border-bottom:2px solid #0C7F77; padding-bottom:8pt; }
h2 { font-size:15pt; color:#07101F; border-bottom:1px solid #cbd6d3; padding-bottom:3pt; margin-top:22pt; break-after:avoid; }
h2:not(:first-of-type) { break-before: page; }
h3 { font-size:11.5pt; color:#0C7F77; margin-top:14pt; break-after:avoid; }
p, li { orphans:3; widows:3; }
a { color:#0C7F77; text-decoration:none; }
table { border-collapse:collapse; width:100%; font-size:9pt; margin:8pt 0 12pt; font-family:"DejaVu Sans", Arial, sans-serif; }
th { background:#E7EDEB; text-align:left; }
th, td { border:1px solid #cbd6d3; padding:4pt 6pt; vertical-align:top; }
tr { break-inside:avoid; }
.mermaid { text-align:center; margin:10pt 0; break-inside:avoid; }
.mermaid svg { max-width:100% !important; max-height:105mm; height:auto; }
ul.contains-task-list, li.task-list-item { list-style:none; }
`;
const html = `<!doctype html><html><head><meta charset="utf-8"><title>The Constitutional Nation — V1 Draft</title><style>${css}</style></head><body>${body}<script>${fs.readFileSync('package/dist/mermaid.min.js','utf8')}</script><script>mermaid.initialize({startOnLoad:false, theme:'neutral', themeVariables:{fontSize:'22px'}, flowchart:{htmlLabels:true, nodeSpacing:30, rankSpacing:35}}); mermaid.run().then(()=>{document.body.dataset.done=1});</script></body></html>`;
fs.writeFileSync('print.html', html);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + process.cwd() + '/print.html');
  await p.waitForSelector('body[data-done="1"]', { timeout: 30000 });
  await p.pdf({ path: process.argv[2], format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:7pt;color:#888;width:100%;padding:0 18mm;font-family:sans-serif">The Constitutional Nation — V1 draft, not for citation — Humanity-AI.Quest</div>',
    footerTemplate: '<div style="font-size:7pt;color:#888;width:100%;text-align:right;padding:0 18mm;font-family:sans-serif">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    margin: { top: '20mm', bottom: '22mm', left: '18mm', right: '18mm' } });
  await b.close();
})();
