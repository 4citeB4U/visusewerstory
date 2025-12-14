/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: UI.COMPONENT.TTS.AZURE
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
  "name": "Azure Cognitive Services TTS Adapter",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "TTS", "Azure", "Voice"],
  "identifier": "UI.COMPONENT.TTS.AZURE",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Azure Cognitive Services TTS adapter; WHY=Provide high-quality cloud TTS option; WHO=Agent Lee System; WHERE=/services/ttsAzure.ts; WHEN=2025-12-09; HOW=Azure Speech SDK + token-based auth
SPDX-License-Identifier: MIT
============================================================================ */

export interface AzureTtsConfig {
  tokenUrl: string; // e.g. '/api/azure/speech/token'
  defaultVoice?: string; // e.g. 'en-US-JennyNeural'
}

export class AzureTTS {
  private sdk: any | null = null;
  private speechConfig: any | null = null;
  private audioConfig: any | null = null;
  private synthesizer: any | null = null;
  private voiceName: string | null = null;
  private isReady = false;
  private tokenUrl: string;

  constructor(config: AzureTtsConfig) {
    this.tokenUrl = config.tokenUrl;
    this.voiceName = config.defaultVoice || null;
  }

  private async fetchToken(): Promise<{ token: string; region: string }> {
    const res = await fetch(this.tokenUrl, { method: 'GET' });
    if (!res.ok) throw new Error(`Azure token endpoint failed: ${res.status}`);
    const json = await res.json();
    if (!json?.token || !json?.region) throw new Error('Invalid token response');
    return { token: json.token, region: json.region };
  }

  async initialize(): Promise<boolean> {
    if (this.isReady) return true;
    try {
      // @ts-ignore — allow dynamic import without type declarations
      const mod = await import('microsoft-cognitiveservices-speech-sdk');
      const { token, region } = await this.fetchToken();
      const speechsdk = (mod as any).SpeechSDK || mod;
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechSynthesisOutputFormat = speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
      if (this.voiceName) speechConfig.speechSynthesisVoiceName = this.voiceName;
      const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
      this.sdk = speechsdk;
      this.speechConfig = speechConfig;
      this.audioConfig = audioConfig;
      this.synthesizer = synthesizer;
      this.isReady = true;
      return true;
    } catch (e) {
      console.warn('[AzureTTS] initialize failed', e);
      return false;
    }
  }

  async setVoiceByName(name: string): Promise<boolean> {
    this.voiceName = name;
    if (!this.isReady) return true;
    try {
      if (this.speechConfig) {
        this.speechConfig.speechSynthesisVoiceName = name;
      }
      return true;
    } catch {
      return false;
    }
  }

  async speak(text: string): Promise<void> {
    if (!text) return;
    if (!this.isReady) {
      const ok = await this.initialize();
      if (!ok) throw new Error('Azure TTS not ready');
    }
    await new Promise<void>((resolve, reject) => {
      this.synthesizer.speakTextAsync(
        text,
        () => resolve(),
        (err: any) => reject(err)
      );
    });
  }

  // Minimal voice listing (SDK lacks direct list; consider caching known voices server-side)
  async getAvailableVoices(): Promise<Array<{ name: string; lang?: string }>> {
    // Optional: implement server-side /api/azure/speech/voices
    return this.voiceName ? [{ name: this.voiceName }] : [];
  }
}

export const createAzureTTS = (tokenUrl: string, defaultVoice?: string) => new AzureTTS({ tokenUrl, defaultVoice });
