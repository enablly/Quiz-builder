import { generateStandaloneHtml } from './src/generateStandaloneQuiz.js';
import { STEELCASE_TEMPLATES } from './src/steelcaseTemplates.js';

const config = STEELCASE_TEMPLATES[0];
const html = generateStandaloneHtml(config, 'http://localhost:3000');
console.log(html.length);
