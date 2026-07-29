import React, { useEffect, useRef } from 'react';
import { calculateWeekNumber } from '../utils/dateUtils';
import { Mic, Pause, Play, XCircle, ShieldCheck, Activity, GraduationCap, Sparkles, Clock } from 'lucide-react';
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
  translationProvider: 'google' | 'gemini';
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
  onOpenSettings
}: AudioControlsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio Equalizer Visualizer animation loop with safety guards
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const render = () => {
      try {
        const width = canvas.width || 260;
        const height = canvas.height || 36;
        ctx.clearRect(0, 0, width, height);

        const barCount = 28;
        const barWidth = Math.max(2, (width / barCount) - 3);
        const isActive = recordingState === 'recording';

        for (let i = 0; i < barCount; i++) {
          let barHeight = 4;
          if (isActive) {
            const time = Date.now() * 0.005;
            const randomFactor = Math.sin(time + i * 0.4) * Math.cos(time * 0.5 + i * 0.2);
            barHeight = Math.max(6, Math.abs(randomFactor) * (height - 6));
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
    <div className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 24px', background: 'rgba(15, 23, 42, 0.65)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Left Side: Mic Buttons & Recording Session Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
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
              style={{ padding: '12px 22px', fontSize: '0.92rem' }}
            >
              <Mic size={18} /> Start Live Microphone
            </button>
          )}

          {recordingState === 'recording' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onPauseSession}
                className="btn-secondary pulsing-recording"
                style={{ padding: '10px 18px', fontSize: '0.88rem', borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                <Pause size={16} /> Pause Recording
              </button>
              <button
                onClick={onCancelSession}
                className="btn-danger"
                style={{ padding: '10px 16px', fontSize: '0.88rem' }}
              >
                <XCircle size={16} /> Cancel Session
              </button>
            </div>
          )}

          {recordingState === 'paused' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onResumeSession}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.88rem', background: '#10b981' }}
              >
                <Play size={16} /> Resume Recording
              </button>
              <button
                onClick={onCancelSession}
                className="btn-danger"
                style={{ padding: '10px 16px', fontSize: '0.88rem' }}
              >
                <XCircle size={16} /> Cancel Session
              </button>
            </div>
          )}

          {/* Active Course & 2-Hour Timer Indicator */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: recordingState === 'recording' ? '#10b981' : (recordingState === 'paused' ? '#f59e0b' : (user ? (activeCourse ? '#38bdf8' : '#f59e0b') : '#ef4444')),
                boxShadow: recordingState === 'recording' ? '0 0 10px #10b981' : 'none'
              }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {!user ? 'Visitor Mode (Not Signed In)' : (activeCourse ? `${activeCourse.code || ''}: ${activeCourse.title || ''}` : 'No Course Selected')}
                {user && activeCourse && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.18)',
                    color: '#38bdf8'
                  }}>
                    {calculateWeekNumber(activeCourse.startDate)}
                  </span>
                )}
              </span>
            </div>

            {/* Timer & Session Status */}
            <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                {!user ? (
                  <span onClick={onOpenAuthModal} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                    Please sign in with Google to start live lecture captioning →
                  </span>
                ) : activeCourse ? (
                  recordingState === 'recording' ? (
                    <>Listening to {activeCourse.instructor || 'Instructor'}'s lecture voice...</>
                  ) : recordingState === 'paused' ? (
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Lecture recording paused. Click "Resume" to continue.</span>
                  ) : (
                    <>Course selected. Click "Start Live Microphone" (Max 2h session).</>
                  )
                ) : (
                  <span onClick={onOpenCourseSelector} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                    Please choose a lecture course first →
                  </span>
                )}
              </p>

              {/* 2-Hour Timer Display */}
              {recordingState !== 'idle' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '1px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-glass)' }}>
                  <Clock size={12} color={recordingState === 'recording' ? '#10b981' : '#f59e0b'} />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: recordingState === 'recording' ? '#10b981' : '#f59e0b' }}>
                    {formatTimer(sessionSeconds)} / 02:00:00
                  </span>
                </div>
              )}
            </div>

            {/* Session Progress Bar */}
            {recordingState !== 'idle' && (
              <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: recordingState === 'recording' ? '#10b981' : '#f59e0b', transition: 'width 0.5s ease' }} />
              </div>
            )}
          </div>
        </div>

        {/* Center: Audio Waveform Equalizer Canvas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', maxWidth: '300px', justifyContent: 'center' }}>
          <Activity size={18} color="#38bdf8" />
          <canvas ref={canvasRef} width={240} height={36} style={{ borderRadius: '8px' }} />
        </div>

        {/* Right Side: Translation Provider Tag & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Translation Provider Badge */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              color: translationProvider === 'gemini' ? '#818cf8' : '#38bdf8',
              borderColor: translationProvider === 'gemini' ? 'rgba(129, 140, 248, 0.4)' : 'rgba(56, 189, 248, 0.3)',
              background: translationProvider === 'gemini' ? 'rgba(99, 102, 241, 0.12)' : undefined
            }}
            title="Click to change Translation Provider in Settings"
          >
            <Sparkles size={14} color={translationProvider === 'gemini' ? '#818cf8' : '#38bdf8'} />
            {translationProvider === 'gemini' ? 'Gemini AI (LLM)' : 'Google Translate'}
          </button>

          {/* Change Course Link */}
          <button
            onClick={onOpenCourseSelector}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
          >
            <GraduationCap size={15} /> Switch Course
          </button>

          {/* Noise Suppression Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setNoiseSuppression(!noiseSuppression)}>
            <ShieldCheck size={18} color={noiseSuppression ? '#10b981' : '#64748b'} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Noise Filter: <strong style={{ color: noiseSuppression ? '#10b981' : 'var(--text-muted)' }}>{noiseSuppression ? 'ON' : 'OFF'}</strong>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
