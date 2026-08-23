import os

file = "server.ts"
with open(file, "r") as f:
    content = f.read()

old_array = """        : [
            "gemini-pro-latest",
            "gemini-3.7-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-pro-preview",
            "gemini-3.6-flash"
          ];"""

new_array = """        : [
            "gemini-3.6-flash",
            "gemini-pro-latest",
            "gemini-3.7-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash"
          ];"""

content = content.replace(old_array, new_array)

with open(file, "w") as f:
    f.write(content)

print("Done")
