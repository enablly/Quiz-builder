const { GoogleGenAI } = require("@google/genai");

async function test() {
  const models = [
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview"
  ];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: "Hello" });
      console.log(`[AVAILABLE] ${m}: success!`);
    } catch(e) {
      console.log(`[QUOTA/ERROR] ${m}: ${e.message.substring(0, 90)}`);
    }
  }
}
test();
