import re

with open("src/generateStandaloneQuiz.js", "r") as f:
    content = f.read()

pattern = r'const prompt = "You are a Senior Workplace Strategy Architect\.\\n" \+.*?"Return ONLY valid HTML\. Do not wrap in markdown or backticks\.";'

replacement = """
                const s2Prompt = (QUIZ_CONFIG.reportSections && QUIZ_CONFIG.reportSections[1] && QUIZ_CONFIG.reportSections[1].prompt) ? QUIZ_CONFIG.reportSections[1].prompt : "<p>Provide a comprehensive, multi-paragraph analysis (at least 2 paragraphs) of what a score of " + scoreStr + "/100 means for their specific workplace agility. Tie this directly back to the survey highlights provided.</p>";
                const s4Prompt = (QUIZ_CONFIG.reportSections && QUIZ_CONFIG.reportSections[3] && QUIZ_CONFIG.reportSections[3].prompt) ? QUIZ_CONFIG.reportSections[3].prompt : "<ul><li>Provide 3 highly detailed, actionable spatial/acoustic interventions. Do not be brief. Explain the rationale and expected impact of each intervention in 2-3 sentences each.</li></ul>";
                const prompt = "You are a Senior Workplace Strategy Architect.\\n" +
"Task: Write a comprehensive, personalized 5-section diagnostic report for a company named \\"" + compStr + "\\".\\n" +
"Survey Score: " + scoreStr + "/100.\\n" +
"Key Survey Highlights:\\n" + qText + "\\n\\n" +
"CRITICAL INSTRUCTION: You MUST perform a Google Search on '" + compStr + "' to gather their latest news, recent real estate decisions, employee return-to-office mandates, or workplace strategies. Your analysis MUST incorporate specific facts, quotes, or recent events found online about this exact company.\\n\\n" +
"Generate a highly detailed, professional HTML diagnostic report for this company.\\n" +
"Include these EXACT sections wrapped in HTML tags:\\n" +
"<h3>1. Company Intelligence & Workplace Context</h3>\\n" +
"<p>Write at least 2 to 3 robust paragraphs providing a detailed analysis of " + compStr + " based on your web research. You MUST explicitly mention facts, recent news, and insights you found online about the company. Connect these external facts to their current workplace context.</p>\\n" +
"<h3>2. Technical Score Breakdown</h3>\\n" +
s2Prompt + "\\n" +
"<h3>3. Critical Friction Points</h3>\\n" +
"<ul><li>Identify 3 specific, detailed friction points based on their exact survey answers. Explain WHY these are friction points in 2-3 sentences each.</li></ul>\\n" +
"<h3>4. High-Performance Optimization Roadmap</h3>\\n" +
s4Prompt + "\\n" +
"<h3>5. Executive Next Steps</h3>\\n" +
"<p>Write a concluding paragraph suggesting engagement with workplace consultants for a full audit.</p>\\n\\n" +
"Return ONLY valid HTML. Do not wrap in markdown or backticks.";
""".strip()

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("src/generateStandaloneQuiz.js", "w") as f:
    f.write(new_content)
