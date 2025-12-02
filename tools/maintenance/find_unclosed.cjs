const fs = require('fs');

const mainAppFilename = 'src/App.tsx';
const appTSX = fs.readFileSync(mainAppFilename, 'utf8');
const stack = [];

const opener = (lineIdx, symbol, line) => ({
  lineIdx,
  symbol,
  line: line.slice(line.indexOf('<')),
});

const onLine = (line, lineIdx) => {
  if (line.includes('//')) {
    const [code, comment] = line.split('//');
    if (/<[A-Z]/.test(comment || '')) return;
    line = code;
  }

  const trimmed = line.trim();
  let i = 0;
  while (i < trimmed.length) {
    if (trimmed[i] !== '<') {
      i += 1;
      continue;
    }
    const match = trimmed.slice(i).match(/<([/!A-Z][^\s/>]*)/i);
    if (!match) {
      i += 1;
      continue;
    }
    const symbol = match[1];
    if (!symbol.startsWith('/') && !symbol.startsWith('!')) {
      stack.push(opener(lineIdx, symbol, trimmed));
    } else if (symbol.startsWith('/')) {
      const closingSymbol = symbol.slice(1);
      const last = stack[stack.length - 1];
      if (last && last.symbol === closingSymbol) {
        stack.pop();
      } else {
        console.error(`Line ${lineIdx + 1}: Unexpected closing </${closingSymbol}>`);
      }
    }
    i += match[0].length;
  }
};

appTSX.split('\n').forEach(onLine);

if (stack.length === 0) {
  console.log('All tags properly closed.');
} else {
  console.log('Unclosed tags:');
  stack.forEach((entry) => {
    console.log(`Line ${entry.lineIdx + 1}: <${entry.symbol}> // ${entry.line.trim()}`);
  });
}
