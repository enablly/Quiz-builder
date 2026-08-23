const http = require("http");

const payload = JSON.stringify({
  company: "Steelcase",
  leadName: "John Doe",
  role: "VP of Workplace Strategy",
  scoreData: 78,
  qaText: "Question 1: Focus work is disrupted by ambient noise.",
  modelFallbacks: ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"]
});

const req = http.request({
  hostname: "localhost",
  port: 3000,
  path: "/api/analyze-company",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload)
  }
}, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log("Returned HTML length:", parsed.html ? parsed.html.length : 0);
      console.log("Thinking Logs:", parsed.thinkingLogs);
    } catch(e) {
      console.log("Raw response:", data.substring(0, 300));
    }
  });
});

req.on("error", (e) => console.error("Req Error:", e));
req.write(payload);
req.end();
