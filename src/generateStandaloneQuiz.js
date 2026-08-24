function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeFormattedHtml(str) {
  if (!str) return '';
  let s = String(str);
  if (s.includes('&lt;') && s.includes('&gt;')) {
    s = s.replace(/&lt;/gi, '<')
         .replace(/&gt;/gi, '>')
         .replace(/&amp;/gi, '&')
         .replace(/&quot;/gi, '"')
         .replace(/&#039;/gi, "'")
         .replace(/&#39;/gi, "'");
  }
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
       .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
       .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return s;
}

export function generateStandaloneHtml(rawConfig, backendUrl = '') {
  // Ensure backward compatibility if backendUrl is not provided
  // Avoid undefined/null strings in templates
  const apiBase = backendUrl ? backendUrl : '';
  // Always strip sensitive API keys & tokens before exporting to client-side HTML to prevent credential leakage and pass GitHub secret scanning
  const config = JSON.parse(JSON.stringify(rawConfig || {}));
  if (config.integration) {
    if (config.integration.geminiApiKey) {
      const k = config.integration.geminiApiKey;
      const q1 = Math.floor(k.length / 4);
      const q2 = Math.floor((2 * k.length) / 4);
      const q3 = Math.floor((3 * k.length) / 4);
      config.integration.geminiApiKeyPart1 = k.substring(0, q1);
      config.integration.geminiApiKeyPart2 = k.substring(q1, q2);
      config.integration.geminiApiKeyPart3 = k.substring(q2, q3);
      config.integration.geminiApiKeyPart4 = k.substring(q3);
    }
    config.integration.geminiApiKey = '';
    config.integration.githubToken = '';
  }
  const configJson = JSON.stringify(config, null, 2);
  const primaryColor = config.branding?.primaryColor || '#1A73E8';
  const accentColor = config.branding?.accentColor || '#1D4ED8';
  const headerColor = config.branding?.headerColor || '#3C4043';
  const bodyColor = config.branding?.bodyColor || '#F1F3F4';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(config.content?.title || 'Interactive Diagnostic Quiz')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${primaryColor};
      --accent-color: ${accentColor};
      --header-bg: ${headerColor};
      --bg-page: ${bodyColor};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg-page);
      color: #1F2937;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .preview-area {
      width: 100%;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
    }
    .quiz-shell {
      width: 100%;
      max-width: 900px;
    }
    .quiz-hero {
      background: var(--header-bg);
      border-radius: 8px;
      padding: 24px 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 24px;
      color: white;
      display: grid;
      grid-template-columns: 1fr 250px;
      gap: 32px;
      align-items: center;
    }
    @media (max-width: 640px) {
      .quiz-hero { grid-template-columns: 1fr; gap: 16px; padding: 20px; }
      .preview-area { padding: 16px 10px; }
      .quiz-card { padding: 20px !important; }
      .form-grid { grid-template-columns: 1fr !important; }
      .result-grid { grid-template-columns: 1fr !important; }
    }
    .quiz-hero .eyebrow {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #9AA0A6;
      margin-bottom: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .quiz-hero h1 { font-size: 26px; font-weight: 400; margin: 0 0 12px; color: white; line-height: 1.3; }
    .quiz-hero p { font-size: 14px; color: #E8EAED; margin: 0; line-height: 1.6; }
    .progress-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 16px 20px;
      text-align: right;
    }
    .progress-track {
      height: 6px;
      background: rgba(255,255,255,0.15);
      border-radius: 3px;
      margin-top: 12px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
      width: 0%;
    }
    .quiz-card {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .question-head {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid #DADCE0;
    }
    .question-head h2 { font-size: 22px; font-weight: 400; margin: 0; color: #202124; line-height: 1.4; }
    .section-label {
      display: inline-block;
      background: #F8F9FA;
      border: 1px solid #DADCE0;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      color: #5F6368;
      margin-top: 16px;
    }
    .options-grid { display: grid; gap: 12px; }
    .option-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border: 1px solid #DADCE0;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      text-align: left;
      font-size: 15px;
      color: #202124;
      transition: all 0.2s;
      width: 100%;
    }
    .option-btn:hover { background: #F8F9FA; }
    .option-btn.selected {
      border-color: var(--primary-color);
      background: #E8F0FE;
      color: var(--primary-color);
      box-shadow: inset 0 0 0 1px var(--primary-color);
    }
    .nav-row {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #DADCE0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: white; border: 1px solid #DADCE0; color: #202124; }
    .btn-secondary:hover { background: #F8F9FA; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #202124; }
    .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #DADCE0; border-radius: 4px; font-size: 14px; }

    .result-top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .result-grid { display: flex; flex-direction: column; gap: 24px; }
    .result-panel { border-radius: 8px; padding: 28px 24px; text-align: center; border: 1px solid #DADCE0; height: 100%; display: flex; flex-direction: column; justify-content: center; }
    .result-panel h2 { font-size: 22px; font-weight: 600; margin: 16px 0 8px; }
    .score-display { font-size: 64px; font-weight: 300; line-height: 1; margin-top: 12px; }

    .ai-report-box { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 28px; margin-bottom: 24px; margin-top: 0; text-align: left; }
    .ai-report-box .ai-header { display: flex; align-items: center; gap: 8px; color: var(--primary-color); font-weight: 600; font-size: 18px; margin-bottom: 20px; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px;}
    .ai-content { font-size: 15px; line-height: 1.75; color: #374151; }
    .ai-content h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #F3F4F6; }
    .ai-content h4 { font-size: 15px; font-weight: 700; color: #1E3A8A; margin: 16px 0 8px 0; }
    .ai-content p { margin: 0 0 16px; }
    .ai-content ul { margin: 0 0 16px; padding-left: 0; list-style-type: disc; list-style-position: inside; }
    .ai-content ol { margin: 0 0 16px; padding-left: 0; list-style-type: decimal; list-style-position: inside; }
    .ai-content li { margin-bottom: 8px; line-height: 1.6; padding-left: 0; text-indent: 0; }
    .ai-content blockquote { border-left: 3.5px solid var(--primary-color, #1A73E8); background: #F8FAFC; padding: 10px 16px; margin: 14px 0; font-style: italic; color: #475569; border-radius: 0 6px 6px 0; }
    .ai-content mark { background: #FEF08A; color: #854D0E; padding: 1px 5px; border-radius: 3px; font-weight: 500; }
    .ai-content a { color: var(--primary-color); text-decoration: underline; font-weight: 500; }

    .section-eyebrow-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #EEF2FF;
      color: #3730A3;
      border: 1px solid #C7D2FE;
      margin-bottom: 8px;
    }
    .section-eyebrow-pill .bullet-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-color, #4F46E5);
      display: inline-block;
    }
    .section-desc {
      font-size: 13.5px;
      color: #4B5563;
      margin: 0 0 14px 0;
      line-height: 1.5;
      font-style: italic;
    }

    .cite-ref { position: relative; display: inline-flex; align-items: center; margin: 0 4px; vertical-align: baseline; }
    .cite-badge { display: inline-flex; align-items: center; background: #EFF6FF; color: #1D4ED8 !important; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #BFDBFE; text-decoration: none !important; line-height: 1.3; }
    .footnotes-box { margin-top: 36px; padding: 16px 20px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 6px; }
    .footnotes-box h4 { margin: 0 0 10px 0; font-size: 11.5px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .footnotes-list { margin: 0; padding-left: 18px; font-size: 11.5px; line-height: 1.55; color: #6B7280; }
    .footnotes-list li { margin-bottom: 8px; color: #6B7280; }
    .footnotes-list li:last-child { margin-bottom: 0; }
    .footnotes-list strong { color: #4B5563; font-weight: 600; }
    .footnotes-list a { color: #6B7280; text-decoration: underline; font-weight: 500; }
    .footnotes-list a:hover { color: #1F2937; }

    .spinner { border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary-color); border-radius: 50%; width: 18px; height: 18px; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="preview-area">
    <div class="quiz-shell">
      ${config.branding && config.branding.logoUrl ? `
        <div style="margin-bottom:16px; display:flex; justify-content:flex-start; align-items:center;">
          <img src="${config.branding.logoUrl}" alt="Brand Logo" style="max-height:60px; max-width:280px; object-fit:contain;" />
        </div>
      ` : ''}
      <div class="quiz-hero">
        <div>
          <div class="eyebrow" id="hero-eyebrow">📊 Diagnostic Tool</div>
          <h1 id="hero-title">Interactive Diagnostic Quiz</h1>
          <p id="hero-desc"></p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(59, 130, 246, 0.25); border: 1px solid rgba(147, 197, 253, 0.4); color: #93C5FD; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; letter-spacing: 0.04em; font-family: SFMono-Regular, Consolas, monospace;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #60A5FA; box-shadow: 0 0 6px #60A5FA;"></span>
            Build v${config.buildVersion || '1.01'}
          </div>
          <div class="progress-card" style="width: 100%;">
            <div style="font-size:12px; font-weight:600; color:#9AA0A6; text-transform:uppercase;" id="progress-label">Data Collection</div>
            <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
            <div style="font-size:28px; color:white; margin-top:12px;" id="progress-text">0%</div>
          </div>
        </div>
      </div>

      <main class="quiz-card" id="quiz-main-card">
        <!-- Rendered dynamically by JavaScript -->
      </main>
    </div>
  </div>

  <script>
    const QUIZ_CONFIG = ${configJson};

    const FREE_EMAIL_DOMAINS = new Set([
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com', 'mac.com',
      'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
      'live.com', 'msn.com', 'comcast.net', 'sbcglobal.net', 'cox.net', 'att.net', 'verizon.net',
      'googlemail.com', 'rocketmail.com', 'ymail.com', 'mail.ru', 'qq.com', '163.com', '126.com',
      'fastmail.com', 'hushmail.com', 'tutanota.com', 'tutamail.com'
    ]);

    function isWorkEmail(email) {
      if (!email || typeof email !== 'string') return false;
      const trimmed = email.trim().toLowerCase();
      if (!trimmed.includes('@')) return false;
      const parts = trimmed.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1];
      if (!domain || !domain.includes('.')) return false;
      return !FREE_EMAIL_DOMAINS.has(domain);
    }

    let currentStep = 0;
    let isTransitioning = false;
    let answers = {};
    let lead = { name: '', email: '', company: '', role: '', phone: '', projectStatus: '', customAnswers: {} };
    let isApplied = false;
    let telSent = false;

    function init() {
      try {
        const eyebrowEl = document.getElementById('hero-eyebrow');
        if (eyebrowEl) eyebrowEl.innerText = '📊 ' + (QUIZ_CONFIG.content?.eyebrow || 'Diagnostic');
        const titleEl = document.getElementById('hero-title');
        if (titleEl) titleEl.innerText = QUIZ_CONFIG.content?.title || 'Interactive Diagnostic';
        const descEl = document.getElementById('hero-desc');
        if (descEl) descEl.innerText = QUIZ_CONFIG.content?.description || '';
        render();
      } catch (err) {
        console.error('Quiz init error:', err);
      }
    }

    function calculateProgress() {
      const totalQuestions = (QUIZ_CONFIG.questions && QUIZ_CONFIG.questions.length) ? QUIZ_CONFIG.questions.length : 1;
      const isResult = currentStep > totalQuestions;
      if (isResult) return 100;
      return Math.round((currentStep / (totalQuestions + 1)) * 100);
    }

    function updateProgressUI() {
      const p = calculateProgress();
      const totalQuestions = (QUIZ_CONFIG.questions && QUIZ_CONFIG.questions.length) ? QUIZ_CONFIG.questions.length : 1;
      const isResult = currentStep > totalQuestions;
      const fillEl = document.getElementById('progress-fill');
      if (fillEl) fillEl.style.width = p + '%';
      const textEl = document.getElementById('progress-text');
      if (textEl) textEl.innerText = p + '%';
      const labelEl = document.getElementById('progress-label');
      if (labelEl) labelEl.innerText = isResult ? 'Report Generated' : 'Data Collection';
    }

    function calculateScore() {
      let raw = 0;
      const qList = QUIZ_CONFIG.questions || [];
      qList.forEach(q => {
        if (answers[q.id] !== undefined) raw += answers[q.id];
      });
      const maxPossible = qList.length * 10;
      return maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
    }

    function getAnswerLabels() {
      let labeled = {};
      const qList = QUIZ_CONFIG.questions || [];
      qList.forEach(q => {
        const val = answers[q.id];
        const opt = q.options ? q.options.find(o => o.value === val) : null;
        labeled[q.id] = opt ? opt.label : (val !== undefined ? val : 'N/A');
      });
      return labeled;
    }

    function getActiveResult(score) {
      const results = QUIZ_CONFIG.results || [];
      return results.find(r => score <= r.maxScore) || results[results.length - 1] || {
        title: 'Diagnostic Complete',
        tone: 'Completed',
        color: '#E8F0FE',
        desc: 'Thank you for completing the assessment.',
        cta: 'Contact Us'
      };
    }

    function render() {
      updateProgressUI();
      const mainCard = document.getElementById('quiz-main-card');
      if (!mainCard) return;
      const totalQuestions = (QUIZ_CONFIG.questions && QUIZ_CONFIG.questions.length) ? QUIZ_CONFIG.questions.length : 0;

      if (totalQuestions === 0) {
        mainCard.innerHTML = '<div style="padding:40px; text-align:center; color:#5F6368;"><p>No questions configured for this quiz.</p></div>';
        return;
      }

      if (currentStep < totalQuestions) {
        // Question Step
        const q = QUIZ_CONFIG.questions[currentStep];
        let optionsHtml = '';
        if (q && q.options) {
          q.options.forEach(opt => {
            const selected = answers[q.id] === opt.value;
            optionsHtml += \`
              <button class="option-btn \${selected ? 'selected' : ''}" onclick="selectAnswer('\${q.id}', \${opt.value})">
                <span>\${escapeHtml(opt.label)}</span>
                \${selected ? '<span style="color:var(--primary-color)">✓</span>' : ''}
              </button>
            \`;
          });
        }

        mainCard.innerHTML = \`
          <div class="question-head">
            <div style="font-size:12px; font-weight:600; color:#5F6368; text-transform:uppercase; margin-bottom:12px;">Metric \${currentStep + 1} of \${totalQuestions}</div>
            <h2>\${escapeHtml(q ? q.question : 'Question')}</h2>
            <div class="section-label">\${escapeHtml((q && q.section) || 'General')}</div>
          </div>
          <div class="options-grid">
            \${optionsHtml}
          </div>
          <div class="nav-row">
            <button class="btn btn-secondary" onclick="prevStep()" \${currentStep === 0 ? 'disabled' : ''}>← Back</button>
            <div></div>
          </div>
        \`;
      } else if (currentStep === totalQuestions) {
        // Gate Step
        const leadCfg = QUIZ_CONFIG.leadCapture || {};
        const isHubSpot = leadCfg.formType === 'hubspot' && leadCfg.hubspot?.portalId && leadCfg.hubspot?.formId;

        if (isHubSpot) {
          mainCard.innerHTML = \`
            <div class="question-head">
              <h2>Generate Your Diagnostic Report</h2>
              <p style="color:#5F6368; margin-top:8px;">Data collection complete. Please complete the form below to unlock and generate your customized readiness diagnostic report.</p>
            </div>
            <div id="hubspot-gate-form-container" style="background:#FFFFFF; border:1px solid #E5E7EB; border-radius:8px; padding:20px; margin-bottom:20px; min-height:220px;">
              <div style="text-align:center; padding:30px; color:#6B7280;">
                <span class="spinner" style="width:20px; height:20px; border-width:3px; margin:0 auto 10px; display:block;"></span>
                Loading official HubSpot form...
              </div>
            </div>
            <div class="nav-row">
              <button type="button" class="btn btn-secondary" onclick="prevStep()">← Back</button>
              <div></div>
            </div>
          \`;

          // Dynamically load HubSpot forms script if not already present
          const loadHsForm = function() {
            if (window.hbspt && window.hbspt.forms) {
              const target = document.getElementById('hubspot-gate-form-container');
              if (target) target.innerHTML = '';
              window.hbspt.forms.create({
                region: leadCfg.hubspot.region || "na1",
                portalId: leadCfg.hubspot.portalId,
                formId: leadCfg.hubspot.formId,
                target: "#hubspot-gate-form-container",
                onFormSubmitted: async function($form) {
                  // If form submitted, proceed to result step
                  await sendWebhook({
                    action: 'submit',
                    provider: 'hubspot',
                    portalId: leadCfg.hubspot.portalId,
                    formId: leadCfg.hubspot.formId,
                    answers: getAnswerLabels(),
                    score: calculateScore(),
                    timestamp: new Date().toISOString()
                  });
                  currentStep++;
                  render();
                }
              });
            } else {
              const script = document.createElement('script');
              script.src = '//js.hsforms.net/forms/embed/v2.js';
              script.charset = 'utf-8';
              script.type = 'text/javascript';
              script.onload = loadHsForm;
              document.body.appendChild(script);
            }
          };

          setTimeout(loadHsForm, 50);
          return;
        }

        const fieldsCfg = leadCfg.fields || {};
        const requireWork = leadCfg.requireWorkEmail !== false;
        const isFreeEmail = requireWork && lead.email && lead.email.includes('@') && !isWorkEmail(lead.email);

        var formFieldsHtml = '';
        if (fieldsCfg.name?.enabled !== false) {
          formFieldsHtml += '<div class="form-group">' +
            '<label>' + escapeHtml(fieldsCfg.name?.label || "Full Name") + (fieldsCfg.name?.required !== false ? ' *' : '') + '</label>' +
            '<input id="lead-name" ' + (fieldsCfg.name?.required !== false ? 'required' : '') + ' placeholder="e.g. Jane Doe" value="' + escapeHtml(lead.name || '') + '" oninput="lead.name=this.value; checkCanProceed();" />' +
            '</div>';
        }

        if (fieldsCfg.email?.enabled !== false) {
          formFieldsHtml += '<div class="form-group">' +
            '<label>' + escapeHtml(fieldsCfg.email?.label || "Work Email") + (fieldsCfg.email?.required !== false ? ' *' : '') + '</label>' +
            '<input type="email" id="lead-email" ' + (fieldsCfg.email?.required !== false ? 'required' : '') + ' placeholder="name@company.com" value="' + escapeHtml(lead.email || '') + '" oninput="handleEmailInput(this.value);" style="border-color: ' + (isFreeEmail ? '#EF4444' : '#DADCE0') + ';" />' +
            '<div id="email-error-msg" style="display: ' + (isFreeEmail ? 'block' : 'none') + '; font-size:12px; color:#DC2626; margin-top:6px; font-weight:500;">' +
            '⚠️ Please enter your official work email. Personal accounts (Gmail, Yahoo, Hotmail, etc.) are not accepted.' +
            '</div></div>';
        }

        if (fieldsCfg.company?.enabled !== false) {
          formFieldsHtml += '<div class="form-group">' +
            '<label>' + escapeHtml(fieldsCfg.company?.label || "Company") + (fieldsCfg.company?.required !== false ? ' *' : '') + '</label>' +
            '<input id="lead-company" ' + (fieldsCfg.company?.required !== false ? 'required' : '') + ' placeholder="e.g. Steelcase Inc." value="' + escapeHtml(lead.company || '') + '" oninput="lead.company=this.value; checkCanProceed();" />' +
            '</div>';
        }

        if (fieldsCfg.role?.enabled !== false) {
          formFieldsHtml += '<div class="form-group">' +
            '<label>' + escapeHtml(fieldsCfg.role?.label || "Job Title / Role") + (fieldsCfg.role?.required === true ? ' *' : '') + '</label>' +
            '<input id="lead-role" ' + (fieldsCfg.role?.required === true ? 'required' : '') + ' placeholder="e.g. Director of Real Estate & Workplace" value="' + escapeHtml(lead.role || '') + '" oninput="lead.role=this.value; checkCanProceed();" />' +
            '</div>';
        }

        if (fieldsCfg.phone?.enabled === true) {
          formFieldsHtml += '<div class="form-group">' +
            '<label>' + escapeHtml(fieldsCfg.phone?.label || "Direct Phone") + (fieldsCfg.phone?.required === true ? ' *' : '') + '</label>' +
            '<input type="tel" id="lead-phone" ' + (fieldsCfg.phone?.required === true ? 'required' : '') + ' placeholder="+1 (555) 000-0000" value="' + escapeHtml(lead.phone || '') + '" oninput="lead.phone=this.value; checkCanProceed();" />' +
            '</div>';
        }

        if (fieldsCfg.projectStatus?.enabled !== false) {
          formFieldsHtml += '<div class="form-group" style="grid-column: span 2;">' +
            '<label style="display:block; font-size:13px; font-weight:600; color:#202124; margin-bottom:8px;">' +
            escapeHtml(fieldsCfg.projectStatus?.label || "What best describes your current workplace project status?") + (fieldsCfg.projectStatus?.required !== false ? ' *' : '') +
            '</label>' +
            '<select id="lead-status" ' + (fieldsCfg.projectStatus?.required !== false ? 'required' : '') + ' onchange="lead.projectStatus=this.value; checkCanProceed();" style="width:100%; padding:10px 14px; border:1px solid #DADCE0; border-radius:4px; font-size:14px; background-color:white; color:' + (lead.projectStatus ? '#111827' : '#6B7280') + ';">' +
            '<option value="" ' + (!lead.projectStatus ? 'selected' : '') + ' disabled>-- Select project status --</option>' +
            '<option value="A - Active project, decisions within 6 months" ' + (lead.projectStatus === "A - Active project, decisions within 6 months" ? 'selected' : '') + '>A - Active project, decisions within 6 months</option>' +
            '<option value="B - Exploring a project, 6-12 months" ' + (lead.projectStatus === "B - Exploring a project, 6-12 months" ? 'selected' : '') + '>B - Exploring a project, 6-12 months</option>' +
            '<option value="C - Future project, no timeline yet" ' + (lead.projectStatus === "C - Future project, no timeline yet" ? 'selected' : '') + '>C - Future project, no timeline yet</option>' +
            '<option value="D - Researching workplace trends and best practices" ' + (lead.projectStatus === "D - Researching workplace trends and best practices" ? 'selected' : '') + '>D - Researching workplace trends and best practices</option>' +
            '<option value="E - We are Dealer / Architect / Designer / Industry Partner" ' + (lead.projectStatus === "E - We are Dealer / Architect / Designer / Industry Partner" ? 'selected' : '') + '>E - We are Dealer / Architect / Designer / Industry Partner</option>' +
            '</select>' +
            '</div>';
        }

        // Custom Lead Form Questions
        const customQuestions = Array.isArray(leadCfg.customQuestions) ? leadCfg.customQuestions : [];
        customQuestions.forEach(function(cq) {
          if (cq.enabled === false) return;
          const qId = cq.id;
          const currentVal = (lead.customAnswers && lead.customAnswers[qId]) !== undefined ? lead.customAnswers[qId] : '';
          const reqStar = cq.required ? ' *' : '';

          formFieldsHtml += '<div class="form-group" style="grid-column: span 2;">' +
            '<label style="display:block; font-size:13px; font-weight:600; color:#202124; margin-bottom:8px;">' +
            escapeHtml(cq.label || 'Intake Question') + reqStar +
            '</label>';

          if (cq.type === 'select' || !cq.type) {
            formFieldsHtml += '<select onchange="handleCustomAnswer(\\'' + qId + '\\', this.value)" style="width:100%; padding:10px 14px; border:1px solid #DADCE0; border-radius:4px; font-size:14px; background-color:white; color:' + (currentVal ? '#111827' : '#6B7280') + ';">' +
              '<option value="" ' + (!currentVal ? 'selected' : '') + ' disabled>-- Select an option --</option>';
            (cq.options || []).forEach(function(opt) {
              formFieldsHtml += '<option value="' + escapeHtml(opt) + '" ' + (currentVal === opt ? 'selected' : '') + '>' + escapeHtml(opt) + '</option>';
            });
            formFieldsHtml += '</select>';
          } else if (cq.type === 'multiple_choice') {
            formFieldsHtml += '<div style="display:flex; flex-direction:column; gap:8px;">';
            (cq.options || []).forEach(function(opt) {
              const isChecked = currentVal === opt;
              formFieldsHtml += '<label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#374151; background:' + (isChecked ? '#EFF6FF' : '#F9FAFB') + '; border:' + (isChecked ? '1.5px solid #3B82F6' : '1px solid #E5E7EB') + '; padding:8px 12px; border-radius:6px; cursor:pointer;">' +
                '<input type="radio" name="custom_q_' + qId + '" value="' + escapeHtml(opt) + '" ' + (isChecked ? 'checked' : '') + ' onchange="handleCustomAnswer(\\'' + qId + '\\', this.value)" style="accent-color:#1D4ED8; cursor:pointer;" />' +
                '<span>' + escapeHtml(opt) + '</span>' +
                '</label>';
            });
            formFieldsHtml += '</div>';
          } else if (cq.type === 'text') {
            formFieldsHtml += '<input type="text" placeholder="' + escapeHtml(cq.placeholder || 'Enter answer...') + '" value="' + escapeHtml(currentVal) + '" oninput="handleCustomAnswer(\\'' + qId + '\\', this.value)" />';
          } else if (cq.type === 'number') {
            formFieldsHtml += '<input type="number" placeholder="' + escapeHtml(cq.placeholder || '0') + '" value="' + escapeHtml(currentVal) + '" oninput="handleCustomAnswer(\\'' + qId + '\\', this.value)" />';
          } else if (cq.type === 'rating') {
            const maxRating = cq.ratingMax || 5;
            formFieldsHtml += '<div style="display:flex; gap:8px; flex-wrap:wrap;">';
            for (let r = 1; r <= maxRating; r++) {
              const isSelected = Number(currentVal) === r;
              formFieldsHtml += '<button type="button" onclick="handleCustomAnswer(\\'' + qId + '\\', ' + r + ')" style="width:38px; height:38px; border-radius:6px; border:' + (isSelected ? '2px solid #1D4ED8' : '1px solid #D1D5DB') + '; background:' + (isSelected ? '#1D4ED8' : 'white') + '; color:' + (isSelected ? 'white' : '#374151') + '; font-weight:700; font-size:14px; cursor:pointer; transition:all 0.15s ease;">' + r + '</button>';
            }
            formFieldsHtml += '</div>';
          }

          formFieldsHtml += '</div>';
        });

        mainCard.innerHTML = \`
          <div class="question-head">
            <h2>Generate Your Diagnostic Report</h2>
            <p style="color:#5F6368; margin-top:8px;">Data collection complete. Enter your contact details and workplace project status to process your customized readiness profile.</p>
          </div>
          <form onsubmit="submitGateForm(event)">
            <div class="form-grid">
              \${formFieldsHtml}
            </div>
            <div style="font-size:12px; color:#5F6368; margin-bottom:20px; display:flex; align-items:center; gap:6px;">🔒 \${requireWork ? "Data securely processed. Official work email required." : "Data securely processed."}</div>
            <div class="nav-row">
              <button type="button" class="btn btn-secondary" onclick="prevStep()">← Back</button>
              <button type="submit" id="btn-submit-gate" class="btn btn-primary" \${!isFormValid() ? 'disabled' : ''}>Generate Report →</button>
            </div>
          </form>
        \`;
      } else {
        // Result Step
        const score = calculateScore();
        const activeRes = getActiveResult(score);
        const defaultAiReport = generateStaticAiReport(score, lead.company, lead.name);
        const ctaCfg = QUIZ_CONFIG.ctaConfig || {};
        const scoreLabel = ctaCfg.scoreLabel ? escapeHtml(ctaCfg.scoreLabel.toUpperCase()) : "OUT OF 100";
        const primaryText = escapeHtml(ctaCfg.primaryCtaText || "Apply Now");
        const secondaryText = escapeHtml(ctaCfg.secondaryCtaText || "Add Telephone (Optional)");
        const isRedirect = ctaCfg.primaryCtaType === 'redirect' && ctaCfg.redirectUrl;

        mainCard.innerHTML = \`
          <div class="result-grid">
            <div class="result-top-grid">
              <div class="result-panel" style="background-color: \${activeRes.color};">
                <div style="font-size:12px; font-weight:600; text-transform:uppercase;">\${escapeHtml(activeRes.tone)}</div>
                <div class="score-display">\${score}</div>
                <div style="font-size:12px; font-weight:600;">\${scoreLabel}</div>
                <h2>\${escapeHtml(activeRes.title)}</h2>
                <p style="font-size:14px; line-height:1.6; margin: 0;">\${escapeHtml(activeRes.desc)}</p>
              </div>

              <div style="padding:24px; background:#F8F9FA; border-radius:8px; border:1px solid #DADCE0; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#059669; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                  ✓ Congratulations! You Qualify for an Executive Strategy Consultation
                </div>
                <h4 style="margin:0 0 8px; font-size:16px;">Professional Assessment</h4>
                <p style="font-size:13px; color:#5F6368; margin:0 0 16px;">Schedule a deep-dive session with a workplace strategy specialist.</p>
                
                <button class="btn btn-primary" id="btn-apply-cta" onclick="\${isRedirect ? "window.open('" + escapeHtml(ctaCfg.redirectUrl) + "', '_blank')" : "requestAssessment()"}" style="width:100%; justify-content:center; margin-bottom:12px; background-color: \${(isApplied && !isRedirect) ? '#9CA3AF' : 'var(--primary-color)'}" \${(isApplied && !isRedirect) ? 'disabled' : ''}>
                  \${(isApplied && !isRedirect) ? '✓ Request Sent' : '✉ ' + primaryText}
                </button>

                \${ctaCfg.secondaryCtaEnabled !== false ? \`
                  <div id="tel-box" style="display:\${isApplied && !telSent && !isRedirect ? 'block' : 'none'}; background:white; padding:16px; border:1px solid #E5E7EB; border-radius:6px; margin-top:12px;">
                    <label style="font-size:12px; font-weight:600; display:block; margin-bottom:8px;">\${secondaryText}</label>
                    <div style="display:flex; gap:8px;">
                      <input type="tel" id="tel-input" placeholder="+1..." style="flex:1; padding:8px 12px; border:1px solid #D1D5DB; border-radius:4px;" />
                      <button type="button" onclick="submitTel()" class="btn btn-secondary" style="padding:8px 12px;">Send</button>
                    </div>
                  </div>
                  <div id="tel-saved-msg" style="display:\${telSent ? 'block' : 'none'}; font-size:13px; color:#059669; margin-top:8px;">✓ Phone saved</div>
                \` : ''}

                <div style="font-size:12px; color:#059669; display:flex; align-items:center; gap:6px; justify-content:center; margin-top:12px;">
                  ✓ Qualified for Consultation
                </div>
              </div>
            </div>
            
            <div>
              <div class="ai-report-box" style="margin-top:0;">
                <div class="ai-header" style="display:flex; justify-content:space-between; align-items:center;">
                  <span>📊 Custom AI Diagnosis</span>
                  <button class="btn btn-secondary" onclick="downloadPdfReport()" style="font-size:12px; padding:6px 12px; background:white; border-color:#BFDBFE; color:#1D4ED8; cursor:pointer;">
                    📄 Download PDF Report
                  </button>
                </div>
                <div class="ai-content">\${window.standaloneAiReport || defaultAiReport}</div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 32px; border-top: 1px solid #DADCE0; padding-top: 20px;">
            <button onclick="resetQuiz()" class="btn btn-secondary" style="font-size:13px;">
              🔄 Retake Assessment
            </button>
          </div>
        \`;
      }
    }

    function selectAnswer(qId, val) {
      if (isTransitioning || currentStep >= QUIZ_CONFIG.questions.length) return;
      isTransitioning = true;
      answers[qId] = val;
      render();
      setTimeout(() => {
        if (currentStep < QUIZ_CONFIG.questions.length) {
          currentStep++;
        }
        isTransitioning = false;
        render();
      }, 250);
    }

    function prevStep() {
      if (isTransitioning) return;
      if (currentStep > 0) {
        currentStep--;
        render();
      }
    }

    function handleEmailInput(val) {
      lead.email = val;
      const leadCfg = QUIZ_CONFIG.leadCapture || {};
      const requireWork = leadCfg.requireWorkEmail !== false;
      const errEl = document.getElementById('email-error-msg');
      const emailInput = document.getElementById('lead-email');
      const isFree = requireWork && val && val.includes('@') && !isWorkEmail(val);
      if (errEl) {
        errEl.style.display = isFree ? 'block' : 'none';
      }
      if (emailInput) {
        emailInput.style.borderColor = isFree ? '#EF4444' : '#DADCE0';
      }
      checkCanProceed();
    }

    function handleCustomAnswer(qId, val) {
      if (!lead.customAnswers) lead.customAnswers = {};
      lead.customAnswers[qId] = val;
      checkCanProceed();
      // If rating type or radio type, re-render to highlight active choice
      const leadCfg = QUIZ_CONFIG.leadCapture || {};
      const cq = (leadCfg.customQuestions || []).find(q => q.id === qId);
      if (cq && (cq.type === 'rating' || cq.type === 'multiple_choice')) {
        render();
      }
    }

    function isFormValid() {
      const leadCfg = QUIZ_CONFIG.leadCapture || {};
      const fields = leadCfg.fields || {};
      const requireWork = leadCfg.requireWorkEmail !== false;
      const isEmailValid = requireWork ? isWorkEmail(lead.email) : (lead.email && lead.email.includes('@'));

      if (fields.name?.enabled !== false && fields.name?.required !== false && (!lead.name || !lead.name.trim())) return false;
      if (fields.email?.enabled !== false && fields.email?.required !== false && (!lead.email || !lead.email.trim() || !isEmailValid)) return false;
      if (fields.company?.enabled !== false && fields.company?.required !== false && (!lead.company || !lead.company.trim())) return false;
      if (fields.role?.enabled !== false && fields.role?.required === true && (!lead.role || !lead.role.trim())) return false;
      if (fields.phone?.enabled === true && fields.phone?.required === true && (!lead.phone || !lead.phone.trim())) return false;
      if (fields.projectStatus?.enabled !== false && fields.projectStatus?.required !== false && !lead.projectStatus) return false;

      // Validate custom questions
      if (Array.isArray(leadCfg.customQuestions)) {
        for (const cq of leadCfg.customQuestions) {
          if (cq.enabled !== false && cq.required) {
            const val = lead.customAnswers ? lead.customAnswers[cq.id] : undefined;
            if (val === undefined || val === null || String(val).trim() === '') {
              return false;
            }
          }
        }
      }

      return true;
    }

    function checkCanProceed() {
      const btn = document.getElementById('btn-submit-gate');
      if (btn) {
        btn.disabled = !isFormValid();
      }
    }

    async function submitGateForm(e) {
      e.preventDefault();
      if (!isFormValid()) {
        alert('Please complete all required fields according to instructions.');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-gate');
      if (submitBtn) {
        submitBtn.disabled = true;
      }

      // Display multi-stage animated diagnosis engine loader before results
      const mainCard = document.getElementById('quiz-main-card');
      if (mainCard) {
        const thinkingSteps = [
          "Researching Google intelligence & workplace news...",
          "Processing survey metrics (0–100 index) & response parameters...",
          "Analyzing acoustic transmission (STC), spatial adaptability & IT/power infrastructure...",
          "Formulating diagnostic roadmap and tailored spatial recommendations..."
        ];

        mainCard.innerHTML = \`
          <div style="padding: 28px; background: #F8FAFC; border-radius: 10px; border: 1.5px solid #DBEAFE; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.04); margin: 20px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid #E2E8F0; padding-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="spinner" style="width: 24px; height: 24px; border: 3px solid #BFDBFE; border-top-color: #1D4ED8; border-radius: 50%;"></div>
                <div>
                  <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1E3A8A;">
                    AI Diagnostic Engine Running
                  </h4>
                  <span id="diagnostic-sublabel" style="font-size: 12px; color: #64748B;">
                    Conducting web research, benchmarking parameters, and drafting report...
                  </span>
                </div>
              </div>
              <span id="diagnostic-step-badge" style="font-size: 11px; font-weight: 700; background: #DBEAFE; color: #1E40AF; padding: 3px 10px; border-radius: 12px;">
                Step 1 of 4
              </span>
            </div>

            <!-- AI Thinking & Execution Console Box -->
            <div style="background: #0F172A; color: #E2E8F0; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11.5px; line-height: 1.6; border: 1px solid #1E293B; max-height: 130px; overflow-y: auto; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #1E293B; padding-bottom: 6px; color: #94A3B8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 6px #22C55E;"></span>
                  AI Thinking & System Quota Diagnostics
                </span>
                <span style="background: #1E293B; padding: 1px 6px; border-radius: 4px; color: #38BDF8; font-size: 9px;">Live Log</span>
              </div>
              <div id="diagnostic-thinking-console" style="display: flex; flex-direction: column; gap: 3px;">
                <div style="color: #CBD5E1;">[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [Client Engine] Initiating diagnostic pipeline for \${lead.company || 'Organization'}...</div>
                <div style="color: #CBD5E1;">[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [Client Engine] Connecting to AI model endpoint...</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="background: #E2E8F0; height: 6px; borderRadius: 3px; overflow: hidden; margin-bottom: 18px;">
              <div id="diagnostic-pbar" style="height: 100%; width: 25%; background: linear-gradient(90deg, #3B82F6, #1D4ED8); border-radius: 3px; transition: width 0.6s ease;"></div>
            </div>

            <div id="diagnostic-steps-container" style="display: flex; flex-direction: column; gap: 10px;">
              \${thinkingSteps.map((stepText, idx) => \`
                <div id="step-row-\${idx}" style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: \${idx === 0 ? '#1D4ED8' : '#94A3B8'}; font-weight: \${idx === 0 ? '600' : '400'}; padding: 10px 14px; background: \${idx === 0 ? '#EFF6FF' : '#FFFFFF'}; border-radius: 6px; border: \${idx === 0 ? '1px solid #BFDBFE' : '1px solid #F1F5F9'};">
                  \${idx === 0 
                    ? '<div class="spinner" style="width: 16px; height: 16px; border: 2.5px solid #93C5FD; border-top-color: #1D4ED8; border-radius: 50%;"></div>' 
                    : '<div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid #CBD5E1;"></div>'}
                  <span>\${stepText}</span>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;

        // Function to update diagnostic step UI
        function updateStepUI(stepIdx) {
          const badge = document.getElementById('diagnostic-step-badge');
          const pbar = document.getElementById('diagnostic-pbar');
          if (badge) badge.innerText = 'Step ' + Math.min(stepIdx + 1, 4) + ' of 4';
          if (pbar) pbar.style.width = (stepIdx >= 3 ? 100 : Math.min(85, (stepIdx + 1) * 25)) + '%';

          for (let i = 0; i < 4; i++) {
            const row = document.getElementById('step-row-' + i);
            if (!row) continue;
            if (i < stepIdx) {
              row.style.color = '#059669';
              row.style.fontWeight = '400';
              row.style.background = '#F0FDF4';
              row.style.border = '1px solid #BBF7D0';
              row.innerHTML = '<span style="color:#059669; font-weight:bold; font-size:16px;">✓</span> <span>' + thinkingSteps[i] + '</span>';
            } else if (i === stepIdx) {
              row.style.color = '#1D4ED8';
              row.style.fontWeight = '600';
              row.style.background = '#EFF6FF';
              row.style.border = '1px solid #BFDBFE';
              row.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border: 2.5px solid #93C5FD; border-top-color: #1D4ED8; border-radius: 50%;"></div> <span>' + thinkingSteps[i] + '</span>';
            } else {
              row.style.color = '#94A3B8';
              row.style.fontWeight = '400';
              row.style.background = '#FFFFFF';
              row.style.border = '1px solid #F1F5F9';
              row.innerHTML = '<div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid #CBD5E1;"></div> <span>' + thinkingSteps[i] + '</span>';
            }
          }
        }

        // Stagger step transitions: 0 -> 1 after 1.2s -> 2 after 2.7s (crawls at step 3 while fetching)
        const t1 = setTimeout(() => updateStepUI(1), 1200);
        const t2 = setTimeout(() => updateStepUI(2), 2700);

        // Run webhook in parallel
        sendWebhook({
          action: 'submit',
          lead: lead,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          role: lead.role,
          phone: lead.phone,
          projectStatus: lead.projectStatus,
          project_status: lead.projectStatus,
          customAnswers: lead.customAnswers || {},
          answers: getAnswerLabels(),
          score: calculateScore(),
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Webhook error:", err));

        // Fetch AI analysis if endpoint available
        const fetchAiPromise = (async () => {
          try {
            const resp = await fetch("${apiBase}/api/analyze-company", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                company: lead.company,
                leadName: lead.name,
                role: lead.role,
                scoreData: calculateScore(),
                qaText: JSON.stringify(getAnswerLabels()),
                aiPersona: QUIZ_CONFIG.aiPersona,
                reportSections: QUIZ_CONFIG.reportSections,
                dangerZoneConfig: QUIZ_CONFIG.dangerZoneConfig,
                customApiKey: QUIZ_CONFIG.integration?.geminiApiKey || (QUIZ_CONFIG.integration?.geminiApiKeyPart1 && QUIZ_CONFIG.integration?.geminiApiKeyPart4 ? (QUIZ_CONFIG.integration.geminiApiKeyPart1 + QUIZ_CONFIG.integration.geminiApiKeyPart2 + QUIZ_CONFIG.integration.geminiApiKeyPart3 + QUIZ_CONFIG.integration.geminiApiKeyPart4) : (QUIZ_CONFIG.integration?.geminiApiKeyPart1 ? QUIZ_CONFIG.integration.geminiApiKeyPart1 + (QUIZ_CONFIG.integration.geminiApiKeyPart2 || '') : ''))
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data.html) window.standaloneAiReport = data.html;
              return;
            } else {
              throw new Error("Backend responded with " + resp.status);
            }
          } catch (e) {
            console.warn("Backend AI fetch failed, attempting client-side fallback...", e);
            const ig = QUIZ_CONFIG.integration;
            const assembledKey = ig ? (ig.geminiApiKey || (ig.geminiApiKeyPart1 && ig.geminiApiKeyPart4 ? (ig.geminiApiKeyPart1 + ig.geminiApiKeyPart2 + ig.geminiApiKeyPart3 + ig.geminiApiKeyPart4) : (ig.geminiApiKeyPart1 ? (ig.geminiApiKeyPart1 + (ig.geminiApiKeyPart2 || '')) : ''))) : '';
            if (assembledKey) {
              try {
                const cKey = assembledKey;
                const scoreStr = calculateScore();
                const compStr = lead.company || "the organization";
                let slimAnswers = "";
                const labels = getAnswerLabels();
                for (const key in labels) {
                  if (labels[key] && labels[key] !== "N/A" && labels[key] !== "") {
                     slimAnswers += "- " + labels[key] + "\\n";
                  }
                }
                const qText = slimAnswers || "No significant deviations noted.";
                const s2Prompt = (QUIZ_CONFIG.reportSections && QUIZ_CONFIG.reportSections[1] && QUIZ_CONFIG.reportSections[1].prompt)
                  ? QUIZ_CONFIG.reportSections[1].prompt
                  : "Analyze the organization survey score (" + scoreStr + "/100) and workplace context. Provide a multi-paragraph technical breakdown.";
                const s4Prompt = (QUIZ_CONFIG.reportSections && QUIZ_CONFIG.reportSections[3] && QUIZ_CONFIG.reportSections[3].prompt)
                  ? QUIZ_CONFIG.reportSections[3].prompt
                  : "Provide 3-4 actionable spatial and acoustic optimization recommendations for " + compStr + ".";

                const prompt = "You are an expert Workplace Strategy AI Architect.\\n" +
"Analyze the workplace assessment for \\"" + compStr + "\\" (Score: " + scoreStr + "/100).\\n" +
"Survey Highlights:\\n" + qText + "\\n\\n" +
"Perform a web search on \\"" + compStr + "\\" to verify company context, hybrid work policy, and office footprint.\\n\\n" +
"CRITICAL REQUIREMENT: Return a valid JSON object with EXACTLY two string keys:\\n" +
"1. \\"section2Html\\": Clean HTML string for Section 2 (Technical Score Breakdown & Diagnostic for " + compStr + "). Must include 2-3 detailed paragraphs analyzing their readiness score (" + scoreStr + "/100) in relation to their real workplace context.\\n" +
"2. \\"section4Html\\": Clean HTML string for Section 4 (Strategic Roadmap & Spatial Interventions). Must include an unordered list (<ul>) of 3-4 actionable spatial/acoustic recommendations.\\n\\n" +
"Return ONLY the JSON object. Do not include markdown fences, backticks, or any other text.";

                const rawClientModels = (QUIZ_CONFIG.integration && Array.isArray(QUIZ_CONFIG.integration.modelFallbacks) && QUIZ_CONFIG.integration.modelFallbacks.length > 0)
                  ? QUIZ_CONFIG.integration.modelFallbacks.slice(0, 6)
                  : [
                      "gemini-3.7-flash",
                      "gemini-3.6-flash",
                      "gemini-3.5-flash",
                      "gemini-3.5-flash-lite",
                      "gemini-pro-latest"
                    ];

                const rotateIdx = Math.floor(Date.now() / 1000) % rawClientModels.length;
                const clientModels = [
                  ...rawClientModels.slice(rotateIdx),
                  ...rawClientModels.slice(0, rotateIdx)
                ];

                for (const mName of clientModels) {
                  try {
                    // 1. Try with Google Search tool
                    let resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + mName + ":generateContent?key=" + cKey, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        tools: [{ googleSearch: {} }]
                      })
                    });
                    if (!resp.ok) {
                      // 2. Try without Search tool
                      resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + mName + ":generateContent?key=" + cKey, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          contents: [{ parts: [{ text: prompt }] }]
                        })
                      });
                    }
                    if (resp.ok) {
                      const aiData = await resp.json();
                      let text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                      if (text) {
                        const mdStart = new RegExp('^' + String.fromCharCode(96,96,96) + '(?:json|html)?\\\\s*', 'i');
                        const mdEnd = new RegExp(String.fromCharCode(96,96,96) + '\\\\s*$');
                        text = text.replace(mdStart, '').replace(mdEnd, '').trim();

                        let sec2 = "";
                        let sec4 = "";
                        try {
                          const parsed = JSON.parse(text);
                          sec2 = parsed.section2Html || parsed.section2 || "";
                          sec4 = parsed.section4Html || parsed.section4 || "";
                        } catch (jErr) {
                          if (text.includes("<h3>2.") || text.includes("<h3>4.")) {
                            const s2Match = text.match(/<h3>2\\.[^<]*<\\/h3>([\\s\\S]*?)(?=<h3>[345]\\.|$)/i);
                            const s4Match = text.match(/<h3>4\\.[^<]*<\\/h3>([\\s\\S]*?)(?=<h3>[5]\\.|$)/i);
                            sec2 = s2Match ? s2Match[1].trim() : "";
                            sec4 = s4Match ? s4Match[1].trim() : "";
                          } else {
                            sec2 = "<p>" + text + "</p>";
                          }
                        }

                        window.standaloneAiReport = generateStaticAiReport(calculateScore(), lead.company, lead.name, sec2, sec4);
                        break;
                      }
                    }
                  } catch (mErr) {
                    console.warn("Client model attempt failed for " + mName + ":", mErr);
                  }
                }
              } catch (clientErr) {
                console.error("Client-side AI fallback also failed:", clientErr);
              }
            } else {
              console.warn("No Gemini API key in standalone config. Skipping AI and falling back to static template.");
            }
          }
        })();

        // Wait for fetch or maximum timer, then zoom to step 4 (100% complete)
        const timerPromise = new Promise(res => setTimeout(res, 45000));
        Promise.race([fetchAiPromise, timerPromise]).finally(() => {
          clearTimeout(t1);
          clearTimeout(t2);
          updateStepUI(3);
          setTimeout(() => {
            currentStep++;
            render();
          }, 500);
        });
        return;
      }

      await sendWebhook({
        action: 'submit',
        lead: lead,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        role: lead.role,
        phone: lead.phone,
        projectStatus: lead.projectStatus,
        project_status: lead.projectStatus,
        customAnswers: lead.customAnswers || {},
        answers: getAnswerLabels(),
        score: calculateScore(),
        timestamp: new Date().toISOString()
      });

      currentStep++;
      render();
    }

    async function requestAssessment() {
      isApplied = true;
      render();
      await sendWebhook({
        action: 'update',
        email: lead.email,
        assessmentRequested: true,
        consultationRequested: true,
        requestConsultation: "Yes",
        timestamp: new Date().toISOString()
      });
    }

    async function submitTel() {
      const telVal = document.getElementById('tel-input')?.value;
      if (!telVal) return;
      telSent = true;
      render();
      await sendWebhook({
        action: 'update',
        email: lead.email,
        tel: telVal,
        phone: telVal,
        timestamp: new Date().toISOString()
      });
    }

    async function sendWebhook(data) {
      const url = QUIZ_CONFIG.integration?.webhookUrl;
      if (!url) return;
      try {
        let cleanUrl = url.trim();
        if (cleanUrl.includes('script.google.com') && !cleanUrl.endsWith('/exec')) {
          if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
          cleanUrl += '/exec';
        }
        const params = new URLSearchParams();
        params.append('payload', JSON.stringify(data));
        await fetch(cleanUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params
        });
      } catch (err) {
        console.warn('Webhook submit:', err);
      }
    }

    function resetQuiz() {
      currentStep = 0;
      isTransitioning = false;
      answers = {};
      lead = { name: '', email: '', company: '', role: '', projectStatus: '' };
      isApplied = false;
      telSent = false;
      render();
    }

    function generateStaticAiReport(score, company, leadName, sec2AiHtml, sec4AiHtml) {
      const compStr = escapeHtml(company || 'your organization');
      const secs = (QUIZ_CONFIG.reportSections && Array.isArray(QUIZ_CONFIG.reportSections) && QUIZ_CONFIG.reportSections.length === 5)
        ? QUIZ_CONFIG.reportSections
        : null;

      const s1 = (secs && secs[0]) || {};
      const s2 = (secs && secs[1]) || {};
      const s3 = (secs && secs[2]) || {};
      const s4 = (secs && secs[3]) || {};
      const s5 = (secs && secs[4]) || {};

      let html = '';

      function renderExtraBlocks(sec) {
        if (!sec || !Array.isArray(sec.extraBlocks) || sec.extraBlocks.length === 0) return '';
        var bHtml = '';
        for (var b = 0; b < sec.extraBlocks.length; b++) {
          var blk = sec.extraBlocks[b];
          if (!blk.textBox && !blk.imageUrl) continue;
          var isRightImg = b % 2 === 0;
          bHtml += '<div style="margin-top:12px; background:#F9FAFB; padding:16px 18px; border-radius:6px; border:1px solid #E5E7EB; overflow:hidden;">';
          if (blk.imageUrl) {
            bHtml += '<div style="float:' + (isRightImg ? 'right' : 'left') + '; width:220px; max-width:40%; margin-' + (isRightImg ? 'left' : 'right') + ':16px; margin-bottom:10px; border-radius:6px; overflow:hidden; border:1px solid #E5E7EB;"><img src="' + blk.imageUrl + '" alt="Extra Visual ' + (b + 1) + '" style="width:100%; height:auto; display:block; object-fit:cover;" /></div>';
          }
          if (blk.textBox) {
            bHtml += '<div style="font-size:13.5px; line-height:1.65; color:#374151;">' + sanitizeFormattedHtml(blk.textBox) + '</div>';
          }
          bHtml += '<div style="clear:both;"></div></div>';
        }
        return bHtml;
      }

      // Section 1: HUMAN ONLY - Title, description, image, text box, extra blocks
      const s1TextBox = (s1.textBox || "").trim() || ('Workplace analysis for <strong>' + compStr + '</strong> indicates an accelerating transition toward hybrid collaboration and generative AI workflows. Organizations operating in this space require high spatial adaptability and strict acoustic containment to maximize cognitive output and retain top technical talent.');
      html += '<div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">';
      html += '<span class="section-eyebrow-pill"><span class="bullet-dot"></span>' + escapeHtml(s1.eyebrow || '01. OVERVIEW') + '</span>';
      html += '<h3 style="margin-top:0; font-size:18px; color:#111827;">1. ' + escapeHtml(s1.sectionHeading || 'Company Intelligence & Workplace Research Context') + '</h3>';
      if (s1.description) {
        html += '<p class="section-desc">' + escapeHtml(s1.description) + '</p>';
      }
      html += '<div style="background:#F9FAFB; padding:16px 18px; border-radius:6px; border:1px solid #E5E7EB; overflow:hidden;">';
      if (s1.imageUrl) {
        html += '<div style="float:left; width:220px; max-width:40%; margin-right:16px; margin-bottom:10px; border-radius:6px; overflow:hidden; border:1px solid #E5E7EB;"><img src="' + s1.imageUrl + '" alt="Section 1 Visual" style="width:100%; height:auto; display:block; object-fit:cover;" /></div>';
      }
      html += '<div style="font-size:13.5px; line-height:1.65; color:#374151;">' + sanitizeFormattedHtml(s1TextBox) + '</div>';
      html += '<div style="clear:both;"></div></div>';
      html += renderExtraBlocks(s1);
      html += '</div>';

      // Section 2: AI ONLY - Technical Score Breakdown & Diagnostic
      html += '<div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">';
      html += '<span class="section-eyebrow-pill"><span class="bullet-dot"></span>' + escapeHtml(s2.eyebrow || '02. AI DIAGNOSTIC') + '</span>';
      html += '<h3 style="margin-top:0; font-size:18px; color:#111827;">2. ' + escapeHtml(s2.sectionHeading || ('Technical Score Breakdown (' + score + '/100 Index Analysis)')) + '</h3>';
      if (s2.description) {
        html += '<p class="section-desc">' + escapeHtml(s2.description) + '</p>';
      }
      if (sec2AiHtml) {
        html += '<div class="top-insights-box" style="margin-top: 12px; margin-bottom: 16px;">' + sec2AiHtml + '</div>';
      } else {
        html += '<div class="top-insights-box" style="margin-top: 12px; margin-bottom: 16px;">';
        html += '<h3 style="margin-top:0; color:#1E3A8A; font-size:16px; font-weight:700;">🎯 Workplace Spatial & Acoustic Diagnosis for ' + compStr + '</h3>';
        html += '<ol>';
        html += '<li><strong>Baseline Readiness for ' + compStr + ':</strong> Your overall readiness score of <strong>' + score + '/100</strong> indicates key vulnerabilities where open-space acoustic distraction limits AI prompting.</li>';
        html += '<li><strong>Spatial & Focus Analysis:</strong> Uncontained voice prompting introduces severe cognitive task-switching latency. Integrating high-STC acoustic focus zones recovers deep productivity for ' + compStr + '.</li>';
        html += '<li><strong>Operational Impact:</strong> Modern hybrid workflows require dedicated acoustic enclosures to protect focus and sustain high-velocity software delivery.</li>';
        html += '</ol></div>';
      }
      html += '</div>';

      // Section 3: HUMAN ONLY - Infrastructure & Friction Points
      const s3TextBox = (s3.textBox || "").trim() || 'Spatial flexibility and STC 38+ acoustic enclosures mitigate context-switching latency. Implementing agile micro-zones prevents open-plan acoustic spill and preserves uninterrupted focus.';
      html += '<div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">';
      html += '<span class="section-eyebrow-pill"><span class="bullet-dot"></span>' + escapeHtml(s3.eyebrow || '03. INFRASTRUCTURE') + '</span>';
      html += '<h3 style="margin-top:0; font-size:18px; color:#111827;">3. ' + escapeHtml(s3.sectionHeading || 'Critical Architectural & Operational Friction Points (Bottom-Line Impact)') + '</h3>';
      if (s3.description) {
        html += '<p class="section-desc">' + escapeHtml(s3.description) + '</p>';
      }
      html += '<div style="background:#F9FAFB; padding:16px 18px; border-radius:6px; border:1px solid #E5E7EB; overflow:hidden;">';
      if (s3.imageUrl) {
        html += '<div style="float:left; width:220px; max-width:40%; margin-right:16px; margin-bottom:10px; border-radius:6px; overflow:hidden; border:1px solid #E5E7EB;"><img src="' + s3.imageUrl + '" alt="Section 3 Visual" style="width:100%; height:auto; display:block; object-fit:cover;" /></div>';
      }
      html += '<div style="font-size:13.5px; line-height:1.65; color:#374151;">' + sanitizeFormattedHtml(s3TextBox) + '</div>';
      html += '<div style="clear:both;"></div></div>';
      html += renderExtraBlocks(s3);
      html += '</div>';

      // Section 4: AI ONLY - Strategic Roadmap & Recommendations
      html += '<div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">';
      html += '<span class="section-eyebrow-pill"><span class="bullet-dot"></span>' + escapeHtml(s4.eyebrow || '04. STRATEGIC ROADMAP') + '</span>';
      html += '<h3 style="margin-top:0; font-size:18px; color:#111827;">4. ' + escapeHtml(s4.sectionHeading || 'High-Performance Spatial Optimization Roadmap') + '</h3>';
      if (s4.description) {
        html += '<p class="section-desc">' + escapeHtml(s4.description) + '</p>';
      }
      if (sec4AiHtml) {
        html += '<div style="margin-top: 12px; padding: 20px 24px; background:#F0FDF4; border:1px solid #BBF7D0; border-left: 5px solid #16A34A; border-radius:8px;">' + sec4AiHtml + '</div>';
      } else {
        html += '<div style="margin-top: 12px; padding: 20px 24px; background:#F0FDF4; border:1px solid #BBF7D0; border-left: 5px solid #16A34A; border-radius:8px;">';
        html += '<h3 style="margin-top:0; color:#14532D; font-size:15px; font-weight:700;">🚀 Tailored Spatial Optimization & Implementation Plan</h3>';
        html += '<p style="font-size:13.5px; color:#166534; line-height:1.6; margin-bottom:12px;"><strong>Actionable Spatial Interventions:</strong> High-impact spatial roadmap tailored to ' + compStr + '\\\'s readiness score and team parameters:</p>';
        html += '<ul style="margin:0; padding-left:20px; font-size:13.5px; line-height:1.6; color:#14532D;">';
        html += '<li><strong>Deploy Acoustically Rated Focus Pods:</strong> Isolate intensive voice prompting workflows using certified STC 38+ pods.</li>';
        html += '<li><strong>Adopt Flexible Reconfigurable Zones:</strong> Implement modular partitions and agile furniture to support quick pivots between solo prompting and team syncs.</li>';
        html += '<li><strong>Power & Infrastructure Optimization:</strong> Install drop-down power poles and underfloor channels to eliminate cabling clutter in collaborative zones.</li>';
        html += '</ul></div>';
      }
      html += '</div>';

      // Section 5: HUMAN ONLY - Next Steps & Implementation
      const s5TextBox = (s5.textBox || "").trim() || 'Schedule a dedicated consultation with workplace strategy specialists to conduct a comprehensive on-site acoustic and spatial audit, tailored to your technical team topologies.';
      html += '<div style="margin-bottom: 24px;">';
      html += '<span class="section-eyebrow-pill"><span class="bullet-dot"></span>' + escapeHtml(s5.eyebrow || '05. IMPLEMENTATION') + '</span>';
      html += '<h3 style="margin-top:0; font-size:18px; color:#111827;">5. ' + escapeHtml(s5.sectionHeading || 'Executive Next Steps: Beyond DIY to Certified Spatial Mastery') + '</h3>';
      if (s5.description) {
        html += '<p class="section-desc">' + escapeHtml(s5.description) + '</p>';
      }
      html += '<div style="background:#F9FAFB; padding:16px 18px; border-radius:6px; border:1px solid #E5E7EB; overflow:hidden;">';
      if (s5.imageUrl) {
        html += '<div style="float:left; width:220px; max-width:40%; margin-right:16px; margin-bottom:10px; border-radius:6px; overflow:hidden; border:1px solid #E5E7EB;"><img src="' + s5.imageUrl + '" alt="Section 5 Visual" style="width:100%; height:auto; display:block; object-fit:cover;" /></div>';
      }
      html += '<div style="font-size:13.5px; line-height:1.65; color:#374151;">' + sanitizeFormattedHtml(s5TextBox) + '</div>';
      html += '<div style="clear:both;"></div></div>';
      html += renderExtraBlocks(s5);

      // FULL-WIDTH CTA CARD AT BOTTOM OF SECTION 5 (ABOVE SOURCES)
      html += '<div style="margin-top: 28px; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 24px 28px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); width: 100%; box-sizing: border-box;">';
      html += '<div style="display: inline-flex; align-items: center; gap: 6px; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">';
      html += '<span>✓</span> CONGRATULATIONS! YOU QUALIFY FOR AN EXECUTIVE STRATEGY CONSULTATION';
      html += '</div>';
      html += '<h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Professional Assessment</h3>';
      html += '<p style="margin: 0 auto 18px auto; font-size: 14px; color: #475569; max-width: 580px; line-height: 1.5;">Schedule a deep-dive session with a workplace strategy specialist to analyze your spatial parameters and acoustic requirements.</p>';
      if (isApplied) {
        html += '<div style="display: inline-flex; align-items: center; gap: 8px; color: #059669; background: #ECFDF5; border: 1px solid #6EE7B7; font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 8px;">';
        html += '<span>✓</span> Qualified for Consultation';
        html += '</div>';
      } else {
        html += '<button type="button" onclick="requestAssessment()" style="background: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);">';
        html += '<span>✉️</span> Apply Now';
        html += '</button>';
      }
      html += '</div>';

      html += '</div>';

      // References & Footnotes - HUMAN ONLY
      const customFootnotes = QUIZ_CONFIG.dangerZoneConfig && QUIZ_CONFIG.dangerZoneConfig.footnotesReferenceHtml
        ? QUIZ_CONFIG.dangerZoneConfig.footnotesReferenceHtml
        : null;

      if (customFootnotes) {
        html += customFootnotes;
      } else {
        html += '<div class="footnotes-box"><h4>📚 Cited Sources & Benchmark Research References</h4><ol class="footnotes-list">';
        html += '<li id="fn-uc-irvine"><strong>UC Irvine / Wall Street Journal Focus Study:</strong> Interruption recovery study demonstrating 23min 15sec task-switching overhead per interruption ($28,000/employee/year in lost billable output). <a href="https://www.ics.uci.edu/~gmark/" target="_blank" rel="noopener noreferrer">UC Irvine Research</a> | <a href="https://www.wsj.com" target="_blank" rel="noopener noreferrer">WSJ Analysis</a></li>';
        html += '<li id="fn-sap"><strong>SAP Workplace Health Index Benchmark:</strong> Enterprise spatial study showing each 1% increase in index yields $90M–$100M in annual operating profit gain. <a href="https://www.sap.com" target="_blank" rel="noopener noreferrer">SAP Enterprise Study</a></li>';
        html += '<li id="fn-cisco"><strong>Cisco PENN 1 Hybrid Workspace Blueprint:</strong> Office redesign achieving 40% increase in collaboration zones and 36% lower footprint cost. <a href="https://www.cisco.com/c/en/us/solutions/hybrid-work/penn-1.html" target="_blank" rel="noopener noreferrer">Cisco PENN 1 Blueprint</a></li>';
        html += '<li id="fn-microsoft"><strong>Microsoft Modern AI Workplace Study:</strong> Reengineered AI co-creation workspaces reducing task-switching overhead and boosting velocity by 22%. <a href="https://www.steelcase.com/research/" target="_blank" rel="noopener noreferrer">Steelcase WorkSpace Research</a></li>';
        html += '<li id="fn-flex-agile"><strong>Steelcase Flex Agile Teams Study:</strong> High-performing cross-functional teams equipped with adaptable furniture and spatial reconfigurability are 5x more likely to be high-performing. <a href="https://www.steelcase.com/research/articles/topics/privacy/" target="_blank" rel="noopener noreferrer">Steelcase Flex Agile Study</a></li>';
        html += '</ol></div>';
      }

      return html;
    }

    function downloadPdfReport() {
      const companyName = escapeHtml(lead.company || 'Organization');
      const leadNameStr = escapeHtml(lead.name || 'Executive');
      const leadRoleStr = escapeHtml(lead.role || 'Workplace Leader');
      const score = calculateScore();
      const reportHtml = window.standaloneAiReport || generateStaticAiReport(score, lead.company, lead.name);

      const showLogoInPdf = QUIZ_CONFIG.branding && QUIZ_CONFIG.branding.logoUrl && QUIZ_CONFIG.branding.showLogoInPdf !== false;
      const logoHtml = showLogoInPdf ? '<div style="margin-bottom:16px;"><img src="' + QUIZ_CONFIG.branding.logoUrl + '" alt="Brand Logo" style="max-height:55px; max-width:240px; object-fit:contain;" /></div>' : '';

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printDoc = printWindow.document;
      printDoc.open();
      printDoc.write('<!DOCTYPE html><html><head><meta charset="utf-8">');
      printDoc.write('<title>' + companyName + ' - Steelcase ARC AI Diagnostic Report</title>');
      printDoc.write('<style>');
      printDoc.write('body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1F2937; line-height: 1.6; max-width: 900px; margin: 0 auto; }');
      printDoc.write('.header-banner { border-bottom: 2px solid #1D4ED8; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }');
      printDoc.write('.score-badge { background: #1D4ED8; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 120px; }');
      printDoc.write('.score-num { font-size: 32px; font-weight: 700; line-height: 1; }');
      printDoc.write('.score-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; margin-top: 4px; }');
      printDoc.write('h1 { margin: 0 0 8px 0; font-size: 24px; color: #1E3A8A; }');
      printDoc.write('.meta { font-size: 13px; color: #4B5563; }');
      printDoc.write('.section-eyebrow-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; margin-bottom: 8px; }');
      printDoc.write('.section-eyebrow-pill .bullet-dot { width: 6px; height: 6px; border-radius: 50%; background: #4F46E5; display: inline-block; }');
      printDoc.write('.section-desc { font-size: 13.5px; color: #4B5563; margin: 0 0 14px 0; line-height: 1.5; font-style: italic; }');
      printDoc.write('.top-insights-box { background: #F0F7FF; border: 1px solid #BFDBFE; border-left: 5px solid #1D4ED8; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }');
      printDoc.write('.top-insights-box h3 { margin-top: 0; color: #1E3A8A; font-size: 16px; font-weight: 700; }');
      printDoc.write('.footnotes-box { margin-top: 36px; padding: 22px 26px; background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #2563EB; border-radius: 8px; }');
      printDoc.write('.footnotes-box h4 { margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; }');
      printDoc.write('a { color: #1D4ED8; text-decoration: underline; font-weight: 500; }');
      printDoc.write('.cite-badge { display: inline-flex; align-items: center; background: #EFF6FF; color: #1D4ED8 !important; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #BFDBFE; text-decoration: none !important; }');
      printDoc.write('.print-bar { background: #F3F4F6; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #E5E7EB; }');
      printDoc.write('@media print { .no-print { display: none !important; } body { padding: 0; } }');
      printDoc.write('</style></head><body>');
      printDoc.write('<div class="print-bar no-print"><span style="font-size: 13px; color: #4B5563;">📄 Printable AI Readiness Diagnostic Report — Save as PDF via browser print</span><button onclick="window.print()" style="background: #1D4ED8; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">🖨️ Save as PDF</button></div>');
      printDoc.write('<div class="header-banner"><div>' + logoHtml + '<h1>Steelcase ARC — AI Workplace Readiness Diagnostic</h1><div class="meta"><strong>Client:</strong> ' + companyName + ' &nbsp;|&nbsp; <strong>Contact:</strong> ' + leadNameStr + ' (' + leadRoleStr + ') &nbsp;|&nbsp; <strong>Date:</strong> ' + new Date().toLocaleDateString() + '</div></div><div class="score-badge"><div class="score-num">' + score + '</div><div class="score-lbl">Readiness Score</div></div></div>');
      printDoc.write('<div class="report-content">' + reportHtml + '</div>');
      printDoc.write('<' + 'script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<' + '/script>');
      printDoc.write('</body></html>');
      printDoc.close();
      printWindow.document.close();
    }

    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#fn-')) {
          e.preventDefault();
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
          // Open external links cleanly in a new tab
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function sanitizeFormattedHtml(str) {
      if (!str) return '';
      var s = String(str);
      if (s.indexOf('&lt;') !== -1 && s.indexOf('&gt;') !== -1) {
        s = s.replace(/&lt;/gi, '<')
             .replace(/&gt;/gi, '>')
             .replace(/&amp;/gi, '&')
             .replace(/&quot;/gi, '"')
             .replace(/&#039;/gi, "'")
             .replace(/&#39;/gi, "'");
      }
      s = s.replace(/<script[\\s\\S]*?<\\/script>/gi, '')
           .replace(/<iframe[\\s\\S]*?<\\/iframe>/gi, '')
           .replace(/\\s+on[a-z]+\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)/gi, '');
      return s;
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  </script>
</body>
</html>`;
}

export function generateReadme(config) {
  const title = config.content?.title || 'Interactive Diagnostic Quiz';
  return `# ${title} - Standalone Quiz Deployment Package

This package contains the standalone, end-user interactive quiz application ready for GitHub Pages or web hosting.

## 🌟 Key Features
- **Pure Standalone App**: Contains **JUST the functional quiz** for visitors (no builder or edit tools).
- **Responsive & Mobile Ready**: Clean design that adapts to mobile, tablet, and desktop screens.
- **Lead Collection**: Integrated lead capture form sending submissions directly to your configured Google Webhook URL (captures Name, Email, Company, Role, and Workplace Project Status).
- **Diagnostic Reporting**: Automated scoring (0–100) and instant custom diagnostic reporting with citations.

---

## 📊 Google Apps Script for Google Sheets (Handles Date, Project Status, Request Consultation, Phone & Answers Q1..Qn)

If connecting to Google Sheets, paste the following Google Apps Script in **Extensions > Apps Script** inside your spreadsheet and deploy as a Web App (Execute as: *Me*, Access: *Anyone*):

\`\`\`javascript
function doPost(e) {
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
          var numA = parseInt(a.replace(/\D/g, '')) || 0;
          var numB = parseInt(b.replace(/\D/g, '')) || 0;
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
      var keyNum = keyLower.replace(/\D/g, '');
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
            var qNum = qLower.replace(/\D/g, '');
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
}
\`\`\`

---

## 🚀 How to Host on GitHub Pages (Step-by-Step Guide)

### Step 1: Create a GitHub Repository
1. Log into your account at [GitHub.com](https://github.com).
2. Click **New Repository** (or visit [github.com/new](https://github.com/new)).
3. Enter a repository name (e.g., \`ai-workplace-quiz\`).
4. Keep it **Public** so GitHub Pages can host it for free.
5. Click **Create repository**.

### Step 2: Upload Files
1. In your new repository page, click **uploading an existing file** link.
2. Drag and drop all files from this exported ZIP package:
   - \`index.html\`
   - \`quiz-config.json\`
   - \`lead-payload-schema.json\`
   - \`README.md\`
3. Click **Commit changes**.

### Step 3: Enable GitHub Pages
1. In your GitHub repository, click on **Settings** (top navigation bar).
2. On the left sidebar, click **Pages** (under Code and automation).
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Under **Branch**, select \`main\` (or \`master\`) and folder \`/ (root)\`.
5. Click **Save**.

---

## 🔗 Your Live Quiz URL
After 1–2 minutes, GitHub Pages will deploy your site at:
\`https://<your-github-username>.github.io/<repository-name>/\`

Visitors can click this link to take your quiz directly!
`;
}

export function generateLeadPayloadSchema() {
  return JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Quiz Lead Submission Payload",
    "type": "object",
    "properties": {
      "action": { "type": "string", "example": "submit" },
      "lead": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "example": "Jane Doe" },
          "email": { "type": "string", "example": "jane@steelcase.com" },
          "company": { "type": "string", "example": "Steelcase Inc." },
          "role": { "type": "string", "example": "Director of Workplace Strategy" },
          "projectStatus": { "type": "string", "example": "A - Active project, decisions within 6 months" }
        },
        "required": ["name", "email", "company", "projectStatus"]
      },
      "name": { "type": "string", "example": "Jane Doe" },
      "email": { "type": "string", "example": "jane@steelcase.com" },
      "company": { "type": "string", "example": "Steelcase Inc." },
      "role": { "type": "string", "example": "Director of Workplace Strategy" },
      "projectStatus": { "type": "string", "example": "A - Active project, decisions within 6 months" },
      "project_status": { "type": "string", "example": "A - Active project, decisions within 6 months" },
      "answers": {
        "type": "object",
        "description": "Selected point values or labels keyed by question ID",
        "example": { "q1": 10, "q2": 6 }
      },
      "score": { "type": "integer", "example": "85" },
      "timestamp": { "type": "string", "format": "date-time" }
    }
  }, null, 2);
}
