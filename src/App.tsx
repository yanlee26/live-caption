import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import AudioControls from './components/AudioControls';
import LiveCaptionBar from './components/LiveCaptionBar';
import TranscriptView from './components/TranscriptView';
import GlossaryManager from './components/GlossaryManager';
import TermCardModal from './components/TermCardModal';
import ExportModal from './components/ExportModal';
import SettingsModal from './components/SettingsModal';
import CourseSelectorModal from './components/CourseSelectorModal';
import AuthModal from './components/AuthModal';

import { translateWithTermPreservation, fetchOnlineTranslation, matchCSTerms } from './utils/translationEngine';
import { CSTerm, TranscriptSentence, Course } from './types';
import {
  loadSavedCourses, saveCourses, fetchCoursesFromSupabase,
  loadActiveCourseId, saveActiveCourseId,
  loadSavedTranscripts, saveTranscripts, fetchTranscriptsFromSupabase,
  loadCustomGlossary, saveCustomGlossary, fetchGlossaryFromSupabase,
  loadAppSettings, saveAppSettings, fetchSettingsFromSupabase
} from './utils/storage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  // Load initial state from localStorage
  const savedSettings = loadAppSettings();
  const savedCourses = loadSavedCourses();
  const savedActiveId = loadActiveCourseId();
  const initialCourse = savedCourses.find(c => c.id === savedActiveId) || savedCourses[0] || null;
  const savedTranscripts = loadSavedTranscripts();
  const savedGlossary = loadCustomGlossary();

  const [theme, setTheme] = useState<'dark' | 'light'>(savedSettings.theme);
  const [currentView, setCurrentView] = useState<'subtitle' | 'transcript' | 'glossary'>('subtitle');

  // Courses State
  const [courses, setCourses] = useState<Course[]>(savedCourses);
  const [activeCourse, setActiveCourse] = useState<Course | null>(initialCourse);
  const [showCourseSelectorModal, setShowCourseSelectorModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Audio & Mic State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);

  // Caption State
  const defaultInitialCaption: TranscriptSentence = {
    id: 'init-1',
    time: 'Live',
    speaker: initialCourse ? initialCourse.instructor : 'Course Instructor',
    english: 'Click "Start Live Microphone" to translate the voice into Chinese live.',
    chinese: '点击“启动实时麦克风”，即可将课程语音实时同传为中文。',
    detectedTerms: matchCSTerms('Click "Start Live Microphone" to translate the voice into Chinese live.', []),
    bookmarked: false,
    courseId: initialCourse?.id,
    userId: user?.id
  };

  const [currentCaption, setCurrentCaption] = useState<TranscriptSentence | null>(
    savedTranscripts.length > 0 ? savedTranscripts[savedTranscripts.length - 1] : defaultInitialCaption
  );

  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptSentence[]>(
    savedTranscripts.length > 0 ? savedTranscripts : [defaultInitialCaption]
  );
  const [customGlossary, setCustomGlossary] = useState<CSTerm[]>(savedGlossary);

  // Modals & Preferences
  const [selectedTermForModal, setSelectedTermForModal] = useState<CSTerm | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const [fontSize, setFontSize] = useState<number>(savedSettings.fontSize);
  const [layoutOrder, setLayoutOrder] = useState<'en-top' | 'cn-top'>(savedSettings.layoutOrder);
  const [speechLang, setSpeechLang] = useState<string>(savedSettings.speechLang);

  // Speech Recognition & Auto-Reconnect Refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const latestSpeechTextRef = useRef<string>('');
  const processedResultIndexesRef = useRef<Set<number>>(new Set());

  // Deduplication Helper: Appends caption object to transcriptHistory without duplicate lines
  const appendDeduplicatedTranscript = (list: TranscriptSentence[], newItem: TranscriptSentence): TranscriptSentence[] => {
    if (!newItem.english || !newItem.english.trim()) return list;

    const trimmedNew = newItem.english.trim().toLowerCase();

    // Check if any of the last 4 items in transcriptHistory has the exact same english text or ID
    const isRecentDuplicate = list.slice(-4).some(item =>
      item.id === newItem.id || item.english.trim().toLowerCase() === trimmedNew
    );

    if (isRecentDuplicate) {
      return list;
    }
    return [...list, newItem];
  };

  // Synchronize isListening ref to avoid closure staleness
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Apply theme data attribute to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync state changes to localStorage & Supabase
  useEffect(() => { saveCourses(courses, user?.id); }, [courses, user?.id]);
  useEffect(() => { if (activeCourse) saveActiveCourseId(activeCourse.id); }, [activeCourse]);
  useEffect(() => { saveTranscripts(transcriptHistory, user?.id); }, [transcriptHistory, user?.id]);
  useEffect(() => { saveCustomGlossary(customGlossary, user?.id); }, [customGlossary, user?.id]);
  useEffect(() => {
    saveAppSettings({ fontSize, layoutOrder, theme, speechLang }, user?.id);
  }, [fontSize, layoutOrder, theme, speechLang, user?.id]);

  // Update current caption and initial sentence when activeCourse changes
  useEffect(() => {
    if (!activeCourse) return;
    const courseTranscripts = transcriptHistory.filter(t => t.courseId === activeCourse.id);
    if (courseTranscripts.length > 0) {
      setCurrentCaption(courseTranscripts[courseTranscripts.length - 1]);
    } else {
      const defaultCourseCaption: TranscriptSentence = {
        id: `init-${activeCourse.id}`,
        time: 'Live',
        speaker: activeCourse.instructor || 'Course Instructor',
        english: `Selected ${activeCourse.code}: ${activeCourse.title}. Click "Start Live Microphone" to begin captioning.`,
        chinese: `已选择 ${activeCourse.code} (${activeCourse.title}) 课程，点击“启动实时麦克风”即可开始同传。`,
        detectedTerms: matchCSTerms(`Selected ${activeCourse.code}: ${activeCourse.title}`, customGlossary),
        bookmarked: false,
        courseId: activeCourse.id,
        userId: user?.id
      };
      setCurrentCaption(defaultCourseCaption);
    }
  }, [activeCourse?.id]);

  // Filter transcript history by currently active course
  const activeCourseHistory = transcriptHistory.filter(t => !t.courseId || t.courseId === activeCourse?.id);

  // Load cloud data from Supabase when authenticated
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    (async () => {
      const [remoteCourses, remoteTranscripts, remoteGlossary, remoteSettings] = await Promise.all([
        fetchCoursesFromSupabase(user.id),
        fetchTranscriptsFromSupabase(user.id),
        fetchGlossaryFromSupabase(user.id),
        fetchSettingsFromSupabase(user.id)
      ]);
      if (!isMounted) return;
      if (remoteCourses && remoteCourses.length > 0) setCourses(remoteCourses);
      if (remoteTranscripts && remoteTranscripts.length > 0) setTranscriptHistory(remoteTranscripts);
      if (remoteGlossary && remoteGlossary.length > 0) setCustomGlossary(remoteGlossary);
      if (remoteSettings) {
        setFontSize(remoteSettings.fontSize);
        setLayoutOrder(remoteSettings.layoutOrder);
        setTheme(remoteSettings.theme);
        setSpeechLang(remoteSettings.speechLang);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.id]);

  // Smart sentence segmentation helper
  const segmentSpeechText = (rawText: string): string[] => {
    if (!rawText) return [];

    const punctuationChunks = rawText.split(/(?<=[.?!;\n])\s+/);
    const finalSegments: string[] = [];

    punctuationChunks.forEach(chunk => {
      const trimmed = chunk.trim();
      if (!trimmed) return;

      if (trimmed.length > 90) {
        const words = trimmed.split(/\s+/);
        let currentGroup: string[] = [];
        let currentLen = 0;

        words.forEach(w => {
          currentGroup.push(w);
          currentLen += w.length + 1;

          const isConjunction = /^(and|so|then|because|where|while|if|but|however|therefore|also|which)$/i.test(w);
          if (currentLen > 75 && (isConjunction || currentLen > 105)) {
            finalSegments.push(currentGroup.join(' '));
            currentGroup = [];
            currentLen = 0;
          }
        });

        if (currentGroup.length > 0) {
          finalSegments.push(currentGroup.join(' '));
        }
      } else {
        finalSegments.push(trimmed);
      }
    });

    return finalSegments;
  };

  // Handle incoming speech text from microphone
  const processLiveSpeech = (text: string, isFinal: boolean = false) => {
    if (!text || !text.trim()) return;

    const segments = segmentSpeechText(text.trim());
    if (segments.length === 0) return;

    const activeSegment = segments[segments.length - 1];
    // Completed segments are strictly previous chunks (excluding activeSegment)
    const completedSegments = segments.slice(0, -1);

    // Process previous completed segments if any
    completedSegments.forEach(seg => {
      if (seg.trim()) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const instantProcessed = translateWithTermPreservation(seg, customGlossary);
        const captionObj: TranscriptSentence = {
          id: `live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          time: timeStr,
          speaker: activeCourse ? activeCourse.instructor : 'Live Professor',
          english: instantProcessed.original,
          chinese: instantProcessed.chinese,
          detectedTerms: instantProcessed.detectedTerms,
          bookmarked: false,
          courseId: activeCourse?.id,
          userId: user?.id
        };

        setTranscriptHistory(prev => appendDeduplicatedTranscript(prev, captionObj));

        fetchOnlineTranslation(seg, customGlossary).then(onlineRes => {
          if (onlineRes && onlineRes.chinese) {
            setTranscriptHistory(prev => prev.map(item =>
              item.id === captionObj.id ? { ...item, chinese: onlineRes.chinese, detectedTerms: onlineRes.detectedTerms } : item
            ));
          }
        });
      }
    });

    // Process current active segment
    if (activeSegment.trim()) {
      latestSpeechTextRef.current = activeSegment.trim();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const instantProcessed = translateWithTermPreservation(activeSegment, customGlossary);

      const activeCaptionObj: TranscriptSentence = {
        id: `live-active-${Date.now()}`,
        time: timeStr,
        speaker: activeCourse ? activeCourse.instructor : 'Live Professor',
        english: instantProcessed.original,
        chinese: instantProcessed.chinese,
        detectedTerms: instantProcessed.detectedTerms,
        bookmarked: false,
        courseId: activeCourse?.id,
        userId: user?.id
      };

      setCurrentCaption(activeCaptionObj);

      if (isFinal) {
        setTranscriptHistory(prev => appendDeduplicatedTranscript(prev, activeCaptionObj));
      }

      fetchOnlineTranslation(activeSegment, customGlossary).then(onlineResult => {
        if (onlineResult && onlineResult.chinese && latestSpeechTextRef.current === activeSegment.trim()) {
          const upgradedObj: TranscriptSentence = {
            ...activeCaptionObj,
            chinese: onlineResult.chinese,
            detectedTerms: onlineResult.detectedTerms
          };

          setCurrentCaption(upgradedObj);

          if (isFinal) {
            setTranscriptHistory(prev => prev.map(item =>
              item.id === activeCaptionObj.id ? upgradedObj : item
            ));
          }
        }
      });
    }
  };

  // Web Speech API Initialization with Continuous Auto-Reconnect Loop & Web Speech Index Tracking
  useEffect(() => {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            // Track and process each Web Speech result index EXACTLY ONCE to prevent duplicate fires
            if (!processedResultIndexesRef.current.has(i)) {
              processedResultIndexesRef.current.add(i);
              finalTranscript += result[0].transcript + ' ';
            }
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          processLiveSpeech(finalTranscript.trim(), true);
        } else if (interimTranscript.trim()) {
          processLiveSpeech(interimTranscript.trim(), false);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition status:', err.error);
        if (isListeningRef.current && err.error !== 'not-allowed') {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch (e) { }
            }
          }, 300);
        }
      };

      recognition.onend = () => {
        // Reset processed index tracker on Web Speech restart
        processedResultIndexesRef.current.clear();
        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) { }
            }
          }, 150);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [speechLang, customGlossary]);

  // Start Mic Listening
  const handleStartListening = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!activeCourse) {
      setShowCourseSelectorModal(true);
      return;
    }

    setIsListening(true);
    isListeningRef.current = true;
    processedResultIndexesRef.current.clear();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Speech recognition starting...', e);
      }
    }
  };

  // Stop Mic Listening
  const handleStopListening = () => {
    setIsListening(false);
    isListeningRef.current = false;
    processedResultIndexesRef.current.clear();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }
  };

  // Course Handlers
  const handleSelectCourse = (course: Course) => {
    setActiveCourse(course);
  };

  const handleCreateCourse = (newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
  };

  // Bookmark Line Toggle
  const handleToggleBookmark = (targetCaption: TranscriptSentence) => {
    const updatedBookmarkStatus = !targetCaption.bookmarked;

    if (currentCaption && (currentCaption.id === targetCaption.id || currentCaption.english === targetCaption.english)) {
      setCurrentCaption(prev => prev ? ({ ...prev, bookmarked: updatedBookmarkStatus }) : null);
    }

    setTranscriptHistory(prev => prev.map(item => {
      if (item.id === targetCaption.id || item.english === targetCaption.english) {
        return { ...item, bookmarked: updatedBookmarkStatus };
      }
      return item;
    }));
  };

  // Custom Glossary Handlers
  const handleAddCustomTerm = (termObj: CSTerm) => {
    setCustomGlossary(prev => [termObj, ...prev]);
  };

  const handleDeleteCustomTerm = (termId: string) => {
    setCustomGlossary(prev => prev.filter(t => t.id !== termId));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeCourse={activeCourse}
        onOpenCourseSelector={() => setShowCourseSelectorModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '32px' }}>

        {/* Audio Control Toolbar */}
        <AudioControls
          user={user}
          onOpenAuthModal={() => setShowAuthModal(true)}
          activeCourse={activeCourse}
          onOpenCourseSelector={() => setShowCourseSelectorModal(true)}
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          speechRate={speechRate}
          setSpeechRate={setSpeechRate}
          noiseSuppression={noiseSuppression}
          setNoiseSuppression={setNoiseSuppression}
        />

        {/* View 1: Subtitle Overlay View */}
        {currentView === 'subtitle' && (
          <div>
            <LiveCaptionBar
              currentCaption={currentCaption}
              onSelectTerm={(term) => setSelectedTermForModal(term)}
              onToggleBookmark={handleToggleBookmark}
              fontSize={fontSize}
              setFontSize={setFontSize}
              layoutOrder={layoutOrder}
            />

            {/* Quick Live Stream Summary underneath subtitle view */}
            <div style={{ maxWidth: '1200px', margin: '32px auto 0 auto', padding: '0 16px' }}>
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    Recent Captions for {activeCourse ? activeCourse.code : 'Current Lecture'}
                  </h3>
                  <button onClick={() => setCurrentView('transcript')} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
                    View Full Transcript Stream ({activeCourseHistory.length}) →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeCourseHistory.slice(-4).reverse().map((item, idx) => (
                    <div key={item.id || idx} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid #38bdf8' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                        {item.english}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500 }}>
                        {item.chinese}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Full Transcript Stream */}
        {currentView === 'transcript' && (
          <TranscriptView
            transcriptHistory={activeCourseHistory}
            onSelectTerm={(term) => setSelectedTermForModal(term)}
            onToggleBookmark={handleToggleBookmark}
            onClearHistory={() => setTranscriptHistory(prev => prev.filter(t => t.courseId && t.courseId !== activeCourse?.id))}
          />
        )}

        {/* View 3: CS Term Dictionary & Custom Glossary Bank */}
        {currentView === 'glossary' && (
          <GlossaryManager
            customGlossary={customGlossary}
            onAddCustomTerm={handleAddCustomTerm}
            onDeleteCustomTerm={handleDeleteCustomTerm}
            onSelectTerm={(term) => setSelectedTermForModal(term)}
          />
        )}

      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showCourseSelectorModal && (
        <CourseSelectorModal
          courses={courses}
          selectedCourse={activeCourse}
          onSelectCourse={handleSelectCourse}
          onCreateCourse={handleCreateCourse}
          onClose={() => setShowCourseSelectorModal(false)}
        />
      )}

      {selectedTermForModal && (
        <TermCardModal
          term={selectedTermForModal}
          onClose={() => setSelectedTermForModal(null)}
        />
      )}

      {showExportModal && (
        <ExportModal
          transcriptHistory={transcriptHistory}
          customGlossary={customGlossary}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          fontSize={fontSize}
          setFontSize={setFontSize}
          layoutOrder={layoutOrder}
          setLayoutOrder={setLayoutOrder}
          speechLang={speechLang}
          setSpeechLang={setSpeechLang}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
