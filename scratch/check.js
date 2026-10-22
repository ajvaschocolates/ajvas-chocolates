const { execSync } = require('child_process');
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = execSync(`"${edge}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --dump-dom "file:///c:/Users/USER/OneDrive/Desktop/ajvas chocolates/scratch/test-th-only.html"`, {encoding: 'utf-8'});
const m = out.match(/<div id="out">([\s\S]*?)<\/div>/);
console.log(m ? m[1] : 'NOT FOUND');
