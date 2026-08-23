import os

file = "src/App.jsx"
with open(file, "r") as f:
    content = f.read()

old_datalist = """                  <datalist id="gemini-suggested-models">
                    <option value="gemini-pro-latest" />
                    <option value="gemini-3.7-flash" />
                    <option value="gemini-3.5-flash-lite" />
                    <option value="gemini-3.1-pro-preview" />
                    <option value="gemini-3.6-flash" />
                    <option value="gemini-3.5-flash" />
                    <option value="gemini-3.1-flash-lite" />
                    <option value="gemini-3-flash-preview" />
                    <option value="gemini-flash-latest" />
                    <option value="gemini-flash-lite-latest" />
                  </datalist>"""

old_input = """                        <input
                          type="text"
                          list="gemini-suggested-models"
                          value={mName}
                          onChange={(e) => {
                            const newArr = [...arr];
                            newArr[idx] = e.target.value;
                            setConfig({ ...config, integration: { ...config.integration, modelFallbacks: newArr } });
                          }}
                          placeholder="e.g. gemini-3.6-flash"
                          style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '4px', background: '#FFFFFF', color: '#111827' }}
                        />"""

new_select = """                        <select
                          value={mName}
                          onChange={(e) => {
                            const newArr = [...arr];
                            newArr[idx] = e.target.value;
                            setConfig({ ...config, integration: { ...config.integration, modelFallbacks: newArr } });
                          }}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '4px', background: '#FFFFFF', color: '#111827' }}
                        >
                          <option value="gemini-3.7-flash">gemini-3.7-flash (Latest Fast)</option>
                          <option value="gemini-3.6-flash">gemini-3.6-flash (Stable Fast)</option>
                          <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                          <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                          <option value="gemini-pro-latest">gemini-pro-latest (Pro Tier)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Legacy)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (Legacy)</option>
                          <option value="gemini-2.0-flash">gemini-2.0-flash (Legacy)</option>
                          <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
                          <option value="gemini-1.5-pro">gemini-1.5-pro (Legacy)</option>
                        </select>"""

content = content.replace(old_datalist, "")
content = content.replace(old_input, new_select)

with open(file, "w") as f:
    f.write(content)

print("Done")
