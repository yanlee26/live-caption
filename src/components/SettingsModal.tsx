import React from 'react';
import { X, Settings, Type, Layout, Languages } from 'lucide-react';

interface SettingsModalProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  layoutOrder: 'en-top' | 'cn-top';
  setLayoutOrder: (order: 'en-top' | 'cn-top') => void;
  speechLang: string;
  setSpeechLang: (lang: string) => void;
  onClose: () => void;
}

export default function SettingsModal({
  fontSize,
  setFontSize,
  layoutOrder,
  setLayoutOrder,
  speechLang,
  setSpeechLang,
  onClose
}: SettingsModalProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-float-up" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '28px',
        borderRadius: '24px',
        background: 'var(--bg-main)',
        border: '1px solid var(--border-glow)'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)' }}>
              <Settings size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                Caption Preferences & Display
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Customize font size, subtitle stack order, and speech options
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Font Size Slider */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Type size={16} color="#38bdf8" /> Subtitle Font Size
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={32}
            step={2}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        {/* Bilingual Stack Order */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Layout size={16} color="#818cf8" /> Subtitle Bilingual Stack Order
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setLayoutOrder('en-top')}
              className={layoutOrder === 'en-top' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '10px', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              English Top / 中文 Bottom
            </button>
            <button
              onClick={() => setLayoutOrder('cn-top')}
              className={layoutOrder === 'cn-top' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '10px', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              中文 Top / English Bottom
            </button>
          </div>
        </div>

        {/* Speech Recognition Accent */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Languages size={16} color="#10b981" /> Mic Speech Accent Model
          </label>
          <select
            value={speechLang}
            onChange={(e) => setSpeechLang(e.target.value)}
            className="glass-card"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="en-US">🇺🇸 English (US Accent)</option>
            <option value="en-GB">🇬🇧 English (UK Accent)</option>
            <option value="en-AU">🇦🇺 English (Australian Accent)</option>
            <option value="en-CA">🇨🇦 English (Canadian Accent)</option>
          </select>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
          Done
        </button>

      </div>
    </div>
  );
}
