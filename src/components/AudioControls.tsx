import React, { useEffect, useRef } from 'react';
import { calculateWeekNumber } from '../utils/dateUtils';
import { Mic, Pause, Play, XCircle, ShieldCheck, Activity, GraduationCap, Sparkles, Clock, Bot } from 'lucide-react';
import { Course, UserProfile } from '../types';

interface AudioControlsProps {
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  activeCourse: Course | null;
  onOpenCourseSelector: () => void;
  recordingState: 'idle' | 'recording' | 'paused';
  sessionSeconds: number;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onCancelSession: () => void;
  noiseSuppression: boolean;
  setNoiseSuppression: (enabled: boolean) => void;
  translationProvider: 'google' | 'gemini' | 'openai';
  geminiApiKey?: string;
  openAiApiKey?: string;
  onOpenSettings: () => void;
}

const MAX_LECTURE_SECONDS = 7200; // 2 Hours

function formatTimer(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function AudioControls({
  user,
  onOpenAuthModal,
  activeCourse,
  onOpenCourseSelector,
  recordingState,
  sessionSeconds,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onCancelSession,
  noiseSuppression,
  setNoiseSuppression,
  translationProvider,
  geminiApiKey,
  openAiApiKey,
  onOpenSettings
}: AudioControlsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const isGeminiActive = translationProvider === 'gemini';
  const isOpenAiActive = translationProvider === 'openai';
  
  const hasGeminiKey = Boolean(geminiApiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY));
  const hasOpenAiKey = Boolean(openAiApiKey || (import.meta.env && import.meta.env.VITE_OPENAI_API_KEY));

  // Audio Equalizer Visualizer animation loop with safety guards
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const render = () => {
      try {
        const width = canvas.width || 180;
        const height = canvas.height || 32;
        ctx.clearRect(0, 0, width, height);

        const barCount = 22;
        const barWidth = Math.max(2, (width / barCount) - 3);
        const isActive = recordingState === 'recording';

        for (let i = 0; i < barCount; i++) {
          let barHeight = 4;
          if (isActive) {
            const time = Date.now() * 0.005;
            const randomFactor = Math.sin(time + i * 0.4) * Math.cos(time * 0.5 + i * 0.2);
            barHeight = Math.max(5, Math.abs(randomFactor) * (height - 5));
          }

          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#0284c7');
          gradient.addColorStop(0.5, '#38bdf8');
          gradient.addColorStop(1, '#6366f1');

          ctx.fillStyle = isActive ? gradient : 'rgba(148, 163, 184, 0.3)';
          ctx.beginPath();
          const renderCtx = ctx as any;
          if (typeof renderCtx.roundRect === 'function') {
            renderCtx.roundRect(i * (barWidth + 3), (height - barHeight) / 2, barWidth, barHeight, 3);
          } else {
            renderCtx.rect(i * (barWidth + 3), (height - barHeight) / 2, barWidth, barHeight);
          }
          ctx.fill();
        }
      } catch (e) {
        // Prevent canvas draw errors from breaking React execution
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [recordingState]);

  const progressPercent = Math.min(100, (sessionSeconds / MAX_LECTURE_SECONDS) * 100);

  return (
    <div className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '12px 24px', background: 'rgba(15, 23, 42, 0.75)', overflowX: 'auto' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px', minWidth: '980px' }}>
        
        {/* Section 1: Mic Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {recordingState === 'idle' && (
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuthModal();
                } else if (!activeCourse) {
                  onOpenCourseSelector();
                } else {
                  onStartSession();
                }
              }}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              <Mic size={16} /> Start Live Microphone
            </button>
          )}

          {recordingState === 'recording' && (
            <>
              <button
                onClick={onPauseSession}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', whiteSpace: 'nowrap' }}
              >
                <Pause size={15} /> Pause
              </button>
              <button
                onClick={onCancelSession}
                className="btn-danger"
                style={{ padding: '8px 12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                <XCircle size={15} /> Cancel
              </button>
            </>
          )}

          {recordingState === 'paused' && (
            <>
              <button
                onClick={onResumeSession}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', background: '#10b981', whiteSpace: 'nowrap' }}
              >
                <Play size={15} /> Resume
              </button>
              <button
                onClick={onCancelSession}
                className="btn-danger"
                style={{ padding: '8px 12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                <XCircle size={15} /> Cancel
              </button>
            </>
          )}
        </div>

        {/* Section 2: Active Course & Live Timer */}
        <div style={{ flex: 1, minWidth: '280px', flexShrink: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <span
              className={recordingState === 'recording' ? 'recording-dot-pulse' : undefined}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: recordingState === 'recording' ? '#10b981' : (recordingState === 'paused' ? '#f59e0b' : (user ? (activeCourse ? '#38bdf8' : '#f59e0b') : '#ef4444')),
                flexShrink: 0
              }}
            />
            
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {!user ? 'Visitor Mode' : (activeCourse ? `${activeCourse.code}: ${activeCourse.title}` : 'No Course Selected')}
            </strong>

            {user && activeCourse && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                flexShrink: 0
              }}>
                {calculateWeekNumber(activeCourse.startDate)}
              </span>
            )}

            {/* 2-Hour Timer Badge */}
            {recordingState !== 'idle' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: recordingState === 'recording' ? '#10b981' : '#f59e0b',
                flexShrink: 0
              }}>
                <Clock size={11} color={recordingState === 'recording' ? '#10b981' : '#f59e0b'} />
                {formatTimer(sessionSeconds)} / 02:00:00
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {!user ? (
                <span onClick={onOpenAuthModal} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                  Sign in with Google to start captioning →
                </span>
              ) : activeCourse ? (
                recordingState === 'recording' ? (
                  <>Listening to {activeCourse.instructor || 'Instructor'}...</>
                ) : recordingState === 'paused' ? (
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Recording paused. Click "Resume".</span>
                ) : (
                  <>Click "Start Live Microphone" (Max 2h session).</>
                )
              ) : (
                <span onClick={onOpenCourseSelector} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                  Choose a lecture course first →
                </span>
              )}
            </span>
          </div>

          {/* Session Progress Line */}
          {recordingState !== 'idle' && (
            <div style={{ width: '100%', height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.08)', marginTop: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: recordingState === 'recording' ? '#10b981' : '#f59e0b', transition: 'width 0.5s ease' }} />
            </div>
          )}
        </div>

        {/* Section 3: Audio Equalizer Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Activity size={16} color="#38bdf8" />
          <canvas ref={canvasRef} width={180} height={32} style={{ borderRadius: '6px' }} />
        </div>

        {/* Section 4: Settings & Options Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Engine Provider Badge */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              color: isOpenAiActive ? (hasOpenAiKey ? '#10b981' : '#f59e0b') : (isGeminiActive ? (hasGeminiKey ? '#818cf8' : '#f59e0b') : '#38bdf8'),
              borderColor: isOpenAiActive ? (hasOpenAiKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)') : (isGeminiActive ? (hasGeminiKey ? 'rgba(129, 140, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)') : 'rgba(56, 189, 248, 0.3)'),
              background: isOpenAiActive ? (hasOpenAiKey ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.1)') : (isGeminiActive ? (hasGeminiKey ? 'rgba(99, 102, 241, 0.12)' : 'rgba(245, 158, 11, 0.1)') : undefined),
              whiteSpace: 'nowrap'
            }}
            title="Click to change Translation Provider in Settings"
          >
            {isOpenAiActive ? (
              <Bot size={13} color={hasOpenAiKey ? '#10b981' : '#f59e0b'} />
            ) : (
              <Sparkles size={13} color={isGeminiActive ? (hasGeminiKey ? '#818cf8' : '#f59e0b') : '#38bdf8'} />
            )}
            {isOpenAiActive ? (hasOpenAiKey ? 'OpenAI GPT 🤖' : 'OpenAI (No Key → Fallback)') : isGeminiActive ? (hasGeminiKey ? 'Gemini AI ✨' : 'Gemini (No Key → Fallback)') : 'Google Translate'}
          </button>

          {/* Switch Course */}
          <button
            onClick={onOpenCourseSelector}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', whiteSpace: 'nowrap' }}
          >
            <GraduationCap size={14} /> Switch Course
          </button>

          {/* Noise Suppression Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => setNoiseSuppression(!noiseSuppression)}>
            <ShieldCheck size={16} color={noiseSuppression ? '#10b981' : '#64748b'} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Filter: <strong style={{ color: noiseSuppression ? '#10b981' : 'var(--text-muted)' }}>{noiseSuppression ? 'ON' : 'OFF'}</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
