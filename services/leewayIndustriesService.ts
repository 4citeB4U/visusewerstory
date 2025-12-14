/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: AI.ORCHESTRATION.ROUTER.CORE
REGION: 🧠 AI

STACK: LANG=ts; FW=none; UI=none; BUILD=node
RUNTIME: browser
TARGET: agent-module

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=n/a;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Leeway Industries Core Service",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "AI", "Orchestration", "AgentLee"],
  "identifier": "AI.ORCHESTRATION.ROUTER.CORE",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Leeway Industries core service layer; WHY=Orchestrate Agent Lee conversation and data flows; WHO=Agent Lee System; WHERE=/services/leewayIndustriesService.ts; WHEN=2025-12-09; HOW=Model orchestration + chat session + slide explanations
SPDX-License-Identifier: MIT
============================================================================ */

import { MOCK_DATA, STORY_CONFIG } from "../constants";
import { initDocStore } from "../Models/AgentLeeBrainMonolith";
import { SlideDefinition, UserRole } from "../types";
import { buildAgentLeeCorePrompt } from "./agentlee-core/AgentLeeCore";
import { AgentLeeChartRegistry } from "./AgentLeeChartRegistry";
import {
  runBrainModel,
  runCompanionModel,
  runPlannerModel,
  runSingleModelAnswer,
  runVoiceStyler,
  warmUpModelGroup,
} from "./localModelHub";

/**
 * Agent response shape used throughout the app.
 */
export type AgentResponse = {
  text: string;
  navigationTarget?: string;
};

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
  "I’m Agent Lee. Let’s walk the story at your pace. We can stay on this slide or move when you’re ready.";

/**
 * Analyze input to find the best matching scripted response.
 * `slideContext` is typically `currentSlide.title`.
 */
const determineResponse = (query: string, slideContext?: string): AgentResponse => {
  const q = query.toLowerCase();

  // Map number words to integers (1-20 for safety; we need up to 13)
  const WORD_NUM: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20
  };
  const wordToNum = (word: string): number | null => WORD_NUM[word] ?? null;

  // --- 0. Direct Page Navigation (Highest Priority) ---
  // Detects "Turn to Page 8", "Go to Slide 5", "Navigate to page 10", "Show page 12", etc.
  // Requires explicit navigation verbs to avoid false positives like "explain the page" or "on page 13"
  const pageMatch = q.match(/\b(?:turn\s+to|go\s+to|navigate\s+to|show|open|display)\s+(?:page|slide)\s+(\d+)/i) ||
                     q.match(/^(?:page|slide)\s+(\d+)$/i); // Also allow standalone "page 8" as full query
  const pageWordMatch = q.match(/\b(?:turn\s+to|go\s+to|navigate\s+to|show|open|display)\s+(?:page|slide)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)/i) ||
                         q.match(/^(?:page|slide)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)$/i);
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
  if (pageWordMatch) {
    const wn = wordToNum(pageWordMatch[1]);
    if (wn && wn >= 1) {
      return {
        text: `Certainly. Turning to Page ${wn}.`,
        navigationTarget: wn.toString()
      };
    }
  }

  // --- 1. Keyword Navigation Commands ---
  // Make patterns more restrictive with word boundaries and multiple keywords to avoid false matches
  if ((q.includes("show") && q.includes("map")) || 
      (q.includes("acquisition") && q.includes("map")) ||
      /\b(show|display|open)\s+(the\s+)?acquisition/i.test(q) ||
      /\bwhere\s+(are|is)\s+(we|the|your)\b/i.test(q)) {
    return {
      text: "Navigating to the National Platform Map. As you can see, we have expanded well beyond the Midwest into the Mid-Atlantic region with strategic hubs in Pennsylvania and New Jersey.",
      navigationTarget: "AcquisitionMap"
    };
  }
  if (q.includes("roi") || q.includes("return on investment")) {
    return {
      text: "Navigating to the Evidence Locker to review ROI charts and case studies.",
      navigationTarget: "12" // Evidence Locker
    };
  }
  if (q.includes("money") || q.includes("financial") || q.includes("revenue") || q.includes("ebitda")) {
    return {
      text: "Moving to the Financial Bridge. We are tracking from a $37M base towards a $70M target, driven by organic growth, tech uplift, and M&A.",
      navigationTarget: "8" // Engineering Tomorrow
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
  if (/\bevidence\s+locker\b/i.test(q) || 
      (q.includes("show") && q.includes("evidence")) ||
      (q.includes("open") && q.includes("evidence")) ||
      (q.includes("verify") && q.includes("source")) ||
      /\b(show|open|display)\s+(the\s+)?sources?\b/i.test(q)) {
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
  if (/\b(close|end|finish|wrap up)\s+(the\s+)?(presentation|deck|slides?)\b/i.test(q) ||
      /\b(closing|final)\s+slide\b/i.test(q) ||
      (q.includes("thank") && (q.includes("closing") || q.includes("final")))) {
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
const SYSTEM_INSTRUCTION = `You are Agent Lee: a pragmatic, voice-forward AI guide with a Midwestern business register.

ANTI-SCRIPT RULES
✗ Never repeat the same opening line across conversations
✗ No "Good evening, I am Agent Lee..." unless requested
✗ Get to the user's goal quickly

MIDWESTERN BUSINESS VOICE
✓ "Let's take a look at what the data's telling us"
✓ "We're in a good spot, just need to tighten a few things up"
✓ "I'll take point on that piece"
✓ "Let's make sure we're aligned on the outcome"
✗ Avoid: "How can I assist?", "Processing request", robotic phrasing

Speak like a dependable operations leader: warm, modest, solution-oriented, with steady progress mindset.
Specialize in sewer infrastructure, CCTV inspections, project costs, and construction data.
Provide clear insights grounded in evidence, using short sentences and collaborative language.

You have expertise in sewer systems, CCTV inspections, project costs, and construction data.
Provide clear insights grounded in evidence, but speak like a human who's genuinely engaged in helping explore the story.`;

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
  // High-priority chart intent: explain chart naturally without requiring a button
  try {
    const m = String(message || '').toLowerCase();
    const wantsChart = /(explain|describe|walk|talk)\s+(the\s+)?(chart|graph|visual|figure)|\b(chart|graph|figure)\b/.test(m);
    if (wantsChart) {
      const selectedPoint = (typeof window !== 'undefined') ? (window as any).AGENT_SELECTED_POINT || undefined : undefined;
      const exp = await explainChartForSlide(currentSlide, { selectedPoint });
      const highlightsText = (exp.highlights || []).map(h => `• ${h.text}`).join('\n');
      const msgText = [exp.narrative, highlightsText].filter(Boolean).join('\n').trim();
      if (msgText) {
        // Trigger gentle auto-scroll on the active chart panel while explaining
        try {
          setTimeout(() => {
            try { (window as any).AGENTLEE_UI?.scrollActiveChartPanel?.(); } catch {}
          }, 600);
        } catch {}
        return { text: msgText };
      }
    }
  } catch (chartErr) {
    // Graceful fallback when chart explanation fails
    const safeTitle = currentSlide?.title ? ` on "${currentSlide.title}"` : '';
    return { text: `I couldn’t explain the chart${safeTitle} just yet. We may not have the chart context loaded. We can stay with the story or come back to charts once they’re ready.` };
  }
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
    try {
      if (typeof window !== 'undefined') {
        (window as any).AGENT_LAST_EVIDENCE = evidenceResult?.evidence || null;
      }
    } catch {}
    const chartContext = evidenceResult.evidence?.chartContext || null;
    // Special handling for Page 11 tabbed charts: attempt to tag DOM to load chart context
    try {
      const pn = (currentSlide as any)?.pageNumber;
      if (typeof window !== 'undefined' && (pn === 11 || /roi|metrics|analysis|technology/i.test(String(currentSlide?.chartKind)))) {
        (window as any).AGENTLEE_UI?.runSlide11TabsAutomation?.();
        await (window as any).AGENTLEE_UI?.ensureChartsRendered?.();
      }
    } catch {}
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
        citations: (evidenceResult?.evidence?.citations as import('./localModelHub').SingleModelCitationsItem[] | undefined) || [],
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

    // Proactive follow-up for vague queries (tailored to slide chartKind)
    const isVague = (msg: string) => {
      const m = String(msg || '').toLowerCase();
      const hasSpecifics = /\b(\d{4}|\$?\d+|year|series|component|chart|timeline|bridge|crew|cctv|cost|roi|method|region|phase)\b/.test(m);
      return !hasSpecifics;
    };
    if (isVague(message)) {
      const kind = String(currentSlide?.chartKind || '').toLowerCase();
      // Provide a gentle, non-directive suggestion without a question
      let suggestion = 'We can stay on this page or move to ROI, the map, or the timeline whenever you want.';
      if (kind === 'timeline') suggestion = 'We can walk the timeline highlights and connect the dots to the story.';
      else if (kind === 'contractorschedule' || kind === 'velocity') suggestion = 'We can step through crew capacity and regional growth at your pace.';
      else if (kind === 'growthbridge') suggestion = 'We can cover the financial bridge components and how they stack up.';
      else if (kind === 'cctv') suggestion = 'We can touch on inspection methods and what they mean in practice.';
      else if (kind === 'projectcosts') suggestion = 'We can cover methods, costs, and impact in plain language.';
      else if (kind === 'techstack') suggestion = 'We can outline speed, risk, and optimization without jargon.';
      else if (kind === 'evidence') suggestion = 'We can open the Evidence Locker and keep it simple.';
      narrationText = narrationText ? `${narrationText}\n\n${suggestion}` : suggestion;
    }

    if (!narrationText || isGarbled(narrationText) || isAgentNameVariant(narrationText)) {
      if (isAgentNameVariant(narrationText)) {
        console.warn('[LeewayIndustriesService] Rejected final narration because it appears to contain garbled Agent Lee name variants.');
      }
      if (isGarbled(narrationText)) {
        console.warn('[LeewayIndustriesService] Rejected final narration because output is garbled or repetitive.');
      }
      const safeTitle = currentSlide?.title ? ` for "${currentSlide.title}"` : '';
      narrationText = `I hit a snag generating a clean response${safeTitle}. We can stick with this slide or move to ROI, the map, or the timeline when you want.`;
    }

    try {
      (window as any).AGENT_DIAGNOSTICS = (window as any).AGENT_DIAGNOSTICS || {};
      (window as any).AGENT_DIAGNOSTICS.lastResponse = {
        timestamp: Date.now(),
        durationMs: Date.now() - start,
        textPreview: narrationText.slice(0, 300),
        success: true,
        models: 'planner+brain+voice+companion',
        citations: (evidenceResult?.evidence?.citations || []).slice(0, 8),
        matchedClaims: evidenceResult?.evidence?.matchedClaims || [],
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

// ---------------------------------------------------------------------------
//  CHART EXPLANATION API (Deterministic, Structured, KB-grounded)
// ---------------------------------------------------------------------------

export type ChartExplanation = {
  narrative: string;
  highlights: Array<{ type: 'trend' | 'peak' | 'low' | 'inflection' | 'relation' | 'anomaly'; text: string }>;
  point_explanation?: { x: string | number; seriesKey?: string; y: number; meaning?: string };
  kb_used: string[];
  confidence: 'low' | 'medium' | 'high';
  assumptions: string[];
};

function toNumberSafe(v: any): number | null {
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function buildChartSnapshotForSlide(currentSlide?: SlideDefinition) {
  try {
    const ctx = (currentSlide?.id || currentSlide?.title) ? (window as any).AgentLeeChartRegistry?.getChartContextForSlide(currentSlide?.id || currentSlide?.title) : null;
    const data = (currentSlide?.id || currentSlide?.title) ? (window as any).AgentLeeChartRegistry?.getChartDataForSlide(currentSlide?.id || currentSlide?.title) : null;
    return { chart_context: ctx || null, chart_data: Array.isArray(data) ? data : null };
  } catch {
    return { chart_context: null, chart_data: null };
  }
}

export async function explainChartForSlide(currentSlide?: SlideDefinition, opts?: { selectedPoint?: { x: string | number; seriesKey?: string } }): Promise<ChartExplanation> {
  const snap = buildChartSnapshotForSlide(currentSlide);
  const ev = (window as any).AGENT_LAST_EVIDENCE || {};
  const citations = Array.isArray(ev?.citations) ? ev.citations : [];
  const kbIds = citations.map((c: any) => `kb_${c.id ?? c.docId ?? 'doc'}`);

  // Fallback: if registry didn’t return, synthesize chart_data directly from deck config and mock data
  if (!snap.chart_data || !snap.chart_data.length) {
    try {
      const cfg = (window as any).STORY_CONFIG || STORY_CONFIG;
      const mock = (window as any).MOCK_DATA || MOCK_DATA;
      const slideList: Array<any> = Array.isArray(cfg?.slides) ? (cfg.slides as Array<any>) : [];
      const slide = currentSlide || (slideList.length ? slideList[0] : null);
      const charts: any[] = [];
      const kind = String((slide as any)?.chartKind || '').toLowerCase();
      if (kind === 'timeline' && Array.isArray(mock?.historicalGrowth)) {
        charts.push({
          id: 'timeline', title: 'Historical Growth Timeline', axes: { x: 'Year', y: 'Index' },
          series: [{ name: 'Growth', points: mock.historicalGrowth.map((h: any)=> ({ x: Number(h.year) || h.year, y: Number(h.value) || 0, label: h.milestone })) }]
        });
      } else if ((kind === 'contractorschedule' || kind === 'velocity') && Array.isArray(mock?.operationalVelocity)) {
        const byRegion: Record<string, any[]> = {};
        mock.operationalVelocity.forEach((r: any)=>{
          const x = Number(r.year) || r.year; const y = Number(r.crewCount) || 0; (byRegion[r.region] = byRegion[r.region] || []).push({ x, y, label: r.projectsCompleted });
        });
        charts.push({ id: 'crewCapacity', title: 'Velocity: Crew Capacity (2020–2050)', axes: { x: 'Year', y: 'Crew Capacity', unitY: 'crews' }, series: Object.entries(byRegion).map(([name, pts])=> ({ name, points: pts.sort((a:any,b:any)=> Number(a.x)-Number(b.x)) })) });
      } else if (kind === 'growthbridge' && Array.isArray(mock?.financials)) {
        const map: Record<string, number> = {}; mock.financials.forEach((f:any)=> { map[String(f.category)] = Number(f.value) || 0; });
        charts.push({ id: 'growthBridge', title: 'Financial Bridge: Path to $70M', axes: { x: 'Component', y: 'Revenue', unitY: 'USD (M)' }, series: [{ name: 'Bridge Components', points: [ { x:'Base', y: map['Base Ops']||0 }, { x:'Organic', y: map['Tech Uplift']||0 }, { x:'M&A', y: map['M&A']||0 } ] }] });
      } else if (kind === 'cctv' && Array.isArray(mock?.cctvInspections)) {
        const byMethod: Record<string, { total: number; count: number }> = {};
        mock.cctvInspections.forEach((r:any)=>{ const m = String(r.method||'Unknown'); (byMethod[m] = byMethod[m] || { total:0, count:0 }); byMethod[m].total += Number(r.reviewTimeMinutes)||0; byMethod[m].count += 1; });
        const pts = Object.entries(byMethod).map(([m, agg])=> ({ x: m, y: agg.count ? Math.round((agg.total/agg.count)*10)/10 : 0 }));
        charts.push({ id: 'cctv', title: 'CCTV Inspection: Avg Review Time', axes: { x: 'Method', y: 'Avg Minutes', unitY: 'min' }, series: [{ name: 'Review Time', points: pts }] });
      } else if (kind === 'aisewersviz') {
        // Evolution Velocity: AI momentum, ROI, and workforce impact
        const techMetrics = Array.isArray(mock?.techMetrics) ? mock.techMetrics : [];
        const caseStudies = Array.isArray(mock?.caseStudies) ? mock.caseStudies : [];

        if (techMetrics.length || caseStudies.length) {
          const adoptionPoints = techMetrics
            .filter((m:any)=> String(m.metric).toLowerCase() === 'speed')
            .map((m:any)=> ({ x: m.phase || 'Phase', y: Number(m.value) || 0, label: m.label }));
          const riskPoints = techMetrics
            .filter((m:any)=> String(m.metric).toLowerCase() === 'risk')
            .map((m:any)=> ({ x: m.phase || 'Phase', y: Number(m.value) || 0, label: m.label }));
          const optimizationPoints = techMetrics
            .filter((m:any)=> String(m.metric).toLowerCase() === 'optimization')
            .map((m:any)=> ({ x: m.phase || 'Phase', y: Number(m.value) || 0, label: m.label }));

          const roiPoints = caseStudies.map((cs:any, idx:number)=> ({
            x: cs.study || `Case ${idx+1}`,
            y: Number(cs.savingsPercent) || 0,
            label: `${cs.study}: ${cs.savingsPercent}% savings`
          }));

          const series: any[] = [];
          if (adoptionPoints.length) series.push({ name: 'AI Speed / Adoption', points: adoptionPoints });
          if (riskPoints.length) series.push({ name: 'Risk Prediction Strength', points: riskPoints });
          if (optimizationPoints.length) series.push({ name: 'Optimization / Budget Impact', points: optimizationPoints });
          if (roiPoints.length) series.push({ name: 'ROI Case Studies', points: roiPoints });

          if (series.length) {
            charts.push({
              id: 'aiSewersViz',
              title: 'Evolution Velocity: AI + Workforce Impact',
              axes: { x: 'Phase / Case Study', y: 'Impact / Savings', unitY: 'index / %' },
              series,
            });
          }
        }
      }
      snap.chart_data = charts.length ? charts : null;
    } catch {}
  }
  if (!snap.chart_data || !snap.chart_data.length) {
    return {
      narrative: 'I have the slide context, but chart data is still loading. Tell me which part you want first, and I will summarize by year, series, and peaks.',
      highlights: [],
      kb_used: kbIds.slice(0,6),
      confidence: 'low',
      assumptions: []
    };
  }

  const charts = snap.chart_data;
  const highlights: ChartExplanation['highlights'] = [];
  const narrativeParts: string[] = [];
  let point_explanation: ChartExplanation['point_explanation'] | undefined;

  charts.forEach((chart: any, idx: number) => {
    const title = chart?.title || chart?.id || `chart ${idx+1}`;
    const xLabel = chart?.axes?.x || 'X';
    const yLabel = chart?.axes?.y || 'Y';
    const yUnit = chart?.axes?.unitY ? ` ${chart.axes.unitY}` : '';
    const series0 = Array.isArray(chart?.series) && chart.series.length ? chart.series[0] : null;
    let peakText = '';
    let lowText = '';
    if (series0 && Array.isArray(series0.points) && series0.points.length) {
      const pts = (series0.points as Array<any>).filter((p: any) => toNumberSafe(p.y) !== null);
      const sortedByY = [...pts].sort((a,b)=> (toNumberSafe(a.y)!)-(toNumberSafe(b.y)!));
      const low = sortedByY[0];
      const high = sortedByY[sortedByY.length-1];
      peakText = `Highest ${yLabel}${yUnit} occurs at ${String(high.x)} with ${toNumberSafe(high.y)!}.`;
      lowText = `Lowest ${yLabel}${yUnit} occurs at ${String(low.x)} with ${toNumberSafe(low.y)!}.`;
      highlights.push({ type: 'peak', text: peakText });
      highlights.push({ type: 'low', text: lowText });
      const first = pts[0];
      const last = pts[pts.length-1];
      if (toNumberSafe(last.y)! > toNumberSafe(first.y)!) {
        highlights.push({ type: 'trend', text: `Series ${series0.name || ''} rises from ${String(first.x)} → ${String(last.x)}.` });
      } else if (toNumberSafe(last.y)! < toNumberSafe(first.y)!) {
        highlights.push({ type: 'trend', text: `Series ${series0.name || ''} declines from ${String(first.x)} → ${String(last.x)}.` });
      }
      // Selected point explanation (first chart preferred)
      if (!point_explanation && opts?.selectedPoint) {
        const sKey = opts.selectedPoint.seriesKey;
        const targetSeries = sKey ? chart.series.find((s: any)=> String(s.name||'') === String(sKey)) : series0;
        const point = targetSeries?.points.find((p: any)=> String(p.x) === String(opts.selectedPoint!.x));
        if (point && toNumberSafe(point.y) !== null) {
          point_explanation = { x: point.x, seriesKey: targetSeries?.name, y: toNumberSafe(point.y)! };
        }
      }
    }
    narrativeParts.push(`For “${title}”, X is ${xLabel}; Y is ${yLabel}${yUnit}. ${peakText ? peakText + ' ' : ''}${lowText ? lowText : ''}`.trim());
  });

  // Simple relation heuristic between first two charts (if present)
  if (charts.length >= 2) {
    const cA = charts[0];
    const cB = charts[1];
    const sA = Array.isArray(cA?.series) && cA.series.length ? cA.series[0] : null;
    const sB = Array.isArray(cB?.series) && cB.series.length ? cB.series[0] : null;
    if (sA?.points?.length && sB?.points?.length) {
      const aPts = sA.points.filter((p: any)=> toNumberSafe(p.y) !== null);
      const bPts = sB.points.filter((p: any)=> toNumberSafe(p.y) !== null);
      const aTrendUp = toNumberSafe(aPts[aPts.length-1]?.y)! > toNumberSafe(aPts[0]?.y)!;
      const bTrendUp = toNumberSafe(bPts[bPts.length-1]?.y)! > toNumberSafe(bPts[0]?.y)!;
      if (aTrendUp && bTrendUp) {
        highlights.push({ type: 'relation', text: `Relation: Chart 1 and Chart 2 both trend upward — A likely influences B.` });
      } else if (!aTrendUp && !bTrendUp) {
        highlights.push({ type: 'relation', text: `Relation: Chart 1 and Chart 2 both trend downward — common headwinds present.` });
      }
    }
  }

  const narrative = narrativeParts.join(' ');

  return {
    narrative: `${narrative} If you want, I can zoom into a specific year or component—what part should I explain next?`,
    highlights,
    point_explanation,
    kb_used: kbIds.slice(0, 6),
    confidence: 'medium',
    assumptions: []
  };
}

export const saveEvidenceForSlide = async (
  slideId: string,
  slideTitle: string,
  csvContent: string,
  options?: { asCsv?: boolean; filename?: string }
) => {
  try {
    const docId = `dossier::${slideId || 'slide'}::${Date.now()}`;
    const metadata = { slideId, slideTitle, createdAt: Date.now() };
    const store = initDocStore();
    if (typeof (store as any).addDocument === 'function') {
      await (store as any).addDocument(docId, csvContent, metadata);
    } else if (typeof (store as any).add === 'function') {
      (store as any).add(docId, csvContent, metadata);
    }

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
  // Page knowledge loader: loads chart IDs and data for the current slide
  (window as any).AGENTLEE_KB = (window as any).AGENTLEE_KB || {};
  (window as any).AGENTLEE_KB.loadPageKnowledge = (pageNumber?: number) => {
    try {
      const slides = Array.isArray(STORY_CONFIG?.slides) ? STORY_CONFIG.slides : [];
      const idx = typeof pageNumber === 'number' ? Math.max(0, Math.min(slides.length - 1, pageNumber - 1)) : 0;
      const slide: SlideDefinition | undefined = slides[idx];
      if (!slide) return false;
      const chartData = AgentLeeChartRegistry.getChartDataForSlide(slide.id || slide.title) || [];
      const chartIds = chartData.map(c => c.id);
      const kb = {
        slideId: slide.id,
        slideTitle: slide.title,
        pageNumber: (slide as any).pageNumber ?? (idx + 1),
        chartIds,
        charts: chartData,
        narration: slide.narration || null,
      };
      (window as any).AGENT_PAGE_KB = kb;
      return true;
    } catch (e) { return false; }
  };
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

// Evidence builder: synthesizes citations and web sources from deck constants
const answerWithEvidence = async (
  query: string,
  contextMessage: string,
  currentSlide: any
): Promise<{
  evidence: {
    localDataPreview: string;
    chartContext: any;
    citations: import('./localModelHub').SingleModelCitationsItem[];
    chartData: any;
    matchedClaims: any[];
    webSources?: Array<{ label: string; url?: string; category?: string }>;
  };
}> => {
  try {
    const slides = Array.isArray(STORY_CONFIG?.slides) ? STORY_CONFIG.slides : [];
    const slide: any = currentSlide || (slides.length ? slides[0] : null);

    // Chart context + data via registry snapshot
    const snap = buildChartSnapshotForSlide(slide);

    // Build citations from evidence items
    const evItems = Array.isArray(MOCK_DATA?.evidenceItems) ? MOCK_DATA.evidenceItems : [] as any[];
    const citations: import('./localModelHub').SingleModelCitationsItem[] = evItems.slice(0, 12).map((it: any, idx: number) => ({
      id: idx + 1,
      docId: String(it.id || it.title || `evidence_${idx + 1}`),
      textSnippet: String(it.title || it.url || it.tag || ''),
      score: null,
      meta: {
        path: it.url || null,
        lineStart: null,
        lineEnd: null,
        type: String(it.type || it.tag || 'Link'),
      },
    }));

    // Build web sources for the Sources panel (label + url + category)
    const webSources = evItems.slice(0, 20).map((it: any) => ({
      label: String(it.title || it.id || it.url || 'Source'),
      url: it.url || undefined,
      category: String(it.tag || it.type || 'Link'),
    }));

    // Create a short local preview by combining slide narration and evidence titles
    const narration = slide?.narration;
    const narText = Array.isArray(narration?.paragraphs) ? narration.paragraphs.join(' ') : '';
    const titles = evItems.slice(0, 6).map((e: any) => e.title).filter(Boolean).join('; ');
    const previewParts = [
      slide?.title ? `Slide: ${slide.title}` : '',
      snap.chart_context ? `Chart: ${snap.chart_context}` : '',
      narText ? `Narration: ${narText.slice(0, 320)}` : '',
      titles ? `Evidence: ${titles}` : '',
    ].filter(Boolean);
    const localDataPreview = previewParts.join('\n');

    return {
      evidence: {
        localDataPreview,
        chartContext: snap.chart_context,
        citations,
        chartData: snap.chart_data,
        matchedClaims: [],
        webSources,
      },
    };
  } catch (e) {
    // Graceful fallback with empty evidence
    return {
      evidence: {
        localDataPreview: '',
        chartContext: null,
        citations: [],
        chartData: null,
        matchedClaims: [],
        webSources: [],
      },
    };
  }
};

// Added missing type definition for `SingleModelCitationsItem`.
// Use SingleModelCitationsItem from localModelHub

