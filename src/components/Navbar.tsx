import { calculateWeekNumber } from '../utils/dateUtils';
import { Mic, BookOpen, MessageSquareText, Settings, Download, Volume2, Sun, Moon, GraduationCap, ChevronDown, User } from 'lucide-react';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'subtitle' | 'transcript' | 'glossary';
  setCurrentView: (view: 'subtitle' | 'transcript' | 'glossary') => void;
  activeCourse: Course | null;
  onOpenCourseSelector: () => void;
  onOpenAuthModal: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function Navbar({
  currentView,
  setCurrentView,
  activeCourse,
  onOpenCourseSelector,
  onOpenAuthModal,
  onOpenSettings,
  onOpenExport,
  theme,
  setTheme
}: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '12px 24px', width: '100%' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left Side: Logo & Selected Course Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Active Course Selector Button */}
          <button
            onClick={onOpenCourseSelector}
            className="glass-card"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: activeCourse ? '#38bdf8' : 'var(--border-glass)'
            }}
          >
            <GraduationCap size={18} color={activeCourse ? '#38bdf8' : 'var(--text-muted)'} />
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>
                Selected Course
              </span>
              <strong style={{ fontSize: '0.85rem', color: activeCourse ? '#38bdf8' : 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {activeCourse ? `${activeCourse.code}: ${activeCourse.title}` : 'Choose Course...'}
                {activeCourse && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8'
                  }}>
                    {calculateWeekNumber(activeCourse.startDate)}
                  </span>
                )}
              </strong>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

        </div>

        {/* Center: View Mode Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => setCurrentView('subtitle')}
            className={currentView === 'subtitle' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 14px', fontSize: '0.85rem', border: 'none' }}
          >
            <MessageSquareText size={16} /> Subtitle Bar
          </button>
          <button
            onClick={() => setCurrentView('transcript')}
            className={currentView === 'transcript' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 14px', fontSize: '0.85rem', border: 'none' }}
          >
            <Volume2 size={16} /> Live Transcript Stream
          </button>
          <button
            onClick={() => setCurrentView('glossary')}
            className={currentView === 'glossary' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 14px', fontSize: '0.85rem', border: 'none' }}
          >
            <BookOpen size={16} /> Academic Term Dictionary
          </button>
        </div>

        {/* Far Right Edge: Export, Settings, Theme & User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Export Lecture Notes */}
          <button onClick={onOpenExport} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} title="Export Transcript & Notes">
            <Download size={16} /> Export
          </button>

          {/* Settings Modal */}
          <button onClick={onOpenSettings} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} title="Settings">
            <Settings size={16} />
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
          </button>

          {/* Far Right Edge User Login / Profile Avatar */}
          <button
            onClick={onOpenAuthModal}
            className="glass-card"
            style={{
              padding: '5px 12px 5px 8px',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: 'rgba(66, 133, 244, 0.5)',
              background: 'rgba(66, 133, 244, 0.12)',
              borderRadius: '999px'
            }}
            title="User Profile & Authentication Settings"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #4285F4' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#ffffff" />
              </div>
            )}
            <span style={{ fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
