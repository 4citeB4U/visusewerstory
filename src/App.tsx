import { Cog6ToothIcon, PauseCircleIcon, PlayCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { AgentLee } from '../components/AgentLee';
import { FlagBackground } from '../components/FlagBackground';
import { IntroScreen } from '../components/IntroScreen';
import { SlideViewer } from '../components/SlideViewer';
import { MOCK_DATA, STORY_CONFIG } from '../constants';
import { AGENT_STATUS, sendMessageToAgentLee } from '../services/leewayIndustriesService';
import { ttsService } from '../services/ttsService';
import { mapVoicesToPreferred, pickPreferredVoiceName, VoiceOption } from '../services/voicePreferences';
import { PresentationMode, SlideDefinition } from '../types';

export default function App() {
	const [hasStarted, setHasStarted] = React.useState(false);
	const [presentationMode, setPresentationMode] = React.useState<PresentationMode>('Auto');
	const [activeIndex, setActiveIndex] = React.useState(0);
	const [isPaused, setIsPaused] = React.useState(false);
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
	const [selectedVoice, setSelectedVoice] = React.useState<string>(localStorage.getItem('agentlee_tts_voice') || '');
	const [voiceRate, setVoiceRate] = React.useState<number>(ttsService.getRate());
	const [voicePitch, setVoicePitch] = React.useState<number>(ttsService.getPitch());
	const [settingsPanelPos, setSettingsPanelPos] = React.useState<{ top: number; left: number }>({ top: 120, left: 120 });

	const autoRunRef = React.useRef<{ running: boolean }>({ running: false });
	const settingsButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const settingsPanelRef = React.useRef<HTMLDivElement | null>(null);

	const slides = STORY_CONFIG.slides || [];
	const currentSlide = slides[activeIndex] || slides[0] || { title: 'Welcome', id: 'welcome' };

	const handleStart = (mode: PresentationMode) => {
		setPresentationMode(mode);
		setHasStarted(true);
	};

	const navigateTo = (target: string) => {
		if (!target) return;
		const pageNum = parseInt(target, 10);
		if (!isNaN(pageNum)) {
			const idx = Math.max(0, Math.min(slides.length - 1, pageNum - 1));
			setActiveIndex(idx);
			return;
		}
		const idx = slides.findIndex((slide) => slide.id === target || slide.id?.toLowerCase() === target.toLowerCase());
		if (idx >= 0) setActiveIndex(idx);
	};

	const goToEvidence = () => {
		const idx = slides.findIndex((slide) => slide.id && slide.id.toLowerCase().includes('evidence'));
		if (idx >= 0) setActiveIndex(idx);
	};

	const narrationTextForSlide = React.useCallback((slide?: SlideDefinition | null) => {
		if (!slide || !Array.isArray(slide.narration?.paragraphs)) return '';
		return slide.narration.paragraphs.join(' ').replace(/\s+/g, ' ').trim();
	}, []);

	const toggleMute = () => {
		const next = !isMuted;
		setIsMuted(next);
		ttsService.setMute(next);
	};

	const togglePause = () => {
		const next = !isPaused;
		setIsPaused(next);
		if (next) {
			ttsService.pause();
		} else {
			ttsService.resume();
		}
	};

	const handleAgentLeeOpenChange = (open: boolean) => {
		setAgentLeeOpen(open);
		if (open) {
			setPausedByAgentLee(true);
			// Switch to manual mode and stop any current narration, but do not pause the engine
			setPresentationMode('Manual');
			ttsService.cancel();
			ttsService.clearQueue();
		} else if (pausedByAgentLee) {
			setPausedByAgentLee(false);
			setPresentationMode('Auto');
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

	React.useEffect(() => {
		ttsService.cancel();
		ttsService.clearQueue();
	}, [activeIndex]);

	React.useEffect(() => {
		let cancelled = false;

		const runAuto = async () => {
			if (autoRunRef.current.running) return;
			if (presentationMode !== 'Auto' || isPaused || cancelled) return;
			autoRunRef.current.running = true;

			try {
				const scriptedNarration = narrationTextForSlide(currentSlide);
				if (scriptedNarration) {
					await ttsService.speakQueuedAsync(scriptedNarration);
					if (!cancelled) {
						setActiveIndex((prev) => Math.min(slides.length - 1, prev + 1));
					}
					return;
				}

				const prompt = (currentSlide as any).agentLeePromptHint || `Please narrate the key points for this slide: ${currentSlide?.title}`;
				const resp = await sendMessageToAgentLee(prompt, currentSlide as any);
				const preview = resp?.text ? String(resp.text).toLowerCase() : '';
				const looksLikeError = !AGENT_STATUS.online || /encountered an error|agent lee is offline|could not generate|local model hub error|offline/i.test(preview);
				if (looksLikeError) {
					console.warn('Autopilot paused because Agent Lee appears offline.', resp, AGENT_STATUS);
					setIsPaused(true);
					setPresentationMode('Manual');
					return;
				}
				if (cancelled) return;

				await ttsService.speakQueuedAsync(resp?.text || '');

				if (resp?.navigationTarget) {
					navigateTo(resp.navigationTarget);
				} else {
					setActiveIndex((prev) => Math.min(slides.length - 1, prev + 1));
				}
			} catch (error) {
				console.warn('Autopilot narration failed', error);
			} finally {
				autoRunRef.current.running = false;
			}
		};

		if (hasStarted && presentationMode === 'Auto' && !isPaused) {
			runAuto();
		}

		return () => {
			cancelled = true;
		};
	}, [hasStarted, presentationMode, isPaused, activeIndex, currentSlide, slides.length, narrationTextForSlide]);

	React.useEffect(() => {
		if (presentationMode === 'Auto' || isPaused || isMuted) return;
		if (!currentSlide) return;
		const isEvidenceSlide = currentSlide.id === 'evidenceLocker';
		if (!isEvidenceSlide) return;
		const scriptedNarration = narrationTextForSlide(currentSlide);
		if (!scriptedNarration) return;
		(async () => {
			try {
				await ttsService.speakQueuedAsync(scriptedNarration);
			} catch (error) {
				console.warn('Manual evidence narration failed', error);
			}
		})();
	}, [presentationMode, isPaused, isMuted, currentSlide, narrationTextForSlide]);

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
						<button
							aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
							onClick={toggleMute}
							className={`flex items-center justify-center w-10 h-10 rounded-md text-white shadow-md transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
							title={isMuted ? 'Unmute' : 'Mute'}
						>
							{isMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
						</button>

						<button
							aria-label={isPaused ? 'Resume narration' : 'Pause narration'}
							onClick={togglePause}
							className="flex items-center justify-center w-10 h-10 rounded-md text-white shadow-md transition-colors bg-indigo-600 hover:bg-indigo-500"
							title={isPaused ? 'Resume' : 'Pause'}
						>
							{isPaused ? <PlayCircleIcon className="w-5 h-5" /> : <PauseCircleIcon className="w-5 h-5" />}
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
						<div className="flex items-center justify-between">
							<div className="text-sm">TTS Volume</div>
							<div className="text-sm">{isMuted ? 'Muted' : 'On'}</div>
						</div>
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


