import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

function formatAiReportHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  let clean = rawHtml.trim();

  // 1. Remove markdown backticks block
  clean = clean.replace(/^```html\s*/gi, '').replace(/^```\s*/gi, '').replace(/```\s*$/g, '').trim();

  // 2. Unescape common HTML entities if escaped
  if (clean.includes("&lt;") && clean.includes("&gt;")) {
    clean = clean
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // 3. Remove any echoed section directive headers or quoted prompt text
  clean = clean.replace(/\[SECTION \d+ (?:CUSTOM |DEFAULT )?DIRECTIVE[^\]]*\]:?/gi, '');
  clean = clean.replace(/\[AI INSTRUCTION[^\]]*\]:?/gi, '');
  clean = clean.replace(/&quot;Analyze the provided survey responses[\s\S]*?&quot;/gi, '');
  clean = clean.replace(/"Analyze the provided survey responses[\s\S]*?"/gi, '');
  clean = clean.replace(/&quot;Based on the organization&#39;s survey responses[\s\S]*?&quot;/gi, '');
  clean = clean.replace(/&quot;Based on the organization's survey responses[\s\S]*?&quot;/gi, '');
  clean = clean.replace(/"Based on the organization's survey responses[\s\S]*?"/gi, '');
  clean = clean.replace(/&quot;Perform a web search on the target company[\s\S]*?&quot;/gi, '');
  clean = clean.replace(/"Perform a web search on the target company[\s\S]*?"/gi, '');

  // 4. Convert markdown bolding (**text** or __text__) to <strong>text</strong>
  clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  clean = clean.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 5. Convert markdown italic (*text* or _text_) to <em>text</em> when not inside HTML tags
  clean = clean.replace(/(^|[^\w>])\*([^*]+)\*([^\w<]|$)/g, '$1<em>$2</em>$3');

  // 6. Convert leftover markdown bullet items (- item or * item) to <li>item</li>
  clean = clean.replace(/(?:^|\n)\s*[-*]\s+(.+?)(?=\n|$)/g, '\n<li>$1</li>');

  return clean.trim();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Company research & AI Diagnosis Endpoint
  app.post("/api/analyze-company", async (req, res) => {
    const startTime = Date.now();
    try {
      const { company, leadName, role, scoreData, qaText, customApiKey, reportSections, aiPersona, ctaConfig } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: "No Gemini API key available." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Extract designer prompts, uploaded RAG reference files, and danger zone master prompt
      const s1 = reportSections?.[0] || {};
      const s2 = reportSections?.[1] || {};
      const s3 = reportSections?.[2] || {};
      const s4 = reportSections?.[3] || {};
      const s5 = reportSections?.[4] || {};

      const sec2Prompt = s2.prompt ? s2.prompt.trim() : "";
      const sec4Prompt = s4.prompt ? s4.prompt.trim() : "";

      const sec2RagFiles: any[] = Array.isArray(s2.ragFiles) ? s2.ragFiles : [];
      const sec4RagFiles: any[] = Array.isArray(s4.ragFiles) ? s4.ragFiles : [];

      const dangerZoneConfig = req.body.dangerZoneConfig || {};
      const customMasterPrompt = (dangerZoneConfig.masterPrompt || "").trim();
      const customDefaultRagBank = (dangerZoneConfig.defaultRagBank || "").trim();
      const dangerRagFiles: any[] = Array.isArray(dangerZoneConfig.ragFiles) ? dangerZoneConfig.ragFiles : [];
      const dangerRagLinks: any[] = Array.isArray(dangerZoneConfig.ragLinks) ? dangerZoneConfig.ragLinks : [];

      let userUploadedRagText = "";
      const allRagFiles = [...dangerRagFiles, ...sec2RagFiles, ...sec4RagFiles];
      if (allRagFiles.length > 0) {
        userUploadedRagText = "\n\n======================================================================\n[PRIORITY 1: USER-UPLOADED RAG REFERENCE DOCUMENTS - HIGHEST GROUNDING AUTHORITY]:\n======================================================================\n" +
          allRagFiles.map((f: any) => `--- DOCUMENT: ${f.name} ---\n${f.textContent || ''}`).join("\n\n");
      }

      let userGroundingLinksText = "";
      if (dangerRagLinks.length > 0) {
        userGroundingLinksText = "\n\n======================================================================\n[AUTHORITATIVE REFERENCE & RESEARCH GROUNDING LINKS]:\n======================================================================\n" +
          "Incorporate and synthesize findings, standards, and benchmarks from these specific reference links into your analysis and inline citations:\n" +
          dangerRagLinks.map((l: any) => `- ${l.label || 'Reference'}: ${l.url}`).join("\n");
      }
      // 1. Resolve human-defined static content for Sections 1, 3, 5
      const s1TextBox = (s1.textBox || "").trim() || "Workplace analysis for <strong>" + (company || 'your organization') + "</strong> indicates an accelerating transition toward hybrid collaboration and generative AI adoption. Organizations operating in this space require high spatial adaptability and strict acoustic containment to maximize cognitive output and retain top technical talent.";
      const s3TextBox = (s3.textBox || "").trim() || "Spatial flexibility and STC 38+ acoustic enclosures mitigate context-switching latency. Implementing agile micro-zones prevents open-plan acoustic spill and preserves uninterrupted focus.";
      const s5TextBox = (s5.textBox || "").trim() || "Schedule a dedicated consultation with workplace strategy specialists to conduct a comprehensive on-site acoustic and spatial audit, tailored to your technical team topologies.";

      function buildSectionWithVisuals(sec: any, secNum: number, defaultEyebrow: string, defaultHeading: string, defaultContent: string) {
        const eyebrow = sec?.eyebrow || defaultEyebrow;
        const heading = sec?.sectionHeading || defaultHeading;
        const desc = sec?.description || '';
        const img = sec?.imageUrl || '';
        const txt = (sec?.textBox || '').trim() || defaultContent;
        const extraBlocks = Array.isArray(sec?.extraBlocks) ? sec.extraBlocks : [];

        let extraBlocksHtml = '';
        extraBlocks.forEach((blk: any, bIdx: number) => {
          if (!blk.textBox && !blk.imageUrl) return;
          const isRight = bIdx % 2 === 0;
          extraBlocksHtml += `<div style="margin-top:12px; background:#F9FAFB; padding:16px 18px; border-radius:6px; border:1px solid #E5E7EB; overflow:hidden;">
            ${blk.imageUrl ? `<div style="float:${isRight ? 'right' : 'left'}; width:220px; max-width:40%; margin-${isRight ? 'left' : 'right'}:16px; margin-bottom:10px; border-radius:6px; overflow:hidden; border:1px solid #E5E7EB;"><img src="${blk.imageUrl}" alt="Visual ${bIdx + 1}" style="width:100%; height:auto; display:block; object-fit:cover;" /></div>` : ''}
            ${blk.textBox ? `<div style="font-size:13.5px; line-height:1.65; color:#374151;">${blk.textBox}</div>` : ''}
            <div style="clear:both;"></div>
          </div>`;
        });

        return `
<div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">
  <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${eyebrow}</span>
  <h3 style="margin-top:0; font-size:18px; color:#111827;">${secNum}. ${heading}</h3>
  ${desc ? `<p class="section-desc">${desc}</p>` : ''}
  <div style="background:#F9FAFB; padding:16px 18px; border-radius:6px; border:1px solid #E5E7EB; overflow:hidden;">
    ${img ? `<div style="float:left; width:220px; max-width:40%; margin-right:16px; margin-bottom:10px; border-radius:6px; overflow:hidden; border:1px solid #E5E7EB;"><img src="${img}" alt="Section ${secNum} Visual" style="width:100%; height:auto; display:block; object-fit:cover;" /></div>` : ''}
    <div style="font-size:13.5px; line-height:1.65; color:#374151;">${txt}</div>
    <div style="clear:both;"></div>
  </div>
  ${extraBlocksHtml}
</div>`;
      }

      function buildAiSection(sec: any, secNum: number, defaultEyebrow: string, defaultHeading: string, aiContent: string, isGreenTheme = false) {
        const eyebrow = sec?.eyebrow || defaultEyebrow;
        const heading = sec?.sectionHeading || defaultHeading;
        const desc = sec?.description || '';

        return `
<div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">
  <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${eyebrow}</span>
  <h3 style="margin-top:0; font-size:18px; color:#111827;">${secNum}. ${heading}</h3>
  ${desc ? `<p class="section-desc">${desc}</p>` : ''}
  <div style="${isGreenTheme ? 'margin-top:12px; padding:20px 24px; background:#F0FDF4; border:1px solid #BBF7D0; border-left:5px solid #16A34A; border-radius:8px;' : 'margin-top:12px; margin-bottom:16px; background:#F0F7FF; border:1px solid #BFDBFE; border-left:5px solid #1D4ED8; border-radius:8px; padding:20px 24px;'}">
    ${aiContent}
  </div>
</div>`;
      }

      function assembleCompleteReport(sec2AiBody: string, sec4AiBody: string): string {
        const sec1Html = buildSectionWithVisuals(s1, 1, '01. OVERVIEW', 'Company Intelligence & Workplace Research Context', s1TextBox);
        const sec2Html = buildAiSection(s2, 2, '02. AI DIAGNOSTIC', `Technical Score Breakdown (${scoreData}/100 Index Analysis)`, sec2AiBody, false);
        const sec3Html = buildSectionWithVisuals(s3, 3, '03. INFRASTRUCTURE', 'Critical Architectural & Operational Friction Points (Bottom-Line Impact)', s3TextBox);
        const sec4Html = buildAiSection(s4, 4, '04. STRATEGIC ROADMAP', 'High-Performance Spatial Optimization Roadmap', sec4AiBody, true);
        const sec5Html = buildSectionWithVisuals(s5, 5, '05. IMPLEMENTATION', 'Executive Next Steps: Beyond DIY to Certified Spatial Mastery', s5TextBox);

        const customFootnotes = dangerZoneConfig.footnotesReferenceHtml || null;
        const footnotesHtml = customFootnotes || `
<div class="footnotes-box" style="margin-top:36px; padding:22px 26px; background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #2563EB; border-radius:8px;">
  <h4 style="margin:0 0 14px 0; font-size:14px; font-weight:700; color:#1E3A8A; text-transform:uppercase;">📚 Cited Sources & Benchmark Research References</h4>
  <ol class="footnotes-list" style="margin:0; padding-left:20px; font-size:12.5px; color:#4B5563; line-height:1.6;">
    <li id="fn-uc-irvine"><strong>UC Irvine / Wall Street Journal Focus Study:</strong> Interruption recovery study demonstrating 23min 15sec task-switching overhead per interruption ($28,000/employee/year in lost billable output). <a href="https://www.ics.uci.edu/~gmark/" target="_blank" rel="noopener noreferrer">UC Irvine Research</a> | <a href="https://www.wsj.com" target="_blank" rel="noopener noreferrer">WSJ Analysis</a></li>
    <li id="fn-sap"><strong>SAP Workplace Health Index Benchmark:</strong> Enterprise spatial study showing each 1% increase in index yields $90M–$100M in annual operating profit gain. <a href="https://www.sap.com" target="_blank" rel="noopener noreferrer">SAP Enterprise Study</a></li>
    <li id="fn-cisco"><strong>Cisco PENN 1 Hybrid Workspace Blueprint:</strong> Office redesign achieving 40% increase in collaboration zones and 36% lower footprint cost. <a href="https://www.cisco.com/c/en/us/solutions/hybrid-work/penn-1.html" target="_blank" rel="noopener noreferrer">Cisco PENN 1 Blueprint</a></li>
    <li id="fn-microsoft"><strong>Microsoft Modern AI Workplace Study:</strong> Reengineered AI co-creation workspaces reducing task-switching overhead and boosting velocity by 22%. <a href="https://www.steelcase.com/research/" target="_blank" rel="noopener noreferrer">Steelcase WorkSpace Research</a></li>
    <li id="fn-flex-agile"><strong>Steelcase Flex Agile Teams Study:</strong> High-performing cross-functional teams equipped with adaptable furniture and spatial reconfigurability are 5x more likely to be high-performing. <a href="https://www.steelcase.com/research/articles/topics/privacy/" target="_blank" rel="noopener noreferrer">Steelcase Flex Agile Study</a></li>
  </ol>
</div>`;

        return `${sec1Html}\n${sec2Html}\n${sec3Html}\n${sec4Html}\n${sec5Html}\n${footnotesHtml}`;
      }

      // 2. Resolve user-editable prompts for Sections 2 & 4
      const defaultSec2Prompt = `Evaluate \${company || 'the client organization'}'s AI Workplace Readiness Index score (\${scoreData}/100) across the 6 core workplace dimensions (AI adoption, focus & cognitive performance, hybrid collaboration, workplace choice, employee experience, and future spatial adaptability).\n\nPerform a targeted web search on \${company || 'the client organization'} to identify verified public intelligence regarding their industry footprint, office locations, return-to-office (RTO) policies, and technology workforce scale.\n\nWrite a highly scannable executive diagnostic utilizing HTML tags like <b>, <ul>, and <li> to structure the narrative:\n- <b>Diagnostic Baseline:</b> Synthesize their specific score (\${scoreData}/100) with their organizational profile. Identify their primary physical workspace bottleneck (e.g. acoustic bleed from video calls, lack of solitary deep-work prompting pods, or static floorplate rigidity).\n- <b>Cognitive & Productivity Toll:</b> Analyze how these spatial constraints induce context-switching latency (referencing the 23-minute focus recovery benchmark) and impede rapid generative AI experimentation.`;
      
      const defaultSec4Prompt = `Based on \${company || 'the client organization'}'s diagnostic score (\${scoreData}/100), surveyed friction points, and the verified public workplace context research gathered in Section 2, construct a prioritized 3-pillar spatial transformation roadmap for AI-enabled teams.\n\nCRITICAL INSTRUCTION: Explicitly reference the verified company details and context (e.g. recent RTO mandates, industry footprint) you researched earlier to justify these spatial recommendations.\n\nFormulate 3 actionable interventions formatted as structured HTML bullet points (using <ul>, <li>, and <b>):\n- 1. Acoustic & Deep-Focus Sanctuaries: Implement high-STC (38+) micro-pods and quiet library zones within 30 feet of primary desk areas to protect high-intensity AI prompting and confidential hybrid video calls.\n- 2. Agile Reconfigurable Team Neighborhoods: Introduce mobile acoustic boundary screens and modular whiteboard topologies that allow sprint teams to pivot instantly between solo synthesis and active co-creation.\n- 3. Dynamic Power & Hybrid Meeting Equity: Deploy distributed mobile power hubs and sightline-optimized curved video settings with spatial audio for equal conversational parity between remote and in-person collaborators.`;

      const resolvedSec2Prompt = (sec2Prompt || defaultSec2Prompt)
        .replace(/\{company\}/gi, company || 'the client organization')
        .replace(/\{score\}/gi, String(scoreData || 0))
        .replace(/\{leadName\}/gi, leadName || 'Executive')
        .replace(/\{role\}/gi, role || 'Leader');

      const resolvedSec4Prompt = (sec4Prompt || defaultSec4Prompt)
        .replace(/\{company\}/gi, company || 'the client organization')
        .replace(/\{score\}/gi, String(scoreData || 0))
        .replace(/\{leadName\}/gi, leadName || 'Executive')
        .replace(/\{role\}/gi, role || 'Leader');

      const personaRole = aiPersona?.role || "Senior Workplace Strategy Architect";
      const personaFocus = aiPersona?.focusAreas ? ` Focus areas: ${aiPersona.focusAreas}.` : "";
      const personaTone = aiPersona?.tone ? ` Tone: ${aiPersona.tone}.` : "";

      const masterPromptHeader = customMasterPrompt || `You are a ${personaRole}. You are generating AI research and diagnostics for "${company || 'a client organization'}" (Score: ${scoreData}/100).${personaFocus}${personaTone}`;

      const promptStr = `${masterPromptHeader}

SURVEY INPUTS & USER RESPONSES:
${qaText}
${userUploadedRagText}
${userGroundingLinksText}
${customDefaultRagBank ? `\nREFERENCE KNOWLEDGE:\n${customDefaultRagBank}` : ''}

TASK & OPERATING RULES:
You are responsible for generating ONLY Section 2 and Section 4.
Sections 1, 3, and 5 contain fixed human-authored materials and must NOT be generated by AI.

Execute the following exact prompt instructions for Sections 2 and 4:

[SECTION 2 PROMPT (Human-Configured)]:
${resolvedSec2Prompt}

[SECTION 4 PROMPT (Human-Configured)]:
${resolvedSec4Prompt}

OUTPUT FORMAT:
Return a JSON object containing the HTML strings for Section 2 and Section 4:
{
  "section2Html": "<p>...content...</p>",
  "section4Html": "<p>...content or bullet list...</p>"
}

IMPORTANT:
- Output MUST be valid JSON with keys "section2Html" and "section4Html".
- Follow the exact formatting, length, and content requirements specified in each section prompt.
- Do NOT output markdown code blocks or backticks around the JSON.`;

      let htmlResult = "";
      const thinkingLogs: string[] = [];
      const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

      const rawFallbacks = Array.isArray(req.body.modelFallbacks) ? req.body.modelFallbacks : [];
      const userFallbacks = rawFallbacks.map((m: any) => String(m || '').trim()).filter((m: string) => m.length > 0);
      
      const healthyDefaults = [
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-pro-latest"
      ];

      // Combine user selection with guaranteed healthy fallbacks
      const baseModels = Array.from(new Set([...userFallbacks, ...healthyDefaults])).slice(0, 6);

      // Implement Round Robin Load Balancing: start from a different index each time based on current time
      // This ensures we distribute load across models equally to avoid rate limits
      const startIndex = Math.floor(Date.now() / 1000) % baseModels.length;
      const modelsToTry = [
        ...baseModels.slice(startIndex),
        ...baseModels.slice(0, startIndex)
      ];

      thinkingLogs.push(`[${timestamp()}] [AI Engine] Initiated diagnostic generator for: "${company || 'Target Organization'}"`);
      thinkingLogs.push(`[${timestamp()}] [AI Engine] Priority fallback sequence (${modelsToTry.length} models): ${modelsToTry.join(', ')}`);
      let lastError: any = null;

      const runWithTimeout = <T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> => {
        let timer: NodeJS.Timeout;
        return Promise.race([
          promise.then(res => {
            clearTimeout(timer);
            return res;
          }),
          new Promise<T>((_, reject) => {
            timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
          })
        ]);
      };

      const isQuotaOrNotFoundError = (err: any): boolean => {
        const msg = String(err?.message || err || "").toLowerCase();
        const status = err?.status || err?.statusCode || 0;
        return status === 429 || status === 404 || msg.includes("429") || msg.includes("404") || msg.includes("not_found") || msg.includes("not found") || msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("rate limit") || msg.includes("unavailable") || msg.includes("503");
      };

      for (const modelName of modelsToTry) {
        let sources: Array<{ title: string; uri: string }> = [];
        try {
          thinkingLogs.push(`[${timestamp()}] [Gemini API] Querying ${modelName}...`);
          console.log(`[AI Diagnosis] Requesting generation with model: ${modelName}...`);
          
          // Try standard generation directly for fast, high-reliability live AI analysis
          const response = await runWithTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: promptStr,
            }),
            25000,
            `Model ${modelName} timed out after 25s`
          );

          if (response && response.text) {
            let aiText = response.text.trim();
            thinkingLogs.push(`[${timestamp()}] [SUCCESS] Model ${modelName} generated custom AI diagnosis (${aiText.length} chars).`);
            
            // Clean up code block markdown if present
            aiText = aiText.replace(/^```(?:json|html)?\s*/i, '').replace(/\s*```$/i, '').trim();

            let sec2Html = "";
            let sec4Html = "";

            try {
              const parsed = JSON.parse(aiText);
              sec2Html = parsed.section2Html || parsed.section2 || "";
              sec4Html = parsed.section4Html || parsed.section4 || "";
            } catch (pErr) {
              // If not valid JSON, extract by HTML tags or fallback
              if (aiText.includes("<h3>2.") || aiText.includes("<h3>4.")) {
                const s2Match = aiText.match(/<h3>2\.[^<]*<\/h3>([\s\S]*?)(?=<h3>[345]\.|$)/i);
                const s4Match = aiText.match(/<h3>4\.[^<]*<\/h3>([\s\S]*?)(?=<h3>[5]\.|$)/i);
                sec2Html = s2Match ? s2Match[1].trim() : "";
                sec4Html = s4Match ? s4Match[1].trim() : "";
              }
              if (!sec2Html) {
                sec2Html = `<p>${aiText}</p>`;
              }
            }

            if (!sec2Html) {
              sec2Html = `<p><strong>${company || 'The organization'}</strong> scored <strong>${scoreData}/100</strong>. In modern knowledge environments, spatial adaptability and acoustic isolation directly dictate cognitive performance and employee retention.</p><p>${s2.textBox || resolvedSec2Prompt.split('\n')[0]}</p>`;
            }

            if (!sec4Html) {
              sec4Html = s4.textBox 
                ? `<div>${s4.textBox}</div>`
                : `<ul>
                    <li><strong>Acoustic Focus Zones:</strong> Deploy dedicated high-STC quiet pods to isolate intensive solo tasks and prevent acoustic spill.</li>
                    <li><strong>Adaptive Team Neighborhoods:</strong> Implement agile, reconfigurable furnishings to support quick transitions between solo focus and collaborative sprints.</li>
                    <li><strong>Flexible Infrastructure:</strong> Ensure distributed power access and ergonomic support tailored to agile team topologies.</li>
                  </ul>`;
            }

            htmlResult = assembleCompleteReport(sec2Html, sec4Html);

            const modelUsed = modelName;
            const latencyMs = Date.now() - startTime;
            console.log(`[AI Diagnosis] Successfully generated report using model: ${modelName} in ${latencyMs}ms`);
            return res.json({ 
              html: formatAiReportHtml(htmlResult), 
              thinkingLogs,
              telemetry: {
                modelUsed,
                latencyMs,
                status: "success (live AI)",
                groundingSourcesCount: sources.length,
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const quotaFlag = isQuotaOrNotFoundError(err) ? " [QUOTA / CAPACITY LIMIT]" : "";
          thinkingLogs.push(`[${timestamp()}] [NOTICE] ${modelName} skipped${quotaFlag}: ${errMsg.slice(0, 100)}`);
          console.warn(`[AI Diagnosis] Attempt with model ${modelName} failed:`, errMsg);
        }
      }

      // If all live API attempts fail (e.g. quota exhausted 429), generate a comprehensive fallback report
      if (!htmlResult) {
        thinkingLogs.push(`[${timestamp()}] [EXHAUSTION / QUOTA NOTICE] Live Gemini API limits encountered or key quota spent.`);
        thinkingLogs.push(`[${timestamp()}] [SYNTHESIS ENGINE] Generated report using human materials (1,3,5) and configured section prompts (2,4).`);
        console.log("Generating fallback report with human materials and section prompts...");

        const fallbackSec2Body = `<p><strong>${company || 'The organization'}</strong> scored <strong>${scoreData}/100</strong>. In modern knowledge environments, spatial adaptability and acoustic isolation directly dictate cognitive performance and employee retention.</p><p>${s2.textBox || resolvedSec2Prompt.split('\n')[0]}</p>`;

        const fallbackSec4Body = s4.textBox 
          ? `<div>${s4.textBox}</div>`
          : `<ul>
              <li><strong>Acoustic Focus Zones:</strong> Deploy dedicated high-STC quiet pods to isolate intensive solo tasks and prevent acoustic spill.</li>
              <li><strong>Adaptive Team Neighborhoods:</strong> Implement agile, reconfigurable furnishings to support quick transitions between solo focus and collaborative sprints.</li>
              <li><strong>Flexible Infrastructure:</strong> Ensure distributed power access and ergonomic support tailored to agile team topologies.</li>
            </ul>`;

        htmlResult = assembleCompleteReport(fallbackSec2Body, fallbackSec4Body);
      }

      // Format HTML output to remove code fences, fix markdown bolding/italics, and unescape entities
      htmlResult = formatAiReportHtml(htmlResult);
      const latencyMs = Date.now() - startTime;

      res.json({ 
        html: htmlResult, 
        thinkingLogs,
        telemetry: {
          modelUsed: "Benchmark Engine (Synthesis)",
          latencyMs,
          status: "fallback_synthesis",
          groundingSourcesCount: 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI analysis." });
    }
  });

  // Scan & Sync Gemini Models
  app.post("/api/list-models", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required to scan models." });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || "Failed to fetch models from Google API." });
      }

      // Filter for generation models, exclude non-text models, and extract the short name
      const excludedKeywords = ["-tts", "-image", "-robotics", "-computer-use", "-omni", "-customtools"];
      
      const models = data.models
        .filter((m: any) => {
          if (!m.name.includes("gemini") || !(m.supportedGenerationMethods || []).includes("generateContent")) {
            return false;
          }
          const shortName = m.name.replace("models/", "");
          return !excludedKeywords.some(keyword => shortName.includes(keyword));
        })
        .map((m: any) => m.name.replace("models/", ""));
        
      // Sort in reverse alphabetical (newest versions usually sort higher)
      models.sort((a: string, b: string) => b.localeCompare(a));

      res.json({ models });
    } catch (error: any) {
      console.error("List Models Error:", error);
      res.status(500).json({ error: error.message || "Internal server error while fetching models." });
    }
  });

  // 1-Click Publish to GitHub (HQ)
  app.post("/api/publish-github", async (req, res) => {
    try {
      const { token, repo, branch = "main", filePath = "index.html", content, commitMessage } = req.body;

      if (!token) {
        return res.status(400).json({ error: "GitHub Personal Access Token is required." });
      }
      if (!repo || !repo.includes("/")) {
        return res.status(400).json({ error: "Repository must be in 'owner/repo' format (e.g., username/hosted-quiz)." });
      }
      if (!content) {
        return res.status(400).json({ error: "No file content provided to publish." });
      }

      const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
      const [owner, repoName] = cleanRepo.split("/");
      const cleanBranch = (branch || "main").trim();
      const cleanPath = (filePath || "index.html").trim().replace(/^\/+/, "");
      const message = commitMessage || `Publish Hosted Quiz v3.3 via Quiz Builder (${new Date().toLocaleDateString()})`;

      // 1. Check if the file already exists on the target branch to retrieve its SHA
      let fileSha: string | undefined;
      const getFileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${cleanPath}?ref=${encodeURIComponent(cleanBranch)}`;
      
      const getResponse = await fetch(getFileUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token.trim()}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "QuizBuilder-HQ-Publisher",
        },
      });

      if (getResponse.ok) {
        const data: any = await getResponse.json();
        fileSha = data.sha;
      } else if (getResponse.status === 401) {
        return res.status(401).json({ error: "Invalid GitHub Personal Access Token. Please verify token permissions." });
      } else if (getResponse.status === 403) {
        const errData: any = await getResponse.json().catch(() => ({}));
        return res.status(403).json({ error: errData.message || "Permission denied. Ensure your token has 'Contents: Read & Write' permission for this repository." });
      }

      // 2. Commit and push the standalone HQ index.html content (base64 encoded)
      const putFileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${cleanPath}`;
      const base64Content = Buffer.from(content, "utf-8").toString("base64");

      const putBody: any = {
        message: message,
        content: base64Content,
        branch: cleanBranch,
      };
      if (fileSha) {
        putBody.sha = fileSha;
      }

      const putResponse = await fetch(putFileUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token.trim()}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "QuizBuilder-HQ-Publisher",
        },
        body: JSON.stringify(putBody),
      });

      const putData: any = await putResponse.json();

      if (!putResponse.ok) {
        return res.status(putResponse.status).json({
          error: putData.message || "Failed to commit file to GitHub repository.",
          details: putData,
        });
      }

      const pagesUrl = `https://${owner.toLowerCase()}.github.io/${repoName}/`;
      const repoUrl = `https://github.com/${owner}/${repoName}`;
      const commitUrl = putData.commit?.html_url || `${repoUrl}/commits/${cleanBranch}`;

      res.json({
        success: true,
        message: fileSha ? "Hosted Quiz (HQ) updated successfully on GitHub!" : "Hosted Quiz (HQ) published successfully on GitHub!",
        repo: cleanRepo,
        branch: cleanBranch,
        filePath: cleanPath,
        commitSha: putData.commit?.sha,
        commitUrl: commitUrl,
        repoUrl: repoUrl,
        pagesUrl: pagesUrl,
        publishedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("GitHub Publish Error:", error);
      res.status(500).json({ error: error.message || "Internal server error while publishing to GitHub." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const possibleDistPaths = [
      path.join(process.cwd(), "dist"),
      path.resolve(__dirname, "dist"),
      path.resolve(__dirname, "..", "dist"),
      path.resolve(__dirname),
    ];
    const distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, "index.html"))) || path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Forced update to trigger GitHub sync for Cloud Run deployment
  });
}

startServer();
// Force trigger GitHub sync
