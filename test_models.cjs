const { GoogleGenAI } = require("@google/genai");

async function test() {
  const models = ["gemini-pro-latest", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-3.1-pro-preview", "gemini-3.6-flash"];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (const m of models) {
    try {
      console.log("Testing:", m);
      const res = await ai.models.generateContent({ model: m, contents: "Hello" });
      console.log("Success:", m, res.text.substring(0, 30));
    } catch(e) {
      console.log("Error:", m, e.message.substring(0, 80));
    }
  }
}
test();
