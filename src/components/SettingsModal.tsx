import React from 'react';
import { X, Settings, Type, Layout, Languages, Sparkles, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  layoutOrder: 'en-top' | 'cn-top';
  setLayoutOrder: (order: 'en-top' | 'cn-top') => void;
  speechLang: string;
  setSpeechLang: (lang: string) => void;
  translationProvider: 'google' | 'gemini';
  setTranslationProvider: (provider: 'google' | 'gemini') => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  onClose: () => void;
}

export default function SettingsModal({
  fontSize,
  setFontSize,
  layoutOrder,
  setLayoutOrder,
  speechLang,
  setSpeechLang,
  translationProvider,
  setTranslationProvider,
  geminiApiKey,
  setGeminiApiKey,
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
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
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
                Caption Preferences & Engine
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Customize font size, stack order, and choose translation provider
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Translation Provider Selector */}
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="#38bdf8" /> Translation Engine Provider
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button
              onClick={() => setTranslationProvider('google')}
              className={translationProvider === 'google' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '12px',
                fontSize: '0.83rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                borderColor: translationProvider === 'google' ? '#38bdf8' : 'var(--border-glass)'
              }}
            >
              <strong style={{ fontSize: '0.88rem' }}>Google Translate</strong>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>Standard Free API (Fast)</span>
            </button>

            <button
              onClick={() => setTranslationProvider('gemini')}
              className={translationProvider === 'gemini' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '12px',
                fontSize: '0.83rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                borderColor: translationProvider === 'gemini' ? '#38bdf8' : 'var(--border-glass)',
                background: translationProvider === 'gemini' ? 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)' : undefined
              }}
            >
              <strong style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Google Gemini AI ✨
              </strong>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>LLM Context-Aware Academic Translation</span>
            </button>
          </div>

          {/* Gemini API Key input if Gemini is selected */}
          {translationProvider === 'gemini' && (
            <div className="animate-float-up" style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} /> Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  Get Free Key at Google AI Studio <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                placeholder="AIzaSy... (or set VITE_GEMINI_API_KEY in .env)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="glass-card"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', outline: 'none' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Powered by Gemini LLM system prompt instructions in <code>src/prompts/geminiTranslationPrompt.md</code>. Fallbacks to Google Translate if key is invalid.
              </p>
            </div>
          )}
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
            <option value="en-IN">🇮🇳 English (Indian Accent / 印度口音)</option>
            <option value="en-NZ">🇳🇿 English (New Zealand Accent / 新西兰口音)</option>
            <option value="en-GB">🇬🇧 English (UK Accent / 英国口音)</option>
            <option value="en-US">🇺🇸 English (US Accent / 美国口音)</option>
          </select>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
          Done
        </button>

      </div>
    </div>
  );
}
