with open('src/generateStandaloneQuiz.js', 'r') as f:
    text = f.read()

text = text.replace("text.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();", "text.replace(/^```html\\\\s*/i, '').replace(/```\\\\s*$/, '').trim();")
with open('src/generateStandaloneQuiz.js', 'w') as f:
    f.write(text)
