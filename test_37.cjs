const { GoogleGenAI } = require("@google/genai");
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: "Hello" });
    console.log("Success:", res.text.substring(0, 30));
  } catch(e) {
    console.log("Error:", e.message.substring(0, 100));
  }
}
test();
