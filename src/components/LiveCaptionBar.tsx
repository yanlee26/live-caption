import React, { useState } from 'react';
import { Star, Copy, Check, Type, Sparkles, BookOpen } from 'lucide-react';
import { CSTerm, TranscriptSentence } from '../types';

interface LiveCaptionBarProps {
  currentCaption: TranscriptSentence | null;
  onSelectTerm: (term: CSTerm) => void;
  onToggleBookmark: (caption: TranscriptSentence) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  layoutOrder: 'en-top' | 'cn-top';
}

export default function LiveCaptionBar({
  currentCaption,
  onSelectTerm,
  onToggleBookmark,
  fontSize,
  setFontSize,
  layoutOrder
}: LiveCaptionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!currentCaption) return;
    const textToCopy = `${currentCaption.english}\n${currentCaption.chinese}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderEnglishLine = () => {
    if (!currentCaption || !currentCaption.english) {
      return (
        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          Waiting for lecture audio stream or mic speech input...
        </span>
      );
    }

    const { english, detectedTerms } = currentCaption;

    if (!detectedTerms || detectedTerms.length === 0) {
      return <span>{english}</span>;
    }

    let parts: (string | React.ReactNode)[] = [english];
    detectedTerms.forEach(term => {
      const termRegex = new RegExp(`(${term.term})`, 'gi');
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const split = part.split(termRegex);
          split.forEach((s, idx) => {
            if (s.toLowerCase() === term.term.toLowerCase()) {
              newParts.push(
                <span
                  key={`${term.id}-${idx}`}
                  onClick={() => onSelectTerm(term)}
                  className="term-badge"
                  title="Click to view Academic Term Definition"
                  style={{ margin: '0 4px', cursor: 'pointer' }}
                >
                  <Sparkles size={12} /> {s}
                </span>
              );
            } else if (s) {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <span>{parts}</span>;
  };

  const renderChineseLine = () => {
    if (!currentCaption || !currentCaption.chinese) {
      return (
        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          同传中文字幕生成中...
        </span>
      );
    }
    return <span>{currentCaption.chinese}</span>;
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '24px auto',
      padding: '0 16px',
      position: 'relative'
    }}>
      <div className="glass-panel animate-float-up" style={{
        padding: '24px 32px',
        border: '1.5px solid var(--border-glow)',
        borderRadius: '24px',
        background: 'rgba(11, 15, 25, 0.85)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Top Control Dock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8'
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Subtitle Overlay
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Font Size Adjust */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '8px' }}>
              <Type size={14} color="var(--text-muted)" />
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0 4px', fontWeight: 700 }}
              >
                -
              </button>
              <span style={{ fontSize: '0.75rem', minWidth: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0 4px', fontWeight: 700 }}
              >
                +
              </button>
            </div>

            {/* Bookmark Current Line */}
            {currentCaption && (
              <button
                onClick={() => onToggleBookmark(currentCaption)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title={currentCaption.bookmarked ? 'Bookmarked' : 'Star this caption line'}
              >
                <Star size={15} color={currentCaption.bookmarked ? '#f59e0b' : 'var(--text-secondary)'} fill={currentCaption.bookmarked ? '#f59e0b' : 'none'} />
                {currentCaption.bookmarked ? 'Saved' : 'Bookmark'}
              </button>
            )}

            {/* Copy Line */}
            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Copy caption text"
            >
              {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Dual Line Subtitle Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '110px', justifyContent: 'center' }}>
          
          {layoutOrder === 'en-top' ? (
            <>
              {/* Primary English Line */}
              <div style={{
                fontSize: `${fontSize}px`,
                fontWeight: 600,
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}>
                {renderEnglishLine()}
              </div>

              {/* Secondary Chinese Line */}
              <div style={{
                fontSize: `${Math.round(fontSize * 0.9)}px`,
                fontWeight: 500,
                lineHeight: 1.5,
                color: '#38bdf8',
                opacity: 0.95
              }}>
                {renderChineseLine()}
              </div>
            </>
          ) : (
            <>
              {/* Primary Chinese Line */}
              <div style={{
                fontSize: `${fontSize}px`,
                fontWeight: 600,
                lineHeight: 1.5,
                color: '#38bdf8'
              }}>
                {renderChineseLine()}
              </div>

              {/* Secondary English Line */}
              <div style={{
                fontSize: `${Math.round(fontSize * 0.9)}px`,
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                opacity: 0.9
              }}>
                {renderEnglishLine()}
              </div>
            </>
          )}

        </div>

        {/* Term Quick Pills Footer */}
        {currentCaption?.detectedTerms && currentCaption.detectedTerms.length > 0 && (
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px dashed var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={13} /> Academic Terms detected in this sentence:
            </span>
            {currentCaption.detectedTerms.map(term => (
              <button
                key={term.id}
                onClick={() => onSelectTerm(term)}
                className="term-badge"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                {term.term} ({term.chinese})
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
