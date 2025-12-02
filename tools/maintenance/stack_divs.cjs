const fs = require('fs');

const targetFile = 'src/App.tsx';
const lines = fs.readFileSync(targetFile, 'utf8').split(/\r?\n/);

const stack = [];

const normalize = (line) => line.trim().replace(/\s+/g, ' ');

lines.forEach((line, idx) => {
	const trimmed = line.trim();
	if (!trimmed.includes('<div')) return;

	const openMatches = trimmed.match(/<div(\s|>|$)/g) || [];
	const closeMatches = trimmed.match(/<\/div>/g) || [];

	openMatches.forEach(() => {
		stack.push({ line: idx + 1, text: normalize(trimmed) });
		const indent = '  '.repeat(Math.max(stack.length - 1, 0));
		console.log(`${indent}+ line ${idx + 1}: ${normalize(trimmed).slice(0, 120)}`);
	});

	closeMatches.forEach(() => {
		const last = stack.pop();
		const indent = '  '.repeat(Math.max(stack.length, 0));
		const ctx = last ? `${last.text.slice(0, 80)} -> closed line ${idx + 1}` : `orphan closing on line ${idx + 1}`;
		console.log(`${indent}- ${ctx}`);
	});
});

if (stack.length) {
	console.log('\nUnwound stack:');
	stack.forEach((entry) => console.log(`  line ${entry.line}: ${entry.text}`));
}
