const { GoogleGenAI } = require("@google/genai");

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Testing gemini-3.6-flash without search tool...");
  const start = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Generate a 3-paragraph executive summary about Steelcase workplace AI readiness.",
    });
    console.log("Took:", (Date.now() - start), "ms");
    console.log("Success:", res.text.substring(0, 100));
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
