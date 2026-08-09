import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, Sparkles, Clock, ArrowDown, Filter, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CSTerm, TranscriptSentence } from '../types';

interface TranscriptViewProps {
  transcriptHistory: TranscriptSentence[];
  onSelectTerm: (term: CSTerm) => void;
  onToggleBookmark: (item: TranscriptSentence) => void;
  onClearHistory: () => void;
  selectedWeek: string;
  onSelectWeek: (week: string) => void;
}

export default function TranscriptView({
  transcriptHistory,
  onSelectTerm,
  onToggleBookmark,
  onClearHistory,
  selectedWeek,
  onSelectWeek
}: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filterBookmarked, selectedWeek]);

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

  // Calculate pagination slice
  const totalItems = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePageIndex = Math.min(Math.max(1, pageIndex), totalPages);
  const startIndex = (safePageIndex - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  return (
    <div style={{ maxWidth: '1400px', margin: '24px auto 0 auto', padding: '0 16px' }}>
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
            {/* Week Filter (Options 1-50) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#38bdf8" />
              <select
                value={selectedWeek}
                onChange={(e) => onSelectWeek(e.target.value)}
                className="glass-card"
                style={{
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  borderColor: selectedWeek !== 'all' ? '#38bdf8' : 'var(--border-glass)'
                }}
              >
                <option value="all">All Weeks (1-50)</option>
                {Array.from({ length: 50 }, (_, i) => `Week ${i + 1}`).map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search transcript or academic terms..."
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
          {paginatedHistory.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', padding: '40px 0' }}>
              <Filter size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.95rem' }}>No transcript entries match your current search filter.</p>
            </div>
          ) : (
            paginatedHistory.map((item, index) => (
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

        {/* Footer Pagination Bar */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Item Range Info */}
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {totalItems > 0 ? (
              <>Showing <strong style={{ color: 'var(--text-primary)' }}>{startIndex + 1}–{endIndex}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> lines</>
            ) : (
              '0 lines'
            )}
          </div>

          {/* Right: Page Size & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Page Size Select (10, 20, 50, 100) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page Size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(1);
                }}
                className="glass-card"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Index Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
                disabled={safePageIndex <= 1}
                className="btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  opacity: safePageIndex <= 1 ? 0.4 : 1,
                  cursor: safePageIndex <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, padding: '0 4px' }}>
                Page {safePageIndex} of {totalPages}
              </span>

              <button
                onClick={() => setPageIndex(prev => Math.min(totalPages, prev + 1))}
                disabled={safePageIndex >= totalPages}
                className="btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  opacity: safePageIndex >= totalPages ? 0.4 : 1,
                  cursor: safePageIndex >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
