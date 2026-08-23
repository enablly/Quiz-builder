import re

with open("server.ts", "r") as f:
    text = f.read()

pattern = r'let userUploadedRagText = "";.*?(?=\n      const scoreLabelName)'

replacement = """let userUploadedRagText = "";
      const allRagFiles = [...dangerRagFiles, ...sec2RagFiles, ...sec4RagFiles];
      if (allRagFiles.length > 0) {
        userUploadedRagText = "\\n\\n======================================================================\\n[PRIORITY 1: USER-UPLOADED RAG REFERENCE DOCUMENTS - HIGHEST GROUNDING AUTHORITY]:\\n======================================================================\\n" +
          allRagFiles.map((f: any) => `--- DOCUMENT: ${f.name} ---\\n${f.textContent || ''}`).join("\\n\\n");
      }

      let userGroundingLinksText = "";
      if (dangerRagLinks.length > 0) {
        userGroundingLinksText = "\\n\\n======================================================================\\n[AUTHORITATIVE REFERENCE & RESEARCH GROUNDING LINKS]:\\n======================================================================\\n" +
          "Incorporate and synthesize findings, standards, and benchmarks from these specific reference links into your analysis and inline citations:\\n" +
          dangerRagLinks.map((l: any) => `- ${l.label || 'Reference'}: ${l.url}`).join("\\n");
      }

      const humanControlledHeadingsText = `
======================================================================
[HUMAN-CONTROLLED SECTION FRAMING - PRESERVE EXACT HEADINGS, EYEBROWS & DESCRIPTIONS]:
======================================================================
The human administrator has defined the following exact Eyebrow badges, Titles, and Sub-descriptions for the 5 report sections:
- Section 1: Eyebrow: "${s1.eyebrow || '01. OVERVIEW'}" | Title: "${s1.sectionHeading || 'Company Intelligence & Workplace Research Context'}" | Description: "${s1.description || ''}"
- Section 2: Eyebrow: "${s2.eyebrow || '02. AI DIAGNOSTIC'}" | Title: "${s2.sectionHeading || `Technical Score Breakdown (${scoreData}/100 ${scoreLabelName} Analysis)`}" | Description: "${s2.description || ''}"
- Section 3: Eyebrow: "${s3.eyebrow || '03. INFRASTRUCTURE'}" | Title: "${s3.sectionHeading || 'Critical Architectural & Operational Friction Points (Bottom-Line Impact)'}" | Description: "${s3.description || ''}"
- Section 4: Eyebrow: "${s4.eyebrow || '04. STRATEGIC ROADMAP'}" | Title: "${s4.sectionHeading || 'High-Performance Spatial Optimization Roadmap'}" | Description: "${s4.description || ''}"
- Section 5: Eyebrow: "${s5.eyebrow || '05. IMPLEMENTATION'}" | Title: "${s5.sectionHeading || 'Executive Next Steps: Beyond DIY to Certified Spatial Mastery'}" | Description: "${s5.description || ''}"

You MUST output each section wrapped with its exact eyebrow badge <span class="section-eyebrow-pill"><span class="bullet-dot"></span>EYEBROW</span>, heading <h3>[NUMBER]. [TITLE]</h3>, and sub-description <p class="section-desc">[DESCRIPTION]</p> before the content.`;"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(text)
