import React from 'react';
import { X, Settings, Type, Layout, Languages, Sparkles, Key, ExternalLink, Bot } from 'lucide-react';

interface SettingsModalProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  layoutOrder: 'en-top' | 'cn-top';
  setLayoutOrder: (order: 'en-top' | 'cn-top') => void;
  speechLang: string;
  setSpeechLang: (lang: string) => void;
  translationProvider: 'google' | 'gemini' | 'openai';
  setTranslationProvider: (provider: 'google' | 'gemini' | 'openai') => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  openAiApiKey: string;
  setOpenAiApiKey: (key: string) => void;
  openAiModel: string;
  setOpenAiModel: (model: string) => void;
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
  openAiApiKey,
  setOpenAiApiKey,
  openAiModel,
  setOpenAiModel,
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
        maxWidth: '580px',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {/* Google Translate */}
            <button
              onClick={() => setTranslationProvider('google')}
              className={translationProvider === 'google' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '10px 8px',
                fontSize: '0.78rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '3px',
                borderColor: translationProvider === 'google' ? '#38bdf8' : 'var(--border-glass)'
              }}
            >
              <strong style={{ fontSize: '0.82rem' }}>Google Translate</strong>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Standard Free</span>
            </button>

            {/* Google Gemini AI */}
            <button
              onClick={() => setTranslationProvider('gemini')}
              className={translationProvider === 'gemini' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '10px 8px',
                fontSize: '0.78rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '3px',
                borderColor: translationProvider === 'gemini' ? '#818cf8' : 'var(--border-glass)',
                background: translationProvider === 'gemini' ? 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)' : undefined
              }}
            >
              <strong style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                Google Gemini ✨
              </strong>
              <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>Gemini 2.0 LLM</span>
            </button>

            {/* OpenAI GPT */}
            <button
              onClick={() => setTranslationProvider('openai')}
              className={translationProvider === 'openai' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '10px 8px',
                fontSize: '0.78rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '3px',
                borderColor: translationProvider === 'openai' ? '#10b981' : 'var(--border-glass)',
                background: translationProvider === 'openai' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : undefined
              }}
            >
              <strong style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                OpenAI GPT 🤖
              </strong>
              <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>GPT-4o LLM</span>
            </button>
          </div>

          {/* Gemini API Key Input */}
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
                  Get Key at Google AI Studio <ExternalLink size={10} />
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
                Powered by Gemini LLM system prompt instructions. Fallbacks to Google Translate if key is invalid.
              </p>
            </div>
          )}

          {/* OpenAI API Key Input & Model Picker */}
          {translationProvider === 'openai' && (
            <div className="animate-float-up" style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} /> OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.72rem', color: '#10b981', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  Get Key at OpenAI Platform <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                placeholder="sk-proj-... (or set VITE_OPENAI_API_KEY in .env)"
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                className="glass-card"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', outline: 'none', marginBottom: '10px' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bot size={13} color="#10b981" /> OpenAI Model:
                </label>
                <select
                  value={openAiModel}
                  onChange={(e) => setOpenAiModel(e.target.value)}
                  className="glass-card"
                  style={{ padding: '6px 10px', fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none', width: '200px' }}
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
                  <option value="gpt-4o">gpt-4o (High Accuracy)</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                </select>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Uses OpenAI Chat Completions REST API with academic prompt instructions. Fallbacks to Google Translate if key is missing.
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
