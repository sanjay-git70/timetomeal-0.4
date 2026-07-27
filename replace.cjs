const fs = require('fs');
const content = fs.readFileSync('components/StudentView.tsx', 'utf8');
const target = fs.readFileSync('/tmp/cart_target.txt', 'utf8');
const replacement = fs.readFileSync('/tmp/cart_replacement.txt', 'utf8');

if (content.includes(target)) {
  const updated = content.replace(target, replacement);
  fs.writeFileSync('components/StudentView.tsx', updated);
  console.log('Replaced successfully');
} else {
  console.log('Target not found in content');
  // let's check what's wrong
  const targetLines = target.split('\n');
  const firstLine = targetLines[0];
  const lastLine = targetLines[targetLines.length - 2];
  console.log('First line:', firstLine);
  console.log('Last line:', lastLine);
}
