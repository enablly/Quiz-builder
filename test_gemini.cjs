const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Hello" });
    console.log("2.5-flash OK:", res.text);
  } catch(e) { console.error("2.5-flash ERROR:", e.message); }
  
  try {
    const res2 = await ai.models.generateContent({ model: "gemini-2.5-pro", contents: "Hello" });
    console.log("2.5-pro OK:", res2.text);
  } catch(e) { console.error("2.5-pro ERROR:", e.message); }
}
run();
