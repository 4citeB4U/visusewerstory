const fs = require('fs');

const targetFile = 'src/App.tsx';
const source = fs.readFileSync(targetFile, 'utf8');
const open = (source.match(/<div(\s|>|$)/g) || []).length;
const close = (source.match(/<\/div>/g) || []).length;

console.log(`File: ${targetFile}`);
console.log('open <div> tags :', open);
console.log('close </div> tags:', close);
console.log('delta           :', open - close);
