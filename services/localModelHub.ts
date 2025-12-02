import { env, pipeline } from '@xenova/transformers';

const runningInBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const sanitizeBaseUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const readStoredModelBase = (): string | null => {
  if (!runningInBrowser) return null;
  try {
    const stored = window.localStorage?.getItem('agentlee_model_base_url');
    return sanitizeBaseUrl(stored);
  } catch {
    return null;
  }
};

const inferLocalModelServer = (): string | null => {
  if (!runningInBrowser) return null;
  try {
    const loc = window.location as Location | undefined;
    if (!loc) return null;
    const { hostname } = loc;
    const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    if (!isLoopback) return null;
    const hostAlias = hostname === 'localhost' ? '127.0.0.1' : hostname;
    return `http://${hostAlias}:8000`;
  } catch {
    return null;
  }
};

const detectLocalModelBase = (): string | null => {
  const winBase = runningInBrowser
    ? sanitizeBaseUrl((window as any)?.AGENTLEE_MODEL_BASE_URL ?? (window as any)?.AGENTLEE_RUNTIME?.MODEL_BASE_URL)
    : null;
  if (winBase) return winBase;

  const stored = readStoredModelBase();
  if (stored) {
    if (runningInBrowser) (window as any).AGENTLEE_MODEL_BASE_URL = stored;
    return stored;
  }

  const inferred = inferLocalModelServer();
  if (inferred) {
    if (runningInBrowser) (window as any).AGENTLEE_MODEL_BASE_URL = inferred;
    return inferred;
  }

  return null;
};

const localModelBase = detectLocalModelBase();
const shouldAvoidGatedDownloads = runningInBrowser && !localModelBase;

export type ModelKey = 'planner' | 'brain' | 'companion' | 'voice' | 'librarian';

const BROWSER_GATED_MODELS = new Set<string>([
  'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  'HuggingFaceTB/SmolLM2-360M-Instruct',
  'HuggingFaceTB/SmolLM2-135M-Instruct',
  'Xenova/SmolLM2-360M-Instruct',
  'Xenova/SmolLM-360M-Instruct',
  'Xenova/SmolLM-135M-Instruct',
]);
const gatedWarningSent = new Set<ModelKey>();

env.allowLocalModels = !!localModelBase;
env.allowRemoteModels = true;
env.useBrowserCache = true;
if (localModelBase) {
  env.localModelPath = `${localModelBase}/models`;
}
if (!env.cacheDir) {
  env.cacheDir = 'indexeddb://agentlee-transformers';
}

if (typeof console !== 'undefined') {
  if (env.allowLocalModels) {
    console.info('[localModelHub] Using browser-cached models from', env.localModelPath);
  } else {
    console.info('[localModelHub] No local model bundle detected; streaming weights from Hugging Face Hub.');
  }
}

type GenerationSettings = {
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  num_beams?: number;
  early_stopping?: boolean;
  do_sample?: boolean;
} & Record<string, unknown>;

interface ModelConfig {
  label: string;
  model: string | string[];
  task: 'text-generation' | 'conversational' | 'text2text-generation' | 'feature-extraction';
  generation?: GenerationSettings;
  pipelineOptions?: Record<string, unknown>;
}

export interface ModelStatusEntry {
  key: ModelKey;
  label: string;
  modelId: string;
  ready: boolean;
  loading: boolean;
  progress?: number;
  error?: string | null;
}

const MODEL_CONFIG: Record<ModelKey, ModelConfig> = {
  planner: {
    label: 'SmolLM2 Planner',
    model: [
      'HuggingFaceTB/SmolLM2-1.7B-Instruct',
      'HuggingFaceTB/SmolLM2-360M-Instruct',
      'HuggingFaceTB/SmolLM2-135M-Instruct',
      'Xenova/SmolLM2-360M-Instruct',
      'Xenova/SmolLM-360M-Instruct',
      'Xenova/SmolLM-135M-Instruct',
      'Xenova/Qwen1.5-0.5B-Chat'
    ],
    task: 'text-generation',
    generation: {
      max_new_tokens: 320,
      temperature: 0.35,
      top_p: 0.92,
    },
    pipelineOptions: {
      quantized: true,
      dtype: 'q4',
    },
  },
  brain: {
    label: 'Qwen Brain',
    model: 'Xenova/Qwen1.5-0.5B-Chat',
    task: 'text-generation',
    generation: {
      max_new_tokens: 420,
      temperature: 0.58,
      top_p: 0.9,
    },
    pipelineOptions: {
      quantized: true,
      dtype: 'q4',
    },
  },
  companion: {
    label: 'Blenderbot Companion',
    model: 'facebook/blenderbot-400M-distill',
    task: 'conversational',
    pipelineOptions: {
      quantized: true,
    },
  },
  voice: {
    label: 'LaMini Voice Styler',
    model: 'Xenova/LaMini-Flan-T5-248M',
    task: 'text2text-generation',
    generation: {
      max_new_tokens: 220,
      temperature: 0.55,
      top_p: 0.9,
    },
    pipelineOptions: {
      quantized: true,
    },
  },
  librarian: {
    label: 'MiniLM Librarian',
    model: 'Xenova/all-MiniLM-L6-v2',
    task: 'feature-extraction',
  },
};

const pipelineCache = new Map<ModelKey, Promise<any>>();
const modelStatus = new Map<ModelKey, ModelStatusEntry>();

function updateStatus(key: ModelKey, update: Partial<ModelStatusEntry>) {
  const existing = modelStatus.get(key);
  const base: ModelStatusEntry = existing || {
    key,
    label: MODEL_CONFIG[key].label,
    modelId: Array.isArray(MODEL_CONFIG[key].model) ? MODEL_CONFIG[key].model[0] : MODEL_CONFIG[key].model,
    ready: false,
    loading: false,
  };
  const next = { ...base, ...update };
  modelStatus.set(key, next);
}

function resolveCandidates(key: ModelKey) {
  const config = MODEL_CONFIG[key];
  const base = Array.isArray(config.model) ? config.model : [config.model];
  if (!shouldAvoidGatedDownloads) {
    return base;
  }
  const open = base.filter((id) => !BROWSER_GATED_MODELS.has(id));
  if (!open.length) {
    return base;
  }
  if (!gatedWarningSent.has(key) && typeof console !== 'undefined') {
    console.info(
      `[localModelHub] Skipping gated Hugging Face models for ${key} in browser mode. Run "npm run models" or set window.AGENTLEE_MODEL_BASE_URL to self-host weights.`,
    );
    gatedWarningSent.add(key);
  }
  const gated = base.filter((id) => BROWSER_GATED_MODELS.has(id));
  return [...open, ...gated];
}

async function loadModel(key: ModelKey) {
  if (!pipelineCache.has(key)) {
    const config = MODEL_CONFIG[key];
    const candidates = resolveCandidates(key);
    const loadPromise = (async () => {
      let lastError: unknown = null;
      for (const candidate of candidates) {
        updateStatus(key, { loading: true, ready: false, error: null, progress: 0, modelId: candidate });
        const progress_callback = (event: { status?: string; loaded?: number; total?: number }) => {
          if (event?.status === 'downloading' && typeof event.loaded === 'number' && typeof event.total === 'number' && event.total > 0) {
            const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
            updateStatus(key, { progress, loading: true, modelId: candidate });
          }
        };
        const options = { ...(config.pipelineOptions || {}), progress_callback };
        try {
          const instance = await pipeline(config.task as any, candidate, options);
          updateStatus(key, { ready: true, loading: false, progress: 100, modelId: candidate, error: null });
          return instance;
        } catch (err) {
          lastError = err;
          console.warn(`[localModelHub] Failed to load ${candidate}`, err);
        }
      }
      const friendlyError = lastError ? String((lastError as Error)?.message || lastError) : 'All configured models failed to load.';
      updateStatus(key, { loading: false, ready: false, error: friendlyError });
      throw lastError ?? new Error(friendlyError);
    })().catch((err) => {
      pipelineCache.delete(key);
      throw err;
    });
    pipelineCache.set(key, loadPromise);
  }
  return pipelineCache.get(key)!;
}

export function getModelStatusSnapshot(): ModelStatusEntry[] {
  return Array.from(modelStatus.values());
}

export async function warmUpModelGroup(keys: ModelKey[] = ['planner', 'brain', 'voice', 'companion']) {
  await Promise.all(keys.map((key) => loadModel(key).catch(() => null)));
}

function stripPrompt(prompt: string, generated: string) {
  if (!generated) return '';
  if (!prompt) return generated.trim();
  const idx = generated.indexOf(prompt);
  if (idx === 0) {
    return generated.slice(prompt.length).trim();
  }
  return generated.trim();
}

function extractJson(text: string) {
  if (!text) return null;
  const fenceMatch = text.match(/```json([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch (e) {
      // continue
    }
  }
  const braceIndex = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (braceIndex >= 0 && lastBrace > braceIndex) {
    const candidate = text.slice(braceIndex, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function runTextGenerator(key: ModelKey, prompt: string, overrides: Partial<GenerationSettings> = {}) {
  const model = await loadModel(key);
  const config = MODEL_CONFIG[key];
  const generation = { ...(config.generation || {}), ...overrides };
  const output = await model(prompt, generation);
  if (Array.isArray(output)) {
    if (typeof output[0]?.generated_text === 'string') {
      return stripPrompt(prompt, output[0].generated_text);
    }
    if (typeof output[0] === 'string') {
      return stripPrompt(prompt, output[0]);
    }
  }
  if (typeof output?.generated_text === 'string') {
    return stripPrompt(prompt, output.generated_text);
  }
  if (typeof output === 'string') {
    return stripPrompt(prompt, output);
  }
  return String(output ?? '');
}

async function runTextToText(prompt: string) {
  const model = await loadModel('voice');
  const config = MODEL_CONFIG.voice;
  const output = await model(prompt, config.generation || {});
  if (Array.isArray(output) && output[0]) {
    return (output[0].generated_text || output[0].summary_text || '').trim();
  }
  if (typeof output?.generated_text === 'string') {
    return output.generated_text.trim();
  }
  if (typeof output === 'string') {
    return output.trim();
  }
  return '';
}

async function runConversation(prompt: string) {
  const model = await loadModel('companion');
  const output = await model(prompt);
  if (Array.isArray(output) && output[0]) {
    return (output[0].generated_text || output[0].text || '').trim();
  }
  if (typeof output?.generated_text === 'string') {
    return output.generated_text.trim();
  }
  if (typeof output === 'string') {
    return output.trim();
  }
  return '';
}

export interface PlannerInput {
  userMessage: string;
  slideTitle?: string;
  slideId?: string;
  slideSummary?: string;
  evidencePreview?: string;
  chartContext?: string | null;
}

export interface PlannerResult {
  plan: string;
  focusPoints: string[];
  navigationTarget?: string | null;
  answerDraft?: string;
  rawText: string;
}

export async function runPlannerModel(input: PlannerInput): Promise<PlannerResult> {
  const prompt = `You orchestrate Retrieval-Augmented Generation (RAG) for Agent Lee. Build a small plan.
User question: ${input.userMessage}
Slide: ${input.slideTitle || 'Unknown'} (${input.slideId || 'n/a'})
Slide summary: ${input.slideSummary || 'None provided.'}
Chart context: ${input.chartContext || 'Not provided.'}
Evidence preview:
${input.evidencePreview || 'No local evidence available.'}

Respond in JSON with the following shape:
{
  "plan": "one paragraph summarizing how you will answer",
  "focusPoints": ["short bullet", "another"],
  "navigationTarget": "optional slide id/number or null",
  "answerDraft": "short draft paragraph"
}`;

  const raw = await runTextGenerator('planner', prompt, { max_new_tokens: 360, temperature: 0.33 });
  const parsed = extractJson(raw) || {};
  return {
    plan: String(parsed.plan || parsed.summary || raw || '').trim(),
    focusPoints: Array.isArray(parsed.focusPoints)
      ? parsed.focusPoints.map((p: any) => String(p)).filter(Boolean)
      : [],
    navigationTarget: parsed.navigationTarget ? String(parsed.navigationTarget).trim() : undefined,
    answerDraft: parsed.answerDraft ? String(parsed.answerDraft).trim() : undefined,
    rawText: raw.trim(),
  };
}

export interface BrainInput {
  userMessage: string;
  slideTitle?: string;
  slideId?: string;
  slideNarrative?: string;
  evidencePreview?: string;
  planner?: PlannerResult | null;
  deckPrompt: string;
}

export async function runBrainModel(input: BrainInput): Promise<string> {
  const focusBlock = input.planner?.focusPoints?.length
    ? input.planner.focusPoints.map((p, idx) => `${idx + 1}. ${p}`).join('\n')
    : '1. Highlight safety, cost, and growth impacts.';
  const navHint = input.planner?.navigationTarget
    ? `Preferred navigation target: ${input.planner.navigationTarget}`
    : 'Navigation target optional.';
  const prompt = `${input.deckPrompt}

=== USER QUESTION ===
${input.userMessage}

=== CURRENT SLIDE ===
Title: ${input.slideTitle || 'Unknown'} (ID: ${input.slideId || 'n/a'})
Narrative: ${input.slideNarrative || 'Not provided.'}

=== LOCAL EVIDENCE SUMMARY ===
${input.evidencePreview || 'No local evidence indexed yet.'}

=== PLANNER NOTES ===
Plan: ${input.planner?.plan || 'No plan available.'}
Focus points:
${focusBlock}
${navHint}

Write a confident spoken narration (3-4 short paragraphs, 250-320 words). Speak as Agent Lee. Mention data only when grounded in the evidence above. If a navigation change is required, include [[NAVIGATE: target]] once.`;

  return runTextGenerator('brain', prompt, { max_new_tokens: 440, temperature: 0.55 });
}

export interface VoiceStylerInput {
  finalAnswer: string;
  slideTitle?: string;
  planFocus?: string[];
}

export async function runVoiceStyler(input: VoiceStylerInput): Promise<string> {
  const focus = input.planFocus && input.planFocus.length ? input.planFocus.join('; ') : null;
  const prompt = `Rewrite the following answer as a natural spoken narration for a live presentation.
Slide: ${input.slideTitle || 'Unknown'}
Focus: ${focus || 'Highlight safety, cost per foot, operational excellence, and growth thesis.'}
Tone: Warm, confident, actionable. Keep references to slides intact. Preserve any [[NAVIGATE: ...]] tokens.

Answer:
${input.finalAnswer}`;
  const styled = await runTextToText(prompt);
  return styled || input.finalAnswer;
}

export interface CompanionInput {
  userMessage: string;
  finalAnswer: string;
  slideTitle?: string;
}

export async function runCompanionModel(input: CompanionInput): Promise<string> {
  const prompt = `You are Agent Lee's companion voice.
The audience asked: ${input.userMessage}
Slide: ${input.slideTitle || 'Unknown'}
Main narration:
${input.finalAnswer}

Respond with ONE friendly follow-up sentence inviting the audience to ask about charts, evidence, or next steps. Keep it under 25 words.`;
  return runConversation(prompt);
}

// Unified single-model answer with citations and optional navigation
export interface SingleModelCitationsItem {
  id: number;
  docId: string;
  score?: number | null;
  textSnippet: string;
  meta?: { path?: string | null; lineStart?: number | null; lineEnd?: number | null; type?: string | null };
}

export interface SingleModelAnswerInput {
  question: string;
  slideTitle?: string;
  chartContext?: string | null;
  citations?: SingleModelCitationsItem[];
  forceChartFocus?: boolean;
  chartData?: any[] | null;
}

export async function runSingleModelAnswer(input: SingleModelAnswerInput): Promise<string> {
  const { question, slideTitle, chartContext, citations, forceChartFocus, chartData } = input;
  const citeBlock = (citations || []).slice(0, 6).map((c) => {
    const tag = `[${c.id}]`;
    const src = c.meta?.path ? `${c.meta.path}${c.meta.lineStart && c.meta.lineEnd ? `:${c.meta.lineStart}-${c.meta.lineEnd}` : ''}` : (c.docId || 'source');
    const type = c.meta?.type ? ` (${c.meta.type})` : '';
    const score = typeof c.score === 'number' ? ` score=${c.score.toFixed(3)}` : '';
    return `${tag} ${src}${type}${score}: ${c.textSnippet}`;
  }).join('\n\n');

  const mustChart = !!(forceChartFocus && chartContext);
  const chartJson = chartData && Array.isArray(chartData) && chartData.length
    ? `\nChart Data (JSON):\n${JSON.stringify(chartData).slice(0, 6000)}`
    : '';
  const prompt = `You are Agent Lee. Answer succinctly and only with supported facts.

Question:
${question}

${slideTitle ? `Slide: ${slideTitle}\n` : ''}${chartContext ? `Chart context: ${chartContext}\n` : ''}${chartJson}

Top Evidence:
${citeBlock || '(no local evidence)'}

Instructions:
- Produce a clear 3–4 paragraph answer (≈250–320 words).
- Use inline citations like [1], [2] that refer to the evidence list above when a claim is supported.
- Do not invent citations; only cite when grounded.
- If a navigation change is appropriate, include one token [[NAVIGATE: target]] exactly once.
- If evidence is insufficient, state what is missing and suggest what to check.
 - STRICT GROUNDING: Use ONLY the information from Top Evidence and the Chart context provided above. If a claim cannot be supported by those, say so explicitly and do not introduce unrelated topics.
${mustChart ? '\n- USER ASKED ABOUT A CHART. FOCUS PRIMARILY ON THE CHART CONTEXT ABOVE. Describe what the chart shows, trends, comparisons, and the key takeaway. Do not discuss unrelated acquisitions or slides.' : ''}
`;

  return runTextGenerator('brain', prompt, { max_new_tokens: 420, temperature: 0.35, top_p: 0.9 });
}

export default {
  getModelStatusSnapshot,
  warmUpModelGroup,
  runPlannerModel,
  runBrainModel,
  runCompanionModel,
  runVoiceStyler,
  runSingleModelAnswer,
};
