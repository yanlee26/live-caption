import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, ShieldCheck, Activity, GraduationCap, User } from 'lucide-react';
import { Course, UserProfile } from '../types';

interface AudioControlsProps {
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  activeCourse: Course | null;
  onOpenCourseSelector: () => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  noiseSuppression: boolean;
  setNoiseSuppression: (enabled: boolean) => void;
}

export default function AudioControls({
  user,
  onOpenAuthModal,
  activeCourse,
  onOpenCourseSelector,
  isListening,
  onStartListening,
  onStopListening,
  speechRate,
  setSpeechRate,
  noiseSuppression,
  setNoiseSuppression
}: AudioControlsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio Equalizer Visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 28;
      const barWidth = width / barCount - 3;
      const isActive = isListening;

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

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isListening]);

  return (
    <div className="glass-panel" style={{ padding: '16px 24px', margin: '16px auto', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left Side: Mic Start/Stop Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => {
              if (!user) {
                onOpenAuthModal();
              } else if (!activeCourse) {
                onOpenCourseSelector();
              } else {
                if (isListening) onStopListening();
                else onStartListening();
              }
            }}
            className={isListening ? 'btn-danger pulsing-recording' : 'btn-primary'}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            {isListening ? (
              <>
                <MicOff size={20} /> Stop Live Mic
              </>
            ) : (
              <>
                <Mic size={20} /> Start Live Microphone
              </>
            )}
          </button>

          {/* Active Course & Auth Status Indicator */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isListening ? '#10b981' : (user ? (activeCourse ? '#38bdf8' : '#f59e0b') : '#ef4444'),
                boxShadow: isListening ? '0 0 10px #10b981' : 'none'
              }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {!user ? 'Visitor Mode (Not Signed In)' : (activeCourse ? `${activeCourse.code}: ${activeCourse.title}` : 'No Course Selected')}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {!user ? (
                <span onClick={onOpenAuthModal} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                  Please sign in with Google to start live lecture captioning →
                </span>
              ) : activeCourse ? (
                isListening ? (
                  <>Listening to {activeCourse.instructor}'s lecture voice...</>
                ) : (
                  <>Course selected. Click "Start Live Microphone" to begin captioning.</>
                )
              ) : (
                <span onClick={onOpenCourseSelector} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                  Please choose a lecture course first →
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Audio Waveform Equalizer Canvas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', maxWidth: '320px', justifyContent: 'center' }}>
          <Activity size={18} color="#38bdf8" />
          <canvas ref={canvasRef} width={260} height={36} style={{ borderRadius: '8px' }} />
        </div>

        {/* Right Side: Options & Sensitivity Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
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
