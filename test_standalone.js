import fs from 'fs';
import { generateStandaloneHtml } from './src/generateStandaloneQuiz.js';

const config = {
  theme: {
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    logoUrl: 'https://example.com/logo.png',
  },
  companyName: 'Test',
  welcomeScreen: {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    buttonText: 'Start'
  },
  questions: [
    {
      id: 'q1',
      question: 'Question 1',
      options: [
        { label: 'Option 1', value: '1', score: 1 }
      ]
    }
  ],
  leadCapture: {
    title: 'Lead',
    description: 'Lead desc',
    fields: ['name']
  },
  integration: {}
};

const html = generateStandaloneHtml(config);
fs.writeFileSync('standalone_test.html', html);
