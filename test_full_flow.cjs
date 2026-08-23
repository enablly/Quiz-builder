const { GoogleGenAI } = require("@google/genai");

async function test() {
  const models = ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  for (const m of models) {
    console.log("--> Testing full prompt synthesis with model:", m);
    const start = Date.now();
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: "Generate a clean HTML report section for Steelcase workplace assessment.",
      });
      console.log(`[SUCCESS in ${Date.now() - start}ms] Model ${m} output preview:\n`, res.text.substring(0, 150));
      break;
    } catch(e) {
      console.log(`[FAIL] ${m}:`, e.message);
    }
  }
}
test();
