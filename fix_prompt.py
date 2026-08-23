with open('src/generateStandaloneQuiz.js', 'r') as f:
    text = f.read()

bad = """const prompt = `You are an expert workplace diagnostic AI.
Analyze the following survey data for ${compStr}. Score: ${scoreStr}/100.
Survey Answers: ${qText}

Please perform a Google Search on ${compStr} to gather recent news, office locations, or workplace strategies. 

Generate a professional HTML diagnostic report for this company.
Include these EXACT sections wrapped in HTML tags:
<h3>1. Company Intelligence & Workplace Context</h3>
<p>Provide a short analysis of ${compStr} based on web knowledge. explicitly mention facts you found online.</p>
<h3>2. Technical Score Breakdown</h3>
<p>Analyze what ${scoreStr}/100 means for their workplace agility.</p>
<h3>3. Critical Friction Points</h3>
<ul><li>Identify 3 specific friction points based on their survey answers.</li></ul>
<h3>4. High-Performance Optimization Roadmap</h3>
<ul><li>Provide 3 actionable spatial/acoustic interventions.</li></ul>
<h3>5. Executive Next Steps</h3>
<p>Suggest engaging with workplace consultants for a full audit.</p>

Return ONLY valid HTML. Do not wrap in markdown or backticks.`;"""

good = """const prompt = "You are an expert workplace diagnostic AI.\\n" +
"Analyze the following survey data for " + compStr + ". Score: " + scoreStr + "/100.\\n" +
"Survey Answers: " + qText + "\\n\\n" +
"Please perform a Google Search on " + compStr + " to gather recent news, office locations, or workplace strategies.\\n\\n" +
"Generate a professional HTML diagnostic report for this company.\\n" +
"Include these EXACT sections wrapped in HTML tags:\\n" +
"<h3>1. Company Intelligence & Workplace Context</h3>\\n" +
"<p>Provide a short analysis of " + compStr + " based on web knowledge. explicitly mention facts you found online.</p>\\n" +
"<h3>2. Technical Score Breakdown</h3>\\n" +
"<p>Analyze what " + scoreStr + "/100 means for their workplace agility.</p>\\n" +
"<h3>3. Critical Friction Points</h3>\\n" +
"<ul><li>Identify 3 specific friction points based on their survey answers.</li></ul>\\n" +
"<h3>4. High-Performance Optimization Roadmap</h3>\\n" +
"<ul><li>Provide 3 actionable spatial/acoustic interventions.</li></ul>\\n" +
"<h3>5. Executive Next Steps</h3>\\n" +
"<p>Suggest engaging with workplace consultants for a full audit.</p>\\n\\n" +
"Return ONLY valid HTML. Do not wrap in markdown or backticks.";"""

text = text.replace(bad, good)
with open('src/generateStandaloneQuiz.js', 'w') as f:
    f.write(text)
