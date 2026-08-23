with open('src/generateStandaloneQuiz.js', 'r') as f:
    text = f.read()

text = text.replace("text.replace(/^```html/i, '').replace(/```$/, '').trim();", "text.replace(/^\\`\\`\\`html/i, '').replace(/\\`\\`\\`$/, '').trim();")
with open('src/generateStandaloneQuiz.js', 'w') as f:
    f.write(text)
