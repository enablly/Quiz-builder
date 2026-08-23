const dom = require('jsdom').JSDOM;
const virtualConsole = new (require('jsdom').VirtualConsole)();
virtualConsole.on("error", (err) => { console.error("JSDOM Error:", err); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM Error Event:", err); });
const html = require('fs').readFileSync('standalone_test.html', 'utf-8');
const { window } = new dom(html, { runScripts: "dangerously", virtualConsole });
setTimeout(() => {
  console.log("Main card content:", window.document.getElementById('quiz-main-card').innerHTML);
}, 1000);
