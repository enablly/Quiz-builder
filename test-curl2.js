const apiKey = process.env.GEMINI_API_KEY;
async function test() {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3.7-flash'];
  for (const mName of models) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello" }] }]
        })
      });
      const data = await resp.json();
      console.log(`[${mName}] Status: ${resp.status} -`, JSON.stringify(data).slice(0, 150));
    } catch(e) {
      console.log(`[${mName}] Fetch err:`, e.message);
    }
  }
}
test();
