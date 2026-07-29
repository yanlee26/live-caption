import React, { useState, useEffect } from 'react';
import { Star, Copy, Check, Type, Sparkles, BookOpen, Zap, Layers } from 'lucide-react';
import { CSTerm, TranscriptSentence } from '../types';
import { streamingTranslationService } from '../utils/streamingTranslationService';

interface LiveCaptionBarProps {
  currentCaption: TranscriptSentence | null;
  onSelectTerm: (term: CSTerm) => void;
  onToggleBookmark: (caption: TranscriptSentence) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  layoutOrder: 'en-top' | 'cn-top';
  setLayoutOrder?: (order: 'en-top' | 'cn-top') => void;
}

export default function LiveCaptionBar({
  currentCaption,
  onSelectTerm,
  onToggleBookmark,
  fontSize,
  setFontSize,
  layoutOrder,
  setLayoutOrder
}: LiveCaptionBarProps) {
  const [copied, setCopied] = useState(false);
  const [streamText, setStreamText] = useState<string>('');
  const [cacheCount, setCacheCount] = useState<number>(0);

  // Sync streaming text with current caption chinese translation
  useEffect(() => {
    if (currentCaption?.chinese) {
      setStreamText(currentCaption.chinese);
      const status = streamingTranslationService.getStreamStatus();
      setCacheCount(status.cacheCount);
    } else {
      setStreamText('');
    }
  }, [currentCaption?.chinese, currentCaption?.english]);

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
          Waiting for live professor speech or microphone input...
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
    const textToShow = streamText || currentCaption?.chinese;
    if (!currentCaption || !textToShow) {
      return (
        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          实时同传中文字幕处理中...
        </span>
      );
    }

    return (
      <span className="animate-float-up" style={{ textShadow: '0 0 12px rgba(56, 189, 248, 0.25)' }}>
        {textToShow}
      </span>
    );
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
        background: 'rgba(11, 15, 25, 0.88)',
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
          {/* Stream Engine Indicator Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span className="recording-dot-pulse" style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <Zap size={13} color="#10b981" /> Live Subtitle Overlay
            </span>
            {cacheCount > 0 && (
              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {cacheCount} Cached (0ms)
              </span>
            )}
          </div>

          {/* Controls Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Toggle Stack Order */}
            {setLayoutOrder && (
              <button
                onClick={() => setLayoutOrder(layoutOrder === 'en-top' ? 'cn-top' : 'en-top')}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.3)' }}
                title="Switch Bilingual Stack Order"
              >
                <Layers size={13} /> {layoutOrder === 'en-top' ? 'EN / 中' : '中 / EN'}
              </button>
            )}

            {/* Font Size Adjust */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '8px' }}>
              <Type size={13} color="var(--text-muted)" />
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0 4px', fontWeight: 700 }}
              >
                -
              </button>
              <span style={{ fontSize: '0.75rem', minWidth: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                title={currentCaption.bookmarked ? 'Bookmarked' : 'Star this caption line'}
              >
                <Star size={14} color={currentCaption.bookmarked ? '#f59e0b' : 'var(--text-secondary)'} fill={currentCaption.bookmarked ? '#f59e0b' : 'none'} />
                {currentCaption.bookmarked ? 'Saved' : 'Bookmark'}
              </button>
            )}

            {/* Copy Line */}
            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
              title="Copy caption text"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
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
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}>
                {renderEnglishLine()}
              </div>

              {/* Secondary Chinese Line */}
              <div style={{
                fontSize: `${Math.round(fontSize * 0.92)}px`,
                fontWeight: 600,
                lineHeight: 1.6,
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
                lineHeight: 1.6,
                color: '#38bdf8'
              }}>
                {renderChineseLine()}
              </div>

              {/* Secondary English Line */}
              <div style={{
                fontSize: `${Math.round(fontSize * 0.92)}px`,
                fontWeight: 500,
                lineHeight: 1.6,
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
              <BookOpen size={13} /> Academic Terms detected:
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
