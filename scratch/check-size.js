const { execSync } = require('child_process');
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = execSync(`"${edge}" --headless=new --disable-gpu --window-size=1280,800 --run-all-compositor-stages-before-draw --dump-dom "file:///c:/Users/USER/OneDrive/Desktop/ajvas chocolates/scratch/test-table-sizing.html"`, {encoding: 'utf-8'});
const m = out.match(/<div id="out">([\s\S]*?)<\/div>/);
const fs = require('fs');
fs.writeFileSync('scratch/out.txt', m ? m[1] : 'NOT FOUND', 'utf-8');
console.log("Wrote out.txt:", m ? m[1] : 'NOT FOUND');
