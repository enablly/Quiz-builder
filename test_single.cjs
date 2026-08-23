const { GoogleGenAI } = require("@google/genai");
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: "Hello" });
    console.log("gemini-3.5-flash SUCCESS:", res.text.trim());
  } catch(e) {
    console.log("gemini-3.5-flash ERR:", e.message);
  }
}
test();
