import os

file = "server.ts"

with open(file, "r") as f:
    content = f.read()

old_array = """        : [
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-flash-lite-latest"
          ];"""

new_array = """        : [
            "gemini-pro-latest",
            "gemini-3.7-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-pro-preview",
            "gemini-3.6-flash"
          ];"""

content = content.replace(old_array, new_array)

with open(file, "w") as f:
    f.write(content)

print("Done")
