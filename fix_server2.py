import re

with open("server.ts", "r") as f:
    text = f.read()

# Fix the broken strings by just finding them and completing them
text = text.replace('userUploadedRagText = "\\n\\n================================', 'userUploadedRagText = "\\n\\n================================')
text = text.replace('userUploadedRagText = "\\n\\n', 'userUploadedRagText = "\\n\\n======================================================================\\n[PRIORITY 1: USER-UPLOADED RAG REFERENCE DOCUMENTS - HIGHEST GROUNDING AUTHORITY]:\\n======================================================================\\n" +\n')

text = text.replace('userGroundingLinksText = "\\n\\n================================', 'userGroundingLinksText = "\\n\\n================================')
text = text.replace('userGroundingLinksText = "\\n\\n', 'userGroundingLinksText = "\\n\\n======================================================================\\n[AUTHORITATIVE REFERENCE & RESEARCH GROUNDING LINKS]:\\n======================================================================\\n" +\n')

# Deduplicate
text = text.replace('======================================================================\\n[PRIORITY 1: USER-UPLOADED RAG REFERENCE DOCUMENTS - HIGHEST GROUNDING AUTHORITY]:\\n======================================================================\\n" +\n======================================================================\\n[PRIORITY 1: USER-UPLOADED RAG REFERENCE DOCUMENTS - HIGHEST GROUNDING AUTHORITY]:\\n======================================================================\\n" +\n', '======================================================================\\n[PRIORITY 1: USER-UPLOADED RAG REFERENCE DOCUMENTS - HIGHEST GROUNDING AUTHORITY]:\\n======================================================================\\n" +\n')

text = text.replace('======================================================================\\n[AUTHORITATIVE REFERENCE & RESEARCH GROUNDING LINKS]:\\n======================================================================\\n" +\n======================================================================\\n[AUTHORITATIVE REFERENCE & RESEARCH GROUNDING LINKS]:\\n======================================================================\\n" +\n', '======================================================================\\n[AUTHORITATIVE REFERENCE & RESEARCH GROUNDING LINKS]:\\n======================================================================\\n" +\n')


with open("server.ts", "w") as f:
    f.write(text)
