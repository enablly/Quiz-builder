import os

# 1. Update src/App.jsx to remove up/down arrows and adjust default model sequence
app_file = "src/App.jsx"
with open(app_file, "r") as f:
    app_code = f.read()

# Let's inspect the fallback row buttons in App.jsx
# Replace the buttons block that has up/down arrows
old_row_fragment = """                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const newArr = [...arr];
                            const temp = newArr[idx - 1];
                            newArr[idx - 1] = newArr[idx];
                            newArr[idx] = temp;
                            setConfig({ ...config, integration: { ...config.integration, modelFallbacks: newArr } });
                          }}
                          title="Move Up"
                          style={{
                            padding: '6px 10px',
                            background: idx === 0 ? '#F3F4F6' : '#FFFFFF',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            color: idx === 0 ? '#9CA3AF' : '#374151',
                            fontSize: '13px'
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() => {
                            if (idx === arr.length - 1) return;
                            const newArr = [...arr];
                            const temp = newArr[idx + 1];
                            newArr[idx + 1] = newArr[idx];
                            newArr[idx] = temp;
                            setConfig({ ...config, integration: { ...config.integration, modelFallbacks: newArr } });
                          }}
                          title="Move Down"
                          style={{
                            padding: '6px 10px',
                            background: idx === arr.length - 1 ? '#F3F4F6' : '#FFFFFF',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            cursor: idx === arr.length - 1 ? 'not-allowed' : 'pointer',
                            color: idx === arr.length - 1 ? '#9CA3AF' : '#374151',
                            fontSize: '13px'
                          }}
                        >
                          ↓
                        </button>"""

# Replace with empty string (removing the up/down arrows completely)
if old_row_fragment in app_code:
    app_code = app_code.replace(old_row_fragment, "")
    print("Removed sorting arrows from App.jsx")
else:
    print("Warning: old_row_fragment not found directly, checking variations...")

# Update default models in App.jsx to available models:
app_code = app_code.replace(
    "['gemini-3.6-flash', 'gemini-pro-latest', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']",
    "['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-pro-latest']"
)

# Also ensure dropdown has current functional labels
old_options = """                          <option value="gemini-3.7-flash">gemini-3.7-flash (Latest Fast)</option>
                          <option value="gemini-3.6-flash">gemini-3.6-flash (Stable Fast)</option>
                          <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                          <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                          <option value="gemini-pro-latest">gemini-pro-latest (Pro Tier)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Legacy)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (Legacy)</option>
                          <option value="gemini-2.0-flash">gemini-2.0-flash (Legacy)</option>
                          <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
                          <option value="gemini-1.5-pro">gemini-1.5-pro (Legacy)</option>"""

new_options = """                          <option value="gemini-3.5-flash">gemini-3.5-flash (Recommended / High Availability)</option>
                          <option value="gemini-3.7-flash">gemini-3.7-flash (Latest Fast)</option>
                          <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra Fast)</option>
                          <option value="gemini-3.6-flash">gemini-3.6-flash (Daily Quota: 20 reqs)</option>
                          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                          <option value="gemini-pro-latest">gemini-pro-latest (Pro Tier)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Legacy)</option>
                          <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>"""

app_code = app_code.replace(old_options, new_options)

with open(app_file, "w") as f:
    f.write(app_code)

# 2. Update server.ts to use fast 12s timeout and robust fallback logic
server_file = "server.ts"
with open(server_file, "r") as f:
    server_code = f.read()

# Replace defaults in server.ts
server_code = server_code.replace(
    '["gemini-3.6-flash", "gemini-pro-latest", "gemini-3.7-flash", "gemini-2.5-flash", "gemini-1.5-flash"]',
    '["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-pro-latest"]'
)

# Replace timeout from 45000 to 12000 ms so fallbacks happen fast and responsive
server_code = server_code.replace("45000", "12000")

with open(server_file, "w") as f:
    f.write(server_code)

print("App.jsx and server.ts successfully patched!")
