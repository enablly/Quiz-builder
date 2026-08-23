import re

with open("src/generateStandaloneQuiz.js", "r") as f:
    content = f.read()

# Just replace the specific paragraphs
s2_orig = '"<p>Provide a comprehensive, multi-paragraph analysis (at least 2 paragraphs) of what a score of " + scoreStr + "/100 means for their specific workplace agility. Tie this directly back to the survey highlights provided.</p>\\n" +'
s2_new = '((QUIZ_CONFIG.reportSections && QUIZ_CONFIG.reportSections[1] && QUIZ_CONFIG.reportSections[1].prompt) ? QUIZ_CONFIG.reportSections[1].prompt : "<p>Provide a comprehensive, multi-paragraph analysis (at least 2 paragraphs) of what a score of " + scoreStr + "/100 means for their specific workplace agility. Tie this directly back to the survey highlights provided.</p>") + "\\n" +'

s4_orig = '"<ul><li>Provide 3 highly detailed, actionable spatial/acoustic interventions. Do not be brief. Explain the rationale and expected impact of each intervention in 2-3 sentences each.</li></ul>\\n" +'
s4_new = '((QUIZ_CONFIG.reportSections && QUIZ_CONFIG.reportSections[3] && QUIZ_CONFIG.reportSections[3].prompt) ? QUIZ_CONFIG.reportSections[3].prompt : "<ul><li>Provide 3 highly detailed, actionable spatial/acoustic interventions. Do not be brief. Explain the rationale and expected impact of each intervention in 2-3 sentences each.</li></ul>") + "\\n" +'

content = content.replace(s2_orig, s2_new)
content = content.replace(s4_orig, s4_new)

with open("src/generateStandaloneQuiz.js", "w") as f:
    f.write(content)
