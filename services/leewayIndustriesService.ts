import { answerWithEvidence, docStore } from "../Models/agentlee-local-bundle.js";
import { SlideDefinition, UserRole } from "../types";
import { buildAgentLeeCorePrompt } from "./agentlee-core/AgentLeeCore";
import {
    runBrainModel,
    runCompanionModel,
    runPlannerModel,
    runVoiceStyler,
    warmUpModelGroup,
    runSingleModelAnswer,
} from "./localModelHub";

/**
 * Agent response shape used throughout the app.
 */
interface AgentResponse {
  text: string;
  navigationTarget?: string;
}

const readAllowLocalNarrationPreference = (): boolean => {
  try {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (typeof win.ALLOW_LOCAL_NARRATION === 'boolean') return win.ALLOW_LOCAL_NARRATION;
      const stored = window.localStorage?.getItem('agentlee_allow_local_narration');
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    }
  } catch {
    /* ignore */
  }

  const envAllow =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ALLOW_LOCAL_NARRATION) ??
    (typeof process !== 'undefined' && process.env?.VITE_ALLOW_LOCAL_NARRATION);

  if (typeof envAllow === 'string') {
    return envAllow === 'true';
  }

  return false;
};

export let ALLOW_LOCAL_NARRATION = readAllowLocalNarrationPreference();

export const setAllowLocalNarration = (allow: boolean) => {
  ALLOW_LOCAL_NARRATION = !!allow;
};

// ---------------------------------------------------------------------------
//  ORIGINAL DETERMINISTIC ENGINE (RESTORED AS FRONT-LAYER)
//  - Handles navigation (page/slide), map, financials, timeline, velocity,
//    evidence locker, AI/future, closing, and some FAQs.
//  - Always coherent and predictable.
// ---------------------------------------------------------------------------

const GENERIC_HELP_TEXT =
  "I am Agent Lee. I can navigate the presentation or clarify our data. You can ask me to 'Turn to Page 8', 'Show the Map', or 'Explain the Financials'.";

/**
 * Analyze input to find the best matching scripted response.
 * `slideContext` is typically `currentSlide.title`.
 */
const determineResponse = (query: string, slideContext?: string): AgentResponse => {
  const q = query.toLowerCase();

  // --- 0. Direct Page Navigation (Highest Priority) ---
  // Detects "Page 8", "Slide 5", "Turn to page 10", etc.
  const pageMatch = q.match(/(?:page|slide)\s+(\d+)/);
  if (pageMatch) {
    const pageNum = parseInt(pageMatch[1], 10);
    // We do not depend on SLIDES here to avoid extra imports; App will interpret the navigationTarget.
    if (pageNum >= 1) {
      return {
        text: `Certainly. Turning to Page ${pageNum}.`,
        navigationTarget: pageNum.toString()
      };
    } else {
      return {
        text: `I cannot turn to page ${pageNum} as that page is out of range for this presentation.`
      };
    }
  }

  // --- 1. Keyword Navigation Commands ---
  if (q.includes("map") || q.includes("acquisition") || q.includes("where")) {
    return {
      text: "Navigating to the National Platform Map. As you can see, we have expanded well beyond the Midwest into the Mid-Atlantic region with strategic hubs in Pennsylvania and New Jersey.",
      navigationTarget: "AcquisitionMap"
    };
  }
  if (q.includes("money") || q.includes("financial") || q.includes("revenue") || q.includes("ebitda")) {
    return {
      text: "Moving to the Financial Bridge. We are tracking from a $37M base towards a $70M target, driven by organic growth, tech uplift, and M&A.",
      navigationTarget: "Engineering Tomorrow"
    };
  }
  if (q.includes("timeline") || q.includes("history") || q.includes("growth") || q.includes("years")) {
    return {
      text: "Visualizing our 50-year trajectory. Notice the exponential curve starting in 2020 as we integrated AI and strategic capital.",
      navigationTarget: "Through the Tunnels"
    };
  }
  if (q.includes("velocity") || q.includes("crew") || q.includes("capacity")) {
    return {
      text: "Displaying our Operational Velocity. This chart projects our crew capacity growing through 2050 to meet national demand.",
      navigationTarget: "Masters of the Main"
    };
  }
  if (q.includes("evidence") || q.includes("source") || q.includes("verify") || q.includes("link")) {
    return {
      text: "Opening the Evidence Locker. Here you can verify every claim, download case studies, and review our acquisition announcements.",
      navigationTarget: "Evidence Locker"
    };
  }
  if (q.includes("future") || q.includes("evolution") || (q.includes("ai") && q.includes("intelligence"))) {
    return {
      text: "Revealing the Evolution of Intelligence. We are transitioning from a service provider to a predictive platform.",
      navigationTarget: "The Evolution of Intelligence"
    };
  }
  if (q.includes("close") || q.includes("end") || q.includes("thank")) {
    return {
      text: "Initiating closing sequence. Thank you for your partnership. We are ready to execute.",
      navigationTarget: "The Road Ahead"
    };
  }

  // --- 2. Data Queries (Context Aware) ---

  // Financials
  if (q.includes("how much") || q.includes("target") || q.includes("worth")) {
    return {
      text: "Our financial roadmap targets $70M in near-term revenue, building on our current $37M base operations with an additional $25M from strategic M&A."
    };
  }

  // Acquisitions
  if (q.includes("mor") || q.includes("sheridan") || q.includes("buy")) {
    return {
      text: "We successfully acquired MOR Construction to anchor our Mid-Atlantic operations and Sheridan Plumbing to deepen our Chicago footprint. Both are fully integrated."
    };
  }

  // AI / Tech
  if (q.includes("cloud") || q.includes("save") || q.includes("cost")) {
    return {
      text: "According to our verified case studies, AI-enabled workflows have delivered 75% cloud cost savings and reduced inspection review times by over 70%."
    };
  }

  // Safety
  if (q.includes("safe") || q.includes("risk") || q.includes("covenant")) {
    return {
      text: "Safety is paramount. Our 'Covenant' ensures we treat every line as if it were under our own home. We use cross-bore safety audits and predictive modeling to minimize risk."
    };
  }

  // --- 3. General Fallback ---
  if (slideContext) {
    return {
      text: `Regarding the current slide "${slideContext}": We are focused on maximizing asset value through trenchless innovation and verifiable data. I can provide specific figures if you ask about costs, capacity, or growth.`
    };
  }

  return { text: GENERIC_HELP_TEXT };
};

/**
 * Decide if the deterministic response is “specific enough” to use
 * without involving the LLM ensemble.
 */
const isDeterministicSpecific = (resp: AgentResponse): boolean => {
  if (!resp) return false;
  if (resp.navigationTarget) return true;
  return resp.text.trim() !== GENERIC_HELP_TEXT;
};

// ---------------------------------------------------------------------------
//  LOCAL ENSEMBLE SERVICE PIPELINE
// ---------------------------------------------------------------------------

/**
 * Agent status exposed via window.AGENT_STATUS for diagnostics.
 */
export let AGENT_STATUS: {
  initialized: boolean;
  online: boolean;
  model?: string | null;
  lastError?: string | null;
} = { initialized: false, online: false, model: null, lastError: null };

const BASE_DECK_PROMPT = buildAgentLeeCorePrompt();
let localModelsReady = false;

// Minimal, legacy-compat wrapper (kept for structure; main work now is done in sendMessageToAgentLee)
let chatSession: any | null = null;
let initializationPromise: Promise<any> | null = null;

const ensureLocalModelsReady = async () => {
  if (localModelsReady) return;
  try {
    await warmUpModelGroup();
    localModelsReady = true;
  } catch (err) {
    console.warn('[LeewayIndustriesService] warmUpModelGroup failed', err);
  }
};

// Generate a simplified system instruction (used only as conceptual context)
const SYSTEM_INSTRUCTION = `You are Agent Lee, an expert data analyst and strategic advisor for sewer infrastructure projects.

You have access to comprehensive knowledge about sewer systems, CCTV inspections, project costs, bidding processes, and construction data.

Provide clear, concise, and actionable answers based on the available data and your expertise. Focus on practical insights and recommendations.`;

/**
 * Return a short knowledge snippet matching `query`.
 * Exposed so UI components or devtools can fetch contextual facts on demand.
 */
export const getKnowledgeSnippet = (query: string, maxResults = 8): string => {
  // Simplified version - knowledge base functionality moved to agentTeam
  return `Knowledge base query: "${query}". Agent Lee has access to comprehensive sewer infrastructure data including CCTV inspections, project costs, bidding processes, and construction data.`;
};

export const initChatSession = (role: UserRole) => {
  // Avoid duplicate initializations
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    await ensureLocalModelsReady();
    AGENT_STATUS.initialized = true;
    AGENT_STATUS.online = true;
    AGENT_STATUS.model = 'local-model-hub';
    AGENT_STATUS.lastError = null;

    chatSession = {
      sendMessage: async ({ message }: { message: string }) => {
        try {
          return await sendMessageToAgentLee(message);
        } catch (err: any) {
          console.error('Agent Lee local hub error:', err);
          AGENT_STATUS.lastError = (err && err.message) ? err.message : String(err);
          return { text: "Agent Lee is offline. Local model hub error occurred." };
        }
      }
    };
    return chatSession;
  })();
  return initializationPromise;
};

export function isGarbled(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  const words = text.split(/\s+/).filter(Boolean);
  // Allow short greetings or short confirmations (e.g., 'hello', 'hi', 'thanks')
  const shortGreetingRegex = /^(hi|hello|hey|thanks?|thanks\s+for)/i;
  if (words.length <= 3 && shortGreetingRegex.test(text.trim())) return false;
  // If AgentTeam produced a local evidence summary, treat it as OK
  if (text.trim().startsWith('LOCAL_EVIDENCE_SUMMARY:')) return false;
  if (words.length < 5) return true;
  // Detect outputs that are mostly single letters or letter-by-letter spacing (e.g., "A g e n t")
  const spacedLettersPattern = /\b(?:[A-Za-z]\s+){5,}[A-Za-z]\b/;
  if (spacedLettersPattern.test(text)) return true;
  const letterWords = words.filter((w) => /^[A-Za-z]+$/.test(w));
  if (letterWords.length) {
    const singleLetters = letterWords.filter((w) => w.length === 1);
    if (singleLetters.length / letterWords.length >= 0.6) return true;
    const shortNoVowel = letterWords.filter((w) => w.length <= 2 && !/[aeiou]/i.test(w));
    if (shortNoVowel.length >= 4 && shortNoVowel.length / letterWords.length >= 0.5) return true;
  }
  const vowelCount = (text.match(/[aeiou]/gi) || []).length;
  const alphaCount = (text.match(/[a-z]/gi) || []).length;
  if (alphaCount >= 12 && vowelCount / Math.max(1, alphaCount) < 0.2) return true;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const repetitionRatio = uniqueWords.size / words.length;
  if (repetitionRatio < 0.3) return true;
  const normalizedWords = words
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean);
  if (normalizedWords.length) {
    const freq: Record<string, number> = {};
    for (const w of normalizedWords) {
      freq[w] = (freq[w] || 0) + 1;
    }
    const maxEntry = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (maxEntry) {
      const [mostWord, count] = maxEntry;
      if (count >= 3 && count / normalizedWords.length >= 0.4 && mostWord.length <= 5) return true;
    }
    const suffixCounts: Record<string, number> = {};
    for (const w of normalizedWords) {
      const suffix = w.slice(-3);
      if (!suffix) continue;
      suffixCounts[suffix] = (suffixCounts[suffix] || 0) + 1;
    }
    const suffixEntry = Object.entries(suffixCounts).sort((a, b) => b[1] - a[1])[0];
    if (suffixEntry) {
      const [, suffixCount] = suffixEntry;
      if (suffixCount >= 3 && suffixCount / normalizedWords.length >= 0.5) return true;
    }
  }
  // Check for specific garbled patterns
  if (/his appendix/.test(text) && text.includes('Tis')) return true;
  return false;
}

// Normalize a word by removing non-alphabet characters and compressing repeated letters
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1');
}

export function isAgentNameVariant(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const tokens = text.split(/\s+/).map(t => normalizeWord(t)).filter(Boolean);
  if (!tokens.length) return false;
  const keyset = new Set(tokens);
  // Candidate normalized tokens that represent 'agent' or 'agentlee' variants
  const agentVariants = new Set(['agent', 'agt', 'agnt', 'agentlee', 'agentlee', 'alee', 'aello', 'agello', 'agento', 'agentl', 'agentl']);
  let matches = 0;
  for (const tok of keyset) {
    if (agentVariants.has(tok) || tok.includes('agent') || tok.includes('lee') || tok.includes('aello')) matches++;
  }
  // If there are multiple distinct variants or repeated occurrences, consider it an agent name echo
  if (matches >= 2) return true;

  // Also detect if the string contains too many near-duplicate tokens of the agent name
  let agentTokenCount = 0;
  for (const t of tokens) {
    if (t.length && (t.includes('agent') || t.includes('aello') || t.includes('agello') || t.includes('age'))) agentTokenCount++;
  }
  if (agentTokenCount >= 3) return true;
  return false;
}

/**
 * Sanitize LLM text so we never leak system prompts or weird repeated tokens.
 */
function sanitizeLLMText(text: string): string {
  if (!text) return '';

  let t = String(text);

  // Strip any "system:" lines that were echoed
  t = t.replace(/^system:.*$/gim, '');

  // Remove crazy repeated LOCAL_EVIDENCE/LCAL_EVIDENCE sequences
  const pattern = /(L?OCAL?_EVIDENCE[_A-Z]*){5,}/g;
  t = t.replace(pattern, 'LOCAL_EVIDENCE');
  // Remove explicit local disabled markers so the narration stays in-universe
  t = t.replace(/\[?LOCAL LLM DISABLED\]?/gi, '');
  t = t.replace(/local generation is disabled/gi, '');
  t = t.replace(/gemma:local-disabled/gi, '');

  // Collapse excessive whitespace
  t = t.replace(/\n{3,}/g, '\n\n').trim();

  return t.trim();
}

// Additional pattern to detect disabled local LLM or fallback markers
export const LOCAL_LLM_DISABLED_RE = /\[?LOCAL LLM DISABLED\]?|local generation is disabled|gemma:local-disabled|LOCAL-LLM-DISABLED/i;

const buildLocalTemplatedNarration = (slide?: SlideDefinition, evidencePreview?: string): string => {
  const segments: string[] = [];
  try {
    if (slide?.title) {
      segments.push(`Let me walk you through: ${slide.title}.`);
    }
    if (evidencePreview) {
      segments.push(`Supporting data: ${evidencePreview.slice(0, 120)}.`);
    }
    if (slide?.narration) {
      const narration = slide.narration;
      if (Array.isArray(narration.paragraphs) && narration.paragraphs.length) {
        segments.push(narration.paragraphs.slice(0, 2).join(' '));
      }
      if (Array.isArray(narration.bullets) && narration.bullets.length) {
        segments.push(`Key points: ${narration.bullets.slice(0, 4).join('; ')}`);
      }
    }
  } catch (err) {
    console.warn('[LeewayIndustriesService] Local templated narration assembly failed:', err);
  }
  return segments.filter(Boolean).join(' ').trim();
};

const buildSlideNarrativeText = (slide?: SlideDefinition): { summary?: string; narrative?: string } => {
  if (!slide) return {};
  const narration = slide.narration;
  if (!narration) return {};
  const paragraphs = Array.isArray(narration.paragraphs) ? narration.paragraphs.filter(Boolean) : [];
  const bullets = Array.isArray(narration.bullets) ? narration.bullets.filter(Boolean) : [];
  const summary = paragraphs.length ? paragraphs[0] : undefined;
  const combined = [paragraphs.join(' '), bullets.length ? `Bullets: ${bullets.join('; ')}` : '']
    .filter(Boolean)
    .join('\n')
    .trim();
  return { summary, narrative: combined };
};

export const sendMessageToAgentLee = async (
  message: string,
  currentSlide?: SlideDefinition
): Promise<AgentResponse> => {
  // -----------------------------------------------------------------------
  // 0. FIRST-LAYER: DETERMINISTIC ENGINE (FAST, STABLE, NAVIGATION-AWARE)
  // -----------------------------------------------------------------------
  const deterministic = determineResponse(message, currentSlide?.title);
  if (isDeterministicSpecific(deterministic)) {
    console.log('[LeewayIndustriesService] Using deterministic engine result:', deterministic);
    return deterministic;
  }

  // -----------------------------------------------------------------------
  // 1. LOCAL MODEL HUB
  // If VITE_AGENTLEE_SINGLE_MODEL is enabled, use single-model RAG path.
  // Otherwise, fall back to Planner → Brain → Voice + Companion.
  // -----------------------------------------------------------------------
  try {
    console.log('=== Agent Lee Request Started ===');
    console.log('Message:', message);
    console.log('Current slide:', currentSlide?.title);
    const start = Date.now();

    let contextMessage = message;
    if (currentSlide) {
      contextMessage = `[Current Slide: ${currentSlide.title} (ID: ${currentSlide.id})] ${contextMessage}`;
    }

    console.log('Calling answerWithEvidence to gather evidence...');
    const evidenceResult = await answerWithEvidence(message, contextMessage, currentSlide as any ?? null);

    console.log('Evidence collected; preview:', String(evidenceResult.evidence?.localDataPreview || '').slice(0, 240));

    const evidenceText = (evidenceResult.evidence?.localDataPreview || '').slice(0, 2000);
    const chartContext = evidenceResult.evidence?.chartContext || null;
    const slideNarrative = buildSlideNarrativeText(currentSlide);

    await ensureLocalModelsReady();
    AGENT_STATUS.online = true;
    AGENT_STATUS.model = 'local-model-hub';
    AGENT_STATUS.lastError = null;

    let narrationText = '';
    let navigationTarget: string | undefined;

    const singleModelFlag = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AGENTLEE_SINGLE_MODEL === '1') ||
      (typeof process !== 'undefined' && process.env?.VITE_AGENTLEE_SINGLE_MODEL === '1');

    if (!ALLOW_LOCAL_NARRATION) {
      narrationText = buildLocalTemplatedNarration(currentSlide, evidenceText);
      console.warn('[LeewayIndustriesService] Local narration disabled via toggle; using templated narration only.');
    } else if (singleModelFlag) {
      const wantsChart = /\b(chart|charts|graph|graphs|plot|figure|visual|visualization)\b/i.test(message);
      // If user asked about a chart but we have no chart context for this slide, return a scoped warning
      if (wantsChart && !chartContext) {
        const scopeMsg = "I can only discuss charts and evidence included in this presentation. I don't have the context for a chart on this page yet. Try switching to a slide with a visible chart or open the Evidence Locker.";
        console.warn('[LeewayIndustriesService] Chart requested but no chartContext available — returning scope message.');
        return { text: scopeMsg };
      }
      const answerText = await runSingleModelAnswer({
        question: message,
        slideTitle: currentSlide?.title,
        chartContext,
        citations: evidenceResult?.evidence?.citations || [],
        chartData: evidenceResult?.evidence?.chartData || null,
        forceChartFocus: wantsChart,
      });
      narrationText = answerText || '';
      const navMatch = narrationText.match(/\[\[NAVIGATE:\s*(.*?)\]\]/);
      if (navMatch) {
        navigationTarget = navMatch[1]?.trim();
        narrationText = narrationText.replace(navMatch[0], '').trim();
      }
    } else {
      const planner = await runPlannerModel({
        userMessage: message,
        slideTitle: currentSlide?.title,
        slideId: currentSlide?.id,
        slideSummary: slideNarrative.summary,
        evidencePreview: evidenceText,
        chartContext,
      });

      const deckPrompt = `${BASE_DECK_PROMPT}\n\n=== REQUEST CONTEXT ===\nUser: ${message}`;

      let brainAnswer = await runBrainModel({
        userMessage: message,
        slideTitle: currentSlide?.title,
        slideId: currentSlide?.id,
        slideNarrative: slideNarrative.narrative,
        evidencePreview: evidenceText,
        planner,
        deckPrompt,
      });

      if (!brainAnswer.trim()) {
        brainAnswer = buildLocalTemplatedNarration(currentSlide, evidenceText) || 'I am still collecting the necessary local evidence. Ask me about another slide while this one loads.';
      }

      let styledAnswer = brainAnswer;
      try {
        styledAnswer = await runVoiceStyler({
          finalAnswer: brainAnswer,
          slideTitle: currentSlide?.title,
          planFocus: planner.focusPoints,
        }) || brainAnswer;
      } catch (styleErr) {
        console.warn('[LeewayIndustriesService] Voice styler failed; using brain answer.', styleErr);
      }

      let companionHint = '';
      try {
        companionHint = await runCompanionModel({
          userMessage: message,
          finalAnswer: styledAnswer,
          slideTitle: currentSlide?.title,
        }) || '';
      } catch (companionErr) {
        console.warn('[LeewayIndustriesService] Companion model failed; continuing without follow-up.', companionErr);
      }

      narrationText = [styledAnswer, companionHint].filter(Boolean).join('\n\n');
      if (!narrationText.trim()) {
        narrationText = buildLocalTemplatedNarration(currentSlide, evidenceText) || 'Agent Lee is reviewing the latest evidence for that slide. Please try again in a few moments.';
      }

      const navMatch = narrationText.match(/\[\[NAVIGATE:\s*(.*?)\]\]/);
      if (navMatch) {
        navigationTarget = navMatch[1]?.trim();
        narrationText = narrationText.replace(navMatch[0], '').trim();
      }
    }

    narrationText = sanitizeLLMText(narrationText);

    if (!narrationText || isGarbled(narrationText) || isAgentNameVariant(narrationText)) {
      if (isAgentNameVariant(narrationText)) {
        console.warn('[LeewayIndustriesService] Rejected final narration because it appears to contain garbled Agent Lee name variants.');
      }
      if (isGarbled(narrationText)) {
        console.warn('[LeewayIndustriesService] Rejected final narration because output is garbled or repetitive.');
      }
      narrationText = "I'm sorry, I encountered an issue generating a detailed response. Please try rephrasing your question or asking about a specific slide, map, or financial view.";
    }

    try {
      (window as any).AGENT_DIAGNOSTICS = (window as any).AGENT_DIAGNOSTICS || {};
      (window as any).AGENT_DIAGNOSTICS.lastResponse = {
        timestamp: Date.now(),
        durationMs: Date.now() - start,
        textPreview: narrationText.slice(0, 300),
        success: true,
        models: 'planner+brain+voice+companion'
      };
    } catch {
      /* ignore diagnostics */
    }

    console.log('Agent Lee response:', narrationText);
    console.log('=== Agent Lee Request Completed ===');
    return { text: narrationText, navigationTarget };
  } catch (err: any) {
    console.error('Agent Lee Error:', err);
    AGENT_STATUS.lastError = err?.message ? err.message : String(err);
    AGENT_STATUS.online = false;

    let fallbackText = 'Agent Lee encountered an error while running the local narration stack. Check console for details.';

    try {
      const fallbackParts: string[] = [];
      if (currentSlide?.narration) {
        const narration = currentSlide.narration;
        if (Array.isArray(narration.paragraphs)) {
          fallbackParts.push(...narration.paragraphs.slice(0, 3));
        }
        if (Array.isArray(narration.bullets) && narration.bullets.length) {
          fallbackParts.push(`Key takeaways: ${narration.bullets.slice(0, 5).join('; ')}`);
        }
      }
      const safeFallback = fallbackParts.filter(Boolean).join(' ') || fallbackText;

      try {
        (window as any).AGENT_DIAGNOSTICS = (window as any).AGENT_DIAGNOSTICS || {};
        (window as any).AGENT_DIAGNOSTICS.lastResponse = {
          timestamp: Date.now(),
          durationMs: 0,
          textPreview: String(safeFallback).slice(0, 300),
          success: false,
          error: String(err?.message ?? err)
        };
      } catch {
        /* ignore diagnostics errors */
      }

      return { text: safeFallback };
    } catch {
      return { text: fallbackText };
    }
  }
};

export const saveEvidenceForSlide = async (
  slideId: string,
  slideTitle: string,
  csvContent: string,
  options?: { asCsv?: boolean; filename?: string }
) => {
  try {
    const docId = `dossier::${slideId || 'slide'}::${Date.now()}`;
    const metadata = { slideId, slideTitle, createdAt: Date.now() };
    await docStore.addDocument(docId, csvContent, metadata);

    if (options?.asCsv && typeof window !== 'undefined') {
      const filename = options.filename || `${slideId || 'dossier'}-${Date.now()}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    return { docId, indexed: true };
  } catch (error) {
    console.error('saveEvidenceForSlide failed', error);
    throw error;
  }
};

if (typeof window !== 'undefined') {
  (window as any).AGENT_STATUS = AGENT_STATUS;
  (window as any).getKnowledgeSnippet = getKnowledgeSnippet;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ALLOW_LOCAL_NARRATION');
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(window, 'ALLOW_LOCAL_NARRATION', {
        configurable: true,
        get: () => ALLOW_LOCAL_NARRATION,
        set: (value: boolean) => {
          ALLOW_LOCAL_NARRATION = !!value;
        }
      });
    } else if (typeof (window as any).ALLOW_LOCAL_NARRATION === 'boolean') {
      ALLOW_LOCAL_NARRATION = !!(window as any).ALLOW_LOCAL_NARRATION;
    }
  } catch {
    (window as any).ALLOW_LOCAL_NARRATION = ALLOW_LOCAL_NARRATION;
  }

  initChatSession('Executive').catch(() => null);
}

