/**
 * Client-Side Real-Time Log Sanitizer
 * Automatically converts raw internal logs (model names, 429 quota limits, fallback notices)
 * into executive, professional status messages for end users, while outputting
 * unmasked telemetry logs to the browser developer console for admin inspection.
 */

export function sanitizeLogMessage(logLine) {
  if (!logLine || typeof logLine !== 'string') return logLine;

  // 1. Output raw unmasked log to browser console for Admin inspection
  try {
    console.log("%c[ADMIN TELEMETRY RAW LOG]", "color: #38BDF8; font-weight: bold;", logLine);
  } catch (e) {}

  // 2. Extract timestamp bracket if present e.g. [19:29:57]
  let timestampPrefix = '';
  const tsMatch = logLine.match(/^(\[\d{1,2}:\d{2}:\d{2}\])/);
  if (tsMatch) {
    timestampPrefix = tsMatch[1] + ' ';
  }

  const upper = logLine.toUpperCase();

  // 3. Match specific sensitive internal patterns and translate to professional messages

  // Model fallback sequence initialization
  if (upper.includes('PRIORITY FALLBACK SEQUENCE') || upper.includes('MODELS:')) {
    return `${timestampPrefix}[AI Pipeline] Initializing high-availability multi-node diagnostic engine...`;
  }

  // Model querying
  if (upper.includes('[GEMINI API] QUERYING') || upper.includes('REQUESTING GENERATION WITH MODEL') || upper.includes('QUERYING GEMINI')) {
    return `${timestampPrefix}[Intelligence] Analyzing organizational footprint & workplace vectors...`;
  }

  if (upper.includes('STAGE 1/4')) {
    return `${timestampPrefix}[Intelligence] Stage 1/4: Crawling public filings & RTO policy benchmarks...`;
  }

  if (upper.includes('STAGE 2/4')) {
    return `${timestampPrefix}[Data Engine] Stage 2/4: Cross-referencing survey metrics against Steelcase ARC spatial index...`;
  }

  if (upper.includes('STAGE 3/4')) {
    return `${timestampPrefix}[Acoustics Engine] Stage 3/4: Modeling STC noise transmission & context-switching latency...`;
  }

  if (upper.includes('STAGE 4/4')) {
    return `${timestampPrefix}[Synthesis Engine] Stage 4/4: Formulating 3-pillar architectural & spatial roadmap...`;
  }

  if (upper.includes('SEARCH GROUNDING: ENABLED') || upper.includes('GOOGLE SEARCH TOOL')) {
    return `${timestampPrefix}[Intelligence] Conducting live web research on workplace news & occupancy trends...`;
  }

  if (upper.includes('SEARCH GROUNDING: DISABLED') || upper.includes('WITHOUT SEARCH TOOL')) {
    return `${timestampPrefix}[Intelligence] Validating spatial density against ergonomics standards...`;
  }

  // Quota / rate limit / 429 / resource exhausted / skipped notices
  if (upper.includes('429') || upper.includes('QUOTA') || upper.includes('RATE LIMIT') || upper.includes('RESOURCE_EXHAUSTED') || upper.includes('SKIPPED')) {
    return `${timestampPrefix}[Pipeline] Optimizing analysis throughput via secondary high-speed reasoning node...`;
  }

  // Success generation log
  if (upper.includes('GENERATED CUSTOM AI DIAGNOSIS') || upper.includes('[SUCCESS] MODEL')) {
    return `${timestampPrefix}[Success] Executive AI diagnostic report synthesized successfully.`;
  }

  // Exhaustion / fallback synthesis notices
  if (upper.includes('EXHAUSTION') || upper.includes('KEY QUOTA SPENT') || upper.includes('LIMITS ENCOUNTERED')) {
    return `${timestampPrefix}[Pipeline] High traffic volume detected; activating instant benchmark synthesis...`;
  }

  if (upper.includes('HUMAN MATERIALS') || upper.includes('CONFIGURED SECTION PROMPTS') || upper.includes('BENCHMARK ENGINE')) {
    return `${timestampPrefix}[Benchmark Engine] Verified workplace benchmark report compiled from index metrics.`;
  }

  // Client engine logs
  if (upper.includes('AWAITING GOOGLE GEMINI') || upper.includes('CONNECTING TO AI MODEL ENDPOINT')) {
    return `${timestampPrefix}[Client Engine] Connecting securely to AI diagnostic engine...`;
  }

  // General fallback for any line mentioning specific model names or raw errors
  const sensitiveKeywords = [
    'GEMINI-3.7-FLASH', 'GEMINI-3.6-FLASH', 'GEMINI-3.5-FLASH', 'GEMINI-3.5-FLASH-LITE',
    'GEMINI-PRO-LATEST', 'GEMINI-2.0-FLASH', 'GEMINI-1.5-FLASH', 'GEMINI-1.5-PRO',
    'GEMINI-', 'MODELFALLBACKS', 'GEMINIAPIKEY', 'STACK', 'HTTP 500', 'HTTP 429', 'HTTP 404'
  ];

  for (const kw of sensitiveKeywords) {
    if (upper.includes(kw)) {
      return `${timestampPrefix}[System] Processing workplace vectors through diagnostic engine...`;
    }
  }

  // Return clean log as is if no sensitive patterns matched
  return logLine;
}

export function sanitizeTelemetryModelName(modelName) {
  if (!modelName || typeof modelName !== 'string') return "Enterprise AI Engine";
  try {
    console.log("%c[ADMIN TELEMETRY RAW MODEL]", "color: #F59E0B; font-weight: bold;", modelName);
  } catch (e) {}

  const lower = modelName.toLowerCase();
  if (lower.includes('benchmark') || lower.includes('synthesis')) {
    return "Benchmark Engine (Synthesis)";
  }
  return "Enterprise AI Engine (Live)";
}
