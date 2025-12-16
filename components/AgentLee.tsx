/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: UI.COMPONENT.AGENTLEE.CHAT
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
  "name": "Agent Lee Chat Component",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "UI", "Chat", "AgentLee"],
  "identifier": "UI.COMPONENT.AGENTLEE.CHAT",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Agent Lee conversational UI component; WHY=Interactive chat interface with voice narration; WHO=Agent Lee System; WHERE=/components/AgentLee.tsx; WHEN=2025-12-09; HOW=React hooks + TTS + chat session management
SPDX-License-Identifier: MIT
============================================================================ */

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

  // TTS sanitization: strip symbols and URLs for natural speech
  const safeSpeak = (text: string) => {
    const t = String(text || '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[#"'`]/g, '')
      .replace(/[\/\\]{2,}/g, ' ')
      .replace(/[\.]{3,}/g, ' ')
      .replace(/[<>\[\]\(\)]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    try { (ttsService as any).speakQueued?.(t); } catch {}
  };

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

  // Expose minimal UI control bridge for navigation, clicking, and scrolling
  useEffect(() => {
    (window as any).AGENTLEE_UI = (window as any).AGENTLEE_UI || {};
    const ui = (window as any).AGENTLEE_UI;
    ui.scrollDown = (amount: number = 400) => {
      try { window.scrollBy({ top: amount, behavior: 'smooth' }); } catch {}
    };
    ui.scrollUp = (amount: number = 400) => {
      try { window.scrollBy({ top: -amount, behavior: 'smooth' }); } catch {}
    };
    ui.clickROI = () => {
      try {
        const buttons = Array.from(document.querySelectorAll('button, a')) as HTMLElement[];
        const roiBtn = buttons.find(b => /roi/i.test((b.innerText || '').trim()));
        roiBtn?.click();
      } catch {}
    };
    ui.clickChartByText = (label: string) => {
      try {
        const buttons = Array.from(document.querySelectorAll('button, a')) as HTMLElement[];
        const target = buttons.find(b => new RegExp(label, 'i').test((b.innerText || '').trim()));
        target?.click();
      } catch {}
    };

    // Slide-aware attribute tagging for right-hand container and tabs
    ui.tagSlideDOM = (pageNumber?: number) => {
      try {
        const page = String(pageNumber ?? (latestSlideRef.current as any)?.pageNumber ?? '');
        // Tag right-hand container heuristically by overflow-y and screen position
        const candidates = Array.from(document.querySelectorAll<HTMLElement>('*'));
        const rightPanels = candidates.filter(p => {
          const s = getComputedStyle(p);
          const hasY = (p.scrollHeight > p.clientHeight) && /(auto|scroll)/.test(s.overflowY);
          const rect = p.getBoundingClientRect();
          return hasY && rect.left > (window.innerWidth / 2);
        });
        const target = rightPanels.sort((a,b) => b.scrollHeight - a.scrollHeight)[0] || rightPanels[0];
        if (target) {
          target.setAttribute('data-slide', page);
          target.setAttribute('data-role', 'right-panel');
          target.id = target.id || `slide-${page}-right-panel`;
        }
        // Tag tab buttons by known labels
        const tabs = ['Cost Analysis','Performance Metrics','Work Impact','ROI and Savings','Technology Comparison'];
        const els = Array.from(document.querySelectorAll<HTMLElement>('button, [role="tab"], a'));
        for (const label of tabs) {
          const t = els.find(e => new RegExp(label, 'i').test((e.innerText || '').trim()));
          if (t) {
            t.setAttribute('data-slide', page);
            t.setAttribute('data-role', 'tab');
            t.setAttribute('data-tab', label.replace(/\s+/g,'-').toLowerCase());
            if (!t.id) t.id = `slide-${page}-tab-${label.replace(/\s+/g,'-').toLowerCase()}`;
          }
        }
        return true;
      } catch { return false; }
    };

    // Tag chart containers and points with data-* attributes when available
    ui.tagChartDOM = (pageNumber?: number) => {
      try {
        const page = String(pageNumber ?? (latestSlideRef.current as any)?.pageNumber ?? '');
        const charts = Array.from(document.querySelectorAll<HTMLElement>('.recharts-wrapper, canvas, svg'));
        charts.forEach((c, i) => {
          c.setAttribute('data-slide', page);
          c.setAttribute('data-role', 'chart');
          c.setAttribute('data-chart-index', String(i));
          if (!c.id) c.id = `slide-${page}-chart-${i}`;
        });
        return charts.length > 0;
      } catch { return false; }
    };

    // Helper: discover scrollable containers (overflow-x/y with scroll ranges)

    ui.findScrollableContainers = () => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('*'));
      const scrollables = candidates.filter((el: HTMLElement) => {
        const style = getComputedStyle(el);
        const hasY = (el.scrollHeight > el.clientHeight) && /(auto|scroll)/.test(style.overflowY);
        const hasX = (el.scrollWidth > el.clientWidth) && /(auto|scroll)/.test(style.overflowX);
        return hasY || hasX;
      });
      return scrollables;
    };

    // Shared helpers hoisted for reuse across routines
    ui.clickByLabel = (label: string) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('button, [role="tab"], a'));
      const t = els.find(e => new RegExp(label, 'i').test((e.innerText || '').trim()));
      t?.click();
      return !!t;
    };
    ui.waitActive = async (label: string, timeoutMs = 1500) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const els = Array.from(document.querySelectorAll<HTMLElement>('button, [role="tab"], a'));
        const t = els.find(e => new RegExp(label, 'i').test((e.innerText || '').trim()));
        if (t) {
          const active = t.classList.contains('active') || t.getAttribute('aria-selected') === 'true';
          if (active) return true;
        }
        await new Promise(res => setTimeout(res, 120));
      }
      return false;
    };
    ui.ensureChartsRendered = async (timeoutMs = 1200) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const hasCharts = !!document.querySelector('.recharts-wrapper, canvas, svg');
        if (hasCharts) return true;
        await new Promise(res => setTimeout(res, 120));
      }
      return false;
    };

    // Scroll the active chart panel (vertical then horizontal) while explaining
    ui.scrollActiveChartPanel = async () => {
      try {
        const scrolls = ui.findScrollableContainers();
        const v = scrolls.filter((el: HTMLElement) => {
          const s = getComputedStyle(el);
          return /(auto|scroll)/.test(s.overflowY) && (el.scrollHeight > el.clientHeight);
        }).sort((a: HTMLElement, b: HTMLElement) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
        if (v) {
          const maxTop = v.scrollHeight - v.clientHeight;
          v.scrollTo({ top: maxTop, behavior: 'smooth' });
          await new Promise(res => setTimeout(res, 700));
          v.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const h = scrolls.filter((el: HTMLElement) => {
          const s = getComputedStyle(el);
          return /(auto|scroll)/.test(s.overflowX) && (el.scrollWidth > el.clientWidth);
        }).sort((a: HTMLElement, b: HTMLElement) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth))[0];
        if (h) {
          const maxLeft = h.scrollWidth - h.clientWidth;
          h.scrollTo({ left: maxLeft, behavior: 'smooth' });
          await new Promise(res => setTimeout(res, 700));
          h.scrollTo({ left: 0, behavior: 'smooth' });
        }
        return true;
      } catch { return false; }
    };

    // Inline actions for ROI and Slide 11 automation
    ui.clickROI = () => ui.clickByLabel('ROI and Savings');
    ui.runSlide11TabsAutomation = async () => {
      const TAB_LABELS = [
        'Cost Analysis',
        'Performance Metrics',
        'Work Impact',
        'ROI and Savings',
        'Technology Comparison'
      ];
      const scrollActivePanel = async () => {
        const scrolls = ui.findScrollableContainers();
        const v = scrolls.filter((el: HTMLElement) => {
          const s = getComputedStyle(el);
          return /(auto|scroll)/.test(s.overflowY) && (el.scrollHeight > el.clientHeight);
        }).sort((a: HTMLElement, b: HTMLElement) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
        if (v) {
          const maxTop = v.scrollHeight - v.clientHeight;
          v.scrollTo({ top: maxTop, behavior: 'smooth' });
          await new Promise(res => setTimeout(res, 600));
        }
        const h = scrolls.filter((el: HTMLElement) => {
          const s = getComputedStyle(el);
          return /(auto|scroll)/.test(s.overflowX) && (el.scrollWidth > el.clientWidth);
        }).sort((a: HTMLElement, b: HTMLElement) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth))[0];
        if (h) {
          const maxLeft = h.scrollWidth - h.clientWidth;
          h.scrollTo({ left: maxLeft, behavior: 'smooth' });
          await new Promise(res => setTimeout(res, 600));
        }
      };
      for (const label of TAB_LABELS) {
        ui.clickByLabel(label);
        await ui.waitActive(label);
        await ui.ensureChartsRendered();
        await scrollActivePanel();
      }
      return true;
    };

    // Slide Interaction Map: Slide 2 — right-hand vertical scroll completion
    ui.runSlide2ScrollRoutine = async () => {
      try {
        const panels = ui.findScrollableContainers();
        // Heuristic: right-hand panel likely widest/positioned to the right; choose with overflow-y
        const rightPanels = panels.filter((p: HTMLElement) => {
          const s = getComputedStyle(p);
          return /(auto|scroll)/.test(s.overflowY);
        });
        // pick the one with max scrollHeight
        const target = rightPanels.sort((a: HTMLElement, b: HTMLElement) => b.scrollHeight - a.scrollHeight)[0] || rightPanels[0];
        if (!target) return false;
        // Scroll to bottom deterministically
        const maxTop = target.scrollHeight - target.clientHeight;
        target.scrollTo({ top: maxTop, behavior: 'smooth' });
        // Wait for completion
        await new Promise(res => setTimeout(res, 700));
        const done = Math.abs(target.scrollTop - maxTop) < 2;
        return done;
      } catch { return false; }
    };

    // Slide Interaction Map: Slide 11 — tab enumeration and multi-axis scrolling
    ui.runSlide11TabsAutomation = async () => {
      const TAB_LABELS = [
        'Cost Analysis',
        'Performance Metrics',
        'Work Impact',
        'ROI and Savings',
        'Technology Comparison'
      ];
      const scrollActivePanel = async () => {
        // choose largest scrollable region (vertical first)
        const scrolls = ui.findScrollableContainers();
        const v = scrolls.filter((el: HTMLElement) => {
          const s = getComputedStyle(el);
          return /(auto|scroll)/.test(s.overflowY) && (el.scrollHeight > el.clientHeight);
        }).sort((a: HTMLElement, b: HTMLElement) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
        if (v) {
          const maxTop = v.scrollHeight - v.clientHeight;
          v.scrollTo({ top: maxTop, behavior: 'smooth' });
          await new Promise(res => setTimeout(res, 600));
        }
        const h = scrolls.filter((el: HTMLElement) => {
          const s = getComputedStyle(el);
          return /(auto|scroll)/.test(s.overflowX) && (el.scrollWidth > el.clientWidth);
        }).sort((a: HTMLElement, b: HTMLElement) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth))[0];
        if (h) {
          const maxLeft = h.scrollWidth - h.clientWidth;
          h.scrollTo({ left: maxLeft, behavior: 'smooth' });
          await new Promise(res => setTimeout(res, 600));
        }
      };
      for (const label of TAB_LABELS) {
        ui.clickByLabel(label);
        await ui.waitActive(label);
        await ui.ensureChartsRendered();
        await scrollActivePanel();
      }
      return true;
    };

    // Enumerate chart series on page 11 across all tabs and return a summary
    ui.enumeratePage11Charts = async () => {
      const TAB_LABELS = [
        'Cost Analysis',
        'Performance Metrics',
        'Work Impact',
        'ROI and Savings',
        'Technology Comparison'
      ];
      const seriesForTab = async (label: string) => {
        // Navigate to tab and wait active
        const clicked = ui.clickByLabel(label);
        await ui.waitActive(label);
        await ui.ensureChartsRendered();
        // Inspect Recharts legend or labels
        const legends = Array.from(document.querySelectorAll('.recharts-legend-item')) as HTMLElement[];
        const legendText = legends.map(l => (l.innerText || '').trim()).filter(Boolean);
        // Fallback: inspect aria-labels or title attributes within svg
        const svgs = Array.from(document.querySelectorAll('svg')) as SVGElement[];
        const svgTitles = svgs.flatMap(s => Array.from(s.querySelectorAll('title')).map(t => (t.textContent || '').trim())).filter(Boolean);
        // Fallback: any axis ticks
        const ticks = Array.from(document.querySelectorAll('.recharts-cartesian-axis-tick')) as HTMLElement[];
        const tickText = ticks.map(t => (t.innerText || '').trim()).filter(Boolean).slice(0, 12);
        return {
          tab: label,
          legends: legendText,
          titles: svgTitles,
          sampleTicks: tickText,
          chartCount: (document.querySelectorAll('.recharts-wrapper, canvas').length) || 0,
        };
      };
      const out = [] as any[];
      for (const label of TAB_LABELS) {
        out.push(await seriesForTab(label));
      }
      (window as any).AGENT_LAST_PAGE11_SERIES = out;
      return out;
    };

    // Highlight a data point via emitting a selection event (Charts listen to this global)
    ui.highlightChartPoint = (opts: { series?: string; x?: string | number; y?: number; index?: number }) => {
      try {
        (window as any).AGENT_SELECTED_POINT = opts;
        // Attempt a visual hint: flash the first chart container
        const c = document.querySelector('.recharts-wrapper') as HTMLElement | null;
        if (c) { c.style.outline = '2px solid #22c55e'; setTimeout(() => { c.style.outline = ''; }, 800); }
      } catch {}
    };

    // Programmatic selection by series and label (legend/tick match)
    ui.pickPointByLabel = (seriesName: string, label: string) => {
      try {
        (window as any).AGENT_SELECTED_POINT = { series: seriesName, x: label };
        const containers = Array.from(document.querySelectorAll('.recharts-wrapper')) as HTMLElement[];
        if (containers[0]) { containers[0].style.outline = '2px solid #22c55e'; setTimeout(() => { containers[0].style.outline = ''; }, 800); }
        return true;
      } catch { return false; }
    };

    // Expose an open hook and external question handler so other components/pages can route Q&A to Agent Lee
    ui.open = () => { try { setIsOpen(true); } catch {} };

    const externalQuestionHandler = async (ev: any) => {
      try {
        const q = ev?.detail?.question;
        if (!q || !q.trim()) return;
        // Inject a user message and ask via local hub
        const userMsg: Message = { id: Date.now(), sender: 'user', text: q };
        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);
        const slideForAnswer = latestSlideRef.current || currentSlide;
        const agentResponse = await sendMessageToAgentLee(q, slideForAnswer as any);
        const assistantTextLocal = agentResponse?.text || '(No answer returned)';
        const agentMsg: Message = { id: Date.now() + 1, sender: 'agent', text: assistantTextLocal, isStreaming: false };
        setMessages(prev => [...prev, agentMsg]);
        try { safeSpeak(assistantTextLocal); } catch {}
        setIsThinking(false);
      } catch (e) { setIsThinking(false); }
    };

    const openHandler = () => { try { setIsOpen(true); } catch {} };
    // store handlers on window so cleanup can remove them reliably
    (window as any).__AGENTLEE_EXTERNAL_Q_HANDLER = externalQuestionHandler;
    (window as any).__AGENTLEE_OPEN_HANDLER = openHandler;
    window.addEventListener('agentlee:externalQuestion', externalQuestionHandler as EventListener);
    window.addEventListener('agentlee:open', openHandler as EventListener);
  }, []);

  // When Agent Lee box opens, create contextual greeting and speak it
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const slideTitle = currentSlide.title;
      const hour = new Date().getHours();
      const dayPart = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      const greetingText = `${dayPart}. I’m Agent Lee. Let’s walk this page together — "${slideTitle}". We can stay here or move when you’re ready.`;

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
        try { safeSpeak(greetingText); } catch (e) { /* noop */ }
      }, 120);
    }
  }, [isOpen, currentSlide, messages.length, playDuringTyping]);

    // cleanup external listeners on unmount
    useEffect(() => {
      return () => {
        const h1 = (window as any).__AGENTLEE_EXTERNAL_Q_HANDLER;
        const h2 = (window as any).__AGENTLEE_OPEN_HANDLER;
        if (h1) window.removeEventListener('agentlee:externalQuestion', h1 as EventListener);
        if (h2) window.removeEventListener('agentlee:open', h2 as EventListener);
        try { delete (window as any).__AGENTLEE_EXTERNAL_Q_HANDLER; } catch {}
        try { delete (window as any).__AGENTLEE_OPEN_HANDLER; } catch {}
      };
    }, []);

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
        // After navigation, auto-run slide-specific automation
        setTimeout(() => {
          try {
            if (String(navigationTarget) === '2') {
              (window as any).AGENTLEE_UI?.runSlide2ScrollRoutine?.();
            }
            if (String(navigationTarget) === '11') {
              (window as any).AGENTLEE_UI?.runSlide11TabsAutomation?.();
            }
            if (/^roi$/i.test(String(navigationTarget)) || String(navigationTarget) === '11') {
              (window as any).AGENTLEE_UI?.clickROI?.();
            }
            // Tag DOM for deterministic targeting and load page KB
            const pn = Number(navigationTarget);
            // Tagging: set a data attribute on body to assist targeting
            try { document.body.dataset.agentSlide = String(pn); } catch {}
            (window as any).AGENTLEE_KB?.loadPageKnowledge?.(pn);
          } catch {}
        }, 600);
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
      try { safeSpeak(assistantText); } catch (e) { /* noop */ }

      // Gentle auto-scroll on media-heavy pages (e.g., map/picture slides)
      try {
        const kind = String((latestSlideRef.current || currentSlide)?.chartKind || '').toLowerCase();
        if (/(map|image|picture|gallery)/.test(kind)) {
          setTimeout(() => { (window as any).AGENTLEE_UI?.scrollDown?.(300); }, 1000);
          setTimeout(() => { (window as any).AGENTLEE_UI?.scrollUp?.(300); }, 3000);
        }
      } catch {}

      // If the user asked about ROI charts on page 11, run tab automation and explain charts
      try {
        const qLower = String(query || '').toLowerCase();
        const isROIAsk = qLower.includes('roi') || qLower.includes('return on investment');
        const slideNum = ((latestSlideRef.current || currentSlide) as any)?.pageNumber ?? null;
        if (isROIAsk) {
          // Attempt to open ROI and run tabs automation
          setTimeout(() => { (window as any).AGENTLEE_UI?.clickROI?.(); }, 400);
          setTimeout(() => { (window as any).AGENTLEE_UI?.runSlide11TabsAutomation?.(); }, 900);
        }
      } catch {}
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
            setTimeout(async () => {
              await ttsService.speakQueuedAsync(m.text);
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
          <div className="flex items-center gap-2">
            {/* Sources button removed per UX cleanup */}
            {/* Explain Chart button removed; chart explanation handled via natural chat intents */}
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} className="text-green-400 hover:text-white transition-colors text-xl font-bold" title="Close Agent Lee"><PauseCircleIcon className="w-5 h-5" /></button>
          </div>
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

      {/* Sources panel removed per UX cleanup */}

      {/* Fixed Input Area */}
      <div className="p-3 bg-slate-950 border-t border-green-900/50 shrink-0">
        <div className="flex gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Agent Lee about this page..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 placeholder-slate-500 transition-all"
            />
            <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSend(); }}
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
