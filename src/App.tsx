/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.APP.SHELL.LAYOUT
REGION: 🟢 CORE

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
	"name": "Main Application Shell",
	"programmingLanguage": "TypeScript",
	"runtimePlatform": "browser",
	"about": ["LEEWAY", "React", "Application", "Shell"],
	"identifier": "CORE.APP.SHELL.LAYOUT",
	"license": "MIT",
	"dateModified": "2025-12-09"
}

5WH: WHAT=Main application shell, presentation mode, Agent Lee event handlers; WHY=Orchestrate UI components and presentation flow; WHO=Leeway Industries; WHERE=/src/App.tsx; WHEN=2025-12-09; HOW=React + state management + event handling
SPDX-License-Identifier: MIT
============================================================================ */
import { Cog6ToothIcon, PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { AgentLee } from '../components/AgentLee';
import { FlagBackground } from '../components/FlagBackground';
import { IntroScreen } from '../components/IntroScreen';
import { SlideViewer } from '../components/SlideViewer';
import { MOCK_DATA, STORY_CONFIG } from '../constants';
import { sendMessageToAgentLee } from '../services/leewayIndustriesService';
import { ttsService } from '../services/ttsService';
import { mapVoicesToPreferred, pickPreferredVoiceName, VoiceOption } from '../services/voicePreferences';
import { PresentationMode, SlideDefinition } from '../types';

export default function App() {
	const [hasStarted, setHasStarted] = React.useState(false);
	const [presentationMode, setPresentationMode] = React.useState<PresentationMode>('Auto');
	const [activeIndex, setActiveIndex] = React.useState(0);
	const [isPaused, setIsPaused] = React.useState(false);
	const [isSpeakingPaused, setIsSpeakingPaused] = React.useState(false);
	const narrationProgressRef = React.useRef<{ slideIndex: number; paragraphIndex: number } | null>(null);
	const [isMuted, setIsMuted] = React.useState(false);
	const [showSettings, setShowSettings] = React.useState(false);
	const [agentLeeOpen, setAgentLeeOpen] = React.useState(false);
	const [pausedByAgentLee, setPausedByAgentLee] = React.useState(false);
	const [playDuringTyping] = React.useState<boolean>(() => {
		try {
			const v = localStorage.getItem('agentlee_play_during');
			return v === null ? true : v === 'true';
		} catch {
			return true;
		}
	});
	const [availableVoices, setAvailableVoices] = React.useState<VoiceOption[]>([]);
	const [selectedVoice, setSelectedVoice] = React.useState(localStorage.getItem('agentlee_tts_voice') || '');
	const [voiceRate, setVoiceRate] = React.useState(ttsService.getRate());
	const [voicePitch, setVoicePitch] = React.useState(ttsService.getPitch());
	const [settingsPanelPos, setSettingsPanelPos] = React.useState({ top: 120, left: 120 });

	const autoRunRef = React.useRef<{ running: boolean }>({ running: false });
	const settingsButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const settingsPanelRef = React.useRef<HTMLDivElement | null>(null);
	const manualNavigationRef = React.useRef(false);

	const slides = STORY_CONFIG.slides || [];
	const currentSlide = slides[activeIndex] || slides[0] || { title: 'Welcome', id: 'welcome' };

	const handleStart = (mode: PresentationMode) => {
		console.log('[App] handleStart called with mode:', mode, 'activeIndex:', activeIndex);
		setPresentationMode(mode);
		setHasStarted(true);
	};

	// Ensure slide-specific scroll calibration is complete
	const slideScrollBehaviors: { [key: number]: () => void } = {
		11: () => {
			// Page 11: Multi-chart handling
			try {
				(window as any).AGENTLEE_UI?.runSlide11TabsAutomation?.();
				(window as any).AGENTLEE_UI?.ensureChartsRendered?.();
			} catch {}
		},
		12: () => {
			// Page 12: Example scroll behavior
			try {
				(window as any).AGENTLEE_UI?.scrollActiveChartPanel?.();
			} catch {}
		},
		13: () => {
			// Page 13: Custom behavior for specific charts
			try {
				console.log('Custom scroll behavior for Page 13');
			} catch {}
		},
	};

	const navigateTo = (target: string) => {
		console.log('[App] navigateTo called with target:', target);
		manualNavigationRef.current = true; // Mark navigation as manual
		if (!target) return;
		const pageNum = parseInt(target, 10);
		if (!isNaN(pageNum)) {
			const idx = Math.max(0, Math.min(slides.length - 1, pageNum - 1));
			console.log('[App] Navigating to page number', pageNum, '-> index', idx);
			// Deterministic page navigation by number; also cancel any pending speech
			ttsService.cancel();
			ttsService.clearQueue();
			setActiveIndex(idx);
			try {
				(document.body as any).dataset.agentSlide = String(pageNum);
				(window as any).AGENTLEE_KB?.loadPageKnowledge?.(pageNum);
				slideScrollBehaviors[pageNum as keyof typeof slideScrollBehaviors]?.(); // Trigger slide-specific scroll behavior
			} catch {}
			return;
		}
		const idx = slides.findIndex((slide) => slide.id === target || slide.id?.toLowerCase() === target.toLowerCase());
		console.log('[App] Navigating to slide id', target, '-> index', idx);
		if (idx >= 0) {
			setActiveIndex(idx);
			try {
				const pn = (slides[idx] as any)?.pageNumber ?? (idx + 1);
				(document.body as any).dataset.agentSlide = String(pn);
				(window as any).AGENTLEE_KB?.loadPageKnowledge?.(pn);
				slideScrollBehaviors[pn as keyof typeof slideScrollBehaviors]?.(); // Trigger slide-specific scroll behavior
			} catch {}
		}
	};

	const goToEvidence = () => {
		const idx = slides.findIndex((slide) => slide.id && slide.id.toLowerCase().includes('evidence'));
		if (idx >= 0) setActiveIndex(idx);
	};

	const narrationTextForSlide = React.useCallback((slide?: SlideDefinition | null) => {
		if (!slide || !Array.isArray(slide.narration?.paragraphs)) return '';
		return slide.narration.paragraphs.join(' ').replace(/\s+/g, ' ').trim();
	}, []);

	const narrationParagraphsForSlide = React.useCallback((slide?: SlideDefinition | null) => {
		if (!slide || !Array.isArray(slide.narration?.paragraphs)) return [] as string[];
		return slide.narration.paragraphs.map(p => String(p).replace(/\s+/g, ' ').trim()).filter(p => p.length > 0);
	}, []);

	const toggleMute = () => {
		const next = !isMuted;
		setIsMuted(next);
		ttsService.setMute(next);
	};

	const togglePause = () => {
		const next = !isSpeakingPaused;
		setIsSpeakingPaused(next);
		if (next) {
			ttsService.pause();
		} else {
			// Resume: ensure we are on the same slide and restart current paragraph from beginning
			const prog = narrationProgressRef.current;
			if (prog) {
				if (activeIndex !== prog.slideIndex) {
					setActiveIndex(prog.slideIndex);
				}
				const slide = slides[prog.slideIndex];
				const paras = narrationParagraphsForSlide(slide);
				const currentPara = paras[prog.paragraphIndex] || '';
				if (currentPara) {
					// Restart the paragraph cleanly; resume flow thereafter
					ttsService.cancel();
					ttsService.clearQueue();
					setTimeout(() => { ttsService.speakQueuedAsync(currentPara); }, 10);
				}
			}
		}
	};

	const handleAgentLeeOpenChange = (open: boolean) => {
		setAgentLeeOpen(open);
		if (open) {
			setPausedByAgentLee(true);
			// Switch to manual mode and stop any current narration, but do not pause the engine
			setPresentationMode('Manual');
			// Explicitly pause presentation and TTS when Agent Lee opens
			setIsPaused(true);
			// Ensure speaking is resumed for chat (chat should be heard even if speaking was paused)
			setIsSpeakingPaused(false);
			try { ttsService.resume(); } catch {}
			ttsService.cancel();
			ttsService.clearQueue();
		} else if (pausedByAgentLee) {
			setPausedByAgentLee(false);
			// Resume auto mode but do not auto-advance immediately
			setPresentationMode('Auto');
			setIsPaused(false);
		}
	};

	const positionSettingsPanel = React.useCallback(() => {
		if (typeof window === 'undefined' || !settingsButtonRef.current) return;
		const rect = settingsButtonRef.current.getBoundingClientRect();
		const panelWidth = 360;
		const panelHeight = 320;
		let top = rect.top - panelHeight - 12;
		if (top < 16) top = rect.bottom + 12;
		const maxTop = window.innerHeight - panelHeight - 16;
		if (top > maxTop) top = Math.max(16, maxTop);
		const buttonCenter = rect.left + rect.width / 2;
		let left = buttonCenter - panelWidth / 2;
		if (left < 16) left = 16;
		const maxLeft = window.innerWidth - panelWidth - 16;
		if (left > maxLeft) left = Math.max(16, maxLeft);
		setSettingsPanelPos({ top, left });
	}, []);

	React.useEffect(() => {
		if (!showSettings) return;
		const handleResize = () => positionSettingsPanel();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [showSettings, positionSettingsPanel]);

	React.useEffect(() => {
		if (!showSettings) return;
		const handleClick = (event: MouseEvent) => {
			if (!settingsPanelRef.current) return;
			const target = event.target as Node;
			if (!settingsPanelRef.current.contains(target) && !settingsButtonRef.current?.contains(target)) {
				setShowSettings(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [showSettings]);

	const handleToggleSettings = () => {
		if (!showSettings) {
			positionSettingsPanel();
			setShowSettings(true);
		} else {
			setShowSettings(false);
		}
	};

	React.useLayoutEffect(() => {
		if (!showSettings) return;
		const raf = requestAnimationFrame(() => positionSettingsPanel());
		return () => cancelAnimationFrame(raf);
	}, [showSettings, positionSettingsPanel]);

	React.useEffect(() => {
		if (!settingsPanelRef.current) return;
		settingsPanelRef.current.style.setProperty('--settings-panel-top', `${settingsPanelPos.top}px`);
		settingsPanelRef.current.style.setProperty('--settings-panel-left', `${settingsPanelPos.left}px`);
	}, [settingsPanelPos]);

	// Cancel TTS only on manual navigation; avoid interrupting Auto mode narration
	React.useEffect(() => {
		if (presentationMode !== 'Auto') {
			ttsService.cancel();
			ttsService.clearQueue();
		}
	}, [activeIndex, presentationMode]);

	React.useEffect(() => {
		if (!hasStarted) return;
		let cancelled = false;

		const runAuto = async () => {
			if (manualNavigationRef.current) {
				console.log('[App] runAuto skipped - manual navigation detected');
				manualNavigationRef.current = false; // Reset manual navigation flag
				return;
			}
			if (autoRunRef.current.running) {
				console.log('[App] runAuto skipped - already running');
				return;
			}
			// Do not run autopilot while Agent Lee chat is open; presentation and chat are separate
			if (presentationMode !== 'Auto' || cancelled || agentLeeOpen) {
				console.log('[App] runAuto skipped - not in Auto mode or paused');
				return;
			}
			console.log('[App] runAuto starting for slide', activeIndex, currentSlide?.title);
			autoRunRef.current.running = true;

			try {
				// If no voices are available, pause Auto to avoid flipping without narration
				try {
					const voices = ttsService.getAvailableVoices();
					if (!voices || voices.length === 0) {
						console.warn('[App] No TTS voices available; pausing Auto mode to prevent silent flipping');
						setIsPaused(true);
						setPresentationMode('Manual');
						return;
					}
				} catch {}
				// Paragraph-aware narration
				const paragraphs = narrationParagraphsForSlide(currentSlide);
				if (paragraphs.length) {
					for (let i = 0; i < paragraphs.length; i++) {
						if (cancelled || presentationMode !== 'Auto' || agentLeeOpen) return;
						// If speaking paused, wait until resumed
						while (isSpeakingPaused && !cancelled) {
							await new Promise(res => setTimeout(res, 100));
						}
						if (cancelled) return;
						narrationProgressRef.current = { slideIndex: activeIndex, paragraphIndex: i };
						const { started } = await ttsService.speakQueuedAwaitStartAndEndAsync(paragraphs[i]);
						if (!started) {
							console.warn('[App] TTS did not start; pausing Auto mode to avoid rapid flipping');
							setIsPaused(true);
							setPresentationMode('Manual');
							return;
						}
						await new Promise(res => setTimeout(res, 200));
					}
					if (!cancelled) {
						setActiveIndex((prev) => Math.min(slides.length - 1, prev + 1));
					}
					return;
				}

				// No scripted narration available: do not call Agent Lee here.
				// Presentation autopilot should only use scripted narration.
				console.warn('[App] No scripted narration for current slide; pausing Auto mode to keep presentation deterministic');
				setIsPaused(true);
				setPresentationMode('Manual');
				return;
			} finally {
				autoRunRef.current.running = false;
			}
		};

		runAuto();
		return () => {
			cancelled = true;
		};
	}, [hasStarted, activeIndex, presentationMode, agentLeeOpen, currentSlide, slides, narrationParagraphsForSlide, isSpeakingPaused]);

	// Navigate to a chart by slideId or chartKind, speak narration/explanation
	React.useEffect(() => {
		if (!hasStarted) return;
		const handler = async (e: Event) => {
			const detail = (e as CustomEvent).detail || {};
			const { slideId, chartKind, page, tabId } = detail;
			let idx = -1;
			if (typeof page === 'number' && !Number.isNaN(page)) {
				idx = Math.max(0, Math.min(slides.length - 1, page - 1));
			} else if (slideId) {
				idx = slides.findIndex((s) => s.id === slideId);
			} else if (chartKind) {
				idx = slides.findIndex((s) => (s.chartKind || '').toLowerCase() === String(chartKind).toLowerCase());
			}
			if (idx < 0) return;
			// Cancel any pending TTS and navigate
			ttsService.cancel();
			ttsService.clearQueue();
			setActiveIndex(idx);
			// After navigation, optionally select a specific tab within the slide
			try {
				if (tabId) {
					window.dispatchEvent(
						new CustomEvent('agentlee:selectTab', {
							detail: { slideId: slides[idx]?.id, tabId: String(tabId) },
						})
					);
				}
			} catch {}
			// After navigation, in Manual mode, speak slide narration followed by chart explanation
			const slide = slides[idx];
			if (!agentLeeOpen && presentationMode !== 'Auto' && !isSpeakingPaused && !isMuted) {
				const scriptedNarration = narrationTextForSlide(slide);
				if (scriptedNarration) await ttsService.speakQueuedAsync(scriptedNarration);
				try {
					const reg = (window as any).AgentLeeChartRegistry;
					const ctx = reg?.getChartContextForSlide?.(slide.id) || null;
					const prompt = ctx ? `Explain this chart succinctly and tie to ROI, safety, and growth:\n${ctx}` : `Explain the chart on slide "${slide.title}".`;
					const resp = await sendMessageToAgentLee(prompt, slide as any);
					const text = resp?.text || '';
					if (text) await ttsService.speakQueuedAsync(text);
				} catch {}
			}
		};
		window.addEventListener('agentlee:navigateToChart', handler as EventListener);
		window.addEventListener('agentlee:navigateToTab', handler as EventListener); // alias
		return () => {
			window.removeEventListener('agentlee:navigateToChart', handler as EventListener);
			window.removeEventListener('agentlee:navigateToTab', handler as EventListener);
		};
	}, [hasStarted, slides, presentationMode, isSpeakingPaused, isMuted, agentLeeOpen, narrationTextForSlide]);

	// Explain current chart on demand with KB + chart context
	React.useEffect(() => {
		if (!hasStarted) return;
		const handler = async () => {
			const slide = currentSlide;
			try {
				const reg = (window as any).AgentLeeChartRegistry;
				const ctx = reg?.getChartContextForSlide?.(slide?.id) || null;
				const prompt = ctx ? `Explain this chart succinctly and tie to ROI, safety, and growth:\n${ctx}` : `Explain the chart on slide "${slide?.title}".`;
				const resp = await sendMessageToAgentLee(prompt, slide as any);
				const text = resp?.text || '';
				if (text) await ttsService.speakQueuedAsync(text);
			} catch (err) {
				console.warn('Explain chart failed', err);
			}
		};
		window.addEventListener('agentlee:explainChart', handler as EventListener);
		return () => window.removeEventListener('agentlee:explainChart', handler as EventListener);
	}, [hasStarted, currentSlide]);

	// Manual mode: speak narration for any slide when user navigates or asks Agent Lee
	React.useEffect(() => {
		if (!hasStarted) return;
		if (presentationMode === 'Auto' || isSpeakingPaused || isMuted || agentLeeOpen) return;
		if (!currentSlide) return;
		const paragraphs = narrationParagraphsForSlide(currentSlide);
		if (!paragraphs.length) return;
		(async () => {
			try {
				for (let i = 0; i < paragraphs.length; i++) {
					if (isSpeakingPaused || isMuted || agentLeeOpen) break;
					narrationProgressRef.current = { slideIndex: activeIndex, paragraphIndex: i };
					await ttsService.speakQueuedAsync(paragraphs[i]);
				}
			} catch (error) {
				console.warn('Manual narration failed', error);
			}
		})();
		}, [hasStarted, presentationMode, isSpeakingPaused, isMuted, agentLeeOpen, currentSlide, narrationParagraphsForSlide, activeIndex]);

	// Listen for chart point selections and have Agent Lee explain the point
	React.useEffect(() => {
		const handler = async (e: Event) => {
			try {
				const detail = (e as CustomEvent).detail || (window as any).AGENT_SELECTED_POINT;
				if (!detail) return;
				const { x, y, seriesKey, chartKind } = detail;
				const slideTitle = currentSlide?.title || '';
				const prompt = `Explain the selected data point on "${slideTitle}": chart=${chartKind || currentSlide?.chartKind}, x=${x}, y=${y}, series=${seriesKey}. Keep it concise and actionable.`;
				const resp = await sendMessageToAgentLee(prompt, currentSlide as any);
				const text = resp?.text || `Selected point ${x}: ${y ?? ''}`;
				await ttsService.speakQueuedAsync(text);
			} catch (err) {
				console.warn('Agent point explain failed', err);
			}
		};
		window.addEventListener('agentlee:dataPointSelected', handler as EventListener);
		return () => window.removeEventListener('agentlee:dataPointSelected', handler as EventListener);
	}, [currentSlide]);

	// Quick-action triggers: map keywords/IDs to charts and tabs, then speak
	React.useEffect(() => {
		if (!hasStarted) return;
		const invokeQuick = async (raw: any) => {
			const text = String(raw?.text || raw || '').toLowerCase();
			if (!text) return;
			// Keyword → chartKind mapping
			const goto = (detail: any) => {
				try {
					window.dispatchEvent(new CustomEvent('agentlee:navigateToChart', { detail }));
				} catch {}
			};
			// Speak helper after navigation
			const speak = async (msg?: string) => {
				if (!msg) return;
				try { await ttsService.speakQueuedAsync(msg); } catch {}
			};
			// Chart keywords
			if (text.includes('cost analysis') || text.includes('roi') || text.includes('savings')) {
				goto({ chartKind: 'ProjectCosts' });
				await speak('Opening Project Costs analysis and ROI context.');
				return;
			}
			if (text.includes('performance metrics') || text.includes('metrics')) {
				goto({ chartKind: 'TechStack' });
				await speak('Showing performance metrics chart and key indicators.');
				return;
			}
			if (text.includes('ai sewers') || text.includes('ai momentum')) {
				goto({ chartKind: 'AISewersViz' });
				await speak('Opening AI momentum visualization.');
				return;
			}
			// Page 11 tab shortcuts by IDs
			const page11Aliases = ['california 11','pm11','ci11','rs11','tc11'];
			if (page11Aliases.some(a => text.includes(a))) {
				// Navigate to page 11 and select appropriate tab based on keyword
				let tabId = 'Overview';
				if (text.includes('pm11')) tabId = 'Performance';
				else if (text.includes('ci11')) tabId = 'CostIndex';
				else if (text.includes('rs11')) tabId = 'ROI';
				else if (text.includes('tc11') || text.includes('california 11')) tabId = 'TrenchlessCosts';
				try {
					window.dispatchEvent(new CustomEvent('agentlee:navigateToChart', { detail: { page: 11, tabId } }));
					await speak('Navigating to page eleven and opening requested panel.');
				} catch {}
				return;
			}
		};
		const onUtter = (e: Event) => invokeQuick((e as CustomEvent).detail);
		window.addEventListener('agentlee:quickAction', onUtter as EventListener);
		window.addEventListener('agentlee:utterance', onUtter as EventListener);
		return () => {
			window.removeEventListener('agentlee:quickAction', onUtter as EventListener);
			window.removeEventListener('agentlee:utterance', onUtter as EventListener);
		};
	}, [hasStarted]);

	const { preferred: preferredVoiceOptions, remaining: remainingVoiceOptions } = React.useMemo(() => mapVoicesToPreferred(availableVoices), [availableVoices]);

	const handleVoiceTest = React.useCallback(() => {
		if (selectedVoice) {
			ttsService.setVoiceByName(selectedVoice);
		}
		ttsService.previewVoice();
	}, [selectedVoice]);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			for (let i = 0; i < 20; i++) {
				const voices = ttsService.getAvailableVoices() as VoiceOption[];
				if (voices && voices.length) {
					if (!mounted) return;
					setAvailableVoices(voices);
					const pickName = pickPreferredVoiceName(voices, selectedVoice);
					if (pickName && pickName !== selectedVoice) {
						setSelectedVoice(pickName);
						localStorage.setItem('agentlee_tts_voice', pickName);
						ttsService.setVoiceByName(pickName);
					}
					return;
				}
				await new Promise((resolve) => setTimeout(resolve, 200));
			}
			try {
				const fallback = ((window as any).TTS_VOICES || []) as VoiceOption[];
				if (fallback.length && mounted) {
					setAvailableVoices(fallback);
					const pickName = pickPreferredVoiceName(fallback, selectedVoice);
					if (pickName && pickName !== selectedVoice) {
						setSelectedVoice(pickName);
						localStorage.setItem('agentlee_tts_voice', pickName);
						ttsService.setVoiceByName(pickName);
					}
				}
			} catch (e) {}
		})();
		return () => {
			mounted = false;
		};
	}, [selectedVoice]);

	if (!hasStarted) {
		return <IntroScreen onStart={handleStart} />;
	}

	return (
		<div className="h-screen w-screen bg-slate-950 text-white overflow-hidden flex flex-col relative">
			<FlagBackground aria-hidden="true" />
			<div className="flex-1 overflow-hidden p-4 lg:p-8 relative z-10">
				<SlideViewer slide={currentSlide} dataSources={MOCK_DATA} isSpeaking={!isPaused && !isMuted} />
			</div>

			<footer className="h-16 shrink-0 grid grid-cols-3 items-center px-8 border-t border-blue-900 bg-slate-950/90 relative z-30">
				<div className="flex items-center gap-3">
					<AgentLee
						role="Executive"
						currentSlide={currentSlide}
						isSpeaking={!isPaused && !isMuted}
						onNavigate={(target) => navigateTo(target)}
						isOpen={agentLeeOpen}
						onOpenChange={handleAgentLeeOpenChange}
						playDuringTyping={playDuringTyping}
					/>

					<div className="flex items-center ml-2 gap-2">
						{/* Mute button removed per updated spec (use pause/resume only) */}
						<button
							aria-label={isSpeakingPaused ? 'Resume speaking' : 'Pause speaking'}
							onClick={togglePause}
							className="flex items-center justify-center w-10 h-10 rounded-md text-white shadow-md transition-colors bg-indigo-600 hover:bg-indigo-500"
							title={isSpeakingPaused ? 'Resume Speaking' : 'Pause Speaking'}
						>
							{isSpeakingPaused ? <PlayCircleIcon className="w-5 h-5" /> : <PauseCircleIcon className="w-5 h-5" />}
						</button>

						<button
							aria-label="Open settings"
							onClick={handleToggleSettings}
							ref={settingsButtonRef}
							className={`ml-2 px-3 py-2 rounded-md shadow-md transition-colors ${showSettings ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
							title="Settings"
						>
							<Cog6ToothIcon className="w-5 h-5" />
						</button>
					</div>
				</div>

				<div className="flex items-center justify-center gap-4">
					<button
						onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
						aria-label="Previous slide"
						className="w-12 h-12 p-0 bg-transparent rounded overflow-hidden flex items-center justify-center"
					>
						<img src={`${import.meta.env.BASE_URL}images/previous-button.png`} alt="Previous" className="w-full h-full object-cover block" />
					</button>

					<span className="px-4">{activeIndex + 1} / {slides.length}</span>

					<button
						onClick={() => setActiveIndex(Math.min(slides.length - 1, activeIndex + 1))}
						aria-label="Next slide"
						className="w-12 h-12 p-0 bg-transparent rounded overflow-hidden flex items-center justify-center"
					>
						<img src={`${import.meta.env.BASE_URL}images/next-button.png`} alt="Next" className="w-full h-full object-cover block" />
					</button>
				</div>

			<div className="flex items-center justify-end gap-3">
				<button
					title="Go to Evidence"
					onClick={goToEvidence}
					className="px-3 py-2 bg-orange-600 text-white rounded-md shadow-md hover:bg-orange-500"
				>
					Evidence
				</button>

				<div className="text-xs text-slate-400 ml-4">Created by Leeway Industries</div>
				<div className="text-xs text-slate-400">v4.2</div>
			</div>
		</footer>			{showSettings && (
				<div
					ref={settingsPanelRef}
					className="settings-panel fixed z-[70] w-[360px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5"
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold">Presentation Settings</h3>
						<button onClick={() => setShowSettings(false)} className="text-slate-300 hover:text-white" aria-label="Close settings">×</button>
					</div>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="text-sm">Presentation Mode</div>
							<div className="flex gap-2">
								<button onClick={() => setPresentationMode('Manual')} className={`px-3 py-1 rounded ${presentationMode === 'Manual' ? 'bg-orange-600' : 'bg-slate-800'}`}>Manual</button>
								<button onClick={() => setPresentationMode('Auto')} className={`px-3 py-1 rounded ${presentationMode === 'Auto' ? 'bg-orange-600' : 'bg-slate-800'}`}>Auto</button>
							</div>
						</div>
						{/* Volume controls removed per updated spec (use pause/resume only) */}
						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm">TTS Voice</div>
								<div className="flex items-center gap-2">
									<select
										aria-label="Select TTS voice"
										value={selectedVoice}
										onChange={(event) => {
											setSelectedVoice(event.target.value);
											localStorage.setItem('agentlee_tts_voice', event.target.value);
											ttsService.setVoiceByName(event.target.value);
										}}
										className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded"
									>
										{preferredVoiceOptions.length > 0 && (
											<optgroup label="Microsoft Natural (en-US)">
												{preferredVoiceOptions.map((voice) => (
													<option key={voice.label} value={voice.actualName ?? voice.label} disabled={!voice.available}>
														{voice.label}
														{voice.available ? '' : ' — install voice pack in Windows/Edge to use'}
													</option>
												))}
											</optgroup>
										)}
										{remainingVoiceOptions.length > 0 && (
											<optgroup label="Other voices">
												{remainingVoiceOptions.map((voice) => (
													<option key={voice.name} value={voice.name}>
														{voice.name}
														{voice.lang ? ` (${voice.lang})` : ''}
													</option>
												))}
											</optgroup>
										)}
										{preferredVoiceOptions.length === 0 && remainingVoiceOptions.length === 0 && <option>Loading voices...</option>}
									</select>
									<button onClick={handleVoiceTest} className="px-3 py-1 text-xs bg-slate-800 border border-slate-600 rounded hover:bg-slate-700">
										Test Voice
									</button>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm" htmlFor="voice-rate">Voice Rate <span className="text-xs text-slate-500">{voiceRate.toFixed(2)}x</span></label>
								<input
									type="range"
									id="voice-rate"
									min="0.6"
									max="1.4"
									step="0.02"
									value={voiceRate}
									onChange={(event) => {
										const value = parseFloat(event.target.value);
										setVoiceRate(value);
										ttsService.setRate(value);
									}}
									className="w-full"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm" htmlFor="voice-pitch">Voice Pitch <span className="text-xs text-slate-500">{voicePitch.toFixed(2)}x</span></label>
								<input
									type="range"
									id="voice-pitch"
									min="0.6"
									max="1.4"
									step="0.02"
									value={voicePitch}
									onChange={(event) => {
										const value = parseFloat(event.target.value);
										setVoicePitch(value);
										ttsService.setPitch(value);
									}}
									className="w-full"
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}


