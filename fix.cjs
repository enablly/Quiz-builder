const fs = require('fs');
let code = fs.readFileSync('src/generateStandaloneQuiz.js', 'utf8');
code = code.replace(/console\.error\("Client-side AI fallback also failed:", clientErr\);\n\s*\}\n\s*\} else \{\n\s*console\.warn\("No Gemini API key in standalone config\. Skipping AI and falling back to static template\."\);\n\s*\}\n\s*\}/g, 'console.error("Client-side AI fallback also failed:", clientErr);\n              }\n            } else {\n              console.warn("No Gemini API key in standalone config. Skipping AI and falling back to static template.");\n            }');
fs.writeFileSync('src/generateStandaloneQuiz.js', code);
