import re

with open("server.ts", "r") as f:
    text = f.read()

# Clean up all the garbage humanControlledHeadingsText injects
text = re.sub(r'\s*const humanControlledHeadingsText = `', '', text)
# Then manually re-inject it exactly once right before the heading block
text = text.replace('======================================================================\n[HUMAN-CONTROLLED SECTION FRAMING', '      const humanControlledHeadingsText = `\n======================================================================\n[HUMAN-CONTROLLED SECTION FRAMING')

with open("server.ts", "w") as f:
    f.write(text)
