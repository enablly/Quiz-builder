import os

file = "src/App.jsx"

with open(file, "r") as f:
    content = f.read()

# Fix the datalist options
old_datalist = """                  <datalist id="gemini-suggested-models">
                    <option value="gemini-3.6-flash" />
                    <option value="gemini-3.5-flash" />
                    <option value="gemini-3.5-flash-lite" />
                    <option value="gemini-3.1-flash-lite" />
                    <option value="gemini-3.7-flash" />
                    <option value="gemini-3.5-flash-lite" />
                    <option value="gemini-flash-latest" />
                    <option value="gemini-flash-lite-latest" />
                  </datalist>"""

new_datalist = """                  <datalist id="gemini-suggested-models">
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

content = content.replace(old_datalist, new_datalist)

with open(file, "w") as f:
    f.write(content)

print("Done datalist")
