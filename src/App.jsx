import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Settings, Plus, Trash2, CheckCircle2, BarChart2, Mail, Lock, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Download, Code, Phone, RefreshCw, Eye, FileText, Upload, Image, AlertCircle, Globe, ExternalLink, Send, Key, Check, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Highlighter, Heading4, User, Sparkles, Activity } from 'lucide-react';
import JSZip from 'jszip';
import RichTextEditor from './RichTextEditor';
import { generateStandaloneHtml, generateReadme, generateLeadPayloadSchema } from './generateStandaloneQuiz';
import { STEELCASE_TEMPLATES } from './steelcaseTemplates';

const DEFAULT_CONFIG = {
  activeTemplateId: 'steelcase-arc-ai',
  branding: {
    primaryColor: '#1A73E8',
    accentColor: '#1D4ED8',
    bodyColor: '#F1F3F4',
    headerColor: '#3C4043',
    logoUrl: '',
    showLogoInPdf: true,
  },
  leadCapture: {
    formType: 'native', // 'native' | 'hubspot'
    hubspot: {
      portalId: '',
      formId: '',
      region: 'na1'
    },
    requireWorkEmail: true,
    fields: {
      name: { label: "Full Name", enabled: true, required: true },
      email: { label: "Work Email", enabled: true, required: true },
      company: { label: "Company / Organization", enabled: true, required: true },
      role: { label: "Job Title / Role", enabled: true, required: false },
      phone: { label: "Direct Phone", enabled: false, required: false },
      projectStatus: { label: "Workplace Project Status", enabled: true, required: true }
    },
    customQuestions: []
  },
  ctaConfig: {
    primaryCtaText: "Apply for Executive Strategy Consultation",
    primaryCtaType: "in_app", // "in_app" | "redirect"
    redirectUrl: "",
    secondaryCtaEnabled: true,
    secondaryCtaText: "Request Direct Phone Callback",
    scoreLabel: "Readiness Score",
    disclaimer: "Confidential diagnostic prepared by Steelcase Applied Research + Consulting (ARC)."
  },
  aiPersona: {
    role: "Senior Workplace Strategy Architect & AI Workplace Specialist at Steelcase Applied Research + Consulting (ARC)",
    focusAreas: "Spatial adaptability, STC 38+ acoustic enclosures, cognitive recovery, agile pods, and power infrastructure",
    tone: "Executive, authoritative, architectural, and data-driven"
  },
  buildVersion: '1.01',
  content: {
    builderTitle: 'Quiz Builder',
    eyebrow: 'Executive Diagnostic (V4)',
    title: 'AI Workplace Readiness Index (V4)',
    description: 'Diagnostic tool to evaluate physical infrastructure readiness for AI-enabled workflows, hybrid presence, and future spatial adaptability.',
  },
  integration: {
    webhookUrl: '',
    geminiApiKey: '',
    modelFallbacks: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-pro-latest'],
    githubToken: '',
    githubRepo: '',
    githubBranch: 'main',
    githubFilePath: 'index.html',
    lastPublishedAt: '',
    lastPublishUrl: '',
  },
  reportSections: [
    {
      id: "sec1",
      title: "Section 1",
      eyebrow: "01. Overview",
      sectionHeading: "Executive Readiness Overview",
      description: "Summary of spatial readiness criteria, workplace parameters, and diagnostic baseline.",
      imageUrl: "",
      textBox: "Modern AI workflows demand dynamic balance between solitary high-focus prompting and collaborative multi-modal sprints. This diagnostic report synthesizes your organizational parameters against empirical workplace benchmarks."
    },
    {
      id: "sec2",
      title: "Section 2",
      eyebrow: "02. AI Diagnostic",
      sectionHeading: "Technical Score Breakdown & Readiness Analysis",
      description: "Analytical interpretation of what your readiness score means for spatial performance, acoustic privacy, cognitive focus, and bottom-line productivity.",
      prompt: "Analyze the organization's survey answers and overall score ({score}/100). Search online for recent verified information about {company}, focusing strictly on their workplace culture, return-to-office/hybrid policies, recent leadership/people movements, and office footprint changes.\n\nWrite a concise 2-paragraph analysis (max 150-200 words total):\n- Paragraph 1: Synthesize their survey score with their real-world corporate workplace context and recent workforce/leadership dynamics.\n- Paragraph 2: Highlight how their current physical workplace setup directly impacts employee focus, collaboration latency, and operational efficiency.",
      ragFiles: []
    },
    {
      id: "sec3",
      title: "Section 3",
      eyebrow: "03. Infrastructure",
      sectionHeading: "Infrastructure & Spatial Foundations",
      description: "Critical considerations for power distribution, acoustic isolation, and adaptable zoning.",
      imageUrl: "",
      textBox: "Spatial flexibility and STC 38+ acoustic enclosures mitigate context-switching latency. Implementing agile micro-zones prevents open-plan acoustic spill and preserves uninterrupted focus."
    },
    {
      id: "sec4",
      title: "Section 4",
      eyebrow: "04. Strategic Roadmap",
      sectionHeading: "High-Performance Spatial Optimization Roadmap",
      description: "Tailored strategic workplace interventions, architectural configurations, and actionable next steps.",
      prompt: "Based on {company}'s survey responses, score ({score}/100), and verified workplace context, provide a concise, high-impact spatial roadmap (max 2 short paragraphs or 3 tight bullet points):\n- Outline 3 targeted interventions (e.g. acoustic focus micro-pods, agile reconfigurable team zones, and power drop flexibility).\n- Directly connect each intervention to the company's culture, people workflows, and surveyed friction points.\n- Keep the recommendations concise, punchy, and actionable.",
      ragFiles: []
    },
    {
      id: "sec5",
      title: "Section 5",
      eyebrow: "05. Implementation",
      sectionHeading: "Next Steps & Implementation Guidance",
      description: "Strategic roadmap, consultation details, and benchmark deployment timelines.",
      imageUrl: "",
      textBox: "Schedule a dedicated consultation with workplace strategy specialists to conduct a comprehensive on-site acoustic and spatial audit, tailored to your technical team topologies."
    }
  ],
  dangerZoneConfig: {
    masterPrompt: `You are a Senior Workplace Strategy Architect & AI Workplace Specialist from Steelcase Applied Research + Consulting (ARC). You are conducting a high-level diagnostic assessment for the client organization.

SURVEY INPUTS & DIAGNOSTIC DIRECTIVES:
Analyze the organization's scores across spatial adaptability, acoustic containment, and cognitive velocity. Synthesize their parameters against empirical workplace benchmarks.

STEP 1: MANDATORY WEB RESEARCH & COMPANY INTELLIGENCE
Perform Google search research on the client organization to extract specific verified intelligence:
1. Company background, industry sector, headquarters location, key offices, and scale.
2. Recent workplace news, office openings, headquarters relocations, hybrid/RTO work policies.
3. Major technology initiatives, AI strategy, engineering expansions, or digital transformation press news.
- Insert hyperlinked HTML anchor tags with target="_blank" rel="noopener noreferrer" directly in the prose for every cited source.

STEP 2: HIGHLY TECHNICAL & INSIGHTFUL WORKPLACE DIAGNOSTIC REPORT
Write a deeply technical, analytical, and actionable workplace diagnostic report using professional workplace architecture and environmental psychology terminology (STC, RT60, Visual Privacy Index, Cognitive Load & Task Switching Overhead, Micro-Zones for Focused AI Prompting, Agile Pod Topologies). Attach inline cited source badges with hover tooltips and footnote links.`,
    defaultRagBank: `1. **Microsoft (Modern AI Workplace & Focus Design)**: Reengineered team workspaces for AI co-creation and async focus, reducing task-switching overhead, eliminating 1.2 hours/day of redundant sync meetings per worker, and increasing developer output velocity by 22%.
2. **Cisco (PENN 1 NYC & Osaka Agile Workspaces)**: Redesigned offices with flexible mobile power, wireless IoT, and acoustic micro-zones — achieved 40% increase in collaboration zones, 13% workstation capacity gain in 36% less footprint, and $1.2M annual energy/lease savings.
3. **SAP (Flex Culture & Workplace Health Index)**: Redesigned physical spaces to prioritize well-being and acoustic privacy — boosted SAP's Business Health Index from 69% to 78%, generating $90M–$100M in annual operating profit increase per 1% index gain.
4. **Salesforce / Slack (AI-Enabled Workspaces)**: Integrated dedicated generative AI war rooms and quiet prompting spaces — saved employees up to 1 month of lost productive time annually per employee and boosted customer response velocity by 14% per hour.
5. **Engie Headquarters (Global Energy Leader, Paris/Milan)**: Consolidated 700 employees into a Steelcase-designed collaborative hub — fostered spontaneous cross-subsidiary innovation, reducing project delivery cycle times by 18%.
6. **IIMA Ventures (Startup Accelerator Hub)**: Deployed Steelcase morphable Maker Labs and mobile acoustic boundaries — enabled founders to instantly switch between high-energy AI hacking and STC-isolated pitch prep, accelerating product iteration by 35%.
7. **Paris WorkLife (Steelcase Hybrid Lab)**: Engineered technology-enabled video & acoustic focus pods — measured a 13% direct gain in daily employee productivity and a 28% increase in workplace satisfaction.
8. **La-Z-Boy Global Headquarters**: Replaced traditional rigid cubicles with Steelcase open collaborative pods and quiet sanctuaries — resulted in a 45% increase in cross-departmental communication and higher talent retention.
9. **UC Irvine / Wall Street Journal Focus Study**: Benchmark study showing open-plan office interruptions cost 23 minutes and 15 seconds to regain deep task focus — costing organizations up to $28,000 per employee per year in lost billable productivity.
10. **Gensler Workplace Index (Acoustic Focus & Retention)**: Companies providing high-STC acoustic focus zones alongside collaborative hubs exhibit 21% higher cognitive performance scores and 18% lower voluntary employee turnover.
11. **Steelcase Flex Agile Teams Study**: High-performing, cross-functional teams equipped with adaptable furniture and spatial reconfigurability are 5x more likely to be high-performing and profitable compared to static setups.
12. **Accenture ("Productive Anywhere" Benchmark)**: Organizations optimizing hybrid spatial infrastructure retain 85% of high-value technical talent long-term, outperforming industry peers in revenue growth by 15%.
13. **BMW Research & Innovation Center**: Implemented modular acoustic micro-hubs for engineering sprint teams — reduced prototype design error rates by 14% and shortened vehicle software release cycles.
14. **Roche Pharmaceuticals (Agile Spatial Transformation)**: Redesigned R&D laboratories with flexible collaboration pods and quiet analysis sanctuaries — accelerated cross-functional clinical trial alignment by 25%.
15. **Capital One Financial (Tech & AI Operations Hub)**: Integrated acoustic sound masking and reconfigurable team war rooms — lowered employee burnout rates by 30% and increased software engineering throughput.`,
    footnotesReferenceHtml: ``,
    ragFiles: [],
    ragLinks: []
  },
  results: [
    { maxScore: 30, title: 'Workplace at Risk', tone: 'Critical Gap', color: '#FCE8E6', desc: 'Your workplace is not prepared for AI-era work. Focus, collaboration and adaptability barriers are likely limiting employee performance.', cta: 'Book a Strategy Consultation' },
    { maxScore: 60, title: 'Emerging Workplace', tone: 'Foundational Gaps', color: '#FEF7E0', desc: 'Your workplace has some useful foundations, but support for AI-enabled work, hybrid collaboration and employee choice is inconsistent.', cta: 'Request an Improvement Roadmap' },
    { maxScore: 85, title: 'Adaptive Workplace', tone: 'Optimization Opportunity', color: '#E8F0FE', desc: 'Your workplace supports many modern work behaviors, but there are still clear opportunities to improve focus, flexibility and collaboration performance.', cta: 'Explore Next-Gen Strategies' },
    { maxScore: 100, title: 'AI-Ready Workplace', tone: 'Strong Position', color: '#E6F4EA', desc: 'Your workplace is well positioned for AI-era work, with strong support for focus, collaboration, adaptability and employee experience.', cta: 'Schedule Executive Benchmarking' }
  ],
  questions: [
    { id: "q1", section: "AI adoption", question: "How frequently do employees use AI tools in their daily work?", options: [ { label: "Rarely or never", value: 0 }, { label: "A few employees use AI occasionally", value: 3 }, { label: "AI is used regularly by some teams", value: 6 }, { label: "AI is widely used across departments", value: 10 } ] },
    { id: "q2", section: "AI adoption", question: "Has your organization established clear guidance and training for AI usage?", options: [ { label: "No formal or informal guidance exists", value: 0 }, { label: "Informal guidance exists but is inconsistent", value: 3 }, { label: "Basic policy exists", value: 6 }, { label: "Formal governance, training and adoption support exist", value: 10 } ] },
    { id: "q3", section: "Focus & Cognitive Performance", question: "As AI automates routine tasks, deep-focus knowledge work becomes more critical. How often do employees struggle to concentrate in the office?", options: [ { label: "Frequently", value: 0 }, { label: "Often", value: 3 }, { label: "Occasionally", value: 6 }, { label: "Rarely", value: 10 } ] },
    { id: "q4", section: "Focus & Cognitive Performance", question: "Does your physical workplace provide specialized, distraction-free environments designed for intense, AI-assisted knowledge work?", options: [ { label: "Poorly supported", value: 0 }, { label: "Adequately supported", value: 3 }, { label: "Well supported", value: 6 }, { label: "Extremely well supported", value: 10 } ] },
    { id: "q5", section: "Hybrid Collaboration", question: "AI meeting assistants are changing collaboration. How effective are your current physical spaces at integrating remote participants and AI tools seamlessly?", options: [ { label: "Frequently frustrating", value: 0 }, { label: "Often challenging", value: 3 }, { label: "Generally effective", value: 6 }, { label: "Seamless experience", value: 10 } ] },
    { id: "q6", section: "Hybrid Collaboration", question: "Do employees have access to acoustically optimized spaces specifically designed for video and AI-driven hybrid collaboration?", options: [ { label: "None", value: 0 }, { label: "Very limited", value: 3 }, { label: "Some dedicated spaces", value: 6 }, { label: "Extensive range of dedicated spaces", value: 10 } ] },
    { id: "q7", section: "Workplace Choice", question: "As AI shifts the nature of work, employees need different settings. How many distinct space types are available in your office?", options: [ { label: "1 to 2 space types", value: 0 }, { label: "3 to 4 space types", value: 3 }, { label: "5 to 6 space types", value: 6 }, { label: "7 or more space types", value: 10 } ] },
    { id: "q8", section: "Workplace Choice", question: "Employees can easily transition between different workspaces based on whether they are doing AI-focused individual work or group collaboration.", options: [ { label: "Strongly disagree", value: 0 }, { label: "Disagree", value: 3 }, { label: "Agree", value: 6 }, { label: "Strongly agree", value: 10 } ] },
    { id: "q9", section: "Employee Experience", question: "With AI increasing productivity expectations, how would you rate employee satisfaction with the comfort and experience of your physical workplace?", options: [ { label: "Poor", value: 0 }, { label: "Fair", value: 3 }, { label: "Good", value: 6 }, { label: "Excellent", value: 10 } ] },
    { id: "q10", section: "Employee Experience", question: "Since AI cannot replace human connection, does your workplace effectively foster in-person relationship-building and community?", options: [ { label: "Rarely", value: 0 }, { label: "Sometimes", value: 3 }, { label: "Usually", value: 6 }, { label: "Consistently", value: 10 } ] },
    { id: "q11", section: "Future Readiness", question: "As AI rapidly changes technology needs and team structures, how adaptable is your physical workplace to new spatial requirements?", options: [ { label: "Not at all", value: 0 }, { label: "Somewhat", value: 3 }, { label: "Mostly", value: 6 }, { label: "Highly adaptable", value: 10 } ] },
    { id: "q12", section: "Future Readiness", question: "If AI adoption shifts more work towards in-person collaborative sessions, how prepared is your workplace for a sudden 25% increase in attendance?", options: [ { label: "Major disruption expected", value: 0 }, { label: "Significant adjustments required", value: 3 }, { label: "Minor adjustments required", value: 6 }, { label: "Ready immediately", value: 10 } ] }
  ]
};

const STYLES = `
  :root { font-family: 'Inter', system-ui, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #E5E7EB; color: #1F2937; }
  .app-layout { display: flex; height: 100vh; overflow: hidden; }
  
  .builder-sidebar { width: 500px; background: white; border-right: 1px solid #D1D5DB; display: flex; flex-direction: column; z-index: 10; flex-shrink: 0; }
  .builder-header { padding: 20px; border-bottom: 1px solid #D1D5DB; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; }
  .builder-header h2 { margin: 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .builder-export-btn { background: #1A73E8; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.2s; }
  .builder-export-btn:hover { background: #1557B0; }
  
  .builder-tabs { display: flex; border-bottom: 1px solid #D1D5DB; }
  .tab-btn { flex: 1; padding: 12px 0; background: none; border: none; font-size: 13px; font-weight: 600; cursor: pointer; color: #6B7280; border-bottom: 2px solid transparent; }
  .tab-btn.active { color: #2563EB; border-bottom-color: #2563EB; }
  .builder-content { flex: 1; overflow-y: auto; padding: 20px; }
  
  .field-group { margin-bottom: 20px; }
  .field-group label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #4B5563; margin-bottom: 8px; }
  .field-group input, .field-group textarea { width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; font-family: inherit; }
  .field-group textarea { resize: vertical; min-height: 80px; }
  
  .q-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #F9FAFB; position: relative; }
  .opt-row { display: grid; grid-template-columns: 1fr 80px 40px; gap: 8px; margin-bottom: 8px; align-items: center; }
  .opt-row input { margin: 0; }
  
  .preview-area { flex: 1; background: var(--bg-page, #F1F3F4); overflow-y: auto; position: relative; display: flex; flex-direction: column; }
  .preview-scroll-body { flex: 1; overflow-y: auto; display: flex; justify-content: center; padding: 40px 20px; }
  .quiz-shell { width: 100%; max-width: 900px; }
  .quiz-hero { background: var(--header-bg, #3C4043); border-radius: 8px; padding: 24px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; color: white; display: grid; grid-template-columns: 1fr 250px; gap: 32px; align-items: center; }
  .quiz-hero .eyebrow { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9AA0A6; margin-bottom: 8px; display: inline-flex; align-items: center; }
  .quiz-hero h1 { font-size: 28px; font-weight: 400; margin: 0 0 12px; color: white; }
  .quiz-hero p { font-size: 14px; color: #E8EAED; margin: 0; line-height: 1.6; }
  .progress-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 16px 20px; text-align: right; }
  .progress-track { height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; margin-top: 12px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--primary-color, #1A73E8); transition: width 0.3s ease; }
  
  .quiz-card { background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .question-head { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid #DADCE0; }
  .question-head h2 { font-size: 22px; font-weight: 400; margin: 0; color: #202124; line-height: 1.4; }
  .section-label { display: inline-block; background: #F8F9FA; border: 1px solid #DADCE0; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; color: #5F6368; margin-top: 16px; }
  .options-grid { display: grid; gap: 12px; }
  .option-btn { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border: 1px solid #DADCE0; border-radius: 4px; background: white; cursor: pointer; text-align: left; font-size: 15px; color: #202124; transition: all 0.2s; }
  .option-btn:hover { background: #F8F9FA; }
  .option-btn.selected { border-color: var(--primary-color); background: #E8F0FE; color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
  .nav-row { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 24px; border-top: 1px solid #DADCE0; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
  .btn-primary { background: var(--primary-color); color: white; transition: opacity 0.2s; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: white; border: 1px solid #DADCE0; color: #202124; }
  
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #202124; }
  .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #DADCE0; border-radius: 4px; font-size: 14px; }
  
  .result-top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .result-grid { display: flex; flex-direction: column; gap: 24px; }
  .result-panel { border-radius: 8px; padding: 28px 24px; text-align: center; border: 1px solid #DADCE0; height: 100%; display: flex; flex-direction: column; justify-content: center; }
  .result-panel h2 { font-size: 22px; font-weight: 600; margin: 16px 0 8px; }
  .score-display { font-size: 64px; font-weight: 300; line-height: 1; margin-top: 12px; }

  /* AI REPORT STYLES */
  .ai-report-box { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 32px; margin-top: 0; text-align: left; }
  .ai-report-box .ai-header { display: flex; align-items: center; gap: 8px; color: var(--primary-color); font-weight: 600; font-size: 18px; margin-bottom: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px;}
  .ai-loading { display: flex; align-items: center; gap: 12px; color: #6B7280; font-weight: 500; font-size: 14px; }
  .spinner { border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary-color); border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Rendered HTML inside AI Report */
  .ai-content { font-size: 15px; line-height: 1.75; color: #374151; }
  .section-eyebrow-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: #EEF2FF;
    color: #3730A3;
    border: 1px solid #C7D2FE;
    margin-bottom: 6px;
    line-height: 1.4;
  }
  .section-eyebrow-pill .bullet-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-color, #4F46E5);
    display: inline-block;
    flex-shrink: 0;
  }
  .section-desc {
    font-size: 14px;
    color: #4B5563;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  .ai-content h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #F3F4F6; }
  .ai-content h3:first-child { margin-top: 0; }
  .ai-content p { margin: 0 0 16px; }
  .ai-content h4 { font-size: 15px; font-weight: 700; color: #1E3A8A; margin: 16px 0 8px 0; }
  .ai-content ul, .report-content ul, .wysiwyg-content ul {
    margin: 0 0 16px;
    padding-left: 0;
    list-style-type: disc;
    list-style-position: inside;
  }
  .ai-content ol, .report-content ol, .wysiwyg-content ol {
    margin: 0 0 16px;
    padding-left: 0;
    list-style-type: decimal;
    list-style-position: inside;
  }
  .ai-content li, .report-content li, .wysiwyg-content li {
    margin-bottom: 8px;
    line-height: 1.6;
    padding-left: 0;
    text-indent: 0;
  }
  .ai-content blockquote, .report-content blockquote, .wysiwyg-content blockquote { border-left: 3.5px solid var(--primary-color, #1A73E8); background: #F8FAFC; padding: 10px 16px; margin: 14px 0; font-style: italic; color: #475569; border-radius: 0 6px 6px 0; }
  .ai-content mark, .report-content mark, .wysiwyg-content mark { background: #FEF08A; color: #854D0E; padding: 1px 5px; border-radius: 3px; font-weight: 500; }
  .ai-content a, .report-content a, .wysiwyg-content a { color: var(--primary-color); text-decoration: underline; font-weight: 500; }
  .ai-content strong, .report-content strong, .wysiwyg-content strong { color: #111827; font-weight: 600; }
  .research-citations-box a { color: #2563eb !important; word-break: break-all; }

  /* WYSIWYG Editor specific helpers */
  .wysiwyg-content p { margin: 0 0 12px 0; }
  .wysiwyg-content p:last-child { margin-bottom: 0; }
  .wysiwyg-content:empty:before {
    content: attr(data-placeholder);
    color: #9CA3AF;
    pointer-events: none;
  }

  /* CITED SOURCES, HOVER TOOLTIPS & FOOTNOTES */
  html { scroll-behavior: smooth; }
  
  .cite-ref {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin: 0 4px;
    vertical-align: baseline;
  }
  .cite-badge {
    display: inline-flex;
    align-items: center;
    background: #EFF6FF;
    color: #1D4ED8 !important;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid #BFDBFE;
    text-decoration: none !important;
    line-height: 1.3;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .cite-badge:hover {
    background: #1D4ED8;
    color: #FFFFFF !important;
    border-color: #1D4ED8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.3);
  }
  
  /* Hover Tooltip behavior */
  .cite-ref[data-tooltip] {
    position: relative;
    cursor: pointer;
  }
  .cite-ref[data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 128%;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: #0F172A;
    color: #F8FAFC;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.45;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: normal;
    width: max-content;
    max-width: 280px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: left;
  }
  .cite-ref[data-tooltip]::after {
    content: '';
    position: absolute;
    bottom: 112%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px 6px 0 6px;
    border-style: solid;
    border-color: #0F172A transparent transparent transparent;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cite-ref[data-tooltip]:hover::before {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  .cite-ref[data-tooltip]:hover::after {
    opacity: 1;
    visibility: visible;
  }

  /* Footnotes Box Styling - Terms & Conditions / Citation Notes Look & Feel */
  .footnotes-box {
    margin-top: 36px;
    padding: 16px 20px;
    background: #F3F4F6 !important;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    box-shadow: none;
  }
  .footnotes-box h4 {
    margin: 0 0 10px 0;
    font-size: 11.5px;
    font-weight: 700;
    color: #6B7280;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .footnotes-list {
    margin: 0;
    padding-left: 18px;
    font-size: 11.5px;
    line-height: 1.55;
    color: #6B7280;
  }
  .footnotes-list li {
    margin-bottom: 8px;
    color: #6B7280;
    transition: background 0.3s ease;
  }
  .footnotes-list li:last-child {
    margin-bottom: 0;
  }
  .footnotes-list li:target {
    background: #FEF08A;
    padding: 3px 6px;
    border-radius: 4px;
    color: #374151;
  }
  .footnotes-list strong {
    color: #4B5563;
    font-weight: 600;
  }
  .footnotes-list a {
    color: #6B7280 !important;
    text-decoration: underline !important;
    font-weight: 500;
  }
  .footnotes-list a:hover {
    color: #1F2937 !important;
  }

  /* Modal Styles */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
  .modal-content { background: white; border-radius: 12px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
  .export-option-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; transition: border-color 0.2s; }
  .export-option-card:hover { border-color: #1A73E8; background: #F4F8FF; }

  @media print {
    .builder-sidebar { display: none !important; }
    .app-layout { height: auto !important; overflow: visible !important; display: block !important; }
    .preview-area { background: white !important; padding: 0 !important; overflow: visible !important; display: block !important; }
    .quiz-shell { max-width: 100% !important; margin: 0 !important; }
    .nav-row { display: none !important; }
    .quiz-card { padding: 0 !important; box-shadow: none !important; }
    .quiz-hero { margin-top: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .result-panel { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: white !important; margin: 0; padding: 20px; }
  }
`;

export const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
  'live.com', 'msn.com', 'comcast.net', 'sbcglobal.net', 'cox.net', 'att.net', 'verizon.net',
  'googlemail.com', 'rocketmail.com', 'ymail.com', 'mail.ru', 'qq.com', '163.com', '126.com',
  'fastmail.com', 'hushmail.com', 'tutanota.com', 'tutamail.com'
]);

export function isWorkEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes('@')) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!domain || !domain.includes('.')) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

export default function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('quizBuilderConfig');
    if (!saved) return DEFAULT_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        buildVersion: parsed.buildVersion || '1.01',
        leadCapture: {
          ...DEFAULT_CONFIG.leadCapture,
          ...(parsed.leadCapture || {}),
          fields: {
            ...DEFAULT_CONFIG.leadCapture.fields,
            ...(parsed.leadCapture?.fields || {})
          },
          customQuestions: Array.isArray(parsed.leadCapture?.customQuestions)
            ? parsed.leadCapture.customQuestions
            : []
        },
        ctaConfig: {
          ...DEFAULT_CONFIG.ctaConfig,
          ...(parsed.ctaConfig || {})
        },
        aiPersona: {
          ...DEFAULT_CONFIG.aiPersona,
          ...(parsed.aiPersona || {})
        },
        reportSections: (Array.isArray(parsed.reportSections) && parsed.reportSections.length === 5)
          ? parsed.reportSections
          : DEFAULT_CONFIG.reportSections,
        results: Array.isArray(parsed.results) && parsed.results.length > 0
          ? parsed.results
          : DEFAULT_CONFIG.results,
        dangerZoneConfig: {
          ...DEFAULT_CONFIG.dangerZoneConfig,
          ...(parsed.dangerZoneConfig || {}),
          masterPrompt: (parsed.dangerZoneConfig?.masterPrompt?.trim()) || DEFAULT_CONFIG.dangerZoneConfig.masterPrompt,
          defaultRagBank: (parsed.dangerZoneConfig?.defaultRagBank?.trim()) || DEFAULT_CONFIG.dangerZoneConfig.defaultRagBank,
          footnotesReferenceHtml: (parsed.dangerZoneConfig?.footnotesReferenceHtml?.trim()) || DEFAULT_CONFIG.dangerZoneConfig.footnotesReferenceHtml,
          ragFiles: Array.isArray(parsed.dangerZoneConfig?.ragFiles) ? parsed.dangerZoneConfig.ragFiles : [],
          ragLinks: Array.isArray(parsed.dangerZoneConfig?.ragLinks) ? parsed.dangerZoneConfig.ragLinks : []
        }
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('quizBuilderConfig', JSON.stringify(config));
  }, [config]);

  const [availableModels, setAvailableModels] = useState([]);
  const [isScanningModels, setIsScanningModels] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleScanModels = async () => {
    const apiKey = config.integration.geminiApiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY);
    if (!apiKey) {
      alert("Please enter a Gemini API Key first to scan for available models.");
      return;
    }

    setIsScanningModels(true);
    setScanError(null);
    try {
      const resp = await fetch("/api/list-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to scan models");
      
      setAvailableModels(data.models);
      alert(`Successfully discovered ${data.models.length} models available for your API key.`);
    } catch (err) {
      console.error("Scan error:", err);
      setScanError(err.message);
    } finally {
      setIsScanningModels(false);
    }
  };

  const [showDiagnosticLogs, setShowDiagnosticLogs] = useState(false);
  const [lastTelemetryData, setLastTelemetryData] = useState(null);

  const [activeTab, setActiveTab] = useState('questions');
  const [isIntegrationUnlocked, setIsIntegrationUnlocked] = useState(false);
  const [integrationPasswordInput, setIntegrationPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [step, setStep] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answers, setAnswers] = useState({});
  const [lead, setLead] = useState({ name: '', email: '', company: '', role: '', projectStatus: '' });
  
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(18);
  const [aiThinkingLogs, setAiThinkingLogs] = useState([]);
  const thinkingLogEndRef = useRef(null);

  const formatClientReportHtml = (rawHtml) => {
    if (!rawHtml) return "";
    let clean = rawHtml.trim();
    clean = clean.replace(/^```html\s*/gi, '').replace(/^```\s*/gi, '').replace(/```\s*$/g, '').trim();
    if (clean.includes("&lt;") && clean.includes("&gt;")) {
      clean = clean
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }
    clean = clean.replace(/\[SECTION \d+ (?:CUSTOM |DEFAULT )?DIRECTIVE[^\]]*\]:?/gi, '');
    clean = clean.replace(/\[AI INSTRUCTION[^\]]*\]:?/gi, '');
    clean = clean.replace(/&quot;Analyze the provided survey responses[\s\S]*?&quot;/gi, '');
    clean = clean.replace(/"Analyze the provided survey responses[\s\S]*?"/gi, '');
    clean = clean.replace(/&quot;Based on the organization&#39;s survey responses[\s\S]*?&quot;/gi, '');
    clean = clean.replace(/&quot;Based on the organization's survey responses[\s\S]*?&quot;/gi, '');
    clean = clean.replace(/"Based on the organization's survey responses[\s\S]*?"/gi, '');
    clean = clean.replace(/&quot;Perform a web search on the target company[\s\S]*?&quot;/gi, '');
    clean = clean.replace(/"Perform a web search on the target company[\s\S]*?"/gi, '');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    clean = clean.replace(/__(.*?)__/g, '<strong>$1</strong>');
    clean = clean.replace(/(^|[^\w>])\*([^*]+)\*([^\w<]|$)/g, '$1<em>$2</em>$3');
    clean = clean.replace(/(?:^|\n)\s*[-*]\s+(.+?)(?=\n|$)/g, '\n<li>$1</li>');
    return clean.trim();
  };

  useEffect(() => {
    if (isGeneratingAI && thinkingLogEndRef.current) {
      thinkingLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiThinkingLogs, isGeneratingAI]);
  
  const [applied, setApplied] = useState(false);
  const [tel, setTel] = useState('');
  const [telSent, setTelSent] = useState(false);
  const [previewMode, setPreviewMode] = useState('questions'); // 'questions' | 'report' | 'pdf'
  const [addingPresetSectionIdx, setAddingPresetSectionIdx] = useState(null);
  const [newPresetInputText, setNewPresetInputText] = useState('');
  const [editingPresetInfo, setEditingPresetInfo] = useState(null); // { secIdx, pIdx, text }

  const [showExportModal, setShowExportModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [showTokenSecret, setShowTokenSecret] = useState(false);
  const [publishCountdown, setPublishCountdown] = useState(0);

  // GitHub Pages propagation countdown timer
  useEffect(() => {
    let timer;
    if (publishCountdown > 0) {
      timer = setInterval(() => {
        setPublishCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [publishCountdown]);

  // Sync token and repo from localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('qb_github_token');
    const savedRepo = localStorage.getItem('qb_github_repo');
    const savedBranch = localStorage.getItem('qb_github_branch');
    if (savedToken || savedRepo) {
      setConfig(prev => ({
        ...prev,
        integration: {
          ...prev.integration,
          githubToken: prev.integration.githubToken || savedToken || '',
          githubRepo: prev.integration.githubRepo || savedRepo || '',
          githubBranch: prev.integration.githubBranch || savedBranch || 'main',
        }
      }));
    }
  }, []);

  const handlePublishToGitHub = async () => {
    const token = config.integration?.githubToken || localStorage.getItem('qb_github_token') || '';
    const repo = config.integration?.githubRepo || localStorage.getItem('qb_github_repo') || '';
    const branch = config.integration?.githubBranch || localStorage.getItem('qb_github_branch') || 'main';
    const filePath = config.integration?.githubFilePath || 'index.html';

    if (!token.trim()) {
      setPublishStatus({ success: false, message: 'Please provide your GitHub Personal Access Token (PAT) with repo/contents permissions.' });
      setShowPublishModal(true);
      return;
    }
    if (!repo.trim() || !repo.includes('/')) {
      setPublishStatus({ success: false, message: 'Please enter a valid repository in "owner/repo" format (e.g. username/hosted-quiz).' });
      setShowPublishModal(true);
      return;
    }

    setIsPublishing(true);
    setPublishStatus(null);

    // Increment build version by 0.01
    const currentVer = parseFloat(config.buildVersion || '1.01');
    const nextVer = (Math.round((currentVer + 0.01) * 100) / 100).toFixed(2);

    const updatedConfig = {
      ...config,
      buildVersion: nextVer
    };
    setConfig(updatedConfig);

    try {
      // 1. Generate standalone pure Hosted Quiz (HQ) HTML - zero builder UI, zero points
      const hqHtml = generateStandaloneHtml(updatedConfig, window.location.origin);

      // 2. Call backend proxy to commit and push directly to GitHub repository
      const response = await fetch('/api/publish-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          repo: repo.trim(),
          branch: branch.trim() || 'main',
          filePath: filePath.trim() || 'index.html',
          content: hqHtml,
          commitMessage: `🚀 Live Hosted Quiz (HQ) Publish - ${new Date().toLocaleString()}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish to GitHub.');
      }

      setPublishStatus({
        success: true,
        message: data.message || 'Hosted Quiz published successfully!',
        pagesUrl: data.pagesUrl,
        commitUrl: data.commitUrl,
        repoUrl: data.repoUrl,
        publishedAt: data.publishedAt,
      });

      // Start 60-second countdown for GitHub Pages build/propagation
      setPublishCountdown(60);

      // Save token, repo, branch persistently so 1-click works every time
      localStorage.setItem('qb_github_token', token.trim());
      localStorage.setItem('qb_github_repo', repo.trim());
      localStorage.setItem('qb_github_branch', (branch.trim() || 'main'));

      setConfig(prev => ({
        ...prev,
        integration: {
          ...prev.integration,
          lastPublishedAt: data.publishedAt,
          lastPublishUrl: data.pagesUrl,
        }
      }));
    } catch (err) {
      setPublishStatus({
        success: false,
        message: err.message || 'An error occurred while publishing to GitHub.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAiContentClick = (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#fn-')) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = href.substring(1);
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const origBg = el.style.backgroundColor;
          el.style.backgroundColor = '#FEF3C7';
          el.style.transition = 'background-color 0.5s ease';
          setTimeout(() => { el.style.backgroundColor = origBg || ''; }, 2000);
        }
      } else if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("File size is larger than 3MB. Please select a smaller logo image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setConfig(prev => ({
            ...prev,
            branding: {
              ...prev.branding,
              logoUrl: uploadEvent.target.result
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionImageUpload = (sectionIndex, e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image size exceeds 3MB limit. Please choose a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setConfig(prev => {
            const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
            if (secs[sectionIndex]) {
              secs[sectionIndex] = { ...secs[sectionIndex], imageUrl: ev.target.result };
            }
            return { ...prev, reportSections: secs };
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtraBlockImageUpload = (sectionIndex, blockIndex, e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image size exceeds 3MB limit. Please choose a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setConfig(prev => {
            const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
            if (secs[sectionIndex]) {
              const extraBlocks = Array.isArray(secs[sectionIndex].extraBlocks) ? [...secs[sectionIndex].extraBlocks] : [];
              if (extraBlocks[blockIndex]) {
                extraBlocks[blockIndex] = { ...extraBlocks[blockIndex], imageUrl: ev.target.result };
                secs[sectionIndex] = { ...secs[sectionIndex], extraBlocks };
              }
            }
            return { ...prev, reportSections: secs };
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTextFormatting = (textareaId, tag, sectionIndex, blockIndex = null) => {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const text = textarea.value || '';
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    let newCursorStart = start;
    let newCursorEnd = end;

    if (tag === 'ul' || tag === 'ol') {
      if (selectedText) {
        // Split selection by newline and convert each line into <li>...</li>
        const lines = selectedText.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const listItems = lines.map(line => `  <li>${line}</li>`).join('\n');
          replacement = `<${tag}>\n${listItems}\n</${tag}>`;
        } else {
          replacement = `<${tag}>\n  <li>${selectedText}</li>\n</${tag}>`;
        }
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
      } else {
        replacement = `<${tag}>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</${tag}>`;
        newCursorStart = start + `<${tag}>\n  <li>`.length;
        newCursorEnd = newCursorStart + 6; // Select 'Item 1'
      }
    } else if (tag === 'blockquote') {
      if (selectedText) {
        replacement = `<blockquote>${selectedText}</blockquote>`;
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
      } else {
        replacement = `<blockquote>Key insight or quote...</blockquote>`;
        newCursorStart = start + `<blockquote>`.length;
        newCursorEnd = newCursorStart + 23;
      }
    } else if (tag === 'h4') {
      if (selectedText) {
        replacement = `<h4>${selectedText}</h4>`;
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
      } else {
        replacement = `<h4>Subheading Title</h4>`;
        newCursorStart = start + `<h4>`.length;
        newCursorEnd = newCursorStart + 16;
      }
    } else {
      const openTag = `<${tag}>`;
      const closeTag = `</${tag}>`;
      if (selectedText) {
        // Wrap the selected text
        replacement = `${openTag}${selectedText}${closeTag}`;
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
      } else {
        // Empty selection: insert empty tag pair and place cursor between tags
        replacement = `${openTag}${closeTag}`;
        newCursorStart = start + openTag.length;
        newCursorEnd = start + openTag.length;
      }
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);

    setConfig(prev => {
      const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
      if (secs[sectionIndex]) {
        if (blockIndex !== null && blockIndex !== undefined) {
          const extraBlocks = Array.isArray(secs[sectionIndex].extraBlocks) ? [...secs[sectionIndex].extraBlocks] : [];
          if (extraBlocks[blockIndex]) {
            extraBlocks[blockIndex] = { ...extraBlocks[blockIndex], textBox: newText };
            secs[sectionIndex] = { ...secs[sectionIndex], extraBlocks };
          }
        } else {
          secs[sectionIndex] = { ...secs[sectionIndex], textBox: newText };
        }
      }
      return { ...prev, reportSections: secs };
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 10);
  };

  const handleRagFileUpload = (sectionIndex, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result || '';
        const newFileObj = {
          id: 'rag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          uploadedAt: new Date().toLocaleTimeString(),
          textContent: typeof text === 'string' ? text.slice(0, 150000) : ''
        };

        setConfig(prev => {
          const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
          const currSec = secs[sectionIndex] || {};
          const currentFiles = Array.isArray(currSec.ragFiles) ? currSec.ragFiles : [];
          secs[sectionIndex] = {
            ...currSec,
            ragFiles: [...currentFiles, newFileObj]
          };
          return { ...prev, reportSections: secs };
        });
      };
      reader.readAsText(file);
    });
  };

  const removeRagFile = (sectionIndex, fileId) => {
    setConfig(prev => {
      const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
      if (secs[sectionIndex]) {
        const files = Array.isArray(secs[sectionIndex].ragFiles) ? secs[sectionIndex].ragFiles : [];
        secs[sectionIndex] = {
          ...secs[sectionIndex],
          ragFiles: files.filter(f => f.id !== fileId)
        };
      }
      return { ...prev, reportSections: secs };
    });
  };

  const handleGlobalDangerRagFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result || '';
        const newFileObj = {
          id: 'danger_rag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          uploadedAt: new Date().toLocaleTimeString(),
          textContent: typeof text === 'string' ? text.slice(0, 150000) : ''
        };

        setConfig(prev => {
          const currentDangerZone = prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig;
          const currentFiles = Array.isArray(currentDangerZone.ragFiles) ? currentDangerZone.ragFiles : [];
          return {
            ...prev,
            dangerZoneConfig: {
              ...currentDangerZone,
              ragFiles: [...currentFiles, newFileObj]
            }
          };
        });
      };
      reader.readAsText(file);
    });
  };

  const removeGlobalDangerRagFile = (fileId) => {
    setConfig(prev => {
      const currentDangerZone = prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig;
      const currentFiles = Array.isArray(currentDangerZone.ragFiles) ? currentDangerZone.ragFiles : [];
      return {
        ...prev,
        dangerZoneConfig: {
          ...currentDangerZone,
          ragFiles: currentFiles.filter(f => f.id !== fileId)
        }
      };
    });
  };

  const addGlobalDangerRagLink = (url, label) => {
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();
    const newLinkObj = {
      id: 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      url: cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`,
      label: (label && label.trim()) ? label.trim() : cleanUrl
    };

    setConfig(prev => {
      const currentDangerZone = prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig;
      const currentLinks = Array.isArray(currentDangerZone.ragLinks) ? currentDangerZone.ragLinks : [];
      return {
        ...prev,
        dangerZoneConfig: {
          ...currentDangerZone,
          ragLinks: [...currentLinks, newLinkObj]
        }
      };
    });
  };

  const removeGlobalDangerRagLink = (linkId) => {
    setConfig(prev => {
      const currentDangerZone = prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig;
      const currentLinks = Array.isArray(currentDangerZone.ragLinks) ? currentDangerZone.ragLinks : [];
      return {
        ...prev,
        dangerZoneConfig: {
          ...currentDangerZone,
          ragLinks: currentLinks.filter(l => l.id !== linkId)
        }
      };
    });
  };

  const generateLayoutPreviewHtml = () => {
    const sections = Array.isArray(config.reportSections) && config.reportSections.length === 5
      ? config.reportSections
      : DEFAULT_CONFIG.reportSections;
    const footnotesHtml = (config.dangerZoneConfig?.footnotesReferenceHtml || DEFAULT_CONFIG.dangerZoneConfig.footnotesReferenceHtml).trim();

    const renderStaticExtraBlocks = (sec) => {
      if (!Array.isArray(sec.extraBlocks) || sec.extraBlocks.length === 0) return '';
      return sec.extraBlocks.map((block, idx) => {
        if (!block.textBox && !block.imageUrl) return '';
        // Alternate layout: even idx left image/right text, odd idx right image/left text
        const isRightImg = idx % 2 === 0;
        return `
          <div style="margin-top: 14px; overflow: hidden; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px 20px;">
            ${block.imageUrl ? `
              <div style="float: ${isRightImg ? 'right' : 'left'}; width: 280px; max-width: 45%; margin-${isRightImg ? 'left' : 'right'}: 18px; margin-bottom: 12px; border-radius: 6px; overflow: hidden; border: 1px solid #E5E7EB; background: #F3F4F6;">
                <img src="${block.imageUrl}" alt="Extra visual ${idx + 1}" style="width:100%; height:auto; max-height:220px; object-fit:cover; display:block;" />
              </div>
            ` : ''}
            <div style="font-size: 14px; line-height: 1.7; color: #374151;">
              ${block.textBox || ''}
            </div>
            <div style="clear: both;"></div>
          </div>
        `;
      }).join('');
    };

    return `
      <div style="margin-bottom: 28px;">
        <div class="section-eyebrow-pill"><span class="bullet-dot"></span> ${sections[0].eyebrow || '01. OVERVIEW'}</div>
        <h3 style="margin: 6px 0 10px; font-size: 20px; font-weight: 700; color: #111827;">${sections[0].sectionHeading || '1. Executive Readiness Overview'}</h3>
        <p class="section-desc">${sections[0].description || 'Summary of spatial readiness criteria, workplace parameters, and diagnostic baseline.'}</p>
        <div style="margin-top: 14px; overflow: hidden; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px 20px;">
          ${sections[0].imageUrl ? `
            <div style="float: left; width: 280px; max-width: 45%; margin-right: 18px; margin-bottom: 12px; border-radius: 6px; overflow: hidden; border: 1px solid #E5E7EB; background: #F3F4F6;">
              <img src="${sections[0].imageUrl}" alt="Section 1" style="width:100%; height:auto; max-height:220px; object-fit:cover; display:block;" />
            </div>
          ` : ''}
          <div style="font-size: 14px; line-height: 1.7; color: #374151;">
            ${sections[0].textBox || 'Modern AI workflows demand dynamic balance between solitary high-focus prompting and collaborative multi-modal sprints. This diagnostic report synthesizes your organizational parameters against empirical workplace benchmarks.'}
          </div>
          <div style="clear: both;"></div>
        </div>
        ${renderStaticExtraBlocks(sections[0])}
      </div>

      <div style="margin-bottom: 28px; padding-top: 18px; border-top: 1px solid #E5E7EB;">
        <div class="section-eyebrow-pill"><span class="bullet-dot"></span> ${sections[1].eyebrow || '02. AI DIAGNOSTIC'}</div>
        <h3 style="margin: 6px 0 10px; font-size: 20px; font-weight: 700; color: #111827;">${sections[1].sectionHeading || '2. Technical Score Breakdown & Readiness Analysis'}</h3>
        <p class="section-desc">${sections[1].description || 'Analytical interpretation of what your readiness score means for spatial performance, acoustic privacy, cognitive focus, and bottom-line productivity.'}</p>
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-left: 4px solid var(--accent-color, #7C3AED); border-radius: 8px; padding: 20px 24px; margin-top: 14px;">
          ${(sections[1].prompt || sections[1].textBox) ? `
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6D28D9; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              <span>⚡ CUSTOM SECTION PROMPT / TEXT ACTIVE:</span>
            </div>
            <div style="font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-wrap;">
              ${sections[1].prompt || sections[1].textBox}
            </div>
          ` : `
            <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 10px 0;">
              1. <strong>Baseline Spatial Assessment:</strong> Your current infrastructure exhibits foundational adaptability, yet acoustic containment remains a primary bottleneck during intense generative AI focus sessions <span class="cite-ref" data-tooltip="UC Irvine / Wall Street Journal Focus Study"><a href="#fn-uc-irvine" class="cite-badge">UC Irvine Study</a></span>.
            </p>
            <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 10px 0;">
              2. <strong>Acoustic &amp; Focus Velocity:</strong> Unmanaged ambient noise in open zones causes substantial task-switching overhead. Incorporating high-STC sound-isolated pods recovers up to 23 minutes of deep focus per distraction event <span class="cite-ref" data-tooltip="Steelcase Privacy & Acoustic Pods Research"><a href="#fn-steelcase-privacy" class="cite-badge">Steelcase Research</a></span>.
            </p>
            <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0;">
              3. <strong>Organizational Benchmark:</strong> Peer leaders in your sector leveraging reconfigurable micro-zones achieve 22% higher sprint completion rates <span class="cite-ref" data-tooltip="Microsoft Modern AI Workplace Study"><a href="#fn-microsoft" class="cite-badge">Microsoft Study</a></span>.
            </p>
          `}
        </div>
      </div>

      <div style="margin-bottom: 28px; padding-top: 18px; border-top: 1px solid #E5E7EB;">
        <div class="section-eyebrow-pill"><span class="bullet-dot"></span> ${sections[2].eyebrow || '03. INFRASTRUCTURE'}</div>
        <h3 style="margin: 6px 0 10px; font-size: 20px; font-weight: 700; color: #111827;">${sections[2].sectionHeading || '3. Infrastructure & Spatial Foundations'}</h3>
        <p class="section-desc">${sections[2].description || 'Critical considerations for power distribution, acoustic isolation, and adaptable zoning.'}</p>
        <div style="margin-top: 14px; overflow: hidden; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px 20px;">
          ${sections[2].imageUrl ? `
            <div style="float: left; width: 280px; max-width: 45%; margin-right: 18px; margin-bottom: 12px; border-radius: 6px; overflow: hidden; border: 1px solid #E5E7EB; background: #F3F4F6;">
              <img src="${sections[2].imageUrl}" alt="Section 3" style="width:100%; height:auto; max-height:220px; object-fit:cover; display:block;" />
            </div>
          ` : ''}
          <div style="font-size: 14px; line-height: 1.7; color: #374151;">
            ${sections[2].textBox || 'Spatial flexibility and STC 38+ acoustic enclosures mitigate context-switching latency. Implementing agile micro-zones prevents open-plan acoustic spill and preserves uninterrupted focus.'}
          </div>
          <div style="clear: both;"></div>
        </div>
        ${renderStaticExtraBlocks(sections[2])}
      </div>

      <div style="margin-bottom: 28px; padding-top: 18px; border-top: 1px solid #E5E7EB;">
        <div class="section-eyebrow-pill"><span class="bullet-dot"></span> ${sections[3].eyebrow || '04. STRATEGIC ROADMAP'}</div>
        <h3 style="margin: 6px 0 10px; font-size: 20px; font-weight: 700; color: #111827;">${sections[3].sectionHeading || '4. High-Performance Spatial Optimization Roadmap'}</h3>
        <p class="section-desc">${sections[3].description || 'Tailored strategic workplace interventions, architectural configurations, and actionable next steps.'}</p>
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-left: 4px solid var(--accent-color, #1D4ED8); border-radius: 8px; padding: 20px 24px; margin-top: 14px;">
          <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #1E3A8A; display:flex; align-items:center; gap:6px;">
            <span>🚀</span> Strategic Interventions &amp; Action Plan
          </h4>
          ${(sections[3].prompt || sections[3].textBox) ? `
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1D4ED8; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              <span>⚡ CUSTOM SECTION PROMPT / TEXT ACTIVE:</span>
            </div>
            <div style="font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-wrap;">
              ${sections[3].prompt || sections[3].textBox}
            </div>
          ` : `
            <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: #334155;">
              <li style="margin-bottom: 8px;"><strong>Phase 1 (Days 1–30): Deploy Dedicated Focus Enclosures:</strong> Introduce modular single-occupant pods to insulate deep AI prompting workflows from high-traffic office noise <span class="cite-ref" data-tooltip="Cisco PENN 1 Blueprint"><a href="#fn-cisco" class="cite-badge">Cisco Blueprint</a></span>.</li>
              <li style="margin-bottom: 8px;"><strong>Phase 2 (Days 31–90): Agile Team Maker Zones:</strong> Reconfigure floor plates with mobile acoustic screens, whiteboards, and localized power stations to enable rapid shift from solitary analysis to co-creation <span class="cite-ref" data-tooltip="Steelcase Flex Agile Teams Study"><a href="#fn-flex-agile" class="cite-badge">Flex Agile Study</a></span>.</li>
              <li><strong>Phase 3 (Days 91–180): Continuous Sensor &amp; Spatial Telemetry:</strong> Monitor acoustic comfort and seat utilization indices to calibrate real-time capacity and privacy satisfaction.</li>
            </ul>
          `}
        </div>
      </div>

      <div style="margin-bottom: 28px; padding-top: 18px; border-top: 1px solid #E5E7EB;">
        <div class="section-eyebrow-pill"><span class="bullet-dot"></span> ${sections[4].eyebrow || '05. IMPLEMENTATION'}</div>
        <h3 style="margin: 6px 0 10px; font-size: 20px; font-weight: 700; color: #111827;">${sections[4].sectionHeading || '5. Next Steps & Implementation Guidance'}</h3>
        <p class="section-desc">${sections[4].description || 'Strategic roadmap, consultation details, and benchmark deployment timelines.'}</p>
        <div style="margin-top: 14px; overflow: hidden; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px 20px;">
          ${sections[4].imageUrl ? `
            <div style="float: left; width: 280px; max-width: 45%; margin-right: 18px; margin-bottom: 12px; border-radius: 6px; overflow: hidden; border: 1px solid #E5E7EB; background: #F3F4F6;">
              <img src="${sections[4].imageUrl}" alt="Section 5" style="width:100%; height:auto; max-height:220px; object-fit:cover; display:block;" />
            </div>
          ` : ''}
          <div style="font-size: 14px; line-height: 1.7; color: #374151;">
            ${sections[4].textBox || 'Schedule a dedicated consultation with workplace strategy specialists to conduct a comprehensive on-site acoustic and spatial audit, tailored to your technical team topologies.'}
          </div>
          <div style="clear: both;"></div>
        </div>
        ${renderStaticExtraBlocks(sections[4])}

        <div style="margin-top: 28px; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 24px 28px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); width: 100%; box-sizing: border-box;">
          <div style="display: inline-flex; align-items: center; gap: 6px; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
            <span>✓</span> CONGRATULATIONS! YOU QUALIFY FOR AN EXECUTIVE STRATEGY CONSULTATION
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Professional Assessment</h3>
          <p style="margin: 0 auto 18px auto; font-size: 14px; color: #475569; max-width: 580px; line-height: 1.5;">Schedule a deep-dive session with a workplace strategy specialist to analyze your spatial parameters and acoustic requirements.</p>
          ${applied ? `
            <div style="display: inline-flex; align-items: center; gap: 8px; color: #059669; background: #ECFDF5; border: 1px solid #6EE7B7; font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 8px;">
              <span>✓</span> Qualified for Consultation
            </div>
          ` : `
            <button type="button" onclick="window.requestAssessment ? window.requestAssessment() : null" style="background: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);">
              <span>✉️</span> Apply Now
            </button>
          `}
        </div>
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 2px dashed #CBD5E1;">
        ${footnotesHtml}
      </div>
    `;
  };

  const generatePdfPreviewHtml = () => {
    const companyName = lead.company || 'Organization';
    const leadName = lead.name || 'Executive';
    const leadRole = lead.role || 'Workplace Leader';
    
    const showLogoInPdf = config.branding?.logoUrl && config.branding?.showLogoInPdf !== false;
    const logoHtml = showLogoInPdf 
      ? `<div style="margin-bottom: 16px;"><img src="${config.branding.logoUrl}" alt="Brand Logo" style="max-height: 55px; max-width: 240px; object-fit: contain;" /></div>`
      : '';

    const contentHtml = (isResultStep && aiReport) ? aiReport : generateLayoutPreviewHtml();
    const scoreVal = isResultStep ? scoreData : (scoreData || 75);

    return `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #1F2937; line-height: 1.6; max-width: 900px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border: 1px solid #E2E8F0;">
        <div style="border-bottom: 2px solid #1D4ED8; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
          <div>
            ${logoHtml}
            <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #1E3A8A; font-weight: 700;">${config.content?.title || 'Steelcase ARC — AI Workplace Readiness Diagnostic'}</h1>
            <div style="font-size: 13px; color: #4B5563;">
              <strong>Client:</strong> ${companyName} &nbsp;|&nbsp; 
              <strong>Contact:</strong> ${leadName} (${leadRole}) &nbsp;|&nbsp; 
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
          <div style="background: #1D4ED8; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 120px; flex-shrink: 0;">
            <div style="font-size: 32px; font-weight: 700; line-height: 1;">${scoreVal}</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; margin-top: 4px;">Readiness Score</div>
          </div>
        </div>

        <div class="report-content">
          ${contentHtml}
        </div>
      </div>
    `;
  };

  const downloadPdfReport = () => {
    const companyName = lead.company || 'Organization';
    const leadName = lead.name || 'Executive';
    const leadRole = lead.role || 'Workplace Leader';
    
    const showLogoInPdf = config.branding?.logoUrl && config.branding?.showLogoInPdf !== false;
    const logoHtml = showLogoInPdf 
      ? `<div style="margin-bottom: 16px;"><img src="${config.branding.logoUrl}" alt="Brand Logo" style="max-height: 55px; max-width: 240px; object-fit: contain;" /></div>`
      : '';

    const contentHtml = (isResultStep && aiReport) ? aiReport : generateLayoutPreviewHtml();
    const scoreVal = isResultStep ? scoreData : (scoreData || 75);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${companyName} - Steelcase ARC AI Diagnostic Report</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1F2937; line-height: 1.6; max-width: 900px; margin: 0 auto; }
            .header-banner { border-bottom: 2px solid #1D4ED8; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
            .score-badge { background: #1D4ED8; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 120px; }
            .score-num { font-size: 32px; font-weight: 700; line-height: 1; }
            .score-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; margin-top: 4px; }
            h1 { margin: 0 0 8px 0; font-size: 24px; color: #1E3A8A; }
            .meta { font-size: 13px; color: #4B5563; }
            .top-insights-box { background: #F0F7FF; border: 1px solid #BFDBFE; border-left: 5px solid #1D4ED8; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }
            .top-insights-box h3 { margin-top: 0; color: #1E3A8A; font-size: 16px; font-weight: 700; }
            .footnotes-box { margin-top: 36px; padding: 16px 20px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 6px; }
            .footnotes-box h4 { margin: 0 0 10px 0; font-size: 11.5px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .footnotes-list { margin: 0; padding-left: 18px; font-size: 11.5px; line-height: 1.55; color: #6B7280; }
            .footnotes-list li { margin-bottom: 8px; color: #6B7280; }
            .footnotes-list strong { color: #4B5563; }
            .footnotes-list a { color: #6B7280; text-decoration: underline; }
            a { color: #1D4ED8; text-decoration: underline; font-weight: 500; }
            .cite-badge { display: inline-flex; align-items: center; background: #EFF6FF; color: #1D4ED8 !important; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #BFDBFE; text-decoration: none !important; }
            .section-eyebrow-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; margin-bottom: 6px; }
            .section-eyebrow-pill .bullet-dot { width: 6px; height: 6px; border-radius: 50%; background: #4F46E5; display: inline-block; }
            .section-desc { font-size: 14px; color: #4B5563; margin: 0 0 14px 0; line-height: 1.5; }
            .report-content ul { margin: 0 0 16px; padding-left: 0; list-style-type: disc; list-style-position: inside; }
            .report-content ol { margin: 0 0 16px; padding-left: 0; list-style-type: decimal; list-style-position: inside; }
            .report-content li { margin-bottom: 8px; line-height: 1.6; padding-left: 0; text-indent: 0; }
            .report-content blockquote { border-left: 3.5px solid #1D4ED8; background: #F8FAFC; padding: 10px 16px; margin: 14px 0; font-style: italic; color: #475569; border-radius: 0 6px 6px 0; }
            .report-content mark { background: #FEF08A; color: #854D0E; padding: 1px 5px; border-radius: 3px; font-weight: 500; }
            .report-content h4 { font-size: 15px; font-weight: 700; color: #1E3A8A; margin: 16px 0 8px 0; }
            .report-content p { margin: 0 0 14px 0; }
            .print-bar { background: #F3F4F6; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #E5E7EB; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-bar no-print">
            <span style="font-size: 13px; color: #4B5563;">📄 Printable AI Readiness Diagnostic Report — Save as PDF via browser print</span>
            <button onclick="window.print()" style="background: #1D4ED8; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              🖨️ Save as PDF
            </button>
          </div>
          
          <div class="header-banner">
            <div>
              ${logoHtml}
              <h1>Steelcase ARC — AI Workplace Readiness Diagnostic</h1>
              <div class="meta">
                <strong>Client:</strong> ${companyName} &nbsp;|&nbsp; 
                <strong>Contact:</strong> ${leadName} (${leadRole}) &nbsp;|&nbsp; 
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </div>
            </div>
            <div class="score-badge">
              <div class="score-num">${scoreVal}</div>
              <div class="score-lbl">Readiness Score</div>
            </div>
          </div>

          <div class="report-content">
            ${contentHtml}
          </div>

          <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const [isVisitorPreview, setIsVisitorPreview] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'quiz' || params.get('mode') === 'visitor' || params.get('standalone') === 'true';
  });

  const isQuestionStep = step < config.questions.length;
  const isGateStep = step === config.questions.length;
  const isResultStep = step === config.questions.length + 1;
  const progress = isResultStep ? 100 : Math.round((step / (config.questions.length + 1)) * 100);

  const scoreData = useMemo(() => {
    const raw = config.questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const maxPossible = config.questions.length * 10;
    return maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
  }, [answers, config.questions]);

  const activeResult = useMemo(() => {
    return config.results.find(r => scoreData <= r.maxScore) || config.results[config.results.length - 1];
  }, [scoreData, config.results]);

  const thinkingSteps = useMemo(() => [
    `🔍 Researching Google intelligence & workplace news for "${lead.company || 'your organization'}"...`,
    `📊 Processing survey metrics (${scoreData}/100 index) & response parameters...`,
    `🏗️ Analyzing acoustic transmission (STC), spatial adaptability & IT/power infrastructure...`,
    `💡 Formulating Steelcase ARC diagnostic roadmap and tailored spatial recommendations...`
  ], [lead.company, scoreData]);

  const isEmailValid = (config.leadCapture?.requireWorkEmail !== false) ? isWorkEmail(lead.email) : (lead.email && lead.email.includes('@'));
  
  const isLeadValid = () => {
    const fields = config.leadCapture?.fields || {};
    if (fields.name?.enabled !== false && fields.name?.required !== false && !lead.name?.trim()) return false;
    if (fields.email?.enabled !== false && fields.email?.required !== false && (!lead.email?.trim() || !isEmailValid)) return false;
    if (fields.company?.enabled !== false && fields.company?.required !== false && !lead.company?.trim()) return false;
    if (fields.role?.enabled !== false && fields.role?.required === true && !lead.role?.trim()) return false;
    if (fields.phone?.enabled === true && fields.phone?.required === true && !lead.phone?.trim()) return false;
    if (fields.projectStatus?.enabled !== false && fields.projectStatus?.required !== false && !lead.projectStatus) return false;

    // Validate dynamic custom questions
    const customQs = Array.isArray(config.leadCapture?.customQuestions) ? config.leadCapture.customQuestions : [];
    for (const cq of customQs) {
      if (cq.enabled !== false && cq.required) {
        const val = lead.customAnswers?.[cq.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          return false;
        }
      }
    }

    return true;
  };

  const canProceed = isQuestionStep 
    ? answers[config.questions[step]?.id] !== undefined 
    : isLeadValid();

  const handleAnswer = (val) => {
    if (isAnswering || step >= config.questions.length) return;
    setIsAnswering(true);
    setAnswers(prev => ({ ...prev, [config.questions[step].id]: val }));
    setTimeout(() => {
      setStep(prev => prev < config.questions.length ? prev + 1 : prev);
      setIsAnswering(false);
    }, 300);
  };

  const getAnswerLabels = () => {
    let labeledAnswers = {};
    config.questions.forEach(q => {
      const selectedOpt = q.options.find(o => o.value === answers[q.id]);
      labeledAnswers[q.id] = selectedOpt ? selectedOpt.label : 'N/A';
    });
    return labeledAnswers;
  };

  const getCleanWebhookUrl = (url) => {
    if (!url) return '';
    let clean = url.trim();
    if (clean.includes('script.google.com') && !clean.endsWith('/exec')) {
      if (clean.endsWith('/')) clean = clean.slice(0, -1);
      clean += '/exec';
    }
    return clean;
  };

  const submitToGoogle = async (actionData) => {
    const url = getCleanWebhookUrl(config.integration.webhookUrl);
    if (!url) return;
    
    try {
      const params = new URLSearchParams();
      params.append('payload', JSON.stringify(actionData));
      
      await fetch(url, { 
        method: 'POST', 
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
    } catch (e) { console.error("Webhook failed:", e); }
  };

  const activeApiKey = config.integration.geminiApiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY);

  const submitToWebhook = async () => {
    setIsSubmitting(true);
    // Immediately advance to results view so the user sees live progress & score card right away
    setStep(config.questions.length + 1);
    setPreviewMode('questions');

    // Run webhook in parallel background so slow or failing Google Sheets URLs never block UI
    submitToGoogle({ 
      action: "submit", 
      lead, 
      name: lead.name,
      email: lead.email,
      company: lead.company,
      role: lead.role,
      phone: lead.phone,
      projectStatus: lead.projectStatus,
      project_status: lead.projectStatus,
      customAnswers: lead.customAnswers || {},
      answers: getAnswerLabels(), 
      score: scoreData, 
      timestamp: new Date().toISOString() 
    }).catch(err => console.error("Background webhook error:", err));

    setIsSubmitting(false);
    generateAiAnalysis();
  };

  const requestAssessment = async () => {
    setApplied(true);
    await submitToGoogle({ 
      action: "update", 
      email: lead.email, 
      assessmentRequested: true, 
      consultationRequested: true, 
      requestConsultation: "Yes", 
      timestamp: new Date().toISOString() 
    });
  };

  const submitTel = async () => {
    if (!tel) return;
    setTelSent(true);
    await submitToGoogle({ 
      action: "update", 
      email: lead.email, 
      tel: tel, 
      phone: tel, 
      timestamp: new Date().toISOString() 
    });
  };

  const generateAiAnalysis = async () => {
    setIsGeneratingAI(true);
    setAiReport("");
    setThinkingStepIndex(0);
    setThinkingProgress(18);

    const nowStr = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    const initialLogs = [
      `[${nowStr()}] [Client Engine] Initiating diagnostic generation for: "${lead.company || 'Target Organization'}"...`,
      `[${nowStr()}] [Client Engine] Stage 1/4: Analyzing organizational profile & workplace news...`,
      `[${nowStr()}] [Client Engine] Connecting to backend server endpoint (/api/analyze-company)...`
    ];
    setAiThinkingLogs(initialLogs);

    const t1 = setTimeout(() => {
      setThinkingStepIndex(1);
      setThinkingProgress(45);
      setAiThinkingLogs(prev => [
        ...prev,
        `[${nowStr()}] [Client Engine] Stage 2/4: Processing survey index metrics (${scoreData}/100)...`
      ]);
    }, 2500);

    const t2 = setTimeout(() => {
      setThinkingStepIndex(2);
      setThinkingProgress(68);
      setAiThinkingLogs(prev => [
        ...prev,
        `[${nowStr()}] [Client Engine] Stage 3/4: Assessing acoustic transmission (STC) & IT infrastructure...`,
        `[${nowStr()}] [Client Engine] Awaiting Google Gemini model response & search grounding...`
      ]);
    }, 5500);

    let currentCrawl = 68;
    const crawlInterval = setInterval(() => {
      if (currentCrawl < 90) {
        currentCrawl += 1;
        setThinkingProgress(currentCrawl);
      }
    }, 600);

    let htmlOutput = "";

    try {
      let qaText = config.questions
        .map(q => {
          const selectedOpt = q.options.find(o => o.value === answers[q.id]);
          return { q: q.question, a: selectedOpt ? selectedOpt.label : null };
        })
        .filter(item => item.a && item.a !== 'N/A' && item.a !== '')
        .map(item => "Q: " + item.q + "\nA: " + item.a)
        .join('\n\n') || "No specific deviations recorded.";

      const response = await fetch("/api/analyze-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: lead.company,
          leadName: lead.name,
          role: lead.role,
          scoreData: scoreData,
          qaText: qaText,
          customApiKey: activeApiKey,
          aiPersona: config.aiPersona,
          reportSections: config.reportSections,
          dangerZoneConfig: config.dangerZoneConfig,
          modelFallbacks: config.integration?.modelFallbacks || ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-pro-latest']
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `API HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.telemetry) {
        setLastTelemetryData(data.telemetry);
      }

      if (data.thinkingLogs && Array.isArray(data.thinkingLogs)) {
        setAiThinkingLogs(prev => [...prev, ...data.thinkingLogs]);
      }

      if (data.html) {
        htmlOutput = formatClientReportHtml(data.html);
      } else {
        throw new Error("Invalid response format received from AI server");
      }
    } catch (e) {
      console.error("AI Generation error:", e);
      const errDetail = e?.message || "Unknown error";
      setLastTelemetryData({
        modelUsed: "Instant Synthesis (Offline)",
        latencyMs: 1200,
        status: "client_fallback",
        groundingSourcesCount: 0,
        timestamp: new Date().toISOString()
      });
      setAiThinkingLogs(prev => [
        ...prev,
        `[${nowStr()}] [ERROR] AI request notice: ${errDetail}`,
        `[${nowStr()}] [BENCHMARK ENGINE] Instant synthesis activated: generating Steelcase + Gensler benchmark report.`
      ]);
      const secs = Array.isArray(config.reportSections) && config.reportSections.length === 5 
        ? config.reportSections 
        : DEFAULT_CONFIG.reportSections;
      const s1 = secs[0] || {};
      const s2 = secs[1] || {};
      const s3 = secs[2] || {};
      const s4 = secs[3] || {};
      const s5 = secs[4] || {};

      const s1TextBox = (s1.textBox || "").trim() || `Workplace analysis for <strong>${lead.company || 'your organization'}</strong> indicates an accelerating transition toward hybrid collaboration and generative AI adoption. Organizations operating in this space require high spatial adaptability and strict acoustic containment to maximize cognitive output and retain top technical talent.`;
      const s3TextBox = (s3.textBox || "").trim() || `Spatial flexibility and STC 38+ acoustic enclosures mitigate context-switching latency. Implementing agile micro-zones prevents open-plan acoustic spill and preserves uninterrupted focus.`;
      const s5TextBox = (s5.textBox || "").trim() || `Schedule a dedicated consultation with workplace strategy specialists to conduct a comprehensive on-site acoustic and spatial audit, tailored to your technical team topologies.`;

      const fallbackSec2Body = `<p><strong>${lead.company || 'The organization'}</strong> scored <strong>${scoreData}/100</strong>. In modern knowledge environments, spatial adaptability and acoustic isolation directly dictate cognitive performance and employee retention.</p><p>${s2.textBox || s2.prompt || ''}</p>`;

      const fallbackSec4Body = s4.textBox 
        ? `<div>${s4.textBox}</div>`
        : (s4.prompt ? `<div>${s4.prompt}</div>` : `<ul>
            <li><strong>Acoustic Focus Zones:</strong> Deploy dedicated high-STC quiet pods to isolate intensive solo tasks and prevent acoustic spill.</li>
            <li><strong>Adaptive Team Neighborhoods:</strong> Implement agile, reconfigurable furnishings to support quick transitions between solo focus and collaborative sprints.</li>
            <li><strong>Flexible Infrastructure:</strong> Ensure distributed power access and ergonomic support tailored to agile team topologies.</li>
          </ul>`);

      htmlOutput = `
        <div>
          <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${s1.eyebrow || '01. OVERVIEW'}</span>
          <h3>1. ${s1.sectionHeading || 'Company Intelligence & Workplace Research Context'}</h3>
          ${s1.description ? `<p class="section-desc">${s1.description}</p>` : ''}
          <div>${s1TextBox}</div>
        </div>
        
        <div>
          <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${s2.eyebrow || '02. AI DIAGNOSTIC'}</span>
          <h3>2. ${s2.sectionHeading || `Technical Score Breakdown (${scoreData}/100 Index Analysis)`}</h3>
          ${s2.description ? `<p class="section-desc">${s2.description}</p>` : ''}
          <div>${fallbackSec2Body}</div>
        </div>
        
        <div>
          <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${s3.eyebrow || '03. INFRASTRUCTURE'}</span>
          <h3>3. ${s3.sectionHeading || 'Critical Architectural & Operational Friction Points (Bottom-Line Impact)'}</h3>
          ${s3.description ? `<p class="section-desc">${s3.description}</p>` : ''}
          <div>${s3TextBox}</div>
        </div>
        
        <div>
          <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${s4.eyebrow || '04. STRATEGIC ROADMAP'}</span>
          <h3>4. ${s4.sectionHeading || 'High-Performance Spatial Optimization Roadmap'}</h3>
          ${s4.description ? `<p class="section-desc">${s4.description}</p>` : ''}
          <div>${fallbackSec4Body}</div>
        </div>
        
        <div>
          <span class="section-eyebrow-pill"><span class="bullet-dot"></span>${s5.eyebrow || '05. IMPLEMENTATION'}</span>
          <h3>5. ${s5.sectionHeading || 'Executive Next Steps: Beyond DIY to Certified Spatial Mastery'}</h3>
          ${s5.description ? `<p class="section-desc">${s5.description}</p>` : ''}
          <div>${s5TextBox}</div>
        </div>
      `;
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(crawlInterval);

      // Transition to Stage 4 (Formulating diagnostic roadmap) and zoom progress bar to 100%
      setThinkingStepIndex(3);
      setThinkingProgress(100);
      await new Promise(res => setTimeout(res, 700));

      setAiReport(formatClientReportHtml(htmlOutput));
      setIsGeneratingAI(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setIsAnswering(false);
    setAnswers({});
    setAiReport("");
    setLead({ name: '', email: '', company: '', role: '', projectStatus: '' });
    setApplied(false);
    setTelSent(false);
    setTel("");
  };

  const downloadFile = (filename, content, type = 'application/json') => {
    try {
      const blob = new Blob([content], { type: `${type};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const getSanitizedConfig = (cfg) => {
    const clean = JSON.parse(JSON.stringify(cfg || {}));
    if (clean.integration) {
      if (clean.integration.geminiApiKey) {
        const k = clean.integration.geminiApiKey;
        const mid = Math.floor(k.length / 2);
        clean.integration.geminiApiKeyPart1 = k.substring(0, mid);
        clean.integration.geminiApiKeyPart2 = k.substring(mid);
      }
      clean.integration.geminiApiKey = '';
    }
    return clean;
  };

  const exportJson = () => {
    downloadFile('quiz-config.json', JSON.stringify(getSanitizedConfig(config), null, 2), 'application/json');
  };

  const exportStandaloneHtml = () => {
    try {
      const htmlContent = generateStandaloneHtml(config, window.location.origin);
      downloadFile('index.html', htmlContent, 'text/html');
    } catch (err) {
      console.error('Failed to generate standalone HTML:', err);
    }
  };

  const exportReadme = () => {
    const readmeContent = generateReadme(getSanitizedConfig(config));
    downloadFile('README.md', readmeContent, 'text/markdown');
  };

  const exportPayloadSchema = () => {
    const schemaContent = generateLeadPayloadSchema();
    downloadFile('lead-payload-schema.json', schemaContent, 'application/json');
  };

  const exportZipPackage = async () => {
    try {
      const zip = new JSZip();
      const sanitizedConfig = getSanitizedConfig(config);
      zip.file('index.html', generateStandaloneHtml(config, window.location.origin));
      zip.file('quiz-config.json', JSON.stringify(sanitizedConfig, null, 2));
      zip.file('README.md', generateReadme(sanitizedConfig));
      zip.file('lead-payload-schema.json', generateLeadPayloadSchema());

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz-github-package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    }
  };

  const exportGitHubFiles = () => {
    setShowExportModal(true);
  };

  return (
    <div className="app-layout">
      <style>{STYLES}</style>
      
      {isVisitorPreview && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          background: '#1E293B',
          color: '#F8FAFC',
          padding: '8px 16px',
          borderRadius: '30px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          border: '1px solid #334155'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Eye size={16} color="#60A5FA" /> Standalone Quiz Preview (No Builder)</span>
          <button 
            onClick={() => setIsVisitorPreview(false)}
            style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* BUILDER SIDEBAR */}
      {!isVisitorPreview && (
        <div className="builder-sidebar">
          <div className="builder-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}><Settings size={20} /> {config.content?.builderTitle || 'Quiz Builder'}</h2>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <button 
                  onClick={() => {
                    setShowPublishModal(true);
                    handlePublishToGitHub();
                  }} 
                  style={{
                    background: '#059669', 
                    color: 'white', 
                    border: 'none', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '5px', 
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                  }} 
                  title="1-Click Publish live quiz to GitHub Pages"
                >
                  <Globe size={14}/> Publish
                </button>
                <button className="builder-export-btn" onClick={exportGitHubFiles} style={{padding: '6px 10px', fontSize: 12}}><Download size={14}/> Export</button>
              </div>
            </div>
          </div>
        
        <div className="builder-tabs">
          <button className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>Questions</button>
          <button className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`} onClick={() => setActiveTab('form')}>Form</button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Report</button>
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Setting {!isIntegrationUnlocked && <Lock size={12} style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }} />}
          </button>
        </div>

        <div className="builder-content">

          {activeTab === 'reports' && (
            <div>
              {(config.reportSections || DEFAULT_CONFIG.reportSections).map((sec, secIdx) => {
                const isAiSection = secIdx === 1 || secIdx === 3;
                const sectionNum = secIdx + 1;
                const defaultPresets = [
                  `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                  `● SECTION 0${sectionNum}`,
                  `● KEY FINDINGS`,
                  `● EXECUTIVE INSIGHTS`
                ];

                return (
                  <div key={sec.id || secIdx} style={{ background: '#F9FAFB', border: isAiSection ? '1px solid #CBD5E1' : '1px solid #E5E7EB', borderLeft: isAiSection ? '4px solid #7C3AED' : '4px solid #1A73E8', borderRadius: '8px', padding: '18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: isAiSection ? '#4C1D95' : '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: isAiSection ? '#7C3AED' : '#1A73E8', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                          {sectionNum}
                        </span>
                        Section {sectionNum}: {isAiSection ? 'AI Diagnosis & Narrative' : 'Content & Media'}
                      </span>
                      <span style={{ fontSize: '11px', background: isAiSection ? '#EDE9FE' : '#E0E7FF', color: isAiSection ? '#6D28D9' : '#3730A3', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        {isAiSection ? 'AI Controlled Text Box' : 'Static Narrative'}
                      </span>
                    </div>

                    {/* Section Eyebrow */}
                    <div className="field-group" style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ margin: 0 }}>Eyebrow</label>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input 
                          value={sec.eyebrow || ''} 
                          placeholder={`e.g. 0${sectionNum}. ${isAiSection ? 'AI DIAGNOSTIC' : 'OVERVIEW'}`}
                          onChange={e => {
                            const val = e.target.value;
                            setConfig(prev => {
                              const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                              secs[secIdx] = { ...secs[secIdx], eyebrow: val };
                              return { ...prev, reportSections: secs };
                            });
                          }} 
                        />
                      </div>

                      {/* Quick preset editable pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Presets:</span>
                        {((sec.presets && Array.isArray(sec.presets)) ? sec.presets : [
                          `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                          `SECTION 0${sectionNum}`,
                          `KEY FINDINGS`,
                          `EXECUTIVE INSIGHTS`
                        ]).map((presetText, pIdx) => {
                          const isEditingThis = editingPresetInfo && editingPresetInfo.secIdx === secIdx && editingPresetInfo.pIdx === pIdx;

                          if (isEditingThis) {
                            return (
                              <div
                                key={pIdx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  background: '#EFF6FF',
                                  border: '1.5px solid #3B82F6',
                                  borderRadius: '12px',
                                  padding: '2px 4px 2px 6px',
                                  gap: '4px'
                                }}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingPresetInfo.text}
                                  onChange={e => setEditingPresetInfo({ ...editingPresetInfo, text: e.target.value })}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (editingPresetInfo.text.trim()) {
                                        setConfig(prev => {
                                          const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                          const currPresets = (secs[secIdx].presets && Array.isArray(secs[secIdx].presets)) ? [...secs[secIdx].presets] : [
                                            `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                                            `SECTION 0${sectionNum}`,
                                            `KEY FINDINGS`,
                                            `EXECUTIVE INSIGHTS`
                                          ];
                                          currPresets[pIdx] = editingPresetInfo.text.trim();
                                          secs[secIdx] = { ...secs[secIdx], presets: currPresets };
                                          return { ...prev, reportSections: secs };
                                        });
                                      }
                                      setEditingPresetInfo(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingPresetInfo(null);
                                    }
                                  }}
                                  style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#1E3A8A',
                                    padding: 0,
                                    width: `${Math.max(60, editingPresetInfo.text.length * 7)}px`,
                                    maxWidth: '180px'
                                  }}
                                />
                                <button
                                  type="button"
                                  title="Save"
                                  onClick={() => {
                                    if (editingPresetInfo.text.trim()) {
                                      setConfig(prev => {
                                        const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                        const currPresets = (secs[secIdx].presets && Array.isArray(secs[secIdx].presets)) ? [...secs[secIdx].presets] : [
                                          `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                                          `SECTION 0${sectionNum}`,
                                          `KEY FINDINGS`,
                                          `EXECUTIVE INSIGHTS`
                                        ];
                                        currPresets[pIdx] = editingPresetInfo.text.trim();
                                        secs[secIdx] = { ...secs[secIdx], presets: currPresets };
                                        return { ...prev, reportSections: secs };
                                      });
                                    }
                                    setEditingPresetInfo(null);
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', fontSize: '11px', padding: '0 2px', fontWeight: 700 }}
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  title="Cancel"
                                  onClick={() => setEditingPresetInfo(null)}
                                  style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '11px', padding: '0 2px' }}
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={pIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#F3F4F6',
                                border: '1px solid #D1D5DB',
                                borderRadius: '12px',
                                padding: '1px 6px 1px 8px',
                                gap: '4px'
                              }}
                            >
                              <span
                                onClick={() => {
                                  setConfig(prev => {
                                    const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                    secs[secIdx] = { ...secs[secIdx], eyebrow: presetText };
                                    return { ...prev, reportSections: secs };
                                  });
                                }}
                                title="Click to apply to Eyebrow"
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: '#374151',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6B7280', display: 'inline-block' }}></span>
                                {presetText}
                              </span>
                              <button
                                type="button"
                                title="Edit this preset text"
                                onClick={() => {
                                  setEditingPresetInfo({ secIdx, pIdx, text: presetText });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#9CA3AF',
                                  cursor: 'pointer',
                                  padding: '1px 2px',
                                  fontSize: '10px',
                                  lineHeight: 1,
                                  borderRadius: '2px'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#1D4ED8'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                title="Remove preset"
                                onClick={() => {
                                  setConfig(prev => {
                                    const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                    const currPresets = (secs[secIdx].presets && Array.isArray(secs[secIdx].presets)) ? [...secs[secIdx].presets] : [
                                      `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                                      `SECTION 0${sectionNum}`,
                                      `KEY FINDINGS`,
                                      `EXECUTIVE INSIGHTS`
                                    ];
                                    currPresets.splice(pIdx, 1);
                                    secs[secIdx] = { ...secs[secIdx], presets: currPresets };
                                    return { ...prev, reportSections: secs };
                                  });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#9CA3AF',
                                  cursor: 'pointer',
                                  padding: '1px 2px',
                                  fontSize: '10px',
                                  lineHeight: 1,
                                  borderRadius: '2px'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}

                        {addingPresetSectionIdx === secIdx ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: '#EFF6FF',
                              border: '1.5px solid #3B82F6',
                              borderRadius: '12px',
                              padding: '2px 4px 2px 6px',
                              gap: '4px'
                            }}
                          >
                            <input
                              type="text"
                              autoFocus
                              placeholder="Type preset name..."
                              value={newPresetInputText}
                              onChange={e => setNewPresetInputText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newPresetInputText.trim()) {
                                    setConfig(prev => {
                                      const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                      const currPresets = (secs[secIdx].presets && Array.isArray(secs[secIdx].presets)) ? [...secs[secIdx].presets] : [
                                        `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                                        `SECTION 0${sectionNum}`,
                                        `KEY FINDINGS`,
                                        `EXECUTIVE INSIGHTS`
                                      ];
                                      currPresets.push(newPresetInputText.trim());
                                      secs[secIdx] = { ...secs[secIdx], presets: currPresets };
                                      return { ...prev, reportSections: secs };
                                    });
                                  }
                                  setNewPresetInputText('');
                                  setAddingPresetSectionIdx(null);
                                } else if (e.key === 'Escape') {
                                  setNewPresetInputText('');
                                  setAddingPresetSectionIdx(null);
                                }
                              }}
                              style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#1E3A8A',
                                padding: 0,
                                width: '110px'
                              }}
                            />
                            <button
                              type="button"
                              title="Add Preset"
                              onClick={() => {
                                if (newPresetInputText.trim()) {
                                  setConfig(prev => {
                                    const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                    const currPresets = (secs[secIdx].presets && Array.isArray(secs[secIdx].presets)) ? [...secs[secIdx].presets] : [
                                      `0${sectionNum}. ${isAiSection ? (secIdx === 1 ? 'AI DIAGNOSTIC' : 'STRATEGIC ROADMAP') : (secIdx === 0 ? 'OVERVIEW' : secIdx === 2 ? 'INFRASTRUCTURE' : 'IMPLEMENTATION')}`,
                                      `SECTION 0${sectionNum}`,
                                      `KEY FINDINGS`,
                                      `EXECUTIVE INSIGHTS`
                                    ];
                                    currPresets.push(newPresetInputText.trim());
                                    secs[secIdx] = { ...secs[secIdx], presets: currPresets };
                                    return { ...prev, reportSections: secs };
                                  });
                                }
                                setNewPresetInputText('');
                                setAddingPresetSectionIdx(null);
                              }}
                              style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', fontSize: '11px', padding: '0 2px', fontWeight: 700 }}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              title="Cancel"
                              onClick={() => {
                                setNewPresetInputText('');
                                setAddingPresetSectionIdx(null);
                              }}
                              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '11px', padding: '0 2px' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAddingPresetSectionIdx(secIdx);
                              setNewPresetInputText('');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#EFF6FF',
                              border: '1px dashed #93C5FD',
                              color: '#1D4ED8',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                          >
                            <Plus size={11} /> Add Preset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section Title */}
                    <div className="field-group" style={{ marginBottom: '12px' }}>
                      <label>Title</label>
                      <input 
                        value={sec.sectionHeading || ''} 
                        placeholder={`e.g. Section ${sectionNum} Heading`}
                        onChange={e => {
                          const val = e.target.value;
                          setConfig(prev => {
                            const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                            secs[secIdx] = { ...secs[secIdx], sectionHeading: val };
                            return { ...prev, reportSections: secs };
                          });
                        }} 
                      />
                    </div>

                    {/* Sub-Description */}
                    <div className="field-group" style={{ marginBottom: '14px' }}>
                      <label>Sub-Description</label>
                      <textarea 
                        style={{ minHeight: '55px' }}
                        value={sec.description || ''} 
                        placeholder="Brief sub-description framing this section..."
                        onChange={e => {
                          const val = e.target.value;
                          setConfig(prev => {
                            const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                            secs[secIdx] = { ...secs[secIdx], description: val };
                            return { ...prev, reportSections: secs };
                          });
                        }} 
                      />
                    </div>

                    {!isAiSection ? (
                      /* Sections 1, 3, 5: Visual Image + Narrative Text Box & Extra Blocks in Full-Width Stacked Layout */
                      <div>
                        {/* Primary Image & Text Block (Full Width Stacked) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                          {/* Visual Image Upload - Full Width */}
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#4B5563', marginBottom: '6px' }}>
                              Visual Image
                            </label>
                            {sec.imageUrl ? (
                              <div style={{ position: 'relative', border: '1px solid #D1D5DB', borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                                <img src={sec.imageUrl} alt={`Section ${sectionNum} visual`} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setConfig(prev => {
                                      const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                      secs[secIdx] = { ...secs[secIdx], imageUrl: '' };
                                      return { ...prev, reportSections: secs };
                                    });
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '3px 8px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              </div>
                            ) : (
                              <div>
                                <label 
                                  htmlFor={`sec-img-input-${secIdx}`}
                                  style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '6px', 
                                    padding: '20px 10px', 
                                    background: 'white', 
                                    border: '2px dashed #9CA3AF', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer', 
                                    textAlign: 'center' 
                                  }}
                                >
                                  <Image size={22} color="#1A73E8" />
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A73E8' }}>Upload Image (Full Width)</span>
                                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>PNG/JPG/SVG</span>
                                </label>
                                <input 
                                  id={`sec-img-input-${secIdx}`}
                                  type="file" 
                                  accept="image/*" 
                                  onChange={e => handleSectionImageUpload(secIdx, e)}
                                  style={{ display: 'none' }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Narrative Text Box - Full Width */}
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#4B5563', marginBottom: '6px' }}>
                              Narrative Text Box (Rich WYSIWYG Editor)
                            </label>
                            <RichTextEditor
                              id={`sec-text-input-${secIdx}`}
                              value={sec.textBox || ''}
                              placeholder="Detailed executive guidance, benchmarks, and context..."
                              minHeight="140px"
                              onChange={val => {
                                setConfig(prev => {
                                  const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                  secs[secIdx] = { ...secs[secIdx], textBox: val };
                                  return { ...prev, reportSections: secs };
                                });
                              }}
                            />
                          </div>
                        </div>

                        {/* Extra Text & Image Blocks - Full Width Stacked */}
                        {Array.isArray(sec.extraBlocks) && sec.extraBlocks.map((block, bIdx) => (
                          <div 
                            key={bIdx} 
                            style={{ 
                              background: '#F9FAFB', 
                              border: '1px solid #E5E7EB', 
                              borderRadius: '8px', 
                              padding: '14px', 
                              marginBottom: '16px',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>
                                Extra Content Block #{bIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfig(prev => {
                                    const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                    const extraBlocks = Array.isArray(secs[secIdx].extraBlocks) ? [...secs[secIdx].extraBlocks] : [];
                                    extraBlocks.splice(bIdx, 1);
                                    secs[secIdx] = { ...secs[secIdx], extraBlocks };
                                    return { ...prev, reportSections: secs };
                                  });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#DC2626',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Trash2 size={12} /> Remove Block
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {/* Extra Block: Visual Image Upload - Full Width */}
                              <div>
                                <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: '#4B5563', marginBottom: '4px' }}>
                                  Extra Block Visual Image
                                </label>
                                {block.imageUrl ? (
                                  <div style={{ position: 'relative', border: '1px solid #D1D5DB', borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                                    <img src={block.imageUrl} alt={`Section ${sectionNum} extra visual ${bIdx + 1}`} style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setConfig(prev => {
                                          const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                          const extraBlocks = Array.isArray(secs[secIdx].extraBlocks) ? [...secs[secIdx].extraBlocks] : [];
                                          extraBlocks[bIdx] = { ...extraBlocks[bIdx], imageUrl: '' };
                                          secs[secIdx] = { ...secs[secIdx], extraBlocks };
                                          return { ...prev, reportSections: secs };
                                        });
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '6px',
                                        right: '6px',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '3px 6px',
                                        fontSize: '10.5px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px'
                                      }}
                                    >
                                      <Trash2 size={11} /> Remove
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <label 
                                      htmlFor={`sec-extra-img-${secIdx}-${bIdx}`}
                                      style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '4px', 
                                        padding: '16px 8px', 
                                        background: 'white', 
                                        border: '2px dashed #9CA3AF', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer', 
                                        textAlign: 'center' 
                                      }}
                                    >
                                      <Image size={18} color="#1A73E8" />
                                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1A73E8' }}>Upload Extra Block Image</span>
                                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>PNG/JPG/SVG</span>
                                    </label>
                                    <input 
                                      id={`sec-extra-img-${secIdx}-${bIdx}`}
                                      type="file" 
                                      accept="image/*" 
                                      onChange={e => handleExtraBlockImageUpload(secIdx, bIdx, e)}
                                      style={{ display: 'none' }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Extra Block: Narrative Box - Full Width */}
                              <div>
                                <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: '#4B5563', marginBottom: '4px' }}>
                                  Extra Block Narrative Box (Rich WYSIWYG Editor)
                                </label>
                                <RichTextEditor
                                  id={`sec-extra-text-${secIdx}-${bIdx}`}
                                  value={block.textBox || ''}
                                  placeholder="Additional paragraph, insights, or analysis..."
                                  minHeight="110px"
                                  onChange={val => {
                                    setConfig(prev => {
                                      const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                      const extraBlocks = Array.isArray(secs[secIdx].extraBlocks) ? [...secs[secIdx].extraBlocks] : [];
                                      extraBlocks[bIdx] = { ...extraBlocks[bIdx], textBox: val };
                                      secs[secIdx] = { ...secs[secIdx], extraBlocks };
                                      return { ...prev, reportSections: secs };
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add New Section Block Button */}
                        <div style={{ marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setConfig(prev => {
                                const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                const currentExtra = Array.isArray(secs[secIdx].extraBlocks) ? [...secs[secIdx].extraBlocks] : [];
                                currentExtra.push({
                                  textBox: '',
                                  imageUrl: ''
                                });
                                secs[secIdx] = { ...secs[secIdx], extraBlocks: currentExtra };
                                return { ...prev, reportSections: secs };
                              });
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#F0FDF4',
                              color: '#166534',
                              border: '1.5px dashed #86EFAC',
                              padding: '7px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#DCFCE7'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4'; }}
                          >
                            <Plus size={14} /> Add new section
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Sections 2 & 4: AI Controlled Text Box with Directives & RAG files */
                      <div>
                        <div className="field-group" style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Code size={13} color="#7C3AED" /> Custom AI Generation Prompt Directives
                          </label>
                          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 6px 0' }}>
                            Direct how Gemini AI synthesizes this specific section using respondent scores and organization context.
                          </p>
                          <textarea 
                            style={{ minHeight: '80px', fontSize: '13px' }}
                            value={sec.prompt || ''} 
                            placeholder="Specify generation guidelines, tone, metrics, and analytical emphasis..."
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => {
                                const secs = Array.isArray(prev.reportSections) ? [...prev.reportSections] : [...DEFAULT_CONFIG.reportSections];
                                secs[secIdx] = { ...secs[secIdx], prompt: val };
                                return { ...prev, reportSections: secs };
                              });
                            }} 
                          />
                        </div>

                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                            <Upload size={13} color="#7C3AED" /> RAG Knowledge Base Uploads (TXT, MD, CSV, JSON)
                          </label>
                          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 8px 0' }}>
                            Upload whitepapers, proprietary benchmarks, or reference data to ground this section's AI generation.
                          </p>

                          <div style={{ marginBottom: '10px' }}>
                            <label 
                              htmlFor={`sec-rag-input-${secIdx}`}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                padding: '10px', 
                                background: 'white', 
                                border: '1px dashed #7C3AED', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                color: '#7C3AED' 
                              }}
                            >
                              <Upload size={14} /> Upload RAG Reference File(s)
                            </label>
                            <input 
                              id={`sec-rag-input-${secIdx}`}
                              type="file" 
                              multiple 
                              accept=".txt,.md,.markdown,.csv,.json,.text" 
                              onChange={e => handleRagFileUpload(secIdx, e)}
                              style={{ display: 'none' }}
                            />
                          </div>

                          {Array.isArray(sec.ragFiles) && sec.ragFiles.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {sec.ragFiles.map(file => (
                                <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <FileText size={14} color="#7C3AED" />
                                    <span style={{ fontWeight: 500, color: '#1E293B' }}>{file.name}</span>
                                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => removeRagFile(secIdx, file.id)}
                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Report Footnotes & Cited Sources (User-Editable WYSIWYG Editor) */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '4px solid #0EA5E9', borderRadius: '8px', padding: '18px', marginTop: '24px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#0EA5E9', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      📚
                    </span>
                    Report Footnotes &amp; Cited Sources
                  </span>
                  <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                    Rendered at Bottom of Report &amp; PDF
                  </span>
                </div>

                <div className="field-group" style={{ marginBottom: '6px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Citations, Benchmark References &amp; Study Links</span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal' }}>WYSIWYG Visual Editor</span>
                  </label>
                  <RichTextEditor
                    id="report-footnotes-editor"
                    minHeight="140px"
                    showCodeToggle={true}
                    value={config.dangerZoneConfig?.footnotesReferenceHtml || ''}
                    placeholder="Enter footnotes, study citations, benchmark links, and research references..."
                    onChange={val => {
                      setConfig(prev => ({
                        ...prev,
                        dangerZoneConfig: {
                          ...(prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig),
                          footnotesReferenceHtml: val
                        }
                      }));
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: '1.4' }}>
                    💡 Use the visual editor to bold study titles, add numbered/bulleted citations, or insert clickable URLs directly. You can also toggle <strong>HTML Code</strong> view anytime.
                  </div>
                </div>
              </div>

              {/* DANGER ZONE: Core AI Prompt & RAG Knowledge Engine */}
              <div style={{ marginTop: '36px', borderTop: '2px dashed #EF4444', paddingTop: '24px' }}>
                <div style={{ background: '#FEF2F2', border: '1.5px solid #F87171', borderRadius: '8px', padding: '16px 18px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#DC2626', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      ⚠️ Danger Zone
                    </span>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                      Core AI System Prompt &amp; Global RAG Knowledge Architecture
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#B91C1C', lineHeight: 1.5 }}>
                    <strong>Warning:</strong> Modifying these settings directly overrides the foundational AI architecture, system prompt, and fallback research dataset.
                  </p>
                </div>

                {/* Architecture Overview Banner */}
                <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#7F1D1D', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#991B1B' }}>How AI Generation Works:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <span style={{ background: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', border: '1px solid #FCA5A5', fontWeight: 600 }}>1. Master Persona (Prompt)</span>
                    <span>➔</span>
                    <span style={{ background: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', border: '1px solid #FCA5A5', fontWeight: 600 }}>2. Uploaded Files (Priority 1 Grounding)</span>
                    <span>➔</span>
                    <span style={{ background: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', border: '1px solid #FCA5A5', fontWeight: 600 }}>3. Reference URLs &amp; Curated Benchmarks (Fallback)</span>
                  </div>
                </div>

                {/* PART 1: MASTER SYSTEM PROMPT */}
                <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#DC2626', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>1</span>
                        <span style={{ fontWeight: 700, color: '#991B1B', fontSize: '13px' }}>Global Master AI System Prompt (Baseline Persona)</span>
                      </div>
                      <p style={{ margin: '4px 0 0 26px', fontSize: '11.5px', color: '#7F1D1D' }}>
                        Sets the overarching tone, diagnostic methodology, and analytical rigor. Also serves as the fallback whenever a specific report section prompt is left empty.
                      </p>
                    </div>
                    <span style={{ fontSize: '10.5px', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Master Persona
                    </span>
                  </div>
                  
                  <textarea 
                    style={{ minHeight: '110px', fontSize: '12px', fontFamily: 'monospace', borderColor: '#FCA5A5', width: '100%', boxSizing: 'border-box' }}
                    value={config.dangerZoneConfig?.masterPrompt || ''}
                    placeholder="Enter global master system prompt..."
                    onChange={e => {
                      const val = e.target.value;
                      setConfig(prev => ({
                        ...prev,
                        dangerZoneConfig: {
                          ...(prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig),
                          masterPrompt: val
                        }
                      }));
                    }}
                  />
                </div>

                {/* PART 2: GROUNDING KNOWLEDGE SOURCES (RAG ENGINE) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #FEE2E2' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#DC2626', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>2</span>
                        <span style={{ fontWeight: 700, color: '#991B1B', fontSize: '13px' }}>Global RAG Knowledge Grounding Sources</span>
                      </div>
                      <p style={{ margin: '4px 0 0 26px', fontSize: '11.5px', color: '#7F1D1D' }}>
                        Provide verified research data, internal whitepapers, and study links so the AI grounds its insights on empirical facts rather than hallucinations.
                      </p>
                    </div>
                  </div>

                  {/* 2A: Uploaded Knowledge Files */}
                  <div style={{ background: '#FFF9F9', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12.5px', color: '#991B1B' }}>
                        <Upload size={14} color="#DC2626" /> (A) Upload Proprietary Knowledge Files (.txt, .md, .csv, .json)
                      </span>
                      <span style={{ fontSize: '10px', background: '#DC2626', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        Priority 1 Primary Dataset
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#7F1D1D', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      Upload whitepapers, proprietary survey benchmarks, or framework documents. When present, the AI searches these files first.
                    </p>

                    <div style={{ marginBottom: '10px' }}>
                      <label 
                        htmlFor="danger-rag-file-input"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px', 
                          padding: '10px 14px', 
                          background: '#FFFFFF', 
                          border: '1.5px dashed #EF4444', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontSize: '12px', 
                          fontWeight: 700, 
                          color: '#B91C1C',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                      >
                        <Upload size={15} /> Select Files to Upload
                      </label>
                      <input 
                        id="danger-rag-file-input"
                        type="file" 
                        multiple 
                        accept=".txt,.md,.markdown,.csv,.json,.text,.doc,.docx,.pdf" 
                        onChange={handleGlobalDangerRagFileUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {Array.isArray(config.dangerZoneConfig?.ragFiles) && config.dangerZoneConfig.ragFiles.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
                        {config.dangerZoneConfig.ragFiles.map(file => (
                          <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'white', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <FileText size={14} color="#DC2626" />
                              <span style={{ fontWeight: 600, color: '#991B1B' }}>{file.name}</span>
                              <span style={{ fontSize: '10px', color: '#6B7280' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeGlobalDangerRagFile(file.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
                              title="Delete RAG file"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic', padding: '2px 0' }}>
                        No custom RAG files uploaded yet. AI will use the curated fallback text bank below.
                      </div>
                    )}
                  </div>

                  {/* 2B: Grounding Reference Links */}
                  <div style={{ background: '#FFF9F9', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12.5px', color: '#991B1B' }}>
                        <Globe size={14} color="#DC2626" /> (B) Reference Research &amp; Benchmark Study URLs
                      </span>
                      <span style={{ fontSize: '10px', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                        Grounding URLs
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#7F1D1D', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      Authoritative URLs (case studies, research reports) given to the AI so it can cite specific studies with web links.
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        id="danger-rag-link-url"
                        placeholder="https://example.com/research-paper" 
                        style={{ fontSize: '12px', borderColor: '#FCA5A5', flex: 1 }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const urlInput = document.getElementById('danger-rag-link-url');
                            const labelInput = document.getElementById('danger-rag-link-label');
                            if (urlInput && urlInput.value) {
                              addGlobalDangerRagLink(urlInput.value, labelInput ? labelInput.value : '');
                              urlInput.value = '';
                              if (labelInput) labelInput.value = '';
                            }
                          }
                        }}
                      />
                      <input 
                        id="danger-rag-link-label"
                        placeholder="Label (e.g. Steelcase Study)" 
                        style={{ maxWidth: '170px', fontSize: '12px', borderColor: '#FCA5A5' }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const urlInput = document.getElementById('danger-rag-link-url');
                            const labelInput = document.getElementById('danger-rag-link-label');
                            if (urlInput && urlInput.value) {
                              addGlobalDangerRagLink(urlInput.value, labelInput ? labelInput.value : '');
                              urlInput.value = '';
                              if (labelInput) labelInput.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const urlInput = document.getElementById('danger-rag-link-url');
                          const labelInput = document.getElementById('danger-rag-link-label');
                          if (urlInput && urlInput.value) {
                            addGlobalDangerRagLink(urlInput.value, labelInput ? labelInput.value : '');
                            urlInput.value = '';
                            if (labelInput) labelInput.value = '';
                          }
                        }}
                        style={{
                          padding: '8px 14px',
                          background: '#DC2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Plus size={13} /> Add Link
                      </button>
                    </div>

                    {Array.isArray(config.dangerZoneConfig?.ragLinks) && config.dangerZoneConfig.ragLinks.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {config.dangerZoneConfig.ragLinks.map(link => (
                          <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'white', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <ExternalLink size={13} color="#DC2626" />
                              <span style={{ fontWeight: 600, color: '#991B1B' }}>{link.label || link.url}</span>
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>({link.url})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeGlobalDangerRagLink(link.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
                              title="Remove link"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic', padding: '2px 0' }}>
                        No custom reference links added yet.
                      </div>
                    )}
                  </div>

                  {/* 2C: Curated Benchmark Text Bank */}
                  <div style={{ background: '#FFF9F9', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12.5px', color: '#991B1B' }}>
                        <FileText size={14} color="#DC2626" /> (C) Curated RAG Benchmark Text Bank (Built-in Knowledge)
                      </span>
                      <span style={{ fontSize: '10px', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                        Priority 2 Fallback Grounding
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#7F1D1D', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      Built-in textual case studies and benchmarks (Microsoft, Cisco, Roche, Capital One). Used automatically when no custom files are uploaded in (A).
                    </p>
                    <textarea 
                      style={{ minHeight: '150px', fontSize: '12px', fontFamily: 'monospace', borderColor: '#FCA5A5', width: '100%', boxSizing: 'border-box' }}
                      value={config.dangerZoneConfig?.defaultRagBank || ''}
                      placeholder="Enter default RAG benchmarks dataset..."
                      onChange={e => {
                        const val = e.target.value;
                        setConfig(prev => ({
                          ...prev,
                          dangerZoneConfig: {
                            ...(prev.dangerZoneConfig || DEFAULT_CONFIG.dangerZoneConfig),
                            defaultRagBank: val
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <>
              <p style={{fontSize:'13px', color:'#6B7280', marginTop:0, marginBottom: 16}}>Customize questions, choices, and point values below.</p>
              {config.questions.map((q, qIdx) => (
                <div key={q.id} className="q-card">
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                      <label style={{fontSize: '12px', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', margin: 0}}>Metric {qIdx + 1}</label>
                      <button 
                        onClick={() => {
                          const newQ = [...config.questions];
                          newQ.splice(qIdx, 1);
                          setConfig({...config, questions: newQ});
                        }} 
                        style={{background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', padding: 4}}
                      >
                        <Trash2 size={14}/> Delete
                      </button>
                  </div>

                  <div className="field-group" style={{marginBottom: 8}}>
                    <label>Question Text</label>
                    <textarea value={q.question} onChange={e => {
                      const newQ = [...config.questions];
                      newQ[qIdx].question = e.target.value;
                      setConfig({...config, questions: newQ});
                    }} />
                  </div>
                  <div className="field-group" style={{marginBottom: 12}}>
                    <label>Category / Section</label>
                    <input value={q.section} onChange={e => {
                      const newQ = [...config.questions];
                      newQ[qIdx].section = e.target.value;
                      setConfig({...config, questions: newQ});
                    }} />
                  </div>
                  <label style={{fontSize:'11px', textTransform:'uppercase', fontWeight:600, color:'#4B5563', marginBottom:6, display:'block'}}>Answer Options & Points</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="opt-row">
                      <input value={opt.label} placeholder="Answer text" onChange={e => {
                        const newQ = [...config.questions];
                        newQ[qIdx].options[optIdx].label = e.target.value;
                        setConfig({...config, questions: newQ});
                      }} />
                      <input type="number" value={opt.value} placeholder="Pts" onChange={e => {
                        const newQ = [...config.questions];
                        newQ[qIdx].options[optIdx].value = Number(e.target.value);
                        setConfig({...config, questions: newQ});
                      }} />
                      <button className="btn btn-secondary" style={{padding:'8px', width:'100%', height:'100%'}} onClick={() => {
                        const newQ = [...config.questions];
                        newQ[qIdx].options.splice(optIdx, 1);
                        setConfig({...config, questions: newQ});
                      }}><Trash2 size={16} color="#DC2626"/></button>
                    </div>
                  ))}
                  <button className="btn btn-secondary" style={{width:'100%', marginTop:8, fontSize:'12px'}} onClick={() => {
                    const newQ = [...config.questions];
                    newQ[qIdx].options.push({ label: 'New Option', value: 5 });
                    setConfig({...config, questions: newQ});
                  }}><Plus size={14}/> Add Choice</button>
                </div>
              ))}

              <div style={{ padding: '24px 0', marginTop: '16px', borderTop: '2px dashed #D1D5DB' }}>
                <button 
                  className="btn btn-primary" 
                  style={{width:'100%', justifyContent: 'center', padding: '16px', fontSize: '15px', fontWeight: 'bold', backgroundColor: '#10B981', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}} 
                  onClick={() => {
                    const newQ = [...config.questions];
                    newQ.push({
                        id: "q" + Date.now(),
                        section: "New Category",
                        question: "Enter your new question here...",
                        options: [
                            { label: "Option 1", value: 0 },
                            { label: "Option 2", value: 5 },
                            { label: "Option 3", value: 10 }
                        ]
                    });
                    setConfig({...config, questions: newQ});
                    setTimeout(() => {
                      const contentArea = document.querySelector('.builder-content');
                      if (contentArea) contentArea.scrollTop = contentArea.scrollHeight;
                    }, 100);
                }}>
                  <Plus size={20} style={{marginRight: 8}}/> + ADD NEW QUESTION
                </button>
              </div>

              {/* Score Tiers & Risk Categories Editor */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={18} color="#1D4ED8" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Score Tiers &amp; Result Logic
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    0–100 Scale
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Customize the score ranges, tone badges, card titles, and description for each outcome level to fit any quiz topic.
                </p>

                {(Array.isArray(config.results) ? config.results : []).map((tier, tIdx) => (
                  <div key={tIdx} className="q-card" style={{ borderLeft: `4px solid ${tier.color || '#3B82F6'}`, background: '#FFFFFF', marginBottom: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937' }}>
                        Tier {tIdx + 1}: Score ≤ {tier.maxScore}
                      </span>
                      {config.results.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newResults = config.results.filter((_, idx) => idx !== tIdx);
                            setConfig({ ...config, results: newResults });
                          }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', padding: '2px' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Tone Badge</label>
                        <input
                          value={tier.tone || ''}
                          placeholder="e.g. Critical Gap"
                          onChange={e => {
                            const newResults = [...config.results];
                            newResults[tIdx].tone = e.target.value;
                            setConfig({ ...config, results: newResults });
                          }}
                          style={{ margin: 0, padding: '7px 9px', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Max Score</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={tier.maxScore ?? 100}
                          onChange={e => {
                            const newResults = [...config.results];
                            newResults[tIdx].maxScore = Number(e.target.value);
                            setConfig({ ...config, results: newResults });
                          }}
                          style={{ margin: 0, padding: '7px 9px', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Card Bg</label>
                        <input
                          type="color"
                          value={tier.color?.startsWith('#') ? tier.color : '#FCE8E6'}
                          onChange={e => {
                            const newResults = [...config.results];
                            newResults[tIdx].color = e.target.value;
                            setConfig({ ...config, results: newResults });
                          }}
                          style={{ margin: 0, padding: '2px', height: '34px', width: '100%', cursor: 'pointer' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Headline Title</label>
                      <input
                        value={tier.title || ''}
                        placeholder="e.g. Workplace at Risk"
                        onChange={e => {
                          const newResults = [...config.results];
                          newResults[tIdx].title = e.target.value;
                          setConfig({ ...config, results: newResults });
                        }}
                        style={{ margin: 0, padding: '7px 9px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Description / Assessment</label>
                      <textarea
                        value={tier.desc || ''}
                        placeholder="Enter the diagnosis summary for this score range..."
                        rows={2}
                        onChange={e => {
                          const newResults = [...config.results];
                          newResults[tIdx].desc = e.target.value;
                          setConfig({ ...config, results: newResults });
                        }}
                        style={{ margin: 0, padding: '7px 9px', fontSize: '12px', minHeight: '52px' }}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '6px', fontSize: '12px', padding: '10px', justifyContent: 'center' }}
                  onClick={() => {
                    const list = Array.isArray(config.results) ? [...config.results] : [];
                    const lastMax = list.length > 0 ? list[list.length - 1].maxScore : 50;
                    list.push({
                      maxScore: Math.min(100, lastMax + 20),
                      title: 'New Score Tier',
                      tone: 'Opportunity',
                      color: '#E8F0FE',
                      desc: 'Describe what this score range means for your quiz topic...',
                      cta: 'Learn More'
                    });
                    setConfig({ ...config, results: list });
                  }}
                >
                  <Plus size={14} /> Add Score Tier
                </button>
              </div>
            </>
          )}

          {activeTab === 'form' && (
            <div>
              {/* Studio: Lead Form Studio */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} color="#1A73E8" /> Lead Form Studio
                  </span>
                  <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    Diagnostic Gate &amp; Intake
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Choose your lead capture mechanism at the diagnostic gate: use the built-in native form (syncs with your Webhook / Google Sheets) or embed your official HubSpot Form to sync leads directly to HubSpot CRM.
                </p>

                {/* Form Provider Selector */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#334155', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Form Provider / Engine
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        leadCapture: {
                          ...prev.leadCapture,
                          formType: 'native'
                        }
                      }))}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: (config.leadCapture?.formType !== 'hubspot') ? '2px solid #1A73E8' : '1px solid #D1D5DB',
                        background: (config.leadCapture?.formType !== 'hubspot') ? '#EFF6FF' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: (config.leadCapture?.formType !== 'hubspot') ? '#1E40AF' : '#1F2937' }}>
                          ⚡ Native Form
                        </span>
                        {config.leadCapture?.formType !== 'hubspot' && <CheckCircle2 size={16} color="#1A73E8" />}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', lineHeight: 1.3 }}>
                        Built-in customizable gate. Fast, responsive, and syncs to Google Sheets webhook.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        leadCapture: {
                          ...prev.leadCapture,
                          formType: 'hubspot'
                        }
                      }))}
                      style={{
                        position: 'relative',
                        padding: '12px',
                        borderRadius: '6px',
                        border: (config.leadCapture?.formType === 'hubspot') ? '2px solid #EA580C' : '1px solid #D1D5DB',
                        background: (config.leadCapture?.formType === 'hubspot') ? '#FFF7ED' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid #FCD34D',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        lineHeight: '1.2'
                      }}>BETA</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', paddingRight: '42px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: (config.leadCapture?.formType === 'hubspot') ? '#C2410C' : '#1F2937' }}>
                          🧡 HubSpot Embed Form
                        </span>
                        {config.leadCapture?.formType === 'hubspot' && <CheckCircle2 size={16} color="#EA580C" />}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', lineHeight: 1.3 }}>
                        Embed your official HubSpot Form directly. Auto-syncs leads to HubSpot CRM.
                      </span>
                    </button>
                  </div>
                </div>

                {/* HubSpot Form Configuration Panel */}
                {config.leadCapture?.formType === 'hubspot' && (
                  <div style={{ background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        HubSpot Embed Configuration
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#7C2D12', margin: '0 0 14px', lineHeight: 1.4 }}>
                      Enter your HubSpot <strong>Portal ID</strong> (Hub ID) and <strong>Form ID</strong> (GUID), or paste your HubSpot embed code snippet below. When respondents submit this form, they will automatically unlock their score &amp; report.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Embed snippet parser helper */}
                      <div style={{ background: 'white', border: '1px dashed #FB923C', borderRadius: '6px', padding: '10px 12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9A3412', marginBottom: '6px' }}>
                          Quick Paste Embed Code (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder={`hbspt.forms.create({ portalId: "12345678", formId: "abcdef-..." });`}
                          onChange={e => {
                            const val = e.target.value;
                            if (!val) return;
                            const portalMatch = val.match(/portalId[:=]\s*["']?(\d+)["']?/i);
                            const formMatch = val.match(/formId[:=]\s*["']?([a-zA-Z0-9_-]+)["']?/i);
                            const regionMatch = val.match(/region[:=]\s*["']?([a-zA-Z0-9_-]+)["']?/i);
                            if (portalMatch || formMatch) {
                              setConfig(prev => ({
                                ...prev,
                                leadCapture: {
                                  ...prev.leadCapture,
                                  hubspot: {
                                    portalId: portalMatch ? portalMatch[1] : (prev.leadCapture?.hubspot?.portalId || ''),
                                    formId: formMatch ? formMatch[1] : (prev.leadCapture?.hubspot?.formId || ''),
                                    region: regionMatch ? regionMatch[1] : (prev.leadCapture?.hubspot?.region || 'na1')
                                  }
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '12px',
                            border: '1px solid #FED7AA',
                            borderRadius: '4px',
                            backgroundColor: '#FFFCFA',
                            color: '#1F2937'
                          }}
                        />
                        <span style={{ fontSize: '10.5px', color: '#9A3412', marginTop: '4px', display: 'block' }}>
                          Paste your HubSpot snippet and we will automatically extract Portal ID &amp; Form ID.
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            HubSpot Portal ID (Hub ID) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 12345678"
                            value={config.leadCapture?.hubspot?.portalId || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                leadCapture: {
                                  ...prev.leadCapture,
                                  hubspot: {
                                    ...(prev.leadCapture?.hubspot || {}),
                                    portalId: val
                                  }
                                }
                              }));
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #D1D5DB',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            HubSpot Form ID (GUID) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 3b7c89f1-4567-4890-..."
                            value={config.leadCapture?.hubspot?.formId || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                leadCapture: {
                                  ...prev.leadCapture,
                                  hubspot: {
                                    ...(prev.leadCapture?.hubspot || {}),
                                    formId: val
                                  }
                                }
                              }));
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #D1D5DB',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                          HubSpot Region (Optional)
                        </label>
                        <select
                          value={config.leadCapture?.hubspot?.region || 'na1'}
                          onChange={e => {
                            const val = e.target.value;
                            setConfig(prev => ({
                              ...prev,
                              leadCapture: {
                                ...prev.leadCapture,
                                hubspot: {
                                  ...(prev.leadCapture?.hubspot || {}),
                                  region: val
                                }
                              }
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            fontSize: '13px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="na1">North America (na1 - default)</option>
                          <option value="eu1">Europe (eu1)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* If Native Form is chosen, render Native Form Studio */}
                {config.leadCapture?.formType !== 'hubspot' && (
                  <>
                {/* Require Work Email Toggle */}
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>Block Free / Disposable Email Domains</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Forces corporate domains (gmail, yahoo, hotmail, etc. rejected)</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={config.leadCapture?.requireWorkEmail !== false}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      leadCapture: {
                        ...prev.leadCapture,
                        requireWorkEmail: e.target.checked
                      }
                    }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1A73E8' }}
                  />
                </div>

                {/* Standard Primary Contact Fields */}
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#4B5563', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Standard Contact Fields
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { key: 'name', label: 'Full Name', defaultReq: true },
                    { key: 'email', label: 'Work Email', defaultReq: true },
                    { key: 'company', label: 'Company / Organization', defaultReq: true },
                    { key: 'role', label: 'Job Title / Role', defaultReq: false },
                    { key: 'phone', label: 'Direct Phone', defaultReq: false },
                    { key: 'projectStatus', label: 'Project Status / Timeline', defaultReq: true }
                  ].map(f => {
                    const fieldData = config.leadCapture?.fields?.[f.key] || { label: f.label, enabled: true, required: f.defaultReq };
                    return (
                      <div key={f.key} style={{ background: fieldData.enabled !== false ? '#FFFFFF' : '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: fieldData.enabled !== false ? 1 : 0.6 }}>
                        <div style={{ flex: 1, marginRight: '12px' }}>
                          <input
                            type="text"
                            value={fieldData.label || f.label}
                            onChange={e => {
                              const newLabel = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                leadCapture: {
                                  ...prev.leadCapture,
                                  fields: {
                                    ...prev.leadCapture?.fields,
                                    [f.key]: {
                                      ...(prev.leadCapture?.fields?.[f.key] || {}),
                                      label: newLabel
                                    }
                                  }
                                }
                              }));
                            }}
                            style={{ width: '100%', fontSize: '13px', fontWeight: 600, border: '1px solid #D1D5DB', borderRadius: '4px', padding: '4px 8px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={fieldData.enabled !== false}
                              onChange={e => {
                                const isEn = e.target.checked;
                                setConfig(prev => ({
                                  ...prev,
                                  leadCapture: {
                                    ...prev.leadCapture,
                                    fields: {
                                      ...prev.leadCapture?.fields,
                                      [f.key]: {
                                        ...(prev.leadCapture?.fields?.[f.key] || {}),
                                        enabled: isEn
                                      }
                                    }
                                  }
                                }));
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            Show
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              disabled={fieldData.enabled === false}
                              checked={fieldData.required === true}
                              onChange={e => {
                                const isReq = e.target.checked;
                                setConfig(prev => ({
                                  ...prev,
                                  leadCapture: {
                                    ...prev.leadCapture,
                                    fields: {
                                      ...prev.leadCapture?.fields,
                                      [f.key]: {
                                        ...(prev.leadCapture?.fields?.[f.key] || {}),
                                        required: isReq
                                      }
                                    }
                                  }
                                }));
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            Required
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Lead Form Questions */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={15} color="#1A73E8" /> Custom Lead Form Questions
                    </span>
                    <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      {(config.leadCapture?.customQuestions || []).length} Custom {((config.leadCapture?.customQuestions || []).length === 1 ? 'Question' : 'Questions')}
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                    Add bespoke questions (Multiple Choice, Text, Number, Rating) to capture deep customer intent and project details on the intake gate.
                  </p>

                  {/* Custom questions list */}
                  {Array.isArray(config.leadCapture?.customQuestions) && config.leadCapture.customQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#3B82F6', color: 'white', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                            {qIdx + 1}
                          </span>
                          Question {qIdx + 1}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Reorder Buttons */}
                          {qIdx > 0 && (
                            <button
                              type="button"
                              title="Move Up"
                              onClick={() => {
                                setConfig(prev => {
                                  const list = [...(prev.leadCapture?.customQuestions || [])];
                                  const temp = list[qIdx - 1];
                                  list[qIdx - 1] = list[qIdx];
                                  list[qIdx] = temp;
                                  return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                });
                              }}
                              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              ↑
                            </button>
                          )}
                          {qIdx < config.leadCapture.customQuestions.length - 1 && (
                            <button
                              type="button"
                              title="Move Down"
                              onClick={() => {
                                setConfig(prev => {
                                  const list = [...(prev.leadCapture?.customQuestions || [])];
                                  const temp = list[qIdx + 1];
                                  list[qIdx + 1] = list[qIdx];
                                  list[qIdx] = temp;
                                  return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                });
                              }}
                              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setConfig(prev => {
                                const list = (prev.leadCapture?.customQuestions || []).filter((_, idx) => idx !== qIdx);
                                return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                              });
                            }}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', padding: '2px' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Question Title */}
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>Question Label</label>
                        <input
                          type="text"
                          value={q.label || ''}
                          placeholder="e.g. Total Workplace Square Footage or Budget Range"
                          onChange={e => {
                            const val = e.target.value;
                            setConfig(prev => {
                              const list = [...(prev.leadCapture?.customQuestions || [])];
                              list[qIdx] = { ...list[qIdx], label: val };
                              return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                            });
                          }}
                          style={{ width: '100%', fontSize: '13px', padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Format Type Selector & Required/Show Toggles */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>Question Format</label>
                          <select
                            value={q.type || 'select'}
                            onChange={e => {
                              const newType = e.target.value;
                              setConfig(prev => {
                                const list = [...(prev.leadCapture?.customQuestions || [])];
                                const defaultOpts = (newType === 'select' || newType === 'multiple_choice') && (!list[qIdx].options || list[qIdx].options.length === 0)
                                  ? ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4']
                                  : list[qIdx].options;
                                list[qIdx] = {
                                  ...list[qIdx],
                                  type: newType,
                                  options: defaultOpts,
                                  ratingMax: newType === 'rating' ? (list[qIdx].ratingMax || 5) : list[qIdx].ratingMax
                                };
                                return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                              });
                            }}
                            style={{ width: '100%', fontSize: '12px', padding: '5px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', backgroundColor: 'white' }}
                          >
                            <option value="select">Dropdown Select (A, B, C, D)</option>
                            <option value="multiple_choice">Radio Buttons (A, B, C, D)</option>
                            <option value="text">Short Text Input</option>
                            <option value="number">Number Input</option>
                            <option value="rating">Rating Scale (1–5 / 1–10)</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '18px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={q.enabled !== false}
                              onChange={e => {
                                const isEn = e.target.checked;
                                setConfig(prev => {
                                  const list = [...(prev.leadCapture?.customQuestions || [])];
                                  list[qIdx] = { ...list[qIdx], enabled: isEn };
                                  return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                });
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            Show
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={q.required === true}
                              onChange={e => {
                                const isReq = e.target.checked;
                                setConfig(prev => {
                                  const list = [...(prev.leadCapture?.customQuestions || [])];
                                  list[qIdx] = { ...list[qIdx], required: isReq };
                                  return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                });
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            Required
                          </label>
                        </div>
                      </div>

                      {/* Format-Specific Editors */}
                      {(q.type === 'select' || q.type === 'multiple_choice' || !q.type) && (
                        <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '4px', padding: '10px', marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', margin: 0 }}>Choices / Options</label>
                            <button
                              type="button"
                              onClick={() => {
                                setConfig(prev => {
                                  const list = [...(prev.leadCapture?.customQuestions || [])];
                                  const currOpts = Array.isArray(list[qIdx].options) ? [...list[qIdx].options] : [];
                                  const nextLetter = String.fromCharCode(65 + currOpts.length);
                                  currOpts.push(`${nextLetter}. Option ${currOpts.length + 1}`);
                                  list[qIdx] = { ...list[qIdx], options: currOpts };
                                  return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                });
                              }}
                              style={{ background: '#EFF6FF', border: '1px solid #93C5FD', color: '#1D4ED8', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              + Add Option
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(Array.isArray(q.options) ? q.options : ['A. Option 1', 'B. Option 2', 'C. Option 3']).map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setConfig(prev => {
                                      const list = [...(prev.leadCapture?.customQuestions || [])];
                                      const currOpts = [...(list[qIdx].options || [])];
                                      currOpts[oIdx] = val;
                                      list[qIdx] = { ...list[qIdx], options: currOpts };
                                      return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                    });
                                  }}
                                  style={{ flex: 1, fontSize: '12px', padding: '4px 8px', border: '1px solid #CBD5E1', borderRadius: '4px', background: 'white' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfig(prev => {
                                      const list = [...(prev.leadCapture?.customQuestions || [])];
                                      const currOpts = (list[qIdx].options || []).filter((_, idx) => idx !== oIdx);
                                      list[qIdx] = { ...list[qIdx], options: currOpts };
                                      return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                    });
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px 4px' }}
                                  title="Remove Option"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.type === 'rating' && (
                        <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '4px', padding: '10px', marginTop: '8px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Rating Scale Maximum</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[5, 10].map(maxVal => (
                              <button
                                key={maxVal}
                                type="button"
                                onClick={() => {
                                  setConfig(prev => {
                                    const list = [...(prev.leadCapture?.customQuestions || [])];
                                    list[qIdx] = { ...list[qIdx], ratingMax: maxVal };
                                    return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                                  });
                                }}
                                style={{
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                  fontWeight: (q.ratingMax || 5) === maxVal ? 700 : 500,
                                  background: (q.ratingMax || 5) === maxVal ? '#1D4ED8' : 'white',
                                  color: (q.ratingMax || 5) === maxVal ? 'white' : '#374151',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                1 to {maxVal} Scale
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.type === 'number' && (
                        <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '4px', padding: '10px', marginTop: '8px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Placeholder (e.g. Units or Range)</label>
                          <input
                            type="text"
                            value={q.placeholder || ''}
                            placeholder="e.g. e.g. 25,000 sq ft or 150 employees"
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => {
                                const list = [...(prev.leadCapture?.customQuestions || [])];
                                list[qIdx] = { ...list[qIdx], placeholder: val };
                                return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                              });
                            }}
                            style={{ width: '100%', fontSize: '12px', padding: '4px 8px', border: '1px solid #CBD5E1', borderRadius: '4px', background: 'white', boxSizing: 'border-box' }}
                          />
                        </div>
                      )}

                      {q.type === 'text' && (
                        <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '4px', padding: '10px', marginTop: '8px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Placeholder Text</label>
                          <input
                            type="text"
                            value={q.placeholder || ''}
                            placeholder="e.g. Enter project requirements, locations..."
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => {
                                const list = [...(prev.leadCapture?.customQuestions || [])];
                                list[qIdx] = { ...list[qIdx], placeholder: val };
                                return { ...prev, leadCapture: { ...prev.leadCapture, customQuestions: list } };
                              });
                            }}
                            style={{ width: '100%', fontSize: '12px', padding: '4px 8px', border: '1px solid #CBD5E1', borderRadius: '4px', background: 'white', boxSizing: 'border-box' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add New Custom Lead Form Question Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setConfig(prev => {
                        const list = Array.isArray(prev.leadCapture?.customQuestions) ? [...prev.leadCapture.customQuestions] : [];
                        list.push({
                          id: 'form_q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                          label: 'New Intake Question',
                          type: 'select',
                          required: false,
                          enabled: true,
                          options: [
                            'A. Less than 10,000 sq ft',
                            'B. 10,000 – 50,000 sq ft',
                            'C. 50,000 – 100,000 sq ft',
                            'D. 100,000+ sq ft'
                          ]
                        });
                        return {
                          ...prev,
                          leadCapture: {
                            ...prev.leadCapture,
                            customQuestions: list
                          }
                        };
                      });
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: '#FFFFFF',
                      border: '1.5px dashed #3B82F6',
                      borderRadius: '6px',
                      color: '#1D4ED8',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    <Plus size={16} /> + Add Custom Form Question
                  </button>
                </div>
                </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Theme & Content
                </span>
              </div>

              {/* Quiz Header & Content Fields */}
              <div className="field-group">
                <label>Builder Header Title</label>
                <input 
                  value={config.content?.builderTitle !== undefined ? config.content.builderTitle : 'Quiz Builder'} 
                  onChange={e => setConfig({...config, content: {...config.content, builderTitle: e.target.value}})} 
                  placeholder="Quiz Builder"
                />
              </div>
              <div className="field-group">
                <label>Header Eyebrow</label>
                <input value={config.content.eyebrow} onChange={e => setConfig({...config, content: {...config.content, eyebrow: e.target.value}})} />
              </div>
              <div className="field-group">
                <label>Quiz Title</label>
                <input value={config.content.title} onChange={e => setConfig({...config, content: {...config.content, title: e.target.value}})} />
              </div>
              <div className="field-group">
                <label>Description</label>
                <textarea value={config.content.description} onChange={e => setConfig({...config, content: {...config.content, description: e.target.value}})} />
              </div>

              {/* Brand Logo Upload Section */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                  <Image size={16} color="#1A73E8" /> Brand Logo
                </label>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  Upload your brand logo to display above the quiz header box and in downloadable PDF reports.
                </p>

                {config.branding?.logoUrl ? (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px', 
                      background: 'white', 
                      border: '1px solid #D1D5DB', 
                      borderRadius: '6px' 
                    }}>
                      <img 
                        src={config.branding.logoUrl} 
                        alt="Uploaded Brand Logo" 
                        style={{ maxHeight: '44px', maxWidth: '180px', objectFit: 'contain' }} 
                      />
                      <button 
                        type="button"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          branding: { ...prev.branding, logoUrl: '' }
                        }))}
                        style={{ 
                          background: '#FEE2E2', 
                          color: '#DC2626', 
                          border: '1px solid #FCA5A5', 
                          borderRadius: '6px', 
                          padding: '6px 12px', 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px' 
                        }}
                      >
                        <Trash2 size={14} /> Remove Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '12px' }}>
                    <label 
                      htmlFor="brand-logo-file-input"
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        padding: '18px', 
                        background: 'white', 
                        border: '2px dashed #9CA3AF', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        textAlign: 'center' 
                      }}
                    >
                      <Upload size={22} color="#1A73E8" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A73E8', textTransform: 'none' }}>
                        Click to upload brand logo image
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'none' }}>
                        PNG, JPG, SVG or WebP
                      </span>
                    </label>
                    <input 
                      id="brand-logo-file-input"
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}

                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Or Image URL
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/logo.png" 
                    value={config.branding?.logoUrl || ''} 
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      branding: { ...prev.branding, logoUrl: e.target.value }
                    }))} 
                    style={{ fontSize: '13px' }}
                  />
                </div>

                {/* PDF Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                  <input 
                    type="checkbox" 
                    id="showLogoInPdfToggle"
                    checked={config.branding?.showLogoInPdf !== false} 
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      branding: { ...prev.branding, showLogoInPdf: e.target.checked }
                    }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1A73E8' }}
                  />
                  <label htmlFor="showLogoInPdfToggle" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer', margin: 0, textTransform: 'none' }}>
                    Include brand logo in PDF download
                  </label>
                </div>
              </div>

              <div className="field-group">
                <label>Primary Brand Color</label>
                <input type="color" value={config.branding.primaryColor} onChange={e => setConfig({...config, branding: {...config.branding, primaryColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
              <div className="field-group">
                <label>Accent Color (Pills & Callout Highlights)</label>
                <input type="color" value={config.branding.accentColor || '#1D4ED8'} onChange={e => setConfig({...config, branding: {...config.branding, accentColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
              <div className="field-group">
                <label>Header Background Color</label>
                <input type="color" value={config.branding.headerColor} onChange={e => setConfig({...config, branding: {...config.branding, headerColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
              <div className="field-group">
                <label>Page Background Color</label>
                <input type="color" value={config.branding.bodyColor} onChange={e => setConfig({...config, branding: {...config.branding, bodyColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
            </div>

            {/* Studio: AI Persona & RAG Synthesis Directives */}
            <div style={{ marginBottom: '28px', paddingTop: '20px', borderTop: '2px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#7C3AED" /> AI Persona &amp; Synthesis Directives
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.4 }}>
                Instruct Gemini on how to tailor recommendations and strategic diagnoses for this assessment.
              </p>

              <div className="field-group">
                <label>AI Expert Role &amp; Identity</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Workplace Strategy Architect at Steelcase ARC"
                  value={config.aiPersona?.role || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    aiPersona: { ...prev.aiPersona, role: e.target.value }
                  }))}
                />
              </div>

              <div className="field-group">
                <label>Domain Focus &amp; Architectural Anchor Areas</label>
                <textarea
                  placeholder="e.g. STC 38+ acoustic enclosures, agile pods, sit-to-stand posture change..."
                  rows={3}
                  value={config.aiPersona?.focusAreas || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    aiPersona: { ...prev.aiPersona, focusAreas: e.target.value }
                  }))}
                />
              </div>

              <div className="field-group">
                <label>Diagnostic Tone &amp; Voice</label>
                <input
                  type="text"
                  placeholder="e.g. Executive, authoritative, architectural, and data-driven"
                  value={config.aiPersona?.tone || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    aiPersona: { ...prev.aiPersona, tone: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Studio: Result CTAs & Consultation Hooks */}
            <div style={{ marginBottom: '28px', paddingTop: '20px', borderTop: '2px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} color="#059669" /> Result CTA &amp; Conversion Hooks
                </span>
              </div>

              <div className="field-group">
                <label>Score Metric Display Label</label>
                <input
                  type="text"
                  placeholder="e.g. AI Readiness Score"
                  value={config.ctaConfig?.scoreLabel || 'Readiness Score'}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    ctaConfig: { ...prev.ctaConfig, scoreLabel: e.target.value }
                  }))}
                />
              </div>

              <div className="field-group">
                <label>Primary Result Button Text</label>
                <input
                  type="text"
                  placeholder="e.g. Apply for Executive Strategy Consultation"
                  value={config.ctaConfig?.primaryCtaText || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    ctaConfig: { ...prev.ctaConfig, primaryCtaText: e.target.value }
                  }))}
                />
              </div>

              <div className="field-group">
                <label>Primary Action Type</label>
                <select
                  value={config.ctaConfig?.primaryCtaType || 'in_app'}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    ctaConfig: { ...prev.ctaConfig, primaryCtaType: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
                >
                  <option value="in_app">In-App Consultation Request (Triggers Webhook &amp; Phone Capture)</option>
                  <option value="redirect">External URL Redirect (e.g. Calendly / Steelcase Contact Form)</option>
                </select>
              </div>

              {config.ctaConfig?.primaryCtaType === 'redirect' && (
                <div className="field-group">
                  <label>Redirect Target URL</label>
                  <input
                    type="url"
                    placeholder="https://www.steelcase.com/contact/consultation"
                    value={config.ctaConfig?.redirectUrl || ''}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      ctaConfig: { ...prev.ctaConfig, redirectUrl: e.target.value }
                    }))}
                  />
                </div>
              )}

              <div className="field-group">
                <label>Footer Disclaimer &amp; Benchmark Note</label>
                <input
                  type="text"
                  placeholder="Confidential diagnostic prepared by Steelcase..."
                  value={config.ctaConfig?.disclaimer || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    ctaConfig: { ...prev.ctaConfig, disclaimer: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '2px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} color={isIntegrationUnlocked ? '#059669' : '#D97706'} /> Advanced Settings
                </span>
              </div>
              {!isIntegrationUnlocked ? (
              <div style={{ padding: '24px 16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', background: '#FEF3C7', color: '#D97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '600', color: '#111827' }}>Settings &amp; Keys Locked</h3>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
                  Enter password to view and edit GitHub Publishing credentials, Webhooks, and Gemini API keys.
                </p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (integrationPasswordInput === '987321654') {
                    setIsIntegrationUnlocked(true);
                    setPasswordError(false);
                    setIntegrationPasswordInput('');
                  } else {
                    setPasswordError(true);
                  }
                }}>
                  <div className="field-group" style={{ textAlign: 'left', marginBottom: '12px' }}>
                    <label>Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter password..." 
                      value={integrationPasswordInput} 
                      onChange={e => {
                        setIntegrationPasswordInput(e.target.value);
                        setPasswordError(false);
                      }} 
                      autoFocus
                    />
                  </div>
                  {passwordError && (
                    <div style={{ color: '#DC2626', fontSize: '12px', marginBottom: '12px', textAlign: 'left', fontWeight: '500' }}>
                      Incorrect password. Please try again.
                    </div>
                  )}
                  <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                    Unlock Settings
                  </button>
                </form>
              </div>
              ) : (
                <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Unlocked
                  </span>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setIsIntegrationUnlocked(false)} 
                    style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Lock size={12} /> Lock Settings
                  </button>
                </div>
                <div className="field-group">
                  <label>Google Sheets Webhook URL</label>
                  <input placeholder="https://script.google.com/macros/s/..." value={config.integration.webhookUrl} onChange={e => setConfig({...config, integration: {...config.integration, webhookUrl: e.target.value}})} />
                  <div style={{fontSize:'12px', color:'#059669', marginTop:'6px', display:'flex', alignItems:'center', gap:'4px'}}><CheckCircle2 size={14}/> Settings automatically saved locally</div>
                </div>

                <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <FileText size={16} color="#1A73E8" /> Google Apps Script Code (Includes Date, Project Status, Request Consultation, Phone &amp; All Answers)
                  </label>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                    Copy &amp; paste this script into your Google Sheet (<strong>Extensions &gt; Apps Script</strong>) then deploy as a Web App (Execute as: <em>Me</em>, Access: <em>Anyone</em>):
                  </p>
                  <pre style={{ background: '#0F172A', color: '#F8FAFC', padding: '12px', borderRadius: '6px', fontSize: '11px', overflowX: 'auto', maxHeight: '220px', margin: '0 0 10px 0', lineHeight: '1.4' }}>{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    var action = data.action || "submit";
    var lead = data.lead || data || {};
    var answers = data.answers || {};
    var timestamp = data.timestamp || new Date().toISOString();
    var email = String(data.email || lead.email || "").trim();

    // Auto-initialize default headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      var defaultHeaders = ["Timestamp", "Name", "Email", "Company", "Title", "Project Status", "Readiness Score", "Request Consultation", "Phone"];
      var qKeys = Object.keys(answers);
      if (qKeys.length > 0) {
        qKeys.sort(function(a, b) {
          var numA = parseInt(a.replace(/\\D/g, '')) || 0;
          var numB = parseInt(b.replace(/\\D/g, '')) || 0;
          return numA - numB;
        });
        qKeys.forEach(function(k) { defaultHeaders.push(k.toUpperCase()); });
      } else {
        for (var i = 1; i <= 12; i++) { defaultHeaders.push("Q" + i); }
      }
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#F3F4F6");
    }

    // Get current sheet headers
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });

    // Helper: Ensure missing headers exist
    function ensureHeader(colName, keywords) {
      var exists = headersLower.some(function(h) {
        return keywords.some(function(kw) { return h.indexOf(kw.toLowerCase()) !== -1; });
      });
      if (!exists) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(colName).setFontWeight("bold");
        lastCol = sheet.getLastColumn();
        headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      }
    }

    // Ensure core missing columns are created dynamically
    ensureHeader("Project Status", ["project"]);
    ensureHeader("Request Consultation", ["consultation", "assessment"]);
    ensureHeader("Phone", ["phone", "telephone", "tel"]);

    // Ensure all question columns (Q1, Q2... Q11, Q12...) exist in header row
    Object.keys(answers).forEach(function(qKey) {
      var keyLower = qKey.toLowerCase().trim();
      var keyNum = keyLower.replace(/\\D/g, '');
      var exists = headersLower.some(function(h) {
        return h === keyLower || (keyNum && (h === "q" + keyNum || h.indexOf("q" + keyNum + ":") === 0 || h.indexOf("q" + keyNum + " ") === 0));
      });
      if (!exists) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(qKey.toUpperCase()).setFontWeight("bold");
        lastCol = sheet.getLastColumn();
        headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      }
    });

    if (action === "submit") {
      var newRow = [];
      for (var i = 0; i < headers.length; i++) {
        var head = headersLower[i];
        if (head.indexOf("timestamp") !== -1 || head.indexOf("date") !== -1 || head.indexOf("time") !== -1) {
          newRow.push(timestamp);
        } else if (head === "name" || head.indexOf("full name") !== -1) {
          newRow.push(lead.name || data.name || "");
        } else if (head === "email" || head.indexOf("work email") !== -1) {
          newRow.push(lead.email || data.email || "");
        } else if (head === "company" || head.indexOf("organization") !== -1) {
          newRow.push(lead.company || data.company || "");
        } else if (head === "title" || head.indexOf("role") !== -1 || head.indexOf("job title") !== -1) {
          newRow.push(lead.role || lead.title || data.role || data.title || "");
        } else if (head.indexOf("project") !== -1) {
          newRow.push(lead.projectStatus || lead.project_status || data.projectStatus || data.project_status || "");
        } else if (head.indexOf("score") !== -1 || head.indexOf("readiness") !== -1) {
          newRow.push(data.score !== undefined ? data.score : "");
        } else if (head.indexOf("consultation") !== -1 || head.indexOf("assessment") !== -1 || head.indexOf("request") !== -1) {
          newRow.push("No");
        } else if (head.indexOf("phone") !== -1 || head.indexOf("telephone") !== -1 || head === "tel") {
          newRow.push(data.tel || data.phone || "");
        } else {
          var matchedVal = "";
          Object.keys(answers).forEach(function(qKey) {
            var qLower = qKey.toLowerCase().trim();
            var qNum = qLower.replace(/\\D/g, '');
            if (head === qLower || (qNum && (head === "q" + qNum || head.indexOf("q" + qNum + ":") === 0 || head.indexOf("q" + qNum + " ") === 0))) {
              matchedVal = answers[qKey];
            }
          });
          if (matchedVal !== "") {
            newRow.push(matchedVal);
          } else if (head.indexOf("answers") !== -1 || head.indexOf("survey") !== -1) {
            newRow.push(JSON.stringify(answers));
          } else {
            newRow.push("");
          }
        }
      }
      sheet.appendRow(newRow);

    } else if (action === "update") {
      var rows = sheet.getDataRange().getValues();
      var emailColIdx = -1;
      for (var c = 0; c < headersLower.length; c++) {
        if (headersLower[c].indexOf("email") !== -1) { emailColIdx = c; break; }
      }
      if (emailColIdx === -1) emailColIdx = 2;

      var consultColIdx = -1;
      var phoneColIdx = -1;
      for (var c = 0; c < headersLower.length; c++) {
        if (headersLower[c].indexOf("consultation") !== -1 || headersLower[c].indexOf("assessment") !== -1) consultColIdx = c;
        if (headersLower[c].indexOf("phone") !== -1 || headersLower[c].indexOf("telephone") !== -1 || headersLower[c] === "tel") phoneColIdx = c;
      }

      var targetRowIndex = -1;
      if (email !== "") {
        for (var r = rows.length - 1; r >= 1; r--) {
          var rowEmail = String(rows[r][emailColIdx] || "").trim();
          if (rowEmail.toLowerCase() === email.toLowerCase()) {
            targetRowIndex = r;
            break;
          }
        }
      }

      if (targetRowIndex === -1 && rows.length > 1) {
        targetRowIndex = rows.length - 1;
      }

      if (targetRowIndex !== -1) {
        if ((data.assessmentRequested || data.consultationRequested || data.requestConsultation) && consultColIdx !== -1) {
          sheet.getRange(targetRowIndex + 1, consultColIdx + 1).setValue("Yes");
        }
        if ((data.tel || data.phone) && phoneColIdx !== -1) {
          sheet.getRange(targetRowIndex + 1, phoneColIdx + 1).setValue(data.tel || data.phone);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`}</pre>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      const code = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    var action = data.action || "submit";
    var lead = data.lead || data || {};
    var answers = data.answers || {};
    var timestamp = data.timestamp || new Date().toISOString();
    var email = String(data.email || lead.email || "").trim();

    if (sheet.getLastRow() === 0) {
      var defaultHeaders = ["Timestamp", "Name", "Email", "Company", "Title", "Project Status", "Readiness Score", "Request Consultation", "Phone"];
      var qKeys = Object.keys(answers);
      if (qKeys.length > 0) {
        qKeys.sort(function(a, b) {
          var numA = parseInt(a.replace(/\\D/g, '')) || 0;
          var numB = parseInt(b.replace(/\\D/g, '')) || 0;
          return numA - numB;
        });
        qKeys.forEach(function(k) { defaultHeaders.push(k.toUpperCase()); });
      } else {
        for (var i = 1; i <= 12; i++) { defaultHeaders.push("Q" + i); }
      }
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#F3F4F6");
    }

    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });

    function ensureHeader(colName, keywords) {
      var exists = headersLower.some(function(h) {
        return keywords.some(function(kw) { return h.indexOf(kw.toLowerCase()) !== -1; });
      });
      if (!exists) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(colName).setFontWeight("bold");
        lastCol = sheet.getLastColumn();
        headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      }
    }

    ensureHeader("Project Status", ["project"]);
    ensureHeader("Request Consultation", ["consultation", "assessment"]);
    ensureHeader("Phone", ["phone", "telephone", "tel"]);

    Object.keys(answers).forEach(function(qKey) {
      var keyLower = qKey.toLowerCase().trim();
      var keyNum = keyLower.replace(/\\D/g, '');
      var exists = headersLower.some(function(h) {
        return h === keyLower || (keyNum && (h === "q" + keyNum || h.indexOf("q" + keyNum + ":") === 0 || h.indexOf("q" + keyNum + " ") === 0));
      });
      if (!exists) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(qKey.toUpperCase()).setFontWeight("bold");
        lastCol = sheet.getLastColumn();
        headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      }
    });

    if (action === "submit") {
      var newRow = [];
      for (var i = 0; i < headers.length; i++) {
        var head = headersLower[i];
        if (head.indexOf("timestamp") !== -1 || head.indexOf("date") !== -1 || head.indexOf("time") !== -1) {
          newRow.push(timestamp);
        } else if (head === "name" || head.indexOf("full name") !== -1) {
          newRow.push(lead.name || data.name || "");
        } else if (head === "email" || head.indexOf("work email") !== -1) {
          newRow.push(lead.email || data.email || "");
        } else if (head === "company" || head.indexOf("organization") !== -1) {
          newRow.push(lead.company || data.company || "");
        } else if (head === "title" || head.indexOf("role") !== -1 || head.indexOf("job title") !== -1) {
          newRow.push(lead.role || lead.title || data.role || data.title || "");
        } else if (head.indexOf("project") !== -1) {
          newRow.push(lead.projectStatus || lead.project_status || data.projectStatus || data.project_status || "");
        } else if (head.indexOf("score") !== -1 || head.indexOf("readiness") !== -1) {
          newRow.push(data.score !== undefined ? data.score : "");
        } else if (head.indexOf("consultation") !== -1 || head.indexOf("assessment") !== -1 || head.indexOf("request") !== -1) {
          newRow.push("No");
        } else if (head.indexOf("phone") !== -1 || head.indexOf("telephone") !== -1 || head === "tel") {
          newRow.push(data.tel || data.phone || "");
        } else {
          var matchedVal = "";
          Object.keys(answers).forEach(function(qKey) {
            var qLower = qKey.toLowerCase().trim();
            var qNum = qLower.replace(/\\D/g, '');
            if (head === qLower || (qNum && (head === "q" + qNum || head.indexOf("q" + qNum + ":") === 0 || head.indexOf("q" + qNum + " ") === 0))) {
              matchedVal = answers[qKey];
            }
          });
          if (matchedVal !== "") {
            newRow.push(matchedVal);
          } else if (head.indexOf("answers") !== -1 || head.indexOf("survey") !== -1) {
            newRow.push(JSON.stringify(answers));
          } else {
            newRow.push("");
          }
        }
      }
      sheet.appendRow(newRow);

    } else if (action === "update") {
      var rows = sheet.getDataRange().getValues();
      var emailColIdx = -1;
      for (var c = 0; c < headersLower.length; c++) {
        if (headersLower[c].indexOf("email") !== -1) { emailColIdx = c; break; }
      }
      if (emailColIdx === -1) emailColIdx = 2;

      var consultColIdx = -1;
      var phoneColIdx = -1;
      for (var c = 0; c < headersLower.length; c++) {
        if (headersLower[c].indexOf("consultation") !== -1 || headersLower[c].indexOf("assessment") !== -1) consultColIdx = c;
        if (headersLower[c].indexOf("phone") !== -1 || headersLower[c].indexOf("telephone") !== -1 || headersLower[c] === "tel") phoneColIdx = c;
      }

      var targetRowIndex = -1;
      if (email !== "") {
        for (var r = rows.length - 1; r >= 1; r--) {
          var rowEmail = String(rows[r][emailColIdx] || "").trim();
          if (rowEmail.toLowerCase() === email.toLowerCase()) {
            targetRowIndex = r;
            break;
          }
        }
      }

      if (targetRowIndex === -1 && rows.length > 1) {
        targetRowIndex = rows.length - 1;
      }

      if (targetRowIndex !== -1) {
        if ((data.assessmentRequested || data.consultationRequested || data.requestConsultation) && consultColIdx !== -1) {
          sheet.getRange(targetRowIndex + 1, consultColIdx + 1).setValue("Yes");
        }
        if ((data.tel || data.phone) && phoneColIdx !== -1) {
          sheet.getRange(targetRowIndex + 1, phoneColIdx + 1).setValue(data.tel || data.phone);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
                      navigator.clipboard.writeText(code);
                      alert('Google Apps Script code copied to clipboard!');
                    }}
                  >
                    📋 Copy Google Apps Script Code
                  </button>
                </div>

                <div className="field-group" style={{ marginTop: '16px' }}>
                  <label>Gemini API Key (For Custom AI Reports)</label>
                  <input placeholder="AIzaSy..." type="password" value={config.integration.geminiApiKey} onChange={e => setConfig({...config, integration: {...config.integration, geminiApiKey: e.target.value}})} />
                  <p style={{fontSize:'12px', color:'#6B7280', marginTop:'8px'}}>Get a free key from Google AI Studio. If provided, the final report will automatically generate a custom analysis using Gemini.</p>
                </div>

                <div className="field-group" style={{ marginTop: '20px', padding: '16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: 0 }}>
                      Gemini Fallback Models Priority Sequence (Up to 5)
                    </label>
                    <span style={{ fontSize: '11px', color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                      {((config.integration.modelFallbacks && config.integration.modelFallbacks.length) || 0)} / 5 Models
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px', lineHeight: '1.4' }}>
                    Configure the model priority sequence for AI report generation. If a model encounters a rate limit (429) or demand surge, the system automatically falls back to the next model in sequence.
                  </p>



                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(config.integration.modelFallbacks || ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-pro-latest']).map((mName, idx, arr) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', boxSizing: 'border-box' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: idx === 0 ? '#1D4ED8' : '#374151', background: idx === 0 ? '#EFF6FF' : '#F3F4F6', padding: '4px 8px', borderRadius: '4px', minWidth: '85px', textAlign: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {idx === 0 ? '#1 Primary' : `#${idx + 1} Fallback`}
                        </span>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <select
                            value={availableModels.includes(mName) ? mName : 'custom'}
                            onChange={(e) => {
                              const newArr = [...arr];
                              if (e.target.value !== 'custom') {
                                newArr[idx] = e.target.value;
                                setConfig({ ...config, integration: { ...config.integration, modelFallbacks: newArr } });
                              }
                            }}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #D1D5DB', borderRadius: '4px', background: '#FFFFFF', color: '#111827', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', boxSizing: 'border-box' }}
                          >
                            {availableModels.length > 0 ? (
                              availableModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                              ))
                            ) : (
                              <>
                                <option value="gemini-3.7-flash">gemini-3.7-flash</option>
                                <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                                <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                                <option value="gemini-flash-lite-latest">gemini-flash-lite-latest</option>
                                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                                <option value="gemini-pro-latest">gemini-pro-latest</option>
                              </>
                            )}
                            {!availableModels.includes(mName) && ![
                              'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 
                              'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-pro-preview', 'gemini-pro-latest'
                            ].includes(mName) && (
                              <option value="custom">Custom: {mName}</option>
                            )}
                          </select>
                        </div>

                        <button
                          type="button"
                          disabled={arr.length <= 1}
                          onClick={() => {
                            if (arr.length <= 1) return;
                            const newArr = arr.filter((_, i) => i !== idx);
                            setConfig({ ...config, integration: { ...config.integration, modelFallbacks: newArr } });
                          }}
                          title="Delete Model"
                          style={{ padding: '6px 8px', background: arr.length <= 1 ? '#F3F4F6' : '#FFFFFF', border: '1px solid ' + (arr.length <= 1 ? '#E5E7EB' : '#FCA5A5'), borderRadius: '4px', cursor: arr.length <= 1 ? 'not-allowed' : 'pointer', color: arr.length <= 1 ? '#9CA3AF' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Model Controls */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {(config.integration.modelFallbacks || ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-pro-latest']).length < 5 && (
                        <button
                          type="button"
                          onClick={() => {
                            const cur = config.integration.modelFallbacks || ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-pro-latest'];
                            if (cur.length < 5) {
                              setConfig({
                                ...config,
                                integration: {
                                  ...config.integration,
                                  modelFallbacks: [...cur, availableModels[0] || 'gemini-3.5-flash-lite']
                                }
                              });
                            }
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Plus size={13} /> Add Standard Slot
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleScanModels}
                        disabled={isScanningModels}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 12px', borderRadius: '6px', cursor: isScanningModels ? 'not-allowed' : 'pointer', opacity: isScanningModels ? 0.7 : 1 }}
                      >
                        <RefreshCw size={13} className={isScanningModels ? 'animate-spin' : ''} /> 
                        {isScanningModels ? 'Scanning Google API...' : 'Scan & Sync Available Models'}
                      </button>
                    </div>

                    {scanError && (
                      <p style={{ fontSize: '11px', color: '#DC2626', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={11} /> Scan failed: {scanError}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={16} color="#059669" /> 1-Click GitHub Pages Publishing
                    </label>
                    <span style={{ fontSize: '11px', background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                      Live Deploy
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5, marginBottom: '14px' }}>
                    Publish your standalone hosted quiz (HQ) directly to your GitHub repository in 1 click. Zero builder controls and zero scoring formulas are exposed to respondents.
                  </p>

                  <div className="field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', color: '#374151' }}>GitHub Personal Access Token (PAT)</label>
                      <a 
                        href="https://github.com/settings/tokens/new?scopes=repo&description=QuizBuilder+Live+Publishing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        Generate Token <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type={showTokenSecret ? "text" : "password"} 
                        placeholder="ghp_xxxxxxxxxxxx" 
                        value={config.integration?.githubToken || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          setConfig(prev => ({ ...prev, integration: { ...prev.integration, githubToken: val } }));
                          localStorage.setItem('qb_github_token', val);
                        }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowTokenSecret(!showTokenSecret)} 
                        style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0 10px', cursor: 'pointer', fontSize: '11px', color: '#4B5563', whiteSpace: 'nowrap' }}
                      >
                        {showTokenSecret ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label style={{ fontSize: '11px', color: '#374151' }}>GitHub Repository (owner/repo)</label>
                    <input 
                      placeholder="e.g. ardentcentury/hosted-quiz" 
                      value={config.integration?.githubRepo || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setConfig(prev => ({ ...prev, integration: { ...prev.integration, githubRepo: val } }));
                        localStorage.setItem('qb_github_repo', val);
                      }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="field-group">
                      <label style={{ fontSize: '11px', color: '#374151' }}>Branch</label>
                      <input 
                        placeholder="main or gh-pages" 
                        value={config.integration?.githubBranch || 'main'} 
                        onChange={e => {
                          const val = e.target.value;
                          setConfig(prev => ({ ...prev, integration: { ...prev.integration, githubBranch: val } }));
                          localStorage.setItem('qb_github_branch', val);
                        }} 
                      />
                    </div>
                    <div className="field-group">
                      <label style={{ fontSize: '11px', color: '#374151' }}>Target File</label>
                      <input 
                        placeholder="index.html" 
                        value={config.integration?.githubFilePath || 'index.html'} 
                        onChange={e => setConfig(prev => ({ ...prev, integration: { ...prev.integration, githubFilePath: e.target.value } }))} 
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handlePublishToGitHub}
                    disabled={isPublishing}
                    style={{
                      width: '100%',
                      background: isPublishing ? '#9CA3AF' : '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Publishing to GitHub...
                      </>
                    ) : (
                      <>
                        <Globe size={15} /> 🚀 1-Click Publish to GitHub Pages
                      </>
                    )}
                  </button>

                  {config.integration?.lastPublishedAt && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#4B5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Last Published: {new Date(config.integration.lastPublishedAt).toLocaleTimeString()}</span>
                      {config.integration.lastPublishUrl && (
                        <a 
                          href={config.integration.lastPublishUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#059669', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                        >
                          Open Live Site <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                </>
              )}
            </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* PREVIEW AREA */}
      <div className="preview-area" style={{ '--bg-page': config.branding.bodyColor, '--primary-color': config.branding.primaryColor, '--header-bg': config.branding.headerColor, '--accent-color': config.branding.accentColor || '#1D4ED8' }}>
        {/* Preview Control Header Bar */}
        <div style={{
          background: '#0F172A',
          color: '#F8FAFC',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E293B',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="#60A5FA" />
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#F1F5F9'
            }}>
              Preview
            </span>
          </div>

          {/* Toggle Switch */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '7px',
              padding: '3px',
              gap: '3px'
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewMode('questions')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: previewMode === 'questions' ? '600' : '500',
                color: previewMode === 'questions' ? '#0F172A' : '#94A3B8',
                background: previewMode === 'questions' ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: previewMode === 'questions' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Questions
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('form')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: previewMode === 'form' ? '600' : '500',
                color: previewMode === 'form' ? '#0F172A' : '#94A3B8',
                background: previewMode === 'form' ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: previewMode === 'form' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('report')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: previewMode === 'report' ? '600' : '500',
                color: previewMode === 'report' ? '#0F172A' : '#94A3B8',
                background: previewMode === 'report' ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: previewMode === 'report' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('pdf')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: previewMode === 'pdf' ? '600' : '500',
                color: previewMode === 'pdf' ? '#0F172A' : '#94A3B8',
                background: previewMode === 'pdf' ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: previewMode === 'pdf' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              PDF
            </button>
          </div>
        </div>

        <div className="preview-scroll-body">
          {previewMode === 'pdf' ? (
            <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                padding: '10px 16px',
                borderRadius: '6px',
                marginBottom: '18px'
              }}>
                <span style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} color="#1D4ED8" /> PDF Document Preview (Exact Download Layout)
                </span>
                <button
                  type="button"
                  onClick={downloadPdfReport}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>

              <div 
                className="pdf-preview-container" 
                onClick={handleAiContentClick}
                dangerouslySetInnerHTML={{ __html: generatePdfPreviewHtml() }} 
              />
            </div>
          ) : (
            <div className="quiz-shell">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {config.branding?.logoUrl ? (
                <img 
                  src={config.branding.logoUrl} 
                  alt="Brand Logo" 
                  style={{ maxHeight: '60px', maxWidth: '280px', objectFit: 'contain' }} 
                />
              ) : <div />}
            </div>
            <div className="quiz-hero">
              <div>
                <div className="eyebrow"><BarChart2 size={14} style={{marginRight: 6}} /> {config.content.eyebrow}</div>
                <h1>{config.content.title}</h1>
                <p>{config.content.description}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'rgba(59, 130, 246, 0.25)', 
                  border: '1px solid rgba(147, 197, 253, 0.4)', 
                  color: '#93C5FD', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 10px', 
                  borderRadius: '12px',
                  letterSpacing: '0.04em',
                  fontFamily: 'SFMono-Regular, Consolas, monospace'
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 6px #60A5FA' }}></span>
                  Build v{config.buildVersion || '1.01'}
                </div>
                <div className="progress-card" style={{ width: '100%' }}>
                  <div style={{fontSize:'12px', fontWeight:600, color:'#9AA0A6', textTransform:'uppercase'}}>{isResultStep ? 'Report Generated' : 'Data Collection'}</div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                  <div style={{fontSize:'28px', color:'white', marginTop:'12px'}}>{progress}%</div>
                </div>
              </div>
            </div>

            <main className="quiz-card">
              {previewMode === 'report' && (
                <div>
                  <div className="result-grid">
                    <div className="result-top-grid">
                      <div className="result-panel" style={{backgroundColor: activeResult.color}}>
                        <div style={{fontSize:'12px', fontWeight:600, textTransform:'uppercase'}}>{activeResult.tone}</div>
                        <div className="score-display">{scoreData || 75}</div>
                        <div style={{fontSize:'12px', fontWeight:600}}>OUT OF 100</div>
                        <h2>{activeResult.title}</h2>
                        <p style={{fontSize:'14px', lineHeight:'1.6', margin: 0}}>{activeResult.desc}</p>
                      </div>

                      <div style={{padding:'24px', background:'#F8F9FA', borderRadius:'8px', border:'1px solid #DADCE0', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div style={{fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'#059669', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px'}}>
                          <CheckCircle2 size={14} color="#059669" /> Congratulations! You Qualify for an Executive Strategy Consultation
                        </div>
                        <h4 style={{margin:'0 0 8px', fontSize:'16px'}}>Professional Assessment</h4>
                        <p style={{fontSize:'13px', color:'#5F6368', margin:'0 0 16px'}}>Schedule a deep-dive session with a workplace strategy specialist.</p>
                        
                        <button 
                          className="btn btn-primary" 
                          disabled
                          style={{width: '100%', justifyContent: 'center', marginBottom: 12, opacity: 0.9, cursor: 'default'}}
                        >
                          <Mail size={16}/> Apply Now
                        </button>
                        
                        <div style={{fontSize:12, color:'#059669', display:'flex', alignItems:'center', gap:6, justifyContent:'center', marginTop:12}}>
                          <CheckCircle2 size={14}/> Qualified for Consultation
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="ai-report-box" style={{marginTop:0}}>
                        <div className="ai-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BarChart2 size={20}/> Custom AI Diagnosis
                        </div>
                        <div className="ai-content" onClick={handleAiContentClick} dangerouslySetInnerHTML={{__html: generateLayoutPreviewHtml()}} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewMode === 'questions' && isQuestionStep && (() => {
                const q = config.questions[step];
                if (!q) return null; 
                
                return (
                  <div>
                    <div className="question-head">
                      <div style={{fontSize:'12px', fontWeight:600, color:'#5F6368', textTransform:'uppercase', marginBottom:'12px'}}>Metric {step + 1} of {config.questions.length}</div>
                      <h2>{q.question}</h2>
                      <div className="section-label">{q.section}</div>
                    </div>
                    <div className="options-grid">
                      {q.options.map(opt => {
                        const selected = answers[q.id] === opt.value;
                        return (
                          <button key={opt.label} onClick={() => handleAnswer(opt.value)} className={`option-btn ${selected ? 'selected' : ''}`}>
                            <span>{opt.label}</span>
                            {selected && <CheckCircle2 size={18} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(previewMode === 'form' || (previewMode === 'questions' && isGateStep)) && (
                <div>
                  <div className="question-head">
                    <h2>Generate Your Diagnostic Report</h2>
                    <p style={{color:'#5F6368', marginTop:'8px'}}>Data collection complete. Enter your contact details and workplace project status to process your customized readiness profile.</p>
                  </div>

                  {config.leadCapture?.formType === 'hubspot' ? (
                    /* HubSpot Embed Form View in Preview */
                    <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #FED7AA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            🧡 HubSpot Embed Form Gate
                          </span>
                          <span style={{ fontSize: '11px', background: '#FFEDD5', color: '#9A3412', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            Direct CRM Sync
                          </span>
                        </div>
                        {config.leadCapture?.hubspot?.portalId && config.leadCapture?.hubspot?.formId ? (
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} /> Hub: {config.leadCapture.hubspot.portalId}
                          </span>
                        ) : null}
                      </div>

                      {(!config.leadCapture?.hubspot?.portalId || !config.leadCapture?.hubspot?.formId) ? (
                        <div style={{ padding: '24px', background: '#FFF7ED', border: '1px dashed #FB923C', borderRadius: '6px', textAlign: 'center' }}>
                          <AlertCircle size={24} color="#EA580C" style={{ margin: '0 auto 8px', display: 'block' }} />
                          <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#9A3412' }}>HubSpot Form Configuration Required</h4>
                          <p style={{ fontSize: '12px', color: '#7C2D12', margin: '0 0 12px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Please switch to the <strong>Form</strong> tab in the sidebar and enter your HubSpot <strong>Portal ID</strong> &amp; <strong>Form ID</strong> (or paste your HubSpot embed snippet).
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('form')}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px', background: '#EA580C', borderColor: '#EA580C' }}
                          >
                            Configure HubSpot Form
                          </button>
                        </div>
                      ) : (
                        <div>
                          {/* Live HubSpot Form Target Container */}
                          <div 
                            id="hubspot-preview-form-target" 
                            key={`hs-${config.leadCapture?.hubspot?.portalId}-${config.leadCapture?.hubspot?.formId}`}
                            ref={node => {
                              if (!node) return;
                              const portalId = config.leadCapture?.hubspot?.portalId;
                              const formId = config.leadCapture?.hubspot?.formId;
                              const region = config.leadCapture?.hubspot?.region || 'na1';
                              if (!portalId || !formId) return;

                              const loadHsScript = () => {
                                if (window.hbspt && window.hbspt.forms) {
                                  node.innerHTML = '';
                                  window.hbspt.forms.create({
                                    region: region,
                                    portalId: portalId,
                                    formId: formId,
                                    target: '#hubspot-preview-form-target',
                                    onFormSubmitted: function($form) {
                                      // Trigger report generation unlock
                                      if (previewMode === 'questions' && isGateStep) {
                                        submitToWebhook();
                                      } else {
                                        alert('HubSpot form submitted successfully! Leads auto-synced to HubSpot CRM.');
                                      }
                                    }
                                  });
                                } else {
                                  const existingScript = document.getElementById('hs-forms-script');
                                  if (!existingScript) {
                                    const script = document.createElement('script');
                                    script.id = 'hs-forms-script';
                                    script.src = '//js.hsforms.net/forms/embed/v2.js';
                                    script.charset = 'utf-8';
                                    script.type = 'text/javascript';
                                    script.onload = () => {
                                      if (window.hbspt && window.hbspt.forms) {
                                        node.innerHTML = '';
                                        window.hbspt.forms.create({
                                          region: region,
                                          portalId: portalId,
                                          formId: formId,
                                          target: '#hubspot-preview-form-target',
                                          onFormSubmitted: function($form) {
                                            if (previewMode === 'questions' && isGateStep) {
                                              submitToWebhook();
                                            } else {
                                              alert('HubSpot form submitted successfully! Leads auto-synced to HubSpot CRM.');
                                            }
                                          }
                                        });
                                      }
                                    };
                                    document.body.appendChild(script);
                                  } else {
                                    existingScript.addEventListener('load', () => {
                                      if (window.hbspt && window.hbspt.forms) {
                                        node.innerHTML = '';
                                        window.hbspt.forms.create({
                                          region: region,
                                          portalId: portalId,
                                          formId: formId,
                                          target: '#hubspot-preview-form-target',
                                          onFormSubmitted: function($form) {
                                            if (previewMode === 'questions' && isGateStep) {
                                              submitToWebhook();
                                            } else {
                                              alert('HubSpot form submitted successfully! Leads auto-synced to HubSpot CRM.');
                                            }
                                          }
                                        });
                                      }
                                    });
                                  }
                                }
                              };
                              loadHsScript();
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                  <>
                  <div className="form-grid">
                    {config.leadCapture?.fields?.name?.enabled !== false && (
                      <div className="form-group">
                        <label>{config.leadCapture?.fields?.name?.label || "Full Name"} {config.leadCapture?.fields?.name?.required !== false ? '*' : ''}</label>
                        <input 
                          required={config.leadCapture?.fields?.name?.required !== false} 
                          placeholder="e.g. Jane Doe"
                          value={lead.name} 
                          onChange={e=>setLead({...lead, name: e.target.value})} 
                        />
                      </div>
                    )}
                    {config.leadCapture?.fields?.email?.enabled !== false && (
                      <div className="form-group">
                        <label>{config.leadCapture?.fields?.email?.label || "Work Email"} {config.leadCapture?.fields?.email?.required !== false ? '*' : ''}</label>
                        <input 
                          type="email" 
                          required={config.leadCapture?.fields?.email?.required !== false} 
                          placeholder="name@company.com"
                          value={lead.email} 
                          onChange={e=>setLead({...lead, email: e.target.value})} 
                          style={{
                            borderColor: (config.leadCapture?.requireWorkEmail !== false && lead.email && lead.email.includes('@') && !isWorkEmail(lead.email)) ? '#EF4444' : '#DADCE0'
                          }}
                        />
                        {config.leadCapture?.requireWorkEmail !== false && lead.email && lead.email.includes('@') && !isWorkEmail(lead.email) && (
                          <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={14} /> Please enter your official work email. Personal accounts (Gmail, Yahoo, Hotmail, etc.) are not accepted.
                          </div>
                        )}
                      </div>
                    )}
                    {config.leadCapture?.fields?.company?.enabled !== false && (
                      <div className="form-group">
                        <label>{config.leadCapture?.fields?.company?.label || "Company"} {config.leadCapture?.fields?.company?.required !== false ? '*' : ''}</label>
                        <input 
                          required={config.leadCapture?.fields?.company?.required !== false}
                          placeholder="e.g. Steelcase Inc."
                          value={lead.company} 
                          onChange={e=>setLead({...lead, company: e.target.value})} 
                        />
                      </div>
                    )}
                    {config.leadCapture?.fields?.role?.enabled !== false && (
                      <div className="form-group">
                        <label>{config.leadCapture?.fields?.role?.label || "Job Title / Role"} {config.leadCapture?.fields?.role?.required ? '*' : ''}</label>
                        <input 
                          required={config.leadCapture?.fields?.role?.required === true}
                          placeholder="e.g. Director of Real Estate & Workplace"
                          value={lead.role} 
                          onChange={e=>setLead({...lead, role: e.target.value})} 
                        />
                      </div>
                    )}
                    {config.leadCapture?.fields?.phone?.enabled === true && (
                      <div className="form-group">
                        <label>{config.leadCapture?.fields?.phone?.label || "Direct Phone"} {config.leadCapture?.fields?.phone?.required ? '*' : ''}</label>
                        <input 
                          type="tel"
                          required={config.leadCapture?.fields?.phone?.required === true}
                          placeholder="+1 (555) 000-0000"
                          value={lead.phone || ''} 
                          onChange={e=>setLead({...lead, phone: e.target.value})} 
                        />
                      </div>
                    )}
                    {config.leadCapture?.fields?.projectStatus?.enabled !== false && (
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#202124', marginBottom: '8px' }}>
                          {config.leadCapture?.fields?.projectStatus?.label || "What best describes your current workplace project status?"} {config.leadCapture?.fields?.projectStatus?.required !== false ? '*' : ''}
                        </label>
                        <select 
                          required={config.leadCapture?.fields?.projectStatus?.required !== false}
                          value={lead.projectStatus} 
                          onChange={e=>setLead({...lead, projectStatus: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            border: '1px solid #DADCE0',
                            borderRadius: '4px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            color: lead.projectStatus ? '#111827' : '#6B7280',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="" disabled>-- Select project status --</option>
                          <option value="A - Active project, decisions within 6 months">A - Active project, decisions within 6 months</option>
                          <option value="B - Exploring a project, 6-12 months">B - Exploring a project, 6-12 months</option>
                          <option value="C - Future project, no timeline yet">C - Future project, no timeline yet</option>
                          <option value="D - Researching workplace trends and best practices">D - Researching workplace trends and best practices</option>
                          <option value="E - We are Dealer / Architect / Designer / Industry Partner">E - We are Dealer / Architect / Designer / Industry Partner</option>
                        </select>
                      </div>
                    )}

                    {/* Dynamic Custom Questions in Form */}
                    {Array.isArray(config.leadCapture?.customQuestions) && config.leadCapture.customQuestions.map((cq) => {
                      if (cq.enabled === false) return null;
                      const qId = cq.id;
                      const currentVal = lead.customAnswers?.[qId] ?? '';
                      const setCustomAnswer = (val) => {
                        setLead(prev => ({
                          ...prev,
                          customAnswers: {
                            ...(prev.customAnswers || {}),
                            [qId]: val
                          }
                        }));
                      };

                      return (
                        <div key={qId} className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#202124', marginBottom: '8px' }}>
                            {cq.label || 'Intake Question'} {cq.required ? '*' : ''}
                          </label>

                          {/* Multiple Choice / Dropdown Format */}
                          {(cq.type === 'select' || !cq.type) && (
                            <select
                              required={cq.required}
                              value={currentVal}
                              onChange={e => setCustomAnswer(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '11px 14px',
                                border: '1px solid #DADCE0',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                color: currentVal ? '#111827' : '#6B7280',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="" disabled>-- Select an option --</option>
                              {(Array.isArray(cq.options) ? cq.options : []).map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {/* Radio Multiple Choice Format */}
                          {cq.type === 'multiple_choice' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {(Array.isArray(cq.options) ? cq.options : []).map((opt, idx) => (
                                <label 
                                  key={idx} 
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    color: '#374151',
                                    background: currentVal === opt ? '#EFF6FF' : '#F9FAFB',
                                    border: currentVal === opt ? '1.5px solid #3B82F6' : '1px solid #E5E7EB',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`custom_q_${qId}`}
                                    value={opt}
                                    checked={currentVal === opt}
                                    onChange={() => setCustomAnswer(opt)}
                                    style={{ accentColor: '#1D4ED8', cursor: 'pointer' }}
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Short Text Input */}
                          {cq.type === 'text' && (
                            <input
                              type="text"
                              required={cq.required}
                              placeholder={cq.placeholder || "Enter answer..."}
                              value={currentVal}
                              onChange={e => setCustomAnswer(e.target.value)}
                            />
                          )}

                          {/* Number Input */}
                          {cq.type === 'number' && (
                            <input
                              type="number"
                              required={cq.required}
                              placeholder={cq.placeholder || "0"}
                              value={currentVal}
                              onChange={e => setCustomAnswer(e.target.value)}
                            />
                          )}

                          {/* Rating Scale */}
                          {cq.type === 'rating' && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {Array.from({ length: cq.ratingMax || 5 }, (_, idx) => idx + 1).map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setCustomAnswer(num)}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '6px',
                                    border: currentVal === num ? '2px solid #1D4ED8' : '1px solid #D1D5DB',
                                    background: currentVal === num ? '#1D4ED8' : 'white',
                                    color: currentVal === num ? 'white' : '#374151',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{fontSize:'12px', color:'#5F6368', display:'flex', alignItems:'center', gap:'6px'}}>
                    <Lock size={12}/> {config.leadCapture?.requireWorkEmail !== false ? "Data securely processed. Official work email required." : "Data securely processed."}
                  </div>
                  </>
                  )}

                  {previewMode === 'form' && config.leadCapture?.formType !== 'hubspot' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!isLeadValid()}
                        onClick={() => {
                          alert('Form inputs are valid and ready for gate submission!');
                        }}
                        style={{
                          opacity: !isLeadValid() ? 0.6 : 1,
                          cursor: !isLeadValid() ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <CheckCircle2 size={16} /> Test Submit Form
                      </button>
                    </div>
                  )}
                </div>
              )}

              {previewMode === 'questions' && isResultStep && (
                <div className="result-grid">
                  <div className="result-top-grid">
                    <div className="result-panel" style={{backgroundColor: activeResult.color}}>
                      <div style={{fontSize:'12px', fontWeight:600, textTransform:'uppercase'}}>{activeResult.tone}</div>
                      <div className="score-display">{scoreData}</div>
                      <div style={{fontSize:'12px', fontWeight:600}}>{config.ctaConfig?.scoreLabel ? config.ctaConfig.scoreLabel.toUpperCase() : "OUT OF 100"}</div>
                      <h2>{activeResult.title}</h2>
                      <p style={{fontSize:'14px', lineHeight:'1.6', margin: 0}}>{activeResult.desc}</p>
                    </div>

                    <div style={{padding:'24px', background:'#F8F9FA', borderRadius:'8px', border:'1px solid #DADCE0', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <div style={{fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'#059669', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px'}}>
                        <CheckCircle2 size={14} color="#059669" /> Congratulations! You Qualify for an Executive Strategy Consultation
                      </div>
                      <h4 style={{margin:'0 0 8px', fontSize:'16px'}}>Professional Assessment</h4>
                      <p style={{fontSize:'13px', color:'#5F6368', margin:'0 0 16px'}}>Schedule a deep-dive session with a workplace strategy specialist.</p>
                      
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (config.ctaConfig?.primaryCtaType === 'redirect' && config.ctaConfig?.redirectUrl) {
                            window.open(config.ctaConfig.redirectUrl, '_blank');
                          } else {
                            requestAssessment();
                          }
                        }}
                        disabled={applied && config.ctaConfig?.primaryCtaType !== 'redirect'}
                        style={{width: '100%', justifyContent: 'center', marginBottom: 12, backgroundColor: applied ? '#9CA3AF' : 'var(--primary-color)'}}
                      >
                        <Mail size={16}/> {applied ? "Request Sent" : (config.ctaConfig?.primaryCtaText || "Apply Now")}
                      </button>
                      
                      {applied && !telSent && config.ctaConfig?.secondaryCtaEnabled !== false && (
                        <div style={{background:'white', padding:16, border:'1px solid #E5E7EB', borderRadius:6, marginTop:12}}>
                          <label style={{fontSize:12, fontWeight:600, display:'block', marginBottom:8}}>{config.ctaConfig?.secondaryCtaText || "Add Telephone (Optional)"}</label>
                          <div style={{display:'flex', gap:8}}>
                            <input type="tel" placeholder="+1..." value={tel} onChange={e=>setTel(e.target.value)} style={{flex:1, padding:'8px 12px', border:'1px solid #D1D5DB', borderRadius:4}} />
                            <button onClick={submitTel} className="btn btn-secondary" style={{padding:'8px 12px'}}>Send</button>
                          </div>
                        </div>
                      )}
                      {telSent && (
                        <div style={{fontSize:13, color:'#059669', display:'flex', alignItems:'center', gap:6, marginTop:8}}><CheckCircle2 size={14}/> Phone saved</div>
                      )}
                      
                      <div style={{fontSize:12, color:'#059669', display:'flex', alignItems:'center', gap:6, justifyContent:'center', marginTop:12}}>
                        <CheckCircle2 size={14}/> Qualified for Consultation
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="ai-report-box" style={{marginTop:0}}>
                      <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BarChart2 size={20}/> Custom AI Diagnosis
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {aiThinkingLogs.length > 0 && !isGeneratingAI && (
                            <button
                              type="button"
                              onClick={() => setShowDiagnosticLogs(!showDiagnosticLogs)}
                              style={{
                                fontSize: '11px',
                                padding: '5px 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: showDiagnosticLogs ? '#EFF6FF' : '#F9FAFB',
                                border: '1px solid ' + (showDiagnosticLogs ? '#3B82F6' : '#D1D5DB'),
                                color: showDiagnosticLogs ? '#1D4ED8' : '#4B5563',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              <Activity size={13} /> {showDiagnosticLogs ? 'Hide Logs' : 'View AI Diagnostics'}
                            </button>
                          )}
                          <button 
                            className="btn btn-secondary" 
                            onClick={downloadPdfReport} 
                            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', borderColor: '#BFDBFE', color: '#1D4ED8', cursor: 'pointer' }}
                          >
                            <FileText size={14} /> Download PDF Report
                          </button>
                        </div>
                      </div>

                      {/* Completed Telemetry Bar & Expandable Logs */}
                      {!isGeneratingAI && showDiagnosticLogs && (
                        <div style={{ margin: '12px 0 16px 0', padding: '14px', background: '#0F172A', borderRadius: '8px', color: '#E2E8F0', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: '11.5px', border: '1px solid #1E293B' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 700, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }}></span>
                              Live Execution Telemetry & Model Verification
                            </span>
                            {lastTelemetryData && (
                              <span style={{ fontSize: '10px', color: '#94A3B8', background: '#1E293B', padding: '2px 8px', borderRadius: '4px' }}>
                                Model: <strong style={{ color: '#FCD34D' }}>{lastTelemetryData.modelUsed}</strong> | Latency: <strong style={{ color: '#4ADE80' }}>{lastTelemetryData.latencyMs}ms</strong>
                              </span>
                            )}
                          </div>

                          <div style={{ maxHeight: '180px', overflowY: 'auto', lineHeight: '1.6' }}>
                            {aiThinkingLogs.map((log, lIdx) => {
                              const isError = log.includes('429') || log.includes('WARN') || log.includes('QUOTA') || log.includes('EXHAUSTION');
                              const isSuccess = log.includes('SUCCESS');
                              return (
                                <div key={lIdx} style={{ 
                                  color: isError ? '#F87171' : isSuccess ? '#4ADE80' : '#CBD5E1',
                                  fontWeight: isError ? 600 : 400,
                                  marginBottom: '3px'
                                }}>
                                  {log}
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(aiThinkingLogs.join('\n'));
                                alert('Diagnostic logs copied to clipboard.');
                              }}
                              style={{ background: '#1E293B', border: '1px solid #475569', color: '#94A3B8', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                            >
                              Copy Full Telemetry Log
                            </button>
                          </div>
                        </div>
                      )}
                      {isGeneratingAI ? (
                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '10px', border: '1.5px solid #DBEAFE', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="spinner" style={{ width: 24, height: 24, border: '3px solid #BFDBFE', borderTopColor: '#1D4ED8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1E3A8A' }}>
                                  AI Diagnostic Engine Running
                                </h4>
                                <span style={{ fontSize: '12px', color: '#64748B' }}>
                                  Conducting web research, benchmarking parameters, and drafting report...
                                </span>
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: '12px' }}>
                              Step {Math.min(thinkingStepIndex + 1, thinkingSteps.length)} of {thinkingSteps.length}
                            </span>
                          </div>

                          {/* AI Execution & Quota Thinking Console Box */}
                          <div style={{
                            background: '#0F172A',
                            color: '#E2E8F0',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '16px',
                            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                            fontSize: '11.5px',
                            lineHeight: '1.6',
                            border: '1px solid #1E293B',
                            maxHeight: '130px',
                            overflowY: 'auto',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #1E293B', paddingBottom: '6px', color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }}></span>
                                AI Thinking & System Quota Diagnostics
                              </span>
                              <span style={{ background: '#1E293B', padding: '1px 6px', borderRadius: '4px', color: '#38BDF8', fontSize: '9px' }}>Live Log</span>
                            </div>
                            {aiThinkingLogs.length === 0 ? (
                              <div style={{ color: '#64748B', fontStyle: 'italic' }}>[System] Connecting to AI analysis engine...</div>
                            ) : (
                              aiThinkingLogs.map((log, lIdx) => {
                                const isError = log.includes('429') || log.includes('WARN') || log.includes('QUOTA') || log.includes('EXHAUSTION');
                                const isSuccess = log.includes('SUCCESS');
                                return (
                                  <div key={lIdx} style={{ 
                                    color: isError ? '#F87171' : isSuccess ? '#4ADE80' : '#CBD5E1',
                                    fontWeight: isError ? 600 : 400,
                                    wordBreak: 'break-word',
                                    marginBottom: '3px'
                                  }}>
                                    {log}
                                  </div>
                                );
                              })
                            )}
                            <div ref={thinkingLogEndRef} />
                          </div>

                          {/* Pulsing Progress Bar */}
                          <div style={{ background: '#E2E8F0', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '18px' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${thinkingProgress}%`, 
                                background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)', 
                                borderRadius: '3px',
                                transition: 'width 0.4s ease-out'
                              }} 
                            />
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {thinkingSteps.map((stepText, idx) => {
                              const isPast = idx < thinkingStepIndex;
                              const isCurrent = idx === thinkingStepIndex;
                              return (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '12px', 
                                  fontSize: '13px', 
                                  color: isCurrent ? '#1D4ED8' : isPast ? '#059669' : '#94A3B8',
                                  fontWeight: isCurrent ? 600 : 400,
                                  transition: 'all 0.3s ease',
                                  padding: '10px 14px',
                                  background: isCurrent ? '#EFF6FF' : isPast ? '#F0FDF4' : '#FFFFFF',
                                  borderRadius: '6px',
                                  border: isCurrent ? '1px solid #BFDBFE' : isPast ? '1px solid #BBF7D0' : '1px solid #F1F5F9'
                                }}>
                                  {isPast ? (
                                    <CheckCircle2 size={18} color="#059669" />
                                  ) : isCurrent ? (
                                    <div className="spinner" style={{ width: 16, height: 16, border: '2.5px solid #93C5FD', borderTopColor: '#1D4ED8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                  ) : (
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #CBD5E1' }}></div>
                                  )}
                                  <span>{stepText}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="ai-content" onClick={handleAiContentClick} dangerouslySetInnerHTML={{__html: aiReport || generateLayoutPreviewHtml()}} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Repaired Bottom Navigation */}
              {previewMode === 'questions' && (
                <div className="nav-row">
                  <button className="btn btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || isResultStep || isSubmitting || isGeneratingAI}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  
                  {isGateStep && (
                    <button 
                      className="btn btn-primary" 
                      onClick={submitToWebhook} 
                      disabled={!canProceed || isSubmitting || isGeneratingAI}
                      style={{
                        opacity: (!canProceed || isSubmitting || isGeneratingAI) ? 0.7 : 1,
                        cursor: (!canProceed || isSubmitting || isGeneratingAI) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {(isSubmitting || isGeneratingAI) ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <div className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                          Analyzing & Generating Report...
                        </span>
                      ) : (
                        <>
                          Generate Report <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Repaired Reset Button Layout */}
              {previewMode === 'questions' && isResultStep && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={resetQuiz}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: 'color 0.2s' }}
                  >
                    <RefreshCw size={14} /> Retake Assessment
                  </button>
                </div>
              )}
            </main>
          </div>
          )}
        </div>
      </div>
      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, borderBottom:'1px solid #E5E7EB', paddingBottom:12}}>
              <h3 style={{margin:0, fontSize:18, fontWeight:600, display:'flex', alignItems:'center', gap:8, color:'#111827'}}>
                <Download size={20} color="#1A73E8"/> Export Standalone Quiz Package
              </h3>
              <button onClick={() => setShowExportModal(false)} style={{background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6B7280'}}>✕</button>
            </div>
            
            <p style={{fontSize:14, color:'#4B5563', marginTop:0, marginBottom:16, lineHeight:1.5}}>
              Export <strong>JUST the functional quiz</strong> (without the builder sidebar) ready to host on GitHub Pages or any web server for visitors!
            </p>

            {/* HIGH PRIORITY ZIP PACKAGE CARD */}
            <div style={{ background: '#F0F7FF', border: '2px solid #3B82F6', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📦 Complete GitHub Pages Repository Package (.zip)
                  </strong>
                  <span style={{ fontSize: '13px', color: '#334155', display: 'block', marginTop: '4px' }}>
                    Includes <code>index.html</code> (standalone quiz), <code>README.md</code> (setup instructions), <code>quiz-config.json</code>, and <code>lead-payload-schema.json</code>.
                  </span>
                </div>
                <button className="btn btn-primary" onClick={exportZipPackage} style={{ fontSize: '14px', padding: '10px 18px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0, backgroundColor: '#1D4ED8' }}>
                  <Download size={16}/> Download ZIP
                </button>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px', letterSpacing: '0.05em' }}>
              Or Download Individual Files:
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>index.html (Standalone Quiz App)</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>Complete single-file interactive quiz web app. Zero builder UI — pure quiz experience for visitors!</span>
              </div>
              <button className="btn btn-secondary" onClick={exportStandaloneHtml} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download HTML</button>
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>README.md (GitHub Setup Guide)</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>Step-by-step instructions on publishing your quiz to GitHub Pages in 2 minutes.</span>
              </div>
              <button className="btn btn-secondary" onClick={exportReadme} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download Guide</button>
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>quiz-config.json</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>JSON quiz config schema, branding, questions, and webhook settings.</span>
              </div>
              <button className="btn btn-secondary" onClick={exportJson} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download JSON</button>
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>lead-payload-schema.json</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>Webhook payload schema sent to Google Sheets / Zapier.</span>
              </div>
              <button className="btn btn-secondary" onClick={exportPayloadSchema} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download Schema</button>
            </div>

            <div style={{marginTop:20, textAlign:'right'}}>
              <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK GITHUB PUBLISH STATUS MODAL */}
      {showPublishModal && (
        <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #E5E7EB', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }}>
                <Globe size={18} color="#059669" /> Publish to GitHub Pages
              </h3>
              <button onClick={() => setShowPublishModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            {isPublishing && (
              <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                <RefreshCw size={36} color="#059669" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Publishing Live Quiz...</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                  Bundling clean Hosted Quiz and committing directly to your GitHub repository.
                </p>
              </div>
            )}

            {!isPublishing && publishStatus?.success && (
              <div>
                <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Check size={26} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '600', color: '#065F46' }}>
                    {publishStatus.message}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4B5563', lineHeight: '1.5' }}>
                    Your clean, standalone Hosted Quiz (HQ) has been pushed to GitHub.
                  </p>
                </div>

                {publishStatus.pagesUrl && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Live GitHub Pages URL
                    </div>
                    <a 
                      href={publishStatus.pagesUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: '13px', color: '#059669', fontWeight: '600', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      {publishStatus.pagesUrl} <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#6B7280', background: '#F9FAFB', padding: '10px 12px', borderRadius: '6px', marginBottom: '18px', lineHeight: 1.4 }}>
                  ℹ️ <strong>GitHub Note:</strong> GitHub Pages typically updates within 30-60 seconds. If your latest edits don't appear right away, perform a hard refresh (<code>Ctrl+Shift+R</code> or <code>Cmd+Shift+R</code>).
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  {publishStatus.commitUrl && (
                    <a 
                      href={publishStatus.commitUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      View Commit ↗
                    </a>
                  )}
                  {publishStatus.pagesUrl && (
                    publishCountdown > 0 ? (
                      <button
                        disabled
                        className="btn"
                        style={{
                          background: '#E2E8F0',
                          color: '#475569',
                          borderColor: '#CBD5E1',
                          cursor: 'not-allowed',
                          fontSize: '12px',
                          padding: '8px 16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          fontWeight: '600'
                        }}
                      >
                        <div className="spinner" style={{ width: 13, height: 13, border: '2px solid #CBD5E1', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        {publishCountdown > 45 
                          ? `Publishing: Committing files (${publishCountdown}s)...` 
                          : publishCountdown > 25 
                          ? `Publishing: GitHub Actions building (${publishCountdown}s)...` 
                          : publishCountdown > 10 
                          ? `Publishing: Deploying to Pages CDN (${publishCountdown}s)...` 
                          : `Publishing: Finalizing live URL (${publishCountdown}s)...`}
                      </button>
                    ) : (
                      <a 
                        href={publishStatus.pagesUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary"
                        style={{ background: '#059669', fontSize: '12px', padding: '8px 16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <ExternalLink size={13} /> Open Live Site
                      </a>
                    )
                  )}
                  <button className="btn btn-secondary" onClick={() => setShowPublishModal(false)} style={{ fontSize: '12px' }}>
                    Done
                  </button>
                </div>
              </div>
            )}

            {!isPublishing && publishStatus && !publishStatus.success && (
              <div>
                <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#FEE2E2', color: '#DC2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <AlertCircle size={26} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '600', color: '#991B1B' }}>
                    Publishing Failed
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
                    {publishStatus.message}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowPublishModal(false);
                      setActiveTab('settings');
                    }}
                    style={{ fontSize: '12px' }}
                  >
                    Open Settings &amp; Keys
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handlePublishToGitHub}
                    style={{ fontSize: '12px', background: '#059669' }}
                  >
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              </div>
            )}

            {!isPublishing && !publishStatus && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '16px' }}>
                  Ready to publish to GitHub Pages. Click publish to push your latest edits.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowPublishModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handlePublishToGitHub} style={{ background: '#059669' }}>
                    <Globe size={14} /> Publish Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
