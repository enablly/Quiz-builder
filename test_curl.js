const http = require('http');

const data = JSON.stringify({
  company: "Steelcase",
  leadName: "John",
  role: "CEO",
  scoreData: { total: 80 },
  qaText: "",
  modelFallbacks: ["gemini-3.6-flash"]
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/analyze-company',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => console.log('Response:', resData.substring(0, 500)));
});

req.write(data);
req.end();
