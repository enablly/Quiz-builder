            console.warn("Backend AI fetch failed, attempting client-side fallback...");
            if (QUIZ_CONFIG.integration && QUIZ_CONFIG.integration.geminiApiKey) {
              try {
                const cKey = QUIZ_CONFIG.integration.geminiApiKey;
                const scoreStr = calculateScore();
                const compStr = lead.company || "the organization";
                const qText = JSON.stringify(getAnswerLabels());
                const prompt = `You are an expert workplace diagnostic AI.
Analyze the following survey data for ${compStr}. Score: ${scoreStr}/100.
Survey Answers: ${qText}

Generate a professional HTML diagnostic report for this company.
Include these EXACT sections wrapped in HTML tags:
<h3>1. Company Intelligence & Workplace Context</h3>
<p>Provide a short analysis of ${compStr} based on web knowledge.</p>
<h3>2. Technical Score Breakdown</h3>
<p>Analyze what ${scoreStr}/100 means for their workplace agility.</p>
<h3>3. Critical Friction Points</h3>
<ul><li>Identify 3 specific friction points based on their survey answers.</li></ul>
<h3>4. High-Performance Optimization Roadmap</h3>
<ul><li>Provide 3 actionable spatial/acoustic interventions.</li></ul>
<h3>5. Executive Next Steps</h3>
<p>Suggest engaging with workplace consultants for a full audit.</p>

Return ONLY valid HTML. Do not wrap in markdown or backticks.`;

                const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${cKey}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ googleSearch: {} }]
                  })
                });
                if (aiResp.ok) {
                  const aiData = await aiResp.json();
                  let text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  if (text) {
                    text = text.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
                    window.standaloneAiReport = text;
                  }
                }
              } catch (clientErr) {
                console.error("Client-side AI fallback also failed:", clientErr);
              }
            }
