// Leeway Industries — Visu-Sewer Story
// Module: tools/maintenance/div_count.cjs
// Purpose: Maintenance script to count divs in generated output for QA
// Date: 2025-12-07
// Note: Internal use. Do not include confidential data in source.
const fs = require('fs');

const targetFile = 'src/App.tsx';
const source = fs.readFileSync(targetFile, 'utf8');
const open = (source.match(/<div(\s|>|$)/g) || []).length;
const close = (source.match(/<\/div>/g) || []).length;

console.log(`File: ${targetFile}`);
console.log('open <div> tags :', open);
console.log('close </div> tags:', close);
console.log('delta           :', open - close);
