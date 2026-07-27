import React, { useState } from 'react';
import { X, BookOpen, Plus, Check, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import { Course, AcademicCategory } from '../types';
import { ACADEMIC_CATEGORIES } from '../data/csGlossary';

interface CourseSelectorModalProps {
  courses: Course[];
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
  onCreateCourse: (newCourse: Course) => void;
  onClose?: () => void;
}

export default function CourseSelectorModal({
  courses,
  selectedCourse,
  onSelectCourse,
  onCreateCourse,
  onClose
}: CourseSelectorModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState<AcademicCategory>('General Academic');
  const [description, setDescription] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const newCourseObj: Course = {
      id: `course-custom-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      instructor: instructor.trim() || 'Guest Lecturer',
      category: category,
      description: description.trim() || 'Custom course created by student.',
      createdDate: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    onCreateCourse(newCourseObj);
    onSelectCourse(newCourseObj);

    setCode('');
    setTitle('');
    setInstructor('');
    setDescription('');
    setShowCreateForm(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-float-up" style={{
        width: '100%',
        maxWidth: '680px',
        padding: '32px',
        borderRadius: '28px',
        background: 'var(--bg-main)',
        border: '1.5px solid var(--border-glow)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)'
      }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}>
              <GraduationCap size={26} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
                Choose Course & Lecture Session
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Select an existing course or create a new course before launching live captioning
              </p>
            </div>
          </div>

          {onClose && (
            <button onClick={onClose} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Create Course Form Toggle */}
        {showCreateForm ? (
          <form onSubmit={handleCreateSubmit} className="glass-card animate-float-up" style={{ padding: '20px', marginBottom: '20px', borderColor: 'var(--border-glow)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Create New Academic Course
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CS 580, BUS 201..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Course Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Learning, Microeconomics..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Instructor</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Geoffrey Hinton"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AcademicCategory)}
                  className="glass-card"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {ACADEMIC_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description / Focus Topics</label>
              <input
                type="text"
                placeholder="e.g. Self-Attention, Supply and Demand, Quantum Mechanics"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-card"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem' }}>
                Save & Select Course
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem', borderColor: '#38bdf8', color: '#38bdf8' }}
            >
              <Plus size={16} /> Create New Course
            </button>
          </div>
        )}

        {/* Course Cards Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '360px',
          overflowY: 'auto',
          paddingRight: '4px',
          marginBottom: '24px'
        }}>
          {courses.map(course => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#38bdf8' : 'var(--border-glass)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#818cf8',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {course.code}
                    </span>
                    <span className="term-badge" style={{ fontSize: '0.72rem', padding: '1px 8px' }}>
                      {course.category}
                    </span>
                    {course.isCustom && (
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }}>
                        Custom
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {course.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Instructor: {course.instructor} {course.description ? `• ${course.description}` : ''}
                  </p>
                </div>

                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid var(--border-glass)',
                  background: isSelected ? '#38bdf8' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isSelected && <Check size={18} color="#ffffff" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {selectedCourse && (
            <button
              onClick={() => {
                if (onClose) onClose();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              Start Live Caption for {selectedCourse.code} <ArrowRight size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
