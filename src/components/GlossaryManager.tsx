import React, { useState } from 'react';
import { Search, Plus, BookOpen, Trash2, Sparkles } from 'lucide-react';
import { ACADEMIC_CATEGORIES, DEFAULT_CS_GLOSSARY } from '../data/csGlossary';
import { AcademicCategory, CSTerm } from '../types';

interface GlossaryManagerProps {
  customGlossary: CSTerm[];
  onAddCustomTerm: (term: CSTerm) => void;
  onDeleteCustomTerm: (id: string) => void;
  onSelectTerm: (term: CSTerm) => void;
}

export default function GlossaryManager({
  customGlossary,
  onAddCustomTerm,
  onDeleteCustomTerm,
  onSelectTerm
}: GlossaryManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<AcademicCategory>('All Categories');
  const [searchTerm, setSearchTerm] = useState('');

  // New Custom Term Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newChinese, setNewChinese] = useState('');
  const [newCategory, setNewCategory] = useState<AcademicCategory>('General Academic');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCodeExample, setNewCodeExample] = useState('');

  const allTerms = [...customGlossary, ...DEFAULT_CS_GLOSSARY];

  const filteredTerms = allTerms.filter(item => {
    const matchesCat = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chinese.includes(searchTerm) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#38bdf8" /> Academic Course Term Dictionary
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Universal Academic Vocabulary + Custom Term protection for Science, Engineering, Business, Medicine, Law & Arts courses
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> {showAddForm ? 'Cancel' : 'Add Custom Course Term'}
          </button>
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
                  placeholder="e.g. 映射化简算法, 假设检验..."
                  value={newChinese}
                  onChange={(e) => setNewChinese(e.target.value)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Academic Field</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AcademicCategory)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {ACADEMIC_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Definition & Notes</label>
              <textarea
                rows={2}
                placeholder="Brief explanation of this term for your course notes..."
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                className="glass-card"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                Save Term
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {ACADEMIC_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search terms or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        </div>

        {/* Term Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          maxHeight: 'calc(100vh - 360px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filteredTerms.map(item => (
            <div
              key={item.id}
              className="glass-card animate-float-up"
              onClick={() => onSelectTerm(item)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="term-badge" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {item.category}
                  </span>
                  {item.isCustom && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.term}
                  </h4>
                  <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 600 }}>
                    {item.chinese}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.definition}
                </p>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Click for code & details
                </span>
                <Sparkles size={14} color="#38bdf8" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
