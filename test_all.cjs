const { GoogleGenAI } = require("@google/genai");

async function test() {
  const models = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-pro-preview",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: "Hello" });
      console.log(`[SUCCESS] ${m}`);
    } catch(e) {
      console.log(`[ERROR] ${m}: ${e.status || ''} ${e.message.substring(0, 80)}`);
    }
  }
}
test();
