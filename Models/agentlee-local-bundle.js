import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@latest';
import { claimEvidence } from './referencesRegistry.js';
import { WEB_SOURCES } from './webSources.js';
import React, { createContext, useCallback, useContext, useState } from 'react';

/* ============================================================
 * SECTION 1: GemmaLLM
 * ============================================================
 */

class GemmaLLM {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.fallbackModels = [
      'Xenova/LaMini-Flan-T5-248M',
      'Xenova/distilgpt2',
      'microsoft/DialoGPT-small',
      'gpt2',
      'Xenova/LaMini-Flan-T5-783M'
    ];
    this.modelName = this.fallbackModels[0];
    this.allowLocalNarration = false;
    this.maxTokens = 1024;
    this.loadingProgress = 0;
  }

  async initialize() {
    if (this.isLoaded || this.isLoading) return this.model;

    console.log('🔄 Initializing GemmaLLM...');
    this.isLoading = true;
    try {
      const allowLocal =
        typeof window !== 'undefined' && typeof window.ALLOW_LOCAL_NARRATION === 'boolean'
          ? window.ALLOW_LOCAL_NARRATION
          : this.allowLocalNarration;
      this.allowLocalNarration = allowLocal !== false;
    } catch (e) {
      /* ignore */
    }

    for (const modelName of this.fallbackModels) {
      try {
        console.log(`🔄 Attempting to load: ${modelName}`);
        this.model = await pipeline('text-generation', modelName, {
          progress_callback: (progress) => {
            if (progress.status === 'downloading') {
              this.loadingProgress = Math.round((progress.loaded / progress.total) * 100);
              console.log(`📥 Gemma loading: ${this.loadingProgress}%`);
              try {
                window.dispatchEvent(new CustomEvent('llmLoadingProgress', {
                  detail: { model: 'gemma', progress: this.loadingProgress }
                }));
              } catch (e) {
                /* ignore */
              }
            }
          }
        });

        this.modelName = modelName;
        this.isLoaded = true;
        this.isLoading = false;
        console.log(`✅ Gemma loaded successfully: ${modelName}`);
        try {
          window.dispatchEvent(new CustomEvent('llmReady', {
            detail: { model: 'gemma', hemisphere: 'local' }
          }));
        } catch (e) {
          /* ignore */
        }
        return this.model;
      } catch (error) {
        console.error(`⚠️ Failed to load ${modelName}: ${error?.message || error}`);
      }
    }

    this.isLoading = false;
    console.warn('⚠️ Failed to load any configured Gemma compatible model(s)');
    return null;
  }

  async chatLocalFallback(message, context = []) {
    if (!this.allowLocalNarration) {
      console.warn('[Gemma] chatLocalFallback called, but local narration is disabled.');
      return {
        text: '[LOCAL LLM DISABLED] Local narration is disabled by user preference.',
        model: 'gemma:local-disabled',
        tokens: 0,
        hemisphere: 'local'
      };
    }

    if (!this.isLoaded) {
      await this.initialize();
    }
    if (!this.model) {
      return {
        text: '[LOCAL LLM UNAVAILABLE] No local model could be loaded in the browser.',
        model: 'gemma:local-unavailable',
        tokens: 0,
        hemisphere: 'local'
      };
    }

    try {
      const resp = await this.chat(message, context);
      return { ...resp, model: this.modelName || 'gemma-local' };
    } catch (e) {
      console.error('[Gemma] local fallback chat failed:', e?.message || e);
      return {
        text: '[LOCAL LLM ERROR] Local generation failed. Try again after the models finish loading.',
        model: 'gemma:local-error',
        tokens: 0,
        hemisphere: 'local'
      };
    }
  }

  async generate(prompt, options = {}) {
    if (!this.isLoaded) await this.initialize();

    const config = {
      max_new_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7,
      do_sample: true,
      top_p: options.topP || 0.9,
      top_k: 40,
      repetition_penalty: 1.3,
      no_repeat_ngram_size: 3,
      num_beams: 1,
      early_stopping: true,
      ...options
    };

    const startTime = performance.now();
    const response = await this.model(prompt, config);
    const endTime = performance.now();
    const generatedText = response[0].generated_text.replace(prompt, '').trim();

    return {
      text: generatedText,
      model: 'gemma',
      tokens: generatedText.split(' ').length,
      hemisphere: 'local',
      responseTime: Math.round(endTime - startTime)
    };
  }

  async chat(message, context = []) {
    if (!this.isLoaded) await this.initialize();

    const recentContext = context.slice(-3);
    let prompt = '';
    if (recentContext.length) {
      recentContext.forEach((msg) => {
        const role = msg.role === 'system' ? 'System' : msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n\n`;
      });
    }
    prompt += `User: ${message}\n\nAssistant:`;
    return this.generate(prompt, { maxTokens: 120, temperature: 0.8 });
  }

  async agentOperation(task, context = '') {
    const prompt = `Agent Operation Task\n\n${context ? `Context: ${context}\n\n` : ''}Task: ${task}\n\nAgent Response:`;
    return this.generate(prompt, { maxTokens: 150 });
  }

  async generateEcho(userInput, systemState) {
    const prompt = `Generate an intelligent echo response for Agent Lee system.\n\nUser Input: ${userInput}\nSystem State: ${JSON.stringify(systemState)}\n\nGenerate a helpful, contextual response:`;
    return this.generate(prompt, { maxTokens: 100, temperature: 0.8 });
  }

  async processWithContext(input, context) {
    if (!this.isLoaded) await this.initialize();
    const combinedInput = `${context}\n${input}`;
    return this.model(combinedInput, { max_length: this.maxTokens });
  }

  setAllowLocalNarration(allow) {
    try {
      this.allowLocalNarration = !!allow;
      if (typeof window !== 'undefined') window.ALLOW_LOCAL_NARRATION = !!allow;
      console.log('GemmaLLM allowLocalNarration set to', this.allowLocalNarration);
    } catch (e) {
      /* ignore */
    }
  }

  getStatus() {
    return {
      model: 'gemma',
      name: 'Gemma 2B',
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      progress: this.loadingProgress,
      hemisphere: 'local',
      color: '#FF8C00',
      capabilities: ['chat', 'agents', 'echo', 'summarization'],
      contextLength: this.maxTokens
    };
  }
}

export const gemmaLLM = new GemmaLLM();
try {
  if (typeof window !== 'undefined') {
    window.gemmaLLM = gemmaLLM;
    window.GemmaLLM = GemmaLLM;
  }
} catch (e) {
  /* ignore */
}

/* ============================================================
 * SECTION 2: embedderLLM
 * ============================================================
 */

const EMBED_MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
let embedPipeline = null;
let embedInitialized = false;

async function loadEmbedPipeline() {
  try {
    if (typeof window !== 'undefined' && window.__XENOVA_EMBED_PIPELINE) {
      return window.__XENOVA_EMBED_PIPELINE;
    }
  } catch (e) {
    /* ignore */
  }

  try {
    const mod = await import('@xenova/transformers');
    if (mod && typeof mod.pipeline === 'function') {
      const p = await mod.pipeline('feature-extraction', EMBED_MODEL_ID);
      try {
        if (typeof window !== 'undefined') window.__XENOVA_EMBED_PIPELINE = p;
      } catch (e) {
        /* ignore */
      }
      return p;
    }
  } catch (e) {
    console.warn('[embedderLLM] Xenova embedding pipeline not available, using fallback.', e);
  }

  return null;
}

function charCodeEmbed(text) {
  const buckets = 64;
  const vec = new Array(buckets).fill(0);
  const source = String(text || '');
  for (let i = 0; i < source.length; i++) {
    const bucket = i % buckets;
    vec[bucket] += source.charCodeAt(i);
  }
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => v / norm);
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}

async function embedText(text) {
  if (!embedInitialized) {
    embedPipeline = await loadEmbedPipeline();
    embedInitialized = true;
  }

  if (embedPipeline) {
    try {
      const out = await embedPipeline(String(text || ''));
      let vec = out;
      if (vec && vec.data) vec = vec.data;
      if (Array.isArray(vec) && Array.isArray(vec[0])) vec = vec[0];
      const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
      return vec.map((v) => v / norm);
    } catch (e) {
      console.warn('[embedderLLM] Embedding pipeline failed, using fallback.', e);
      return charCodeEmbed(text);
    }
  }
  return charCodeEmbed(text);
}

export const embedderLLM = {
  get isInitialized() {
    return embedInitialized;
  },
  async initialize() {
    if (embedInitialized) return;
    embedPipeline = await loadEmbedPipeline();
    embedInitialized = true;
    console.log('[embedderLLM] Initialized. Using pipeline:', !!embedPipeline);
  },
  async embedBatch(texts) {
    await this.initialize();
    const arr = Array.isArray(texts) ? texts : [texts];
    const results = [];
    for (const t of arr) {
      results.push({ text: t, embedding: await embedText(t || '') });
    }
    return results;
  },
  async embed(text) {
    await this.initialize();
    return { embedding: await embedText(text || '') };
  },
  cosineSimilarity
};

/* ============================================================
 * SECTION 3: DocStore (IndexedDB RAG)
 * ============================================================
 */

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('agentlee_rag', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('chunks')) {
        db.createObjectStore('chunks', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function chunkText(text, approxWords = 300) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += approxWords) {
    chunks.push(words.slice(i, i + approxWords).join(' '));
  }
  if (chunks.length === 0) chunks.push(text.slice(0, 1000));
  return chunks;
}

async function embedDocText(text) {
  try {
    const pipe = await loadEmbedPipeline();
    if (pipe) {
      const out = await pipe(text);
      let vec = out;
      if (vec && vec.data) vec = vec.data;
      if (Array.isArray(vec) && Array.isArray(vec[0])) vec = vec[0];
      const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
      return vec.map((v) => v / norm);
    }
  } catch (e) {
    console.warn('Embedding pipeline failed, falling back', e);
  }
  return charCodeEmbed(text);
}

export async function addDocument(docId, text, metadata = {}) {
  const chunks = chunkText(text, 300);
  const embeddings = await Promise.all(chunks.map((c) => embedDocText(c)));
  const db = await openDb();
  const tx = db.transaction('chunks', 'readwrite');
  const store = tx.objectStore('chunks');
  const now = Date.now();
  for (let i = 0; i < chunks.length; i++) {
    store.put({
      id: `${docId}__${i}`,
      docId,
      text: chunks[i],
      embedding: embeddings[i],
      metadata,
      createdAt: now
    });
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('tx error'));
  });
}

// Code-aware chunking with line ranges and metadata
function chunkCodeWithLines(sourceText, targetChunkLines = 160) {
  const lines = String(sourceText || '').split(/\r?\n/);
  const chunks = [];
  for (let start = 0; start < lines.length; start += targetChunkLines) {
    const end = Math.min(lines.length, start + targetChunkLines);
    const text = lines.slice(start, end).join('\n');
    chunks.push({ text, lineStart: start + 1, lineEnd: end });
  }
  if (!chunks.length) chunks.push({ text: String(sourceText || ''), lineStart: 1, lineEnd: Math.max(1, (String(sourceText || '').match(/\n/g) || []).length + 1) });
  return chunks;
}

export async function addCodeDocument(docId, text, metadata = {}) {
  const codeChunks = chunkCodeWithLines(text, 160);
  const embeddings = await Promise.all(codeChunks.map((c) => embedDocText(c.text)));
  const db = await openDb();
  const tx = db.transaction('chunks', 'readwrite');
  const store = tx.objectStore('chunks');
  const now = Date.now();
  for (let i = 0; i < codeChunks.length; i++) {
    const c = codeChunks[i];
    store.put({
      id: `${docId}__${c.lineStart}-${c.lineEnd}`,
      docId,
      text: c.text,
      embedding: embeddings[i],
      metadata: { ...metadata, lineStart: c.lineStart, lineEnd: c.lineEnd, type: metadata.type || 'code' },
      createdAt: now,
    });
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('tx error'));
  });
}

// Helper to index an in-memory snapshot of code files
// files: [{ path, content, lang }]
export async function indexCodeSnapshot(files = []) {
  const results = [];
  for (const file of files) {
    try {
      const docId = `code:${file.path}`;
      await addCodeDocument(docId, file.content || '', { path: file.path, lang: file.lang || '', type: 'code' });
      results.push({ docId, indexed: true });
    } catch (e) {
      results.push({ docId: `code:${file.path}`, indexed: false, error: String(e?.message || e) });
    }
  }
  return results;
}

export async function addSpreadsheetFromBuffer(docId, arrayBuffer, metadata = {}) {
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const results = [];
    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      const childDocId = `${docId}::${sheetName}`;
      await addDocument(childDocId, csv, { ...metadata, sheetName, sourceDoc: docId });
      results.push({ docId: childDocId, sheetName, chunksIndexed: true });
    }
    return results;
  } catch (e) {
    console.error('[docStore] addSpreadsheetFromBuffer failed', e);
    throw e;
  }
}

export async function indexFileFromNotepad(path, fsAdapter) {
  if (!fsAdapter || typeof fsAdapter.getFile !== 'function') {
    throw new Error('fsAdapter with getFile(path) is required');
  }
  const file = await fsAdapter.getFile(path);
  if (!file) throw new Error(`File not found: ${path}`);

  const lower = (path || '').toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    let ab;
    if (file instanceof ArrayBuffer) ab = file;
    else if (file.buffer && file.buffer instanceof ArrayBuffer) ab = file.buffer;
    else if (typeof file === 'string') {
      if (file.includes('\n')) {
        await addSpreadsheetFromBuffer(path, new TextEncoder().encode(file).buffer, { originalPath: path });
        return { indexed: true };
      }
      const bytes = Uint8Array.from(atob(file.replace(/^data:.*;base64,/, '')), (c) => c.charCodeAt(0));
      ab = bytes.buffer;
    }
    if (!ab) throw new Error('Could not obtain ArrayBuffer for spreadsheet');
    return addSpreadsheetFromBuffer(path, ab, { originalPath: path });
  }

  let text;
  if (typeof file === 'string') text = file;
  else if (file instanceof ArrayBuffer) text = new TextDecoder().decode(file);
  else if (file.buffer) text = new TextDecoder().decode(file.buffer);
  else text = String(file);

  await addDocument(path, text, { originalPath: path });
  return { indexed: true };
}

export async function search(query, topK = 5) {
  const qEmb = await embedDocText(query);
  const db = await openDb();
  const tx = db.transaction('chunks', 'readonly');
  const store = tx.objectStore('chunks');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      const scored = all.map((chunk) => ({ ...chunk, score: cosineSimilarity(qEmb, chunk.embedding) }));
      scored.sort((a, b) => b.score - a.score);
      resolve(scored.slice(0, topK));
    };
    req.onerror = () => reject(req.error || new Error('getAll failed'));
  });
}

export async function clearStore() {
  const db = await openDb();
  const tx = db.transaction('chunks', 'readwrite');
  tx.objectStore('chunks').clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('clear failed'));
  });
}

export async function bootstrapRag() {
  try {
    const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/';
    const files = ['data/project_costs.csv', 'data/cctv_inspection.csv', 'data/bid_amounts.csv'];
    for (const filePath of files) {
      try {
        const url = `${base}${filePath}`.replace(/([^:]?)\/\//g, '$1/');
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[RAG] Could not fetch ${filePath}: ${response.status}`);
          continue;
        }
        const text = await response.text();
        await addDocument(filePath, text, { originalPath: filePath });
        console.log(`[RAG] Indexed ${filePath}`);
      } catch (e) {
        console.warn(`[RAG] Failed to index ${filePath}:`, e);
      }
    }
    console.log('[RAG] Indexed core CSVs for Agent Lee.');
  } catch (e) {
    console.error('[RAG] Indexing failed', e);
  }
}

export const docStore = { addDocument, search, clearStore, bootstrapRag };
try {
  if (typeof window !== 'undefined') {
    window.bootstrapRag = bootstrapRag;
  }
} catch (e) {
  /* ignore */
}

/* ============================================================
 * SECTION 4: docStoreBootstrap helper
 * ============================================================
 */

function csvToText(csv, options) {
  const rows = csv.split(/\r?\n/).filter((r) => r.trim().length > 0);
  if (!rows.length) return '';
  const header = rows[0].split(',').map((h) => h.trim());
  const maxRows = (options && options.maxRows) || 50;
  const bodyRows = rows.slice(1, 1 + maxRows).map((r) => r.split(','));
  const lines = [`Columns: ${header.join(', ')}`];
  bodyRows.forEach((cols, idx) => {
    const pairs = header.map((h, i) => `${h}=${(cols[i] || '').trim()}`);
    lines.push(`Row ${idx + 1}: ${pairs.join('; ')}`);
  });
  if (rows.length - 1 > maxRows) {
    lines.push(`… truncated; total rows ≈ ${rows.length - 1}`);
  }
  return lines.join('\n');
}

async function loadCsvAndIndex(docId, url, meta) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[docStoreBootstrap] Failed to fetch ${url}:`, res.status);
      return;
    }
    const csvText = await res.text();
    const plainText = csvToText(csvText, { maxRows: 200 });
    await addDocument(docId, plainText, meta);
    console.info(`[docStoreBootstrap] Indexed ${docId} from ${url}`);
  } catch (err) {
    console.error(`[docStoreBootstrap] Error indexing ${url}:`, err);
  }
}

export async function initDocStore() {
  try {
    const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/';
    const core = [
      loadCsvAndIndex('bid_amounts', `${base}data/bid_amounts.csv`, {
        type: 'csv',
        topic: 'bids',
        description: 'Bid amounts and competitors for Visu-Sewer projects'
      }),
      loadCsvAndIndex('cctv_inspection', `${base}data/cctv_inspection.csv`, {
        type: 'csv',
        topic: 'cctv',
        description: 'Defect types, severity, and affected length by segment'
      }),
      loadCsvAndIndex('contractor_schedule', `${base}data/contractor_schedule.csv`, {
        type: 'csv',
        topic: 'schedule',
        description: 'Task schedule, start/end dates, and % complete over time'
      }),
      loadCsvAndIndex('project_costs', `${base}data/project_costs.csv`, {
        type: 'csv',
        topic: 'costs',
        description: 'Yearly budgeted vs actual spend and variance'
      })
    ];

    // Index any CSV/text files referenced in the references registry (if they live under /public)
    try {
      const extraFiles = Array.from(new Set(
        (Array.isArray(claimEvidence) ? claimEvidence : [])
          .flatMap(c => Array.isArray(c.filePaths) ? c.filePaths : [])
          .filter(Boolean)
      ));
      for (const rel of extraFiles) {
        const docId = String(rel).replace(/^\/*/, '').replace(/\//g, '_');
        core.push(loadCsvAndIndex(docId, `${base}${rel}`.replace(/([^:]?)\/\//g, '$1/'), {
          type: 'csv',
          topic: 'reference',
          description: `Indexed from referencesRegistry: ${rel}`
        }));
      }
    } catch (e) {
      console.warn('[docStoreBootstrap] skipping referencesRegistry indexing', e);
    }

    await Promise.all(core);
    console.info('[docStoreBootstrap] Core CSV documents indexed.');
  } catch (err) {
    console.error('[docStoreBootstrap] Unexpected error:', err);
  }
}

/* ============================================================
 * SECTION 5: AgentTeam (local ensemble orchestrator)
 * ============================================================
 */

const docSearch = search;

function embedTextLegacy(text) {
  return text.split(' ').map((w) => w.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
}

export class AgentTeam {
  constructor() {
    this.modelNames = ['gemma:local'];
    this.isLoaded = false;
    try {
      const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
      this.allowLocalNarration = env.VITE_ALLOW_LOCAL_NARRATION !== 'false';
    } catch (e) {
      this.allowLocalNarration = true;
    }
  }

  async initialize() {
    console.log('[AgentTeam] Initializing local-only mode');
    this.isLoaded = true;
  }

  async embedContext(context) {
    return this.modelNames.map((name) => ({ model: name, embedding: embedTextLegacy(context) }));
  }

  async askAllModels(question, context = '') {
    if (!this.isLoaded) await this.initialize();

    const messages = [
      { role: 'system', content: context || '' },
      { role: 'user', content: question || '' }
    ];

    const isEvidenceOnly = typeof context === 'string' && context.includes('---- EVIDENCE START ----');
    if (isEvidenceOnly) {
      try {
        const localData = await this.retrieveLocalData(question, context);
        const shortPreview = localData ? localData.split('\n').slice(0, 6).join('\n') : 'No local data found.';
        return { responses: [{ text: `LOCAL_EVIDENCE_SUMMARY: ${shortPreview}`, model: 'local_evidence' }], embeddings: [] };
      } catch (e) {
        console.warn('[AgentTeam] evidence-only local summarizer failed', e);
        return { responses: [{ text: 'LOCAL_EVIDENCE_SUMMARY: (failed to produce evidence)', model: 'local_evidence' }], embeddings: [] };
      }
    }

    const promises = [];
    if (this.allowLocalNarration) {
      promises.push((async () => {
        try {
          console.log('[AgentTeam] Calling local gemmaLLM (in-browser)');
          const localResp = await gemmaLLM.chatLocalFallback(question, messages);
          return { text: localResp?.text || '', model: localResp?.model || 'gemma:local' };
        } catch (err) {
          console.warn('[AgentTeam] Local gemmaLLM call failed', err);
          return { text: '', model: 'gemma:local-error', error: String(err?.message || err) };
        }
      })());
    }

    const responses = (await Promise.all(promises))
      .filter((r) => r.text && r.text.trim().length > 0 && !r.error)
      .filter((r) => {
        const text = r.text.trim();
        const words = text.split(/\s+/);
        if (words.length < 5) return false;
        const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
        const repetitionRatio = uniqueWords.size / words.length;
        if (repetitionRatio < 0.2) {
          console.log(`[AgentTeam] Rejected ${r.model} - too repetitive (${repetitionRatio})`);
          return false;
        }
        const normalized = text
          .toLowerCase()
          .replace(/[^a-z]/g, '')
          .replace(/(.)\1+/g, '$1');
        if (
          normalized.includes('agent') ||
          normalized.includes('lee') ||
          normalized.includes('aello') ||
          normalized.includes('agello')
        ) {
          console.log(`[AgentTeam] Rejected ${r.model} - contains garbled Agent Lee-like text`);
          return false;
        }
        if (
          text.toLowerCase().startsWith('system:') ||
          text.toLowerCase().includes('you are agent lee') ||
          text.toLowerCase().includes('if the user asks to navigate')
        ) {
          console.log(`[AgentTeam] Rejected ${r.model} - detected system prompt echo`);
          return false;
        }
        return true;
      });

    if (!responses.length) {
      try {
        const localData = await this.retrieveLocalData(question, context);
        const shortPreview = localData ? localData.split('\n').slice(0, 6).join('\n') : 'No local data found.';
        return { responses: [{ text: `LOCAL_EVIDENCE_SUMMARY: ${shortPreview}`, model: 'local_evidence' }], embeddings: [] };
      } catch (e) {
        return { responses: [{ text: "I'm sorry, the local models are still loading. Please try again in a moment.", model: 'fallback' }], embeddings: [] };
      }
    }

    return { responses, embeddings: [] };
  }

  async retrieveLocalData(question, context = '') {
    try {
      const query = `${question} ${context}`.trim();
      const hits = await docSearch(query, 6);
      if (hits && hits.length) {
        return hits
          .map((h, i) => `Chunk ${i + 1} (doc=${h.docId}, score=${(h.score || 0).toFixed(3)}):\n${h.text.slice(0, 800)}`)
          .join('\n\n');
      }
    } catch (e) {
      console.warn('docStore search failed, falling back to file previews', e);
    }
    return '';
  }

  async answer(question, context = '') {
    const { responses } = await this.askAllModels(question, context);
    const hasLocalEvidenceOnly =
      responses &&
      responses.length === 1 &&
      String(responses[0].model || '').toLowerCase() === 'local_evidence';

    const validResponses = (responses || []).filter((r) => {
      const modelName = String(r.model || '').toLowerCase();
      if (!this.allowLocalNarration && (modelName.startsWith('gemma:') || modelName.includes('local-disabled'))) return false;
      return true;
    });

    let best = null;
    try {
      await embedderLLM.initialize();
      const texts = validResponses.map((r) => (r && r.text ? r.text : String(r)));
      if (!texts.length) throw new Error('No valid responses to evaluate');
      const embObjs = await embedderLLM.embedBatch(texts);
      const embs = embObjs.map((e) => e.embedding || []);
      const scores = new Array(embs.length).fill(0);
      for (let i = 0; i < embs.length; i++) {
        for (let j = 0; j < embs.length; j++) {
          if (i === j) continue;
          scores[i] += embedderLLM.cosineSimilarity(embs[i], embs[j]);
        }
        scores[i] = scores[i] / (embs.length - 1 || 1);
      }
      let maxIdx = 0;
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] > scores[maxIdx]) maxIdx = i;
      }
      best = validResponses[maxIdx];
    } catch (e) {
      const pool = validResponses.length ? validResponses : responses;
      if (pool && pool.length) {
        best = pool.reduce((a, b) => (a.text && b.text && a.text.length > b.text.length ? a : b));
      }
    }

    if (!best && hasLocalEvidenceOnly) {
      best = responses[0];
    }

    try {
      if (typeof window !== 'undefined' && window.AGENT_STATUS) {
        window.AGENT_STATUS.model = best?.model;
      }
    } catch (e) {
      /* ignore */
    }

    return { best, all: responses };
  }

  async explainChart(selector, question = '') {
    const localData = await this.retrieveLocalData(selector, question);
    const prompt = `You are a data analyst. The user requests: ${question || selector}.\n\nUse the following local data as context:\n${localData}\n\nProvide: 1) A short summary of what the chart likely shows.\n2) Three actionable insights.\n3) One suggested visualization improvement or follow-up analysis.`;
    return this.answer(prompt, `Chart explanation context for selector: ${selector}`);
  }
}

export const agentTeam = new AgentTeam();
try {
  if (typeof window !== 'undefined') {
    window.agentTeam = agentTeam;
  }
} catch (e) {
  /* ignore */
}

/* ============================================================
 * SECTION 6: Evidence helper + DOM snapshot glue
 * ============================================================
 */

function getChartContextForSlide(idOrTitle) {
  try {
    if (
      typeof window !== 'undefined' &&
      window.AgentLeeChartRegistry &&
      typeof window.AgentLeeChartRegistry.getChartContextForSlide === 'function'
    ) {
      return window.AgentLeeChartRegistry.getChartContextForSlide(idOrTitle);
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

function getChartDataForSlide(idOrTitle) {
  try {
    if (
      typeof window !== 'undefined' &&
      window.AgentLeeChartRegistry &&
      typeof window.AgentLeeChartRegistry.getChartDataForSlide === 'function'
    ) {
      return window.AgentLeeChartRegistry.getChartDataForSlide(idOrTitle);
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

export async function answerWithEvidence(question, context = '', currentSlide = null) {
  const queryParts = [question, context];
  if (currentSlide?.title) queryParts.push(currentSlide.title);
  if (currentSlide?.id) queryParts.push(String(currentSlide.id));
  const query = queryParts.filter(Boolean).join(' | ').trim() || question || 'Visu-Sewer overview';

  let hits = [];
  try {
    hits = await docSearch(query, 6);
  } catch (err) {
    console.warn('[answerWithEvidence] docStore search failed', err);
  }

  const preview = hits.length
    ? hits
        .map((chunk, index) => {
          const text = (chunk.text || '').slice(0, 600);
          const score = typeof chunk.score === 'number' ? chunk.score.toFixed(3) : 'n/a';
          return `Chunk ${index + 1} (doc=${chunk.docId || 'unknown'}, score=${score}):\n${text}`;
        })
        .join('\n\n')
    : 'No indexed evidence available yet. Capture fresh data via the Evidence Locker button.';

  // Build structured citations array with metadata for UI
  const citations = hits.map((h, i) => ({
    id: i + 1,
    docId: h.docId || 'unknown',
    score: typeof h.score === 'number' ? h.score : null,
    textSnippet: String(h.text || '').slice(0, 600),
    meta: {
      path: h?.metadata?.path || h?.metadata?.originalPath || null,
      lineStart: typeof h?.metadata?.lineStart === 'number' ? h.metadata.lineStart : null,
      lineEnd: typeof h?.metadata?.lineEnd === 'number' ? h.metadata.lineEnd : null,
      type: h?.metadata?.type || null,
    },
  }));

  const chartContext = currentSlide ? getChartContextForSlide(currentSlide.id || currentSlide.title || '') : null;
  const chartData = currentSlide ? getChartDataForSlide(currentSlide.id || currentSlide.title || '') : null;

  // Match claimEvidence entries by slide title (or include all if none)
  let matchedClaims = [];
  try {
    const title = currentSlide?.title ? String(currentSlide.title).toLowerCase() : '';
    matchedClaims = (Array.isArray(claimEvidence) ? claimEvidence : []).filter(c => {
      if (!title) return true;
      const pageTitle = (c.pageTitle || '').toLowerCase();
      return pageTitle && title.includes(pageTitle);
    });
  } catch (e) {
    /* ignore claim matches */
  }

  // Suggest relevant web sources (labels only) – do not fetch contents here
  let suggestedWeb = [];
  try {
    const q = String(question || '').toLowerCase();
    suggestedWeb = (Array.isArray(WEB_SOURCES) ? WEB_SOURCES : [])
      .map(src => ({ src, score: ((src.label||'') + ' ' + (src.category||'') + ' ' + (src.tags||[]).join(' ')).toLowerCase().includes(q) ? 1 : 0 }))
      .filter(x => x.score > 0)
      .slice(0, 5)
      .map(x => ({ label: x.src.label, url: x.src.url, category: x.src.category }));
  } catch (e) {
    /* ignore suggestions */
  }

  return {
    answer: null,
    evidence: {
      localDataPreview: preview,
      matchedClaims,
      urls: matchedClaims.flatMap(c => Array.isArray(c.sources) ? c.sources : []).slice(0, 10),
      webSources: suggestedWeb,
      chartContext,
      chartData,
      citations
    }
  };
}

/* ============================================================
 * SECTION 7: DOM Command Protocol + React hooks
 * ============================================================
 */

const DomAgentContext = createContext(null);

export async function runDomCommand(cmd) {
  if (!cmd || !cmd.action) return;
  switch (cmd.action) {
    case 'click': {
      const els = Array.from(document.querySelectorAll(cmd.selector || ''));
      const el = els[cmd.index ?? 0];
      if (el) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      break;
    }
    case 'type': {
      const target = document.querySelector(cmd.selector || '');
      if (target) {
        target.focus();
        target.value = cmd.text || '';
        target.dispatchEvent(new Event('input', { bubbles: true }));
        if (cmd.submit && target.form) {
          if (typeof target.form.requestSubmit === 'function') target.form.requestSubmit();
          else target.form.submit();
        }
      }
      break;
    }
    case 'scroll': {
      const behavior = cmd.behavior || 'smooth';
      if (cmd.target === 'top') {
        window.scrollTo({ top: 0, behavior });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
      }
      break;
    }
    case 'scrollToElement': {
      const el = document.querySelector(cmd.selector || '');
      if (el) {
        el.scrollIntoView({ behavior: cmd.behavior || 'smooth', block: 'center' });
      }
      break;
    }
    case 'wait': {
      const ms = typeof cmd.ms === 'number' ? cmd.ms : 1000;
      await new Promise((resolve) => setTimeout(resolve, ms));
      break;
    }
    case 'done':
    default:
      break;
  }
}

export function buildCssSelector(el) {
  const parts = [];
  let current = el;
  while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }
    const classList = Array.from(current.classList || []);
    if (classList.length) {
      part += '.' + classList.slice(0, 2).join('.');
    }
    parts.unshift(part);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

export function takeDomSnapshot(limit = 50) {
  const nodeList = Array.from(document.querySelectorAll('button, a, input, textarea, [role="button"]'));
  const elements = nodeList.slice(0, limit).map((el, idx) => {
    const label = el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || '';
    return {
      id: idx,
      tag: el.tagName.toLowerCase(),
      text: label.slice(0, 120),
      attrs: {
        name: el.getAttribute('name') || '',
        type: el.getAttribute('type') || '',
        placeholder: el.getAttribute('placeholder') || '',
        role: el.getAttribute('role') || ''
      },
      selector: buildCssSelector(el)
    };
  });
  return {
    url: window.location.href,
    title: document.title,
    elements
  };
}

export function DomAgentProvider({ children }) {
  const execute = useCallback((cmd) => runDomCommand(cmd), []);
  return React.createElement(DomAgentContext.Provider, { value: { execute } }, children);
}

export function useDomAgent() {
  const ctx = useContext(DomAgentContext);
  if (!ctx) {
    throw new Error('useDomAgent must be used within <DomAgentProvider>.');
  }
  return ctx;
}

export function useUiAgent(goal) {
  const { execute } = useDomAgent();
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);

  const step = useCallback(async () => {
    const snapshot = takeDomSnapshot();
    const res = await fetch('/agent/next-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, snapshot, history })
    });
    if (!res.ok) {
      throw new Error(`/agent/next-command failed with status ${res.status}`);
    }
    const cmd = await res.json();
    setHistory((prev) => [...prev, cmd]);
    await execute(cmd);
    return cmd;
  }, [goal, history, execute]);

  const runToCompletion = useCallback(
    async (maxSteps = 10) => {
      setRunning(true);
      try {
        for (let i = 0; i < maxSteps; i++) {
          const cmd = await step();
          if (cmd.action === 'done') break;
        }
      } finally {
        setRunning(false);
      }
    },
    [step]
  );

  return { running, history, step, runToCompletion };
}

export default {
  gemmaLLM,
  embedderLLM,
  addDocument,
  search,
  clearStore,
  bootstrapRag,
  initDocStore,
  agentTeam,
  answerWithEvidence,
  docStore,
  DomAgentProvider,
  useDomAgent,
  useUiAgent,
  runDomCommand,
  takeDomSnapshot
};
