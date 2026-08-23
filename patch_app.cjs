const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  /if \(clean\.integration\) \{\n\s*clean\.integration\.geminiApiKey = '';\n\s*\}/g,
  `if (clean.integration) {
      if (clean.integration.geminiApiKey) {
        const k = clean.integration.geminiApiKey;
        const mid = Math.floor(k.length / 2);
        clean.integration.geminiApiKeyPart1 = k.substring(0, mid);
        clean.integration.geminiApiKeyPart2 = k.substring(mid);
      }
      clean.integration.geminiApiKey = '';
    }`
);

fs.writeFileSync('src/App.jsx', code);
