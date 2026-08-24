// Steelcase Multi-Domain Quiz & Assessment Presets
export const STEELCASE_TEMPLATES = [
  {
    id: "steelcase-arc-ai",
    name: "Steelcase ARC — AI Workplace Readiness",
    category: "AI & Technology",
    description: "Evaluates physical infrastructure, cognitive focus zones, and spatial agility for AI-augmented teams.",
    branding: {
      primaryColor: "#1A73E8",
      accentColor: "#1D4ED8",
      headerColor: "#3C4043",
      bodyColor: "#F1F3F4",
      logoUrl: "",
      showLogoInPdf: true
    },
    leadCapture: {
      requireWorkEmail: true,
      fields: {
        name: { label: "Full Name", enabled: true, required: true },
        email: { label: "Work Email", enabled: true, required: true },
        company: { label: "Company / Organization", enabled: true, required: true },
        role: { label: "Job Title / Role", enabled: true, required: false },
        phone: { label: "Direct Phone", enabled: false, required: false },
        projectStatus: { label: "Workplace Project Status", enabled: true, required: true }
      }
    },
    ctaConfig: {
      primaryCtaText: "Apply for Executive Strategy Consultation",
      primaryCtaType: "in_app", // "in_app" | "redirect"
      redirectUrl: "",
      secondaryCtaEnabled: true,
      secondaryCtaText: "Request Direct Phone Callback",
      scoreLabel: "AI Readiness Score",
      disclaimer: "Confidential diagnostic prepared by Steelcase Applied Research + Consulting (ARC)."
    },
    content: {
      builderTitle: "Steelcase Quiz Builder",
      eyebrow: "Steelcase ARC Executive Diagnostic",
      title: "AI Workplace Readiness Index",
      description: "Diagnostic tool to evaluate physical infrastructure readiness for AI-enabled workflows, hybrid presence, and future spatial adaptability."
    },
    aiPersona: {
      role: "Senior Principal Workplace Strategy Architect & AI Workplace Fellow at Steelcase Applied Research + Consulting (ARC)",
      focusAreas: "Physical space readiness for generative AI workflows, STC 38+ acoustic enclosures & speech privacy, cognitive focus sanctuaries, agile reconfigurable team neighborhoods, distributed mobile power density, and hybrid video meeting equity (ISO 22955 & Steelcase ARC benchmarks)",
      tone: "Authoritative, architectural, diagnostic, executive-level, and rigorously grounded in workplace ergonomics and environmental psychology"
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
  },
  {
    id: "steelcase-hybrid-spatial",
    name: "Steelcase — Hybrid Workplace & Spatial Utilization Diagnostic",
    category: "Hybrid & Space Planning",
    description: "Evaluates return-to-office flow, shared desk ratios, neighborhood zoning, and multi-modal meeting technology.",
    branding: {
      primaryColor: "#059669",
      accentColor: "#047857",
      headerColor: "#1E293B",
      bodyColor: "#F8FAFC",
      logoUrl: "",
      showLogoInPdf: true
    },
    leadCapture: {
      requireWorkEmail: true,
      fields: {
        name: { label: "Full Name", enabled: true, required: true },
        email: { label: "Work Email", enabled: true, required: true },
        company: { label: "Company / Organization", enabled: true, required: true },
        role: { label: "Job Title / Role", enabled: true, required: true },
        phone: { label: "Phone", enabled: false, required: false },
        projectStatus: { label: "Project Timeline & Scale", enabled: true, required: true }
      }
    },
    ctaConfig: {
      primaryCtaText: "Request Steelcase Hybrid Space Audit",
      primaryCtaType: "in_app",
      redirectUrl: "",
      secondaryCtaEnabled: true,
      secondaryCtaText: "Book a Steelcase WorkLife Center Tour",
      scoreLabel: "Spatial Agility Score",
      disclaimer: "Prepared by Steelcase Applied Research + Consulting. Benchmark against global hybrid utilization datasets."
    },
    content: {
      builderTitle: "Steelcase Hybrid Quiz Builder",
      eyebrow: "Workplace Strategy Diagnostic",
      title: "Hybrid Spatial Agility & Utilization Index",
      description: "Benchmark your floorplate adaptability, desk-sharing ratios, collaborative micro-hubs, and hybrid meeting equity."
    },
    aiPersona: {
      role: "Lead Workplace Transformation & Hybrid Experience Consultant at Steelcase",
      focusAreas: "Space utilization sensors, unassigned seating algorithms, neighborhood zoning, hybrid video equity, and social destination hubs",
      tone: "Analytical, forward-looking, and employee-experience focused"
    },
    results: [
      { maxScore: 30, title: 'Static Floorplate & Low Flexibility', tone: 'High Risk', color: '#FEE2E2', desc: 'Your office operates on pre-hybrid rigid paradigms with fixed desks and poor collaboration equity. RTO resistance and space waste are high.', cta: 'Schedule Hybrid Space Assessment' },
      { maxScore: 60, title: 'Transitioning Hybrid Workspace', tone: 'Moderate Agility', color: '#FEF3C7', desc: 'Hybrid policies exist, but the physical floorplate still suffers from peak-day crowding and off-peak ghost-town dynamics.', cta: 'Get Neighborhood Zoning Blueprint' },
      { maxScore: 85, title: 'Dynamic Hybrid Ecosystem', tone: 'High Agility', color: '#E0F2FE', desc: 'Strong balance of focus sanctuaries, agile project hubs, and community areas with good spatial elasticity.', cta: 'Explore Advanced Sensor Strategies' },
      { maxScore: 100, title: 'Benchmark Agile Workplace', tone: 'Industry Leader', color: '#DCFCE7', desc: 'World-class space utilization, flawless digital-physical meeting equity, and continuous adaptive zoning.', cta: 'Join Executive Roundtable' }
    ],
    questions: [
      { id: "q1", section: "Utilization & Attendance", question: "How does your organization handle peak mid-week attendance versus low Monday/Friday occupancy?", options: [ { label: "Severe overcrowding on peak days, empty on Mondays/Fridays", value: 0 }, { label: "Noticeable friction and desk shortages on peak days", value: 3 }, { label: "Dynamic neighborhood booking cushions peak demand", value: 7 }, { label: "Elastic floorplate seamlessly adapts with fluid zoning", value: 10 } ] },
      { id: "q2", section: "Utilization & Attendance", question: "What is your current desk-sharing ratio across non-dedicated teams?", options: [ { label: "1:1 Dedicated desks for all employees regardless of attendance", value: 0 }, { label: "Informal desk sharing without clear neighborhood zoning", value: 3 }, { label: "1.3 to 1.5 ratio with digital booking", value: 7 }, { label: "Optimized 1.6+ ratio with dynamic team neighborhoods and lockers", value: 10 } ] },
      { id: "q3", section: "Meeting Equity", question: "When remote participants join conference room meetings, how equal is their presence and conversational parity?", options: [ { label: "Remote participants feel like secondary observers / bowling alley effect", value: 0 }, { label: "Basic tabletop camera, remote audio often muffled", value: 3 }, { label: "Front-row camera positioning and dual displays", value: 7 }, { label: "Sightline-optimized curved tables, AI center-of-room framing, and spatial audio", value: 10 } ] },
      { id: "q4", section: "Neighborhood Zoning", question: "Are team areas divided into clear acoustic zones (Buzz / Quiet / Silent)?", options: [ { label: "Single open plan where all sounds bleed across teams", value: 0 }, { label: "Ad-hoc rules with frequent acoustic conflicts", value: 3 }, { label: "Distinct departmental wings with basic buffer zones", value: 7 }, { label: "Engineered acoustic gradient with high-STC phone booths and quiet libraries", value: 10 } ] },
      { id: "q5", section: "Social & Community", question: "Does your office provide compelling destination hubs (WorkCafés, lounges) that motivate employees to commute in?", options: [ { label: "Basic breakroom with vending machines", value: 0 }, { label: "Standard cafeteria with generic seating", value: 3 }, { label: "Vibrant WorkCafé with power access and diverse seating postures", value: 7 }, { label: "Hospitality-grade social hub supporting dining, all-hands, and informal teaming", value: 10 } ] }
    ]
  },
  {
    id: "steelcase-acoustics-privacy",
    name: "Steelcase — Acoustic Comfort & Speech Privacy Index",
    category: "Acoustics & Well-being",
    description: "Evaluates reverberation time (RT60), speech privacy, STC pod distribution, and open-plan noise distraction.",
    branding: {
      primaryColor: "#7C3AED",
      accentColor: "#6D28D9",
      headerColor: "#18181B",
      bodyColor: "#F5F3FF",
      logoUrl: "",
      showLogoInPdf: true
    },
    leadCapture: {
      requireWorkEmail: true,
      fields: {
        name: { label: "Full Name", enabled: true, required: true },
        email: { label: "Work Email", enabled: true, required: true },
        company: { label: "Company", enabled: true, required: true },
        role: { label: "Job Title", enabled: true, required: false },
        phone: { label: "Direct Phone", enabled: false, required: false },
        projectStatus: { label: "Acoustic Audit Urgency", enabled: true, required: true }
      }
    },
    ctaConfig: {
      primaryCtaText: "Request Steelcase Acoustic Engineering Audit",
      primaryCtaType: "in_app",
      redirectUrl: "",
      secondaryCtaEnabled: true,
      secondaryCtaText: "Download Steelcase Acoustic Whitepaper",
      scoreLabel: "Acoustic Privacy Index",
      disclaimer: "Based on ISO 22955 and ASTM acoustic privacy standards synthesized by Steelcase Acoustic Lab."
    },
    content: {
      builderTitle: "Steelcase Acoustic Quiz Builder",
      eyebrow: "Acoustics & Spatial Health Audit",
      title: "Workplace Acoustic Comfort & Speech Privacy Index",
      description: "Diagnose speech intelligibility, reverberation, open-plan distraction radius, and confidential conversation containment."
    },
    aiPersona: {
      role: "Lead Acoustic Engineer & Cognitive Performance Specialist at Steelcase",
      focusAreas: "Speech Privacy Class (SPC), Sound Transmission Class (STC 38+), reverberation RT60, sound masking, and acoustic micro-zones",
      tone: "Scientific, precise, engineering-driven, and focused on cognitive health"
    },
    results: [
      { maxScore: 30, title: 'Severe Acoustic Deficit', tone: 'Critical Noise Fatigue', color: '#FEE2E2', desc: 'Frequent confidential speech leaks, overwhelming distraction radius, and severe cognitive fatigue from unprotected open-plan noise.', cta: 'Request Emergency Acoustic Audit' },
      { maxScore: 60, title: 'Moderate Acoustic Friction', tone: 'Acoustic Gaps', color: '#FEF3C7', desc: 'Some phone booths exist, but lack sound masking and wall absorption causes sound spillage into quiet knowledge areas.', cta: 'Review Pod & Masking Solutions' },
      { maxScore: 85, title: 'Balanced Acoustic Environment', tone: 'Good Privacy', color: '#EDE9FE', desc: 'Effective distribution of focus pods and absorbing ceilings with low distraction spill.', cta: 'Fine-tune Speech Privacy Index' },
      { maxScore: 100, title: 'Acoustic Excellence (ISO 22955)', tone: 'Benchmark Acoustic Quality', color: '#DCFCE7', desc: 'Optimal RT60 reverberation, high-STC enclosures for all video calls, and pristine speech privacy.', cta: 'View Benchmark Case Study' }
    ],
    questions: [
      { id: "q1", section: "Noise & Distraction", question: "How often do employees report that overhearing conversations prevents them from doing deep work?", options: [ { label: "Constantly every day", value: 0 }, { label: "Several times a week", value: 3 }, { label: "Occasionally", value: 7 }, { label: "Rarely or never", value: 10 } ] },
      { id: "q2", section: "Video Call Impact", question: "What happens when someone takes an impromptu Zoom or Teams call in the open desk area?", options: [ { label: "Everyone within 30 feet gets disrupted and annoyed", value: 0 }, { label: "Noticeable disruption to neighboring teammates", value: 3 }, { label: "Minor distraction; most use headphones", value: 7 }, { label: "Zero disruption; acoustic phone pods are steps away from every desk", value: 10 } ] },
      { id: "q3", section: "Confidentiality", question: "Can confidential HR, executive, or client conversations be overheard from adjacent meeting rooms?", options: [ { label: "Frequently overheard through glass or drywall", value: 0 }, { label: "Muffled voices audible when raised", value: 4 }, { label: "Generally secure except near room doors", value: 7 }, { label: "Complete speech privacy (STC 40+ certified partitions)", value: 10 } ] },
      { id: "q4", section: "Acoustic Treatment", question: "What acoustic absorption treatments are installed in your open workspaces?", options: [ { label: "Hard surfaces only (bare concrete, glass, drywall ceiling)", value: 0 }, { label: "Standard commercial ceiling tiles only", value: 3 }, { label: "Acoustic ceiling baffles and wall felt panels", value: 7 }, { label: "Integrated acoustic ecosystem: NRC 0.85+ baffles, active sound masking, and upholstered screens", value: 10 } ] }
    ]
  },
  {
    id: "steelcase-ergonomics-wellness",
    name: "Steelcase — Ergonomics & Active Well-being Diagnostic",
    category: "Ergonomics & Well-being",
    description: "Evaluates musculoskeletal support, sit-to-stand movement, monitor positioning, and posture change frequency.",
    branding: {
      primaryColor: "#0284C7",
      accentColor: "#0369A1",
      headerColor: "#0F172A",
      bodyColor: "#F0F9FF",
      logoUrl: "",
      showLogoInPdf: true
    },
    leadCapture: {
      requireWorkEmail: true,
      fields: {
        name: { label: "Full Name", enabled: true, required: true },
        email: { label: "Work Email", enabled: true, required: true },
        company: { label: "Organization", enabled: true, required: true },
        role: { label: "Title", enabled: true, required: false },
        phone: { label: "Phone", enabled: false, required: false },
        projectStatus: { label: "Seating / Furniture Initiative", enabled: true, required: true }
      }
    },
    ctaConfig: {
      primaryCtaText: "Request Steelcase Ergonomic Audit & Trial Chairs",
      primaryCtaType: "in_app",
      redirectUrl: "",
      secondaryCtaEnabled: true,
      secondaryCtaText: "Download Healthy Posture Guide",
      scoreLabel: "Ergonomic Wellness Index",
      disclaimer: "Synthesized from Steelcase Global Ergonomics & Posture Research."
    },
    content: {
      builderTitle: "Steelcase Ergonomics Quiz Builder",
      eyebrow: "Workplace Health & Ergonomics",
      title: "Workplace Ergonomic & Active Well-Being Audit",
      description: "Assess physical support, posture variation, sit-to-stand adoption, and musculoskeletal fatigue prevention across your team."
    },
    aiPersona: {
      role: "Senior Ergonomist & Biomechanics Research Specialist at Steelcase",
      focusAreas: "LiveBack spinal support, 3D armrests, active posture variation, height-adjustable workstations, and monitor focal distance",
      tone: "Empathetic, scientifically backed, and focused on physical vitality"
    },
    results: [
      { maxScore: 30, title: 'High Musculoskeletal Risk', tone: 'Physical Strain', color: '#FEE2E2', desc: 'Static rigid task seating, improper screen heights, and prolonged sitting without posture change cause employee physical fatigue and strain.', cta: 'Request Ergonomic Trial Program' },
      { maxScore: 60, title: 'Basic Ergonomic Baseline', tone: 'Partial Support', color: '#FEF3C7', desc: 'Some adjustable task chairs, but lack of height-adjustable desks and monitor arms restricts healthy movement.', cta: 'Explore Ergonomic Seating Range' },
      { maxScore: 85, title: 'Active Postural Environment', tone: 'Healthy Movement', color: '#E0F2FE', desc: 'Good adoption of sit-to-stand desks and high-performance seating across main work areas.', cta: 'Optimize Multi-Monitor Setups' },
      { maxScore: 100, title: 'World-Class Ergonomic Sanctuary', tone: 'Peak Ergonomics', color: '#DCFCE7', desc: 'Complete range of motion support, high-end LiveBack seating (Gesture, Leap), and full posture variation.', cta: 'Share Benchmark with Leadership' }
    ],
    questions: [
      { id: "q1", section: "Seating & Spine", question: "What level of ergonomic adjustment do primary workstations provide?", options: [ { label: "Basic non-adjustable chairs without lumbar support", value: 0 }, { label: "Standard height-only adjustable task chairs", value: 3 }, { label: "High-quality chairs with adjustable lumbar and armrests", value: 7 }, { label: "High-performance dynamic seating with synchronized spinal tracking (e.g. Steelcase Gesture/Leap)", value: 10 } ] },
      { id: "q2", section: "Movement & Posture", question: "What percentage of employees have access to sit-to-stand height-adjustable desks?", options: [ { label: "0% (All fixed-height desks)", value: 0 }, { label: "1% to 25% (Special accommodation only)", value: 3 }, { label: "26% to 75%", value: 7 }, { label: "76% to 100% (Universal sit-to-stand adoption)", value: 10 } ] },
      { id: "q3", section: "Visual Ergonomics", question: "How are dual monitors, laptops, and screen heights positioned?", options: [ { label: "Laptops flat on desk, users hunching forward", value: 0 }, { label: "Static monitor stands with fixed height", value: 3 }, { label: "Adjustable monitor arms on most desks", value: 7 }, { label: "Full dynamic monitor arms, laptop risers, and anti-glare task lighting", value: 10 } ] }
    ]
  },
  {
    id: "steelcase-sustainability-circularity",
    name: "Steelcase — Sustainability & Circular Workplace Audit",
    category: "Sustainability",
    description: "Evaluates carbon footprint, LEED/WELL certification readiness, furniture circularity, and end-of-life repurposing.",
    branding: {
      primaryColor: "#059669",
      accentColor: "#047857",
      headerColor: "#064E3B",
      bodyColor: "#F0FDF4",
      logoUrl: "",
      showLogoInPdf: true
    },
    leadCapture: {
      requireWorkEmail: true,
      fields: {
        name: { label: "Full Name", enabled: true, required: true },
        email: { label: "Work Email", enabled: true, required: true },
        company: { label: "Company", enabled: true, required: true },
        role: { label: "Role / ESG Lead", enabled: true, required: false },
        phone: { label: "Phone", enabled: false, required: false },
        projectStatus: { label: "ESG / Workplace Project Phase", enabled: true, required: true }
      }
    },
    ctaConfig: {
      primaryCtaText: "Request Steelcase Circular Economy Consultation",
      primaryCtaType: "in_app",
      redirectUrl: "",
      secondaryCtaEnabled: true,
      secondaryCtaText: "Download Product Carbon Footprint Report",
      scoreLabel: "Circular Workplace Score",
      disclaimer: "Aligned with Cradle to Cradle™, BIFMA LEVEL®, and Steelcase Carbon Neutrality milestones."
    },
    content: {
      builderTitle: "Steelcase Sustainability Quiz Builder",
      eyebrow: "ESG & Circular Design Diagnostic",
      title: "Sustainable Workplace & Circularity Index",
      description: "Measure embodied carbon, material circularity, LEED/WELL alignment, and sustainable decommissioning practices."
    },
    aiPersona: {
      role: "Senior Sustainability & Circular Economy Specialist at Steelcase",
      focusAreas: "Embodied carbon reduction, Cradle to Cradle certification, PVC-free materials, take-back programs, and energy-efficient building systems",
      tone: "Principled, metrics-driven, environmental, and corporate ESG focused"
    },
    results: [
      { maxScore: 30, title: 'High Environmental Impact', tone: 'ESG Gaps', color: '#FEE2E2', desc: 'Furniture is disposed in landfills, high embodied carbon products, and no verifiable circularity certification.', cta: 'Plan Sustainable Refresh' },
      { maxScore: 60, title: 'Developing Sustainability Practices', tone: 'Moderate Progress', color: '#FEF3C7', desc: 'Basic recycling programs, but spatial assets lack formal Cradle to Cradle or EPD documentation.', cta: 'Explore Eco-Certified Products' },
      { maxScore: 85, title: 'High Circularity & Low Carbon', tone: 'Strong ESG Alignment', color: '#DCFCE7', desc: 'Widespread use of certified carbon-neutral seating and sustainable materials with take-back options.', cta: 'Review LEED Credit Maximization' },
      { maxScore: 100, title: 'Zero-Waste Circular Pioneer', tone: 'Global Benchmark', color: '#D1FAE5', desc: 'Full lifecycle carbon offset, closed-loop asset recovery, and exemplary LEED Platinum / WELL Platinum workplace design.', cta: 'Publish Case Study with Steelcase' }
    ],
    questions: [
      { id: "q1", section: "Materials & Carbon", question: "What environmental certifications do your existing office furniture and interior products hold?", options: [ { label: "No formal environmental documentation", value: 0 }, { label: "Basic indoor air quality certification (GREENGUARD only)", value: 3 }, { label: "EPDs (Environmental Product Declarations) and BIFMA LEVEL 2", value: 7 }, { label: "Cradle to Cradle Certified™, CarbonNeutral®, and 90%+ recyclable components", value: 10 } ] },
      { id: "q2", section: "Decommissioning & Circularity", question: "When redesigning or moving offices, how are existing furniture assets managed?", options: [ { label: "Disposed directly to landfill via general contractor", value: 0 }, { label: "Sold for scrap or liquidated without tracking", value: 3 }, { label: "Donated or auctioned informally", value: 7 }, { label: "Managed through Steelcase EcoServices (re-upholster, donate to non-profits, or 100% closed-loop recycle)", value: 10 } ] },
      { id: "q3", section: "Green Building Alignment", question: "Is your workplace currently targeting or certified under LEED, WELL, or Fitwel standards?", options: [ { label: "No green building certifications targeted", value: 0 }, { label: "Exploring certification for future leases", value: 4 }, { label: "Certified LEED Silver / Gold or WELL Bronze", value: 7 }, { label: "Certified LEED Platinum and WELL Platinum with continuous indoor air monitoring", value: 10 } ] }
    ]
  }
];
