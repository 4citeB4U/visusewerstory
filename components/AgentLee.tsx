import { MagnifyingGlassPlusIcon, PauseCircleIcon, SpeakerWaveIcon, UserIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from "react";
import { STORY_CONFIG } from '../constants';
import { AGENT_STATUS, ALLOW_LOCAL_NARRATION, initChatSession, isAgentNameVariant, isGarbled, LOCAL_LLM_DISABLED_RE, sendMessageToAgentLee } from "../services/leewayIndustriesService";
import { ttsService } from "../services/ttsService";
import { SlideDefinition, UserRole } from "../types";

interface AgentLeeProps {
  role: UserRole;
  currentSlide: SlideDefinition;
  isSpeaking: boolean;
  onNavigate: (target: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  playDuringTyping?: boolean;
}

interface Message {
  id: number;
  sender: "user" | "agent";
  text: string;
  isStreaming?: boolean;
}

// Helper component for Streaming Text effect
const TypewriterText: React.FC<{ text: string; onComplete: () => void; speedMs?: number }> = ({ text, onComplete, speedMs = 80 }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(intervalId);
        onComplete();
      }
    }, speedMs); // Speed of streaming (ms per character) - default tuned to TTS

    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

export const AgentLee: React.FC<AgentLeeProps> = ({ role, currentSlide, isSpeaking, onNavigate, isOpen: controlledOpen, onOpenChange, playDuringTyping }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof controlledOpen !== 'undefined';
  const isOpen = isControlled ? !!controlledOpen : internalOpen;
  const setIsOpen = (v: boolean) => {
    if (isControlled) {
      onOpenChange?.(v);
    } else {
      setInternalOpen(v);
    }
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [greetingId, setGreetingId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [agentStatus, setAgentStatus] = useState(AGENT_STATUS);
  const [showDiag, setShowDiag] = useState(false);
  const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestSlideRef = useRef<SlideDefinition | null>(currentSlide);
  useEffect(() => { latestSlideRef.current = currentSlide; }, [currentSlide]);

  let assistantText = "(No answer returned)"; // Declare assistantText earlier
  useEffect(() => {
    initChatSession(role);
  }, [role]);

  // Poll AGENT_STATUS for UI display (simple and safe)
  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setAgentStatus({ ...AGENT_STATUS });
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // When Agent Lee box opens, create contextual greeting and speak it
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const slideTitle = currentSlide.title;
      const greetingText = `Hello. I am Agent Lee. I am here to help you understand "${slideTitle}". How can I assist you with this data?`;

      const greetingMessage: Message = {
        id: Date.now(),
        sender: "agent",
        text: greetingText,
        isStreaming: false
      };

      setGreetingId(greetingMessage.id);
      setMessages([greetingMessage]);

      // Speak greeting immediately (non-streaming) with a tiny delay to avoid cancel race
      setTimeout(() => {
        try { (ttsService as any).speakQueued?.(greetingText); } catch (e) { /* noop */ }
      }, 120);
    }
  }, [isOpen, currentSlide, messages.length, playDuringTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    // Check user input for navigation requests and trigger immediately
    const userNavMatch = input.match(/(?:go to|turn to|page|slide|navigate to)\s*(\d+)/i);
    let didNav = false;
    let residualQuery = input;
    if (userNavMatch) {
      const pageNum = parseInt(userNavMatch[1], 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= STORY_CONFIG.slides.length) {
        console.log('User requested navigation to page:', pageNum);
        const navAck: Message = {
          id: Date.now() + 1,
          sender: 'agent',
          text: `Certainly. Turning to Page ${pageNum}.`,
          isStreaming: false,
        };
        setMessages((prev) => [...prev, navAck]);
        onNavigate(pageNum.toString()); // Pass as string for proper handling
        didNav = true;
        // Remove the navigation phrase from the residual query
        residualQuery = input.replace(userNavMatch[0], '').replace(/\s{2,}/g, ' ').trim();
      }
    }

    const runAnswer = async (query: string) => {
      // Use the local narration service directly for responses
      console.log('Getting response from local model hub...');
      const slideForAnswer = latestSlideRef.current || currentSlide;
      const agentResponse = await sendMessageToAgentLee(query || input, slideForAnswer as any);
      assistantText = agentResponse.text || "(No answer returned)";
      let navigationTarget = agentResponse.navigationTarget;

      // Handle navigation from response
      if (navigationTarget) {
        console.log('Navigation command in response:', navigationTarget);
        onNavigate(navigationTarget);
        return; // Exit early to avoid sending message
      }

      setIsThinking(false);
      // Safety: If text is garbled, looks like local-disabled marker, or contains agent-name variants, fall back
      if (isGarbled(assistantText) || isAgentNameVariant(assistantText) || (!ALLOW_LOCAL_NARRATION && LOCAL_LLM_DISABLED_RE.test(assistantText))) {
        console.warn('[AgentLee UI] Detected garbled or disabled assistantText; attempting a recovery pass.');
        try {
          const retryPrompt = `Please narrate this slide in clear, correct English with no agent or system references. The slide title is: ${slideForAnswer?.title}. Keep it concise.`;
          const retryResp = await sendMessageToAgentLee(retryPrompt, slideForAnswer as any);
          let retryText = (retryResp && retryResp.text) ? retryResp.text : '';
          if (!(isGarbled(retryText) || isAgentNameVariant(retryText) || LOCAL_LLM_DISABLED_RE.test(retryText)) && retryText.trim()) {
            assistantText = retryText;
            console.log('[AgentLee UI] Recovery succeeded. Using retry text.');
          } else {
            // Use a local templated fallback
            console.warn('[AgentLee UI] Retry failed; using local templated fallback.');
            assistantText = (slideForAnswer && (slideForAnswer as any).narration && (slideForAnswer as any).narration.paragraphs && (slideForAnswer as any).narration.paragraphs.slice(0,2).join(' ')) || `I'm sorry, I couldn't narrate that properly. Please rephrase or ask a specific question about this slide.`;
          }
        } catch (e) {
          console.warn('[AgentLee UI] Recovery pass crashed; using fallback.', e);
          assistantText = (slideForAnswer && (slideForAnswer as any).narration && (slideForAnswer as any).narration.paragraphs && (slideForAnswer as any).narration.paragraphs.slice(0,2).join(' ')) || `I'm sorry, I couldn't narrate that properly. Please rephrase or ask a specific question about this slide.`;
        }
      }
      const agentMsg: Message = { id: Date.now() + 1, sender: "agent", text: assistantText, isStreaming: false };
      setMessages(prev => [...prev, agentMsg]);
      // Always speak the answer immediately (non-streaming)
      try { (ttsService as any).speakQueued?.(assistantText); } catch (e) { /* noop */ }
    };

    if (didNav) {
      // Wait briefly so the parent updates currentSlide, then answer the residual query (or restate chart request)
      const q = residualQuery || 'Tell me about the chart on this page.';
      setTimeout(() => { runAnswer(q); }, 600);
      return;
    }

    await runAnswer(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleStreamComplete = (id: number) => {
    setMessages(prev => {
      const m = prev.find(x => x.id === id);
      // Mark as not streaming in updated state
      const updated = prev.map(msg => msg.id === id ? { ...msg, isStreaming: false } : msg);
      if (m && m.text) {
        // If this was the greeting, clear the greetingId
        if (greetingId && id === greetingId) {
          setGreetingId(null);
        }
        // Play TTS after streaming unless we already spoke during typing
        if (!playDuringTyping) {
          try {
            setTimeout(() => {
              (ttsService as any).speakQueued?.(m.text);
            }, 200);
          } catch (e) { console.error('TTS speak failed', e); }
        }
      }
      return updated;
    });
  };

  // Debug/Test button: send a hello message and process the response
  const handleTestHello = async () => {
    setIsThinking(true);
    const agentResponse = await sendMessageToAgentLee('hello', currentSlide);
    setIsThinking(false);
    let assistantText = agentResponse.text || '(No answer returned)';
    if (isGarbled(assistantText) || isAgentNameVariant(assistantText) || (!ALLOW_LOCAL_NARRATION && LOCAL_LLM_DISABLED_RE.test(assistantText))) {
      console.warn('[AgentLee UI] Replacing garbled or disabled test assistantText with safe fallback.');
      assistantText = `I'm sorry, I couldn't narrate that properly. Please rephrase or ask a specific question about this slide.`;
    }
    const agentMsg: Message = { id: Date.now() + 2, sender: 'agent', text: assistantText, isStreaming: false };
    setMessages(prev => [...prev, agentMsg]);
    try { (ttsService as any).speakQueued?.(assistantText); } catch (e) { /* noop */ }
  }

  // Closed State Button
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-green-950/90 hover:bg-green-900 text-white px-4 py-3 rounded-lg border border-green-700 transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] whitespace-nowrap backdrop-blur-sm z-50"
      >
        <UserIcon className="w-5 h-5 text-green-400" />
        <span className="font-bold text-sm uppercase tracking-wider text-green-100">Agent Lee</span>
      </button>
    );
  }

  // Open State Window
  const ttsRate = (ttsService as any).getRate?.() ?? 1.0;
  const computedSpeed = Math.max(30, Math.round(80 / (ttsRate || 1)));
  return (
    <div className="fixed bottom-20 left-8 w-[380px] h-[500px] bg-slate-950 border border-green-800/50 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans animate-[slideUp_0.3s_ease-out]">
      
      {/* Fixed Header - Deeply Green */}
      <div className={`bg-green-950/80 p-4 flex justify-between items-center border-b border-green-800 backdrop-blur-md shrink-0`}>
          <div className="flex items-center gap-3">
          <div className="relative">
            <UserIcon className="w-5 h-5 text-green-400" />
            {isSpeaking && <SpeakerWaveIcon className="absolute left-6 top-0 w-5 h-5 text-green-400 animate-pulse" />}
          </div>
          <div>
            <span className="font-black text-white text-base tracking-wide block leading-none">AGENT LEE</span>
            <span className="text-[9px] text-green-400 uppercase tracking-widest font-mono">Intelligence Unit</span>
          </div>
        </div>
          <button onClick={() => setIsOpen(false)} className="text-green-400 hover:text-white transition-colors text-xl font-bold" title="Close Agent Lee"><PauseCircleIcon className="w-5 h-5" /></button>
      </div>
      {/* Scrollable Messages Area - Fixed Height Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 custom-scrollbar relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-lg text-sm leading-relaxed font-medium shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-900/80 text-white rounded-br-none border border-blue-700' 
                : 'bg-slate-900/90 text-slate-200 rounded-bl-none border border-green-900/30'
            }`}>
                {msg.text}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-900/90 p-3 rounded-lg rounded-bl-none border border-slate-800 flex gap-1 items-center">
              <span className="text-xs text-green-500 font-mono animate-pulse">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="p-3 bg-slate-950 border-t border-green-900/50 shrink-0">
        <div className="flex gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask strategic questions..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 placeholder-slate-500 transition-all"
            />
            <button 
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded text-sm font-bold transition-colors disabled:opacity-50 shadow-lg"
            title="Send question to Agent Lee"
            >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      {showDiag && (
        <div className="p-2 bg-black/60 border-t border-green-800 text-xs text-green-200 overflow-auto max-h-40">
          <strong>Agent Status:</strong>
          <pre className="text-[11px] text-green-200">{JSON.stringify((window as any).AGENT_STATUS, null, 2)}</pre>
          <strong>Last Diagnostics:</strong>
          <pre className="text-[11px] text-green-200">{JSON.stringify((window as any).AGENT_DIAGNOSTICS || {}, null, 2)}</pre>
          <div className="flex gap-2 mt-2">
            <button onClick={() => { (window as any).AGENT_DIAGNOSTICS = {}; setShowDiag(false); }} className="px-2 py-1 bg-green-800 rounded">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
};
