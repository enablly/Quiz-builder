with open('src/generateStandaloneQuiz.js', 'r') as f:
    text = f.read()

text = text.replace('const prompt = "You are an expert workplace diagnostic AI.\\n" +', 'const prompt = "You are an expert workplace diagnostic AI.\\\\n" +')
text = text.replace('"Analyze the following survey data for " + compStr + ". Score: " + scoreStr + "/100.\\n" +', '"Analyze the following survey data for " + compStr + ". Score: " + scoreStr + "/100.\\\\n" +')
text = text.replace('"Survey Answers: " + qText + "\\n\\n" +', '"Survey Answers: " + qText + "\\\\n\\\\n" +')
text = text.replace('"Please perform a Google Search on " + compStr + " to gather recent news, office locations, or workplace strategies.\\n\\n" +', '"Please perform a Google Search on " + compStr + " to gather recent news, office locations, or workplace strategies.\\\\n\\\\n" +')
text = text.replace('"Generate a professional HTML diagnostic report for this company.\\n" +', '"Generate a professional HTML diagnostic report for this company.\\\\n" +')
text = text.replace('"Include these EXACT sections wrapped in HTML tags:\\n" +', '"Include these EXACT sections wrapped in HTML tags:\\\\n" +')
text = text.replace('"<h3>1. Company Intelligence & Workplace Context</h3>\\n" +', '"<h3>1. Company Intelligence & Workplace Context</h3>\\\\n" +')
text = text.replace('"<p>Provide a short analysis of " + compStr + " based on web knowledge. explicitly mention facts you found online.</p>\\n" +', '"<p>Provide a short analysis of " + compStr + " based on web knowledge. explicitly mention facts you found online.</p>\\\\n" +')
text = text.replace('"<h3>2. Technical Score Breakdown</h3>\\n" +', '"<h3>2. Technical Score Breakdown</h3>\\\\n" +')
text = text.replace('"<p>Analyze what " + scoreStr + "/100 means for their workplace agility.</p>\\n" +', '"<p>Analyze what " + scoreStr + "/100 means for their workplace agility.</p>\\\\n" +')
text = text.replace('"<h3>3. Critical Friction Points</h3>\\n" +', '"<h3>3. Critical Friction Points</h3>\\\\n" +')
text = text.replace('"<ul><li>Identify 3 specific friction points based on their survey answers.</li></ul>\\n" +', '"<ul><li>Identify 3 specific friction points based on their survey answers.</li></ul>\\\\n" +')
text = text.replace('"<h3>4. High-Performance Optimization Roadmap</h3>\\n" +', '"<h3>4. High-Performance Optimization Roadmap</h3>\\\\n" +')
text = text.replace('"<ul><li>Provide 3 actionable spatial/acoustic interventions.</li></ul>\\n" +', '"<ul><li>Provide 3 actionable spatial/acoustic interventions.</li></ul>\\\\n" +')
text = text.replace('"<h3>5. Executive Next Steps</h3>\\n" +', '"<h3>5. Executive Next Steps</h3>\\\\n" +')
text = text.replace('"<p>Suggest engaging with workplace consultants for a full audit.</p>\\n\\n" +', '"<p>Suggest engaging with workplace consultants for a full audit.</p>\\\\n\\\\n" +')

with open('src/generateStandaloneQuiz.js', 'w') as f:
    f.write(text)
