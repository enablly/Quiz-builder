const fs = require('fs');
const html = fs.readFileSync('standalone_test.html', 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  fs.writeFileSync('extracted.js', scriptMatch[1]);
  console.log("Extracted");
} else {
  console.log("No script");
}
