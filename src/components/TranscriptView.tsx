import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, Sparkles, Clock, ArrowDown, Filter, Trash2 } from 'lucide-react';
import { CSTerm, TranscriptSentence } from '../types';

interface TranscriptViewProps {
  transcriptHistory: TranscriptSentence[];
  onSelectTerm: (term: CSTerm) => void;
  onToggleBookmark: (item: TranscriptSentence) => void;
  onClearHistory: () => void;
}

export default function TranscriptView({
  transcriptHistory,
  onSelectTerm,
  onToggleBookmark,
  onClearHistory
}: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new transcript item if autoScroll enabled
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcriptHistory, autoScroll]);

  const filteredHistory = transcriptHistory.filter(item => {
    const matchesSearch = !searchQuery || 
      item.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chinese.includes(searchQuery);
    
    const matchesBookmark = !filterBookmarked || item.bookmarked;

    return matchesSearch && matchesBookmark;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: '550px' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              Live Transcript & Academic Notes Stream
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total lines captured: {transcriptHistory.length} | Bookmarked: {transcriptHistory.filter(i => i.bookmarked).length}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search transcript or CS/AI terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-card"
                style={{
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '240px'
                }}
              />
            </div>

            {/* Filter Starred */}
            <button
              onClick={() => setFilterBookmarked(!filterBookmarked)}
              className={filterBookmarked ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Star size={16} fill={filterBookmarked ? '#ffffff' : 'none'} />
              {filterBookmarked ? 'Bookmarked Only' : 'All Lines'}
            </button>

            {/* Auto Scroll Toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: autoScroll ? '#38bdf8' : 'var(--border-glass)' }}
              title="Auto scroll to bottom on new caption"
            >
              <ArrowDown size={16} color={autoScroll ? '#38bdf8' : 'var(--text-muted)'} />
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>

            {/* Clear History */}
            <button
              onClick={onClearHistory}
              className="btn-secondary"
              style={{ padding: '8px 12px' }}
              title="Clear transcript log"
            >
              <Trash2 size={16} color="#ef4444" />
            </button>
          </div>
        </div>

        {/* Scrollable Transcript List */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingRight: '8px'
          }}
        >
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', padding: '40px 0' }}>
              <Filter size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.95rem' }}>No transcript entries match your current search filter.</p>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <div
                key={item.id || index}
                className="glass-card animate-float-up"
                style={{
                  padding: '16px 20px',
                  borderColor: item.bookmarked ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-glass)',
                  background: item.bookmarked ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} /> {item.time || 'Live'}
                    </span>
                    {item.speaker && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8'
                      }}>
                        {item.speaker}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onToggleBookmark(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    title={item.bookmarked ? 'Remove bookmark' : 'Bookmark this line'}
                  >
                    <Star size={16} color={item.bookmarked ? '#f59e0b' : 'var(--text-muted)'} fill={item.bookmarked ? '#f59e0b' : 'none'} />
                  </button>
                </div>

                {/* English Content */}
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.5 }}>
                  {item.english}
                </p>

                {/* Chinese Translation */}
                <p style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '10px', lineHeight: 1.5, fontWeight: 500 }}>
                  {item.chinese}
                </p>

                {/* Detected Terms */}
                {item.detectedTerms && item.detectedTerms.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {item.detectedTerms.map(term => (
                      <button
                        key={term.id}
                        onClick={() => onSelectTerm(term)}
                        className="term-badge"
                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      >
                        <Sparkles size={11} /> {term.term} ({term.chinese})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
