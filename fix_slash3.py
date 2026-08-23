with open('src/generateStandaloneQuiz.js', 'r') as f:
    text = f.read()

import re
text = re.sub(r"text\.replace\(.*?\)\.trim\(\);", "text.replace(/^```html[ \\\\t\\\\n\\\\r]*/i, '').replace(/```[ \\\\t\\\\n\\\\r]*$/, '').trim();", text)
with open('src/generateStandaloneQuiz.js', 'w') as f:
    f.write(text)
