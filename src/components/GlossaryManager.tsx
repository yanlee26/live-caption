import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Trash2, Sparkles, ChevronLeft, ChevronRight, RefreshCw, Database, UploadCloud, CheckCircle2 } from 'lucide-react';
import { ACADEMIC_CATEGORIES, DEFAULT_CS_GLOSSARY } from '../data/csGlossary';
import { AcademicCategory, CSTerm } from '../types';
import { fetchGlossaryTermsAPI, syncGlossaryToSupabase, saveCustomGlossary } from '../utils/storage';

interface GlossaryManagerProps {
  customGlossary: CSTerm[];
  onAddCustomTerm: (term: CSTerm) => void;
  onDeleteCustomTerm: (id: string) => void;
  onSelectTerm: (term: CSTerm) => void;
  userId?: string;
}

export default function GlossaryManager({
  customGlossary,
  onAddCustomTerm,
  onDeleteCustomTerm,
  onSelectTerm,
  userId
}: GlossaryManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<AcademicCategory>('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  
  // API Pagination & Data State
  const [page, setPage] = useState<number>(1);
  const pageSize = 6; // 6 terms per page for responsive 3x2 grid layout
  const [loading, setLoading] = useState<boolean>(false);
  const [terms, setTerms] = useState<CSTerm[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Cloud Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncDone, setSyncDone] = useState<boolean>(false);

  // New Custom Term Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newChinese, setNewChinese] = useState('');
  const [newCategory, setNewCategory] = useState<AcademicCategory>('General Academic');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCodeExample, setNewCodeExample] = useState('');

  // Fetch API terms whenever Category, Search, Page or customGlossary updates
  const loadTermsFromAPI = () => {
    setLoading(true);
    fetchGlossaryTermsAPI({
      category: selectedCategory,
      search: searchTerm,
      page,
      pageSize,
      userId
    }).then(res => {
      setTerms(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTermsFromAPI();
  }, [selectedCategory, searchTerm, page, customGlossary.length, userId]);

  // One-Click Sync All Terms to Cloud Backend
  const handleSyncToBackend = async () => {
    setIsSyncing(true);
    setSyncDone(false);

    try {
      // Merge all custom and default dictionary terms
      const allTermsMap = new Map<string, CSTerm>();
      [...customGlossary, ...DEFAULT_CS_GLOSSARY].forEach(item => {
        allTermsMap.set(item.term.toLowerCase(), item);
      });
      const fullList = Array.from(allTermsMap.values());

      // Save locally and sync to Supabase database
      saveCustomGlossary(fullList, userId);
      if (userId) {
        await syncGlossaryToSupabase(fullList, userId);
      }

      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
      loadTermsFromAPI();
    } catch (e) {
      console.warn('Sync glossary to backend failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset page to 1 on category change
  const handleCategoryChange = (cat: AcademicCategory) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  // Reset page to 1 on search term change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newChinese.trim()) return;

    const termObj: CSTerm = {
      id: `custom-${Date.now()}`,
      term: newTerm.trim(),
      chinese: newChinese.trim(),
      category: newCategory,
      definition: newDefinition || 'User-added course glossary term.',
      definitionCn: newDefinition || '用户自定义课程专有名词',
      codeExample: newCodeExample || '',
      isCustom: true
    };

    onAddCustomTerm(termObj);
    setNewTerm('');
    setNewChinese('');
    setNewDefinition('');
    setNewCodeExample('');
    setShowAddForm(false);
    setPage(1);
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div style={{ maxWidth: '1400px', margin: '24px auto 0 auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <BookOpen size={20} color="#38bdf8" /> Academic Course Term Dictionary
            </h2>
          </div>

          {/* Action Buttons Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <Database size={13} /> API Data Engine ({total} Terms)
            </span>

            {/* One-Click Sync to Backend Button */}
            <button
              onClick={handleSyncToBackend}
              disabled={isSyncing}
              className="btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                borderColor: syncDone ? '#10b981' : 'rgba(56, 189, 248, 0.4)',
                color: syncDone ? '#10b981' : '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              title="Sync all built-in and custom academic terms to backend cloud database"
            >
              {isSyncing ? (
                <RefreshCw size={15} className="animate-spin" color="#38bdf8" />
              ) : syncDone ? (
                <CheckCircle2 size={15} color="#10b981" />
              ) : (
                <UploadCloud size={15} color="#38bdf8" />
              )}
              {isSyncing ? 'Syncing to Backend...' : syncDone ? 'Synced to Backend!' : 'Sync Terms to Backend'}
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={16} /> {showAddForm ? 'Cancel' : 'Add Custom Course Term'}
            </button>
          </div>
        </div>

        {/* Add Custom Term Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="glass-card animate-float-up" style={{ padding: '20px', marginBottom: '20px', borderColor: 'var(--border-glow)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#38bdf8' }}>
              ➕ Add New Term to Custom Course Glossary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>English Term *</label>
                <input
                  type="text"
                  placeholder="e.g. MapReduce, Hypothesis Testing..."
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Chinese Translation *</label>
                <input
                  type="text"
                  placeholder="e.g. 映射化简分布式框架..."
                  value={newChinese}
                  onChange={(e) => setNewChinese(e.target.value)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AcademicCategory)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-glass)' }}
                >
                  {ACADEMIC_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                    <option key={cat} value={cat} style={{ background: '#0f172a' }}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Academic Definition</label>
              <textarea
                placeholder="Detailed English or Chinese explanation of the term..."
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                className="glass-card"
                rows={2}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.8rem' }}
              >
                Save Term
              </button>
            </div>
          </form>
        )}

        {/* Filters & Search Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {ACADEMIC_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  borderRadius: '999px',
                  borderColor: selectedCategory === cat ? '#38bdf8' : 'var(--border-glass)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="API Search terms or definitions..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="glass-card"
              style={{
                padding: '8px 12px 8px 36px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '260px'
              }}
            />
          </div>

        </div>

        {/* API Loading Skeleton / Empty State */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px', color: 'var(--text-muted)' }}>
            <RefreshCw size={18} className="animate-spin" color="#38bdf8" />
            <span style={{ fontSize: '0.9rem' }}>Querying Academic Term API...</span>
          </div>
        ) : terms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <BookOpen size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No matching academic terms found from API</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try adjusting your search query or selected category filter, or click "Sync Terms to Backend".</p>
          </div>
        ) : (
          <>
            {/* Term Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
              minHeight: '260px',
              marginBottom: '20px'
            }}>
              {terms.map(item => (
                <div
                  key={item.id}
                  className="glass-card animate-float-up"
                  onClick={() => onSelectTerm(item)}
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="term-badge" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {item.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.isAutoSaved && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.18)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Sparkles size={10} /> Auto-Saved
                          </span>
                        )}
                        {item.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomTerm(item.id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                            title="Delete Custom Term"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {item.term}
                      </strong>
                      <span style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: 600 }}>
                        {item.chinese}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.definition || item.definitionCn}
                    </p>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Click for code & details
                    </span>
                    <Sparkles size={13} color="#38bdf8" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-glass)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Items Counter */}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem} - {endItem}</strong> of <strong style={{ color: '#38bdf8' }}>{total}</strong> Terms
              </span>

              {/* Page Number Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={page === p ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      minWidth: '32px',
                      borderColor: page === p ? '#38bdf8' : 'var(--border-glass)'
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
