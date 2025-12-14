/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: UI.COMPONENT.INTRO.SPLASH
REGION: 🔵 UI

STACK: LANG=tsx; FW=react; UI=tailwind; BUILD=node
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
  "name": "Introduction Splash Screen Component",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "UI", "Onboarding", "Introduction"],
  "identifier": "UI.COMPONENT.INTRO.SPLASH",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Introduction splash screen component; WHY=Present mode selection and voice configuration; WHO=Agent Lee System; WHERE=/components/IntroScreen.tsx; WHEN=2025-12-09; HOW=React + voice selection + TTS initialization
SPDX-License-Identifier: MIT
============================================================================ */

import React, { useState } from "react";
import { QwenLLM } from "../Models/AgentLeeBrainMonolith";
import { AGENT_STATUS, initChatSession } from "../services/leewayIndustriesService";
import { ttsService } from "../services/ttsService";
import { mapVoicesToPreferred, pickPreferredVoiceName, VoiceOption } from "../services/voicePreferences";
import { PresentationMode } from "../types";

interface IntroScreenProps {
  onStart: (mode: PresentationMode) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const qwenLLM = React.useMemo(() => new QwenLLM(), []);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedMode, setSelectedMode] = useState<PresentationMode>("Auto");
  const [modelsLoading, setModelsLoading] = useState(true);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(localStorage.getItem('agentlee_tts_voice') || '');
  const [useEnhancedVoice, setUseEnhancedVoice] = useState<boolean>(localStorage.getItem('agentlee_use_enhanced') === 'true');
  const [playDuringTyping, setPlayDuringTyping] = useState<boolean>(localStorage.getItem('agentlee_play_during') === 'true');
  const [allowLocalNarration, setAllowLocalNarration] = useState<boolean>(localStorage.getItem('agentlee_allow_local_narration') ? localStorage.getItem('agentlee_allow_local_narration') === 'true' : true);
  const [voiceRate, setVoiceRate] = useState<number>(() => {
    const stored = localStorage.getItem('agentlee_tts_rate');
    const parsed = stored ? parseFloat(stored) : NaN;
    return Number.isFinite(parsed) ? parsed : ttsService.getRate();
  });
  const [voicePitch, setVoicePitch] = useState<number>(() => {
    const stored = localStorage.getItem('agentlee_tts_pitch');
    const parsed = stored ? parseFloat(stored) : NaN;
    return Number.isFinite(parsed) ? parsed : ttsService.getPitch();
  });
  const handleVoiceTest = React.useCallback(() => {
    if (selectedVoice) {
      ttsService.setVoiceByName(selectedVoice);
    }
    ttsService.previewVoice();
  }, [selectedVoice]);

  const { preferred: preferredVoiceOptions, remaining: remainingVoiceOptions } = React.useMemo(() => mapVoicesToPreferred(voices), [voices]);

  const handleStartPresentation = React.useCallback(() => {
    if (!isChecked) return;
    try {
      if (selectedVoice) {
        ttsService.setVoiceByName(selectedVoice);
      }
      ttsService.setRate(voiceRate);
      ttsService.setPitch(voicePitch);
    } catch (e) {
      console.warn('Failed to set voice preferences before start', e);
    }
    try {
      qwenLLM.setAllowLocalNarration(allowLocalNarration);
    } catch (e) {
      console.warn('Failed to set local narration toggle', e);
    }
    try {
      if (allowLocalNarration) {
        qwenLLM.initialize();
      }
    } catch (e) {
      console.warn('Failed to initialize QwenLLM', e);
    }
    try {
      (window as any).ALLOW_LOCAL_NARRATION = allowLocalNarration;
    } catch (e) {}
    onStart(selectedMode);
  }, [allowLocalNarration, isChecked, onStart, selectedMode, selectedVoice, voicePitch, voiceRate]);

  // Load all local models and inject KB on mount
  React.useEffect(() => {
    async function preloadModels() {
      try {
        // Trigger initialization (injects KB context)
        await initChatSession("Executive");
        // Wait for model to be online
        const checkReady = () => AGENT_STATUS.initialized && AGENT_STATUS.online;
        let waited = 0;
        while (!checkReady() && waited < 8000) {
          await new Promise(res => setTimeout(res, 200));
          waited += 200;
        }
      } catch (e) {
        // Ignore errors, fallback will be handled in service
      }
      setModelsLoading(false);
    }
    preloadModels();
    // Load available TTS voices (may appear asynchronously)
    let mounted = true;
    const loadVoices = async () => {
      for (let i = 0; i < 20; i++) {
        const v = (ttsService.getAvailableVoices() as VoiceOption[]);
        if (v && v.length) {
          if (!mounted) return;
          setVoices(v);
          const pickName = pickPreferredVoiceName(v, selectedVoice);
          if (pickName && pickName !== selectedVoice) {
            setSelectedVoice(pickName);
            localStorage.setItem('agentlee_tts_voice', pickName);
            ttsService.setVoiceByName(pickName);
          }
          return;
        }
        await new Promise(r => setTimeout(r, 200));
      }
      // fallback: try window.TTS_VOICES
      try {
        const winV = (window as any).TTS_VOICES || [];
        if (winV && winV.length) {
          setVoices(winV);
          const pickName = pickPreferredVoiceName(winV, selectedVoice);
          if (pickName && pickName !== selectedVoice) {
            setSelectedVoice(pickName);
            localStorage.setItem('agentlee_tts_voice', pickName);
            ttsService.setVoiceByName(pickName);
          }
        }
      } catch (e) {}
    };
    loadVoices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-mono uppercase tracking-widest">
          Confidential Presentation
        </div>
        <h1 className="text-4xl font-bold">A Visu Sewer Story</h1>
        <p className="text-slate-400">From Pipes to Progress: An interactive journey through the infrastructure underground.</p>
        <div className="space-y-4">
          <div className="text-left">
            <label htmlFor="tts-voice-select" className="block text-sm font-medium text-slate-300 mb-2">TTS Voice</label>
            <div className="flex gap-2">
              <select
                id="tts-voice-select"
                aria-label="Text-to-speech voice"
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  localStorage.setItem('agentlee_tts_voice', e.target.value);
                  ttsService.setVoiceByName(e.target.value);
                }}
                className="flex-1 bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded"
              >
                {preferredVoiceOptions.length > 0 && (
                  <optgroup label="Preferred (Natural Female)">
                    {preferredVoiceOptions.map((voice, idx) => (
                      <option key={`${voice.actualName || voice.label}-${idx}`} value={voice.actualName ?? voice.label}>
                        {voice.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {remainingVoiceOptions.length > 0 && (
                  <optgroup label="Other Voices">
                    {remainingVoiceOptions.map((voice, idx) => (
                      <option key={`${voice.name}-${voice.lang || 'unknown'}-${idx}`} value={voice.name}>
                        {voice.name} {voice.lang ? `(${voice.lang})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {preferredVoiceOptions.length === 0 && remainingVoiceOptions.length === 0 && (
                  <option>Loading voices...</option>
                )}
              </select>
              <button
                onClick={handleVoiceTest}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Test
              </button>
            </div>
          </div>
          <label className="flex items-center gap-3 justify-center text-sm">
            <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="h-4 w-4" />
            <span className="text-xs text-slate-400">I acknowledge the Covenant and grant permission.</span>
          </label>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSelectedMode("Auto")}
              className={`px-4 py-2 rounded border ${selectedMode === "Auto" ? "border-orange-500 text-white bg-orange-600/30" : "border-slate-600 text-slate-300"}`}
            >Auto-Pilot</button>
            <button
              onClick={() => setSelectedMode("Manual")}
              className={`px-4 py-2 rounded border ${selectedMode === "Manual" ? "border-orange-500 text-white bg-orange-600/30" : "border-slate-600 text-slate-300"}`}
            >Manual</button>
          </div>
          <button 
            onClick={handleStartPresentation}
            disabled={!isChecked || modelsLoading || voices.length === 0}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded disabled:opacity-50"
          >
            {modelsLoading ? 'Loading Models...' : voices.length === 0 ? 'Loading Voices...' : 'Start Presentation'}
          </button>
        </div>
        <div className="text-[10px] text-slate-600 uppercase tracking-widest">Created by Leeway Industries</div>
      </div>
    </div>
  );
};
