/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: UI.COMPONENT.TTS.SERVICE
REGION: 🔵 UI

STACK: LANG=ts; FW=none; UI=none; BUILD=node
RUNTIME: browser
TARGET: web-app

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=in-app;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Text-to-Speech Service",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "TTS", "Voice", "Accessibility"],
  "identifier": "UI.COMPONENT.TTS.SERVICE",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Text-to-speech service wrapper; WHY=Unified TTS interface with voice management; WHO=Agent Lee System; WHERE=/services/ttsService.ts; WHEN=2025-12-09; HOW=Web Speech API + voice preferences + queue management
SPDX-License-Identifier: MIT
============================================================================ */

import { preferredVoiceLabels } from "./voicePreferences";

// Simple wrapper for Web Speech API
class TTSService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private desiredVoiceName: string | null = null;
  private isMuted = false;
  private queue: Array<{ text: string; onEnd?: () => void; onStart?: () => void }> = [];
  private isProcessingQueue = false;
  private currentText: string | null = null;
  private rate: number;
  private pitch: number;

  constructor() {
    this.synth = window.speechSynthesis;
    this.desiredVoiceName = this.readStoredString('agentlee_tts_voice');
    this.rate = this.readStoredNumber('agentlee_tts_rate', 1.0, 0.6, 1.4);
    this.pitch = this.readStoredNumber('agentlee_tts_pitch', 1.0, 0.6, 1.4);
    // Initialize voices (browsers load async)
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
    this.loadVoices();
  }

  private readStoredString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  private storeString(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  private readStoredNumber(key: string, fallback: number, min: number, max: number) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const num = parseFloat(raw);
      if (Number.isNaN(num)) return fallback;
      return this.clamp(num, min, max);
    } catch (e) {
      return fallback;
    }
  }

  private storeNumber(key: string, value: number) {
    try {
      localStorage.setItem(key, value.toString());
    } catch (e) {}
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  private findVoiceByName(list: SpeechSynthesisVoice[], name?: string | null) {
    if (!name) return undefined;
    const normalizedTarget = this.normalizeName(name);
    return (
      list.find((v) => this.normalizeName(v.name) === normalizedTarget) ||
      list.find((v) => v.name?.toLowerCase().includes(name.toLowerCase()))
    );
  }

  private normalizeName(value?: string | null) {
    return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  private loadVoices() {
    const voices = this.synth.getVoices();
    if (voices && voices.length && this.desiredVoiceName) {
      const pinned = this.findVoiceByName(voices, this.desiredVoiceName);
      if (pinned) {
        this.voice = pinned;
      }
    }
    // Voice preference list: prefer Emma Multilingual Neural, then Samantha, then Microsoft Natural voices
    const preferred = preferredVoiceLabels;
    // Try to find an exact preferred match, then fallback to en-US, then first voice
    let found: SpeechSynthesisVoice | undefined = undefined;
    const desired = this.findVoiceByName(voices, this.desiredVoiceName || undefined);
    if (desired) {
      found = desired;
    } else {
      for (const p of preferred) {
        found = voices.find(v => v.name && v.name.toLowerCase().includes(p.toLowerCase()));
        if (found) break;
      }
    }
    if (!found) {
      found = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en-us')) || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || (voices.length ? voices[0] : undefined);
    }
    this.voice = found || null;
    if (this.voice?.name) {
      this.storeString('agentlee_tts_voice', this.voice.name);
    }
    // Expose available voices for diagnostics
    try {
      (window as any).TTS_VOICES = voices.map(v => ({ name: v.name, lang: v.lang, default: v.default, localService: v.localService, voiceURI: v.voiceURI }));
      if ((window as any).TTS_DEBUG !== false) {
        console.table((window as any).TTS_VOICES, ['name', 'lang', 'localService']);
      }
    } catch (e) {}
  }

  public getAvailableVoices() {
    try {
      const live = this.synth.getVoices();
      if (live?.length) {
        return live.map(v => ({ name: v.name, lang: v.lang }));
      }
      return (window as any).TTS_VOICES || [];
    } catch (e) {
      return [];
    }
  }

  public setVoiceByName(name: string) {
    this.desiredVoiceName = name;
    const voices = this.synth.getVoices();
    const v = this.findVoiceByName(voices, name);
    if (v) {
      this.voice = v;
      this.storeString('agentlee_tts_voice', v.name);
    }
    return !!v;
  }

  public speak(text: string, onEnd?: () => void, onStart?: () => void) {
    // Cancel any currently speaking
    this.cancel();

    // Small delay to ensure cancellation takes effect
    setTimeout(() => {
        // Web Speech only
        this._speakWeb(text, onEnd, onStart);
    }, 50);
  }

  private _speakWeb(text: string, onEnd?: () => void, onStart?: () => void) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
          utterance.voice = this.voice;
        }
        
        // Rate/Pitch adjustments for "Agent" persona
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        
        // Handle Mute via Volume
        utterance.volume = this.isMuted ? 0 : 1;

        utterance.onstart = () => {
            if (onStart) onStart();
        };

        utterance.onend = () => {
            if (onEnd) onEnd();
          // After our synchronous speak, check queue
          this._processQueue();
        };

        utterance.onerror = (e) => {
            // Ignore "interrupted" or "canceled" errors which happen frequently during manual nav
            if ((e as any).error === 'interrupted' || (e as any).error === 'canceled') {
                return;
            }
            console.warn("TTS Event:", (e as any).error);
            // Even on error, trigger onEnd to not hang the auto-pilot
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }

  private _speakImmediate(text: string, onEnd?: () => void, onStart?: () => void) {
    console.log('[TTS] Speaking:', text.slice(0, 50), 'Voice:', this.voice?.name);
    this.currentText = text;
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.isMuted ? 0 : 1;
    utterance.onstart = () => { console.log('[TTS] Started'); if (onStart) onStart(); };
    utterance.onend = () => { console.log('[TTS] Ended'); if (onEnd) onEnd(); this._processQueue(); };
    utterance.onerror = (_e) => { console.log('[TTS] Error:', _e); if (onEnd) onEnd(); this._processQueue(); };
    this.synth.speak(utterance);
  }

  private _processQueue() {
    if (this.isProcessingQueue) return;
    if (!this.queue.length) return;
    this.isProcessingQueue = true;
    const item = this.queue.shift();
    if (!item) { this.isProcessingQueue = false; return; }
    // Speak without interruption
    this._speakImmediate(item.text, () => { if (item.onEnd) item.onEnd(); this.isProcessingQueue = false; this._processQueue(); }, item.onStart);
  }

  // Enqueue speech that should occur after current utterances finish
  public speakQueued(text: string, onEnd?: () => void, onStart?: () => void) {
    if (!text) return;
    try {
      if (this.synth.speaking || this.synth.paused || this.isProcessingQueue) {
        this.queue.push({ text, onEnd, onStart });
      } else {
        // Speak immediately but still treat as queue item to chain events
        this.queue.push({ text, onEnd, onStart });
        this._processQueue();
      }
    } catch (e) { console.error('speakQueued error', e); }
  }

  public speakQueuedAsync(text: string): Promise<void> {
    if (!text) return Promise.resolve();
    return new Promise((resolve) => {
      this.speakQueued(text, () => resolve());
    });
  }

  // Await both start and end; if speech never starts within timeout, resolve with started=false
  public speakQueuedAwaitStartAndEndAsync(text: string, startTimeoutMs = 1500): Promise<{ started: boolean }> {
    if (!text) return Promise.resolve({ started: false });
    return new Promise((resolve) => {
      let started = false;
      let startTimer: number | undefined;
      const onStart = () => {
        started = true;
        if (startTimer) clearTimeout(startTimer as unknown as number);
      };
      const onEnd = () => {
        if (startTimer) clearTimeout(startTimer as unknown as number);
        resolve({ started });
      };
      // Start timeout: if onstart never fires, we still resolve, indicating started=false
      startTimer = (setTimeout(() => {
        // If not started by timeout, allow the queue to continue and resolve when current item ends
        // But if nothing is speaking, resolve now to avoid infinite wait
        if (!this.synth.speaking && !this.synth.paused) {
          resolve({ started: false });
        }
      }, Math.max(300, startTimeoutMs)) as unknown) as number;
      this.speakQueued(text, onEnd, onStart);
    });
  }

  public pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  public cancel() {
    // Explicitly check if speaking to avoid unnecessary calls
    if (this.synth.speaking || this.synth.pending || this.synth.paused) {
        this.synth.cancel();
    }
  }

  // Clear any pending queued speeches but do not cancel currently playing speech
  public clearQueue() {
    this.queue = [];
    this.isProcessingQueue = false;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    // If currently speaking, restart the same utterance with updated volume to ensure immediate silence
    if (this.synth.speaking && this.currentText) {
      this.cancel();
      const text = this.currentText;
      setTimeout(() => {
        this._speakImmediate(text);
      }, 50);
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(value: number) {
    this.rate = this.clamp(value, 0.6, 1.4);
    this.storeNumber('agentlee_tts_rate', this.rate);
  }

  public getPitch(): number {
    return this.pitch;
  }

  public setPitch(value: number) {
    this.pitch = this.clamp(value, 0.6, 1.4);
    this.storeNumber('agentlee_tts_pitch', this.pitch);
  }

  public previewVoice(sampleText?: string) {
    const text = sampleText || "Hi, I'm Agent Lee. Let's walk this page together.";
    this.cancel();
    this.clearQueue();
    setTimeout(() => {
      this._speakImmediate(text);
    }, 50);
  }
}

export const ttsService = new TTSService();

// Expose for console/debugging convenience
try { (window as any).ttsService = ttsService; } catch (e) {}
