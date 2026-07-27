import React, { useState } from 'react';
import { X, Volume2, Code, Copy, Check } from 'lucide-react';
import { CSTerm } from '../types';

interface TermCardModalProps {
  term: CSTerm | null;
  onClose: () => void;
}

export default function TermCardModal({ term, onClose }: TermCardModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!term) return null;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(term.term);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyCode = () => {
    if (term.codeExample) {
      navigator.clipboard.writeText(term.codeExample);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'Machine Learning': return 'cat-ai';
      case 'Deep Learning': return 'cat-algo';
      case 'Distributed Calculation': return 'cat-net';
      case 'Operating Systems': return 'cat-os';
      case 'Data Structures & Algorithms': return 'cat-algo';
      case 'Computer Networks': return 'cat-net';
      case 'Database Systems': return 'cat-db';
      case 'Software Engineering': return 'cat-se';
      default: return 'cat-net';
    }
  };

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
        maxWidth: '620px',
        padding: '28px',
        borderRadius: '24px',
        background: 'var(--bg-main)',
        border: '1px solid var(--border-glow)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span className={`term-badge ${getCategoryClass(term.category)}`}>
                {term.category}
              </span>
              {term.pronunciation && (
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {term.pronunciation}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 }}>
                {term.term}
              </h2>
              <span style={{ fontSize: '1.25rem', color: '#38bdf8', fontWeight: 600 }}>
                {term.chinese}
              </span>
              <button
                onClick={handleSpeak}
                className="btn-secondary"
                style={{ padding: '6px', borderRadius: '50%' }}
                title="Pronounce Term Audio"
              >
                <Volume2 size={16} color="#38bdf8" />
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* English Definition */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>
            Academic Definition (EN)
          </h4>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {term.definition}
          </p>
        </div>

        {/* Chinese Definition */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>
            中文学术解析
          </h4>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {term.definitionCn || term.chinese}
          </p>
        </div>

        {/* Code Example / Syntax */}
        {term.codeExample && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Code size={14} /> Code / Syntax Structure
              </span>
              <button
                onClick={handleCopyCode}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              background: '#090d16',
              padding: '14px',
              borderRadius: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#38bdf8',
              overflowX: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <code>{term.codeExample}</code>
            </pre>
          </div>
        )}

        {/* Example in Lecture */}
        {term.examplesInLecture && (
          <div style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', borderLeft: '3px solid #6366f1' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', display: 'block', marginBottom: '2px' }}>
              Typical Lecture Usage:
            </span>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
              "{term.examplesInLecture}"
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
