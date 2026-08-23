const fs = require('fs');
let code = fs.readFileSync('src/generateStandaloneQuiz.js', 'utf8');

// 1. Update generateStandaloneHtml
code = code.replace(
  /const config = JSON\.parse\(JSON\.stringify\(rawConfig \|\| \{\}\)\);\n\s*if \(config\.integration\) \{\n\s*config\.integration\.geminiApiKey = '';\n\s*config\.integration\.githubToken = '';\n\s*\}/g,
  `const config = JSON.parse(JSON.stringify(rawConfig || {}));
  if (config.integration) {
    if (config.integration.geminiApiKey) {
      const k = config.integration.geminiApiKey;
      const mid = Math.floor(k.length / 2);
      config.integration.geminiApiKeyPart1 = k.substring(0, mid);
      config.integration.geminiApiKeyPart2 = k.substring(mid);
    }
    config.integration.geminiApiKey = '';
    config.integration.githubToken = '';
  }`
);

// 2. Update customApiKey logic
code = code.replace(
  /customApiKey: QUIZ_CONFIG\.integration\?\.geminiApiKey/g,
  `customApiKey: QUIZ_CONFIG.integration?.geminiApiKey || (QUIZ_CONFIG.integration?.geminiApiKeyPart1 ? QUIZ_CONFIG.integration.geminiApiKeyPart1 + QUIZ_CONFIG.integration.geminiApiKeyPart2 : '')`
);

// 3. Update fallback check
code = code.replace(
  /if \(QUIZ_CONFIG\.integration && QUIZ_CONFIG\.integration\.geminiApiKey\) \{\n\s*try \{\n\s*const cKey = QUIZ_CONFIG\.integration\.geminiApiKey;/g,
  `const assembledKey = QUIZ_CONFIG.integration ? (QUIZ_CONFIG.integration.geminiApiKey || (QUIZ_CONFIG.integration.geminiApiKeyPart1 ? QUIZ_CONFIG.integration.geminiApiKeyPart1 + QUIZ_CONFIG.integration.geminiApiKeyPart2 : '')) : '';
            if (assembledKey) {
              try {
                const cKey = assembledKey;`
);

fs.writeFileSync('src/generateStandaloneQuiz.js', code);
