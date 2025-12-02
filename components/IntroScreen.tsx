
import React, { useState } from "react";
import { gemmaLLM } from "../Models/agentlee-local-bundle.js";
import { AGENT_STATUS, initChatSession } from "../services/leewayIndustriesService";
import { ttsService } from "../services/ttsService";
import { mapVoicesToPreferred, pickPreferredVoiceName, VoiceOption } from "../services/voicePreferences";
import { PresentationMode } from "../types";

interface IntroScreenProps {
  onStart: (mode: PresentationMode) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
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
      gemmaLLM.setAllowLocalNarration(allowLocalNarration);
    } catch (e) {
      console.warn('Failed to set gemmaLLM narration toggle', e);
    }
    try {
      if (allowLocalNarration) {
        gemmaLLM.initialize();
      }
    } catch (e) {
      console.warn('Failed to initialize gemmaLLM', e);
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
            disabled={!isChecked}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded disabled:opacity-50"
          >Start Presentation</button>
        </div>
        <div className="text-[10px] text-slate-600 uppercase tracking-widest">Created by Leeway Industries</div>
      </div>
    </div>
  );
};
