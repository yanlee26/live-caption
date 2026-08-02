import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import AudioControls from './components/AudioControls';
import ErrorBoundary from './components/ErrorBoundary';
import LiveCaptionBar from './components/LiveCaptionBar';
import TranscriptView from './components/TranscriptView';
import GlossaryManager from './components/GlossaryManager';
import TermCardModal from './components/TermCardModal';
import ExportModal from './components/ExportModal';
import SettingsModal from './components/SettingsModal';
import CourseSelectorModal from './components/CourseSelectorModal';
import AuthModal from './components/AuthModal';

import { translateWithTermPreservation, fetchOnlineTranslation, matchCSTerms, autoExtractAndSaveTerms } from './utils/translationEngine';
import { streamingTranslationService } from './utils/streamingTranslationService';
import { calculateWeekNumber } from './utils/dateUtils';
import { Calendar } from 'lucide-react';
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
  const [translationProvider, setTranslationProvider] = useState<'google' | 'gemini' | 'openai'>(savedSettings.translationProvider || 'google');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(savedSettings.geminiApiKey || '');
  const [openAiApiKey, setOpenAiApiKey] = useState<string>(savedSettings.openAiApiKey || '');
  const [openAiModel, setOpenAiModel] = useState<string>(savedSettings.openAiModel || 'gpt-4o-mini');

  // 2-Hour Lecture Recording Session Controls
  const MAX_LECTURE_SECONDS = 7200; // 2 Hours
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Speech Recognition & Auto-Reconnect Refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const latestSpeechTextRef = useRef<string>('');
  const processedResultIndexesRef = useRef<Set<number>>(new Set());
  const activeCaptionIdRef = useRef<string | null>(null);

  // 2-Hour Real-Time Timestamp-based Recording Timer (immune to browser background tab throttling)
  useEffect(() => {
    let interval: any = null;
    if (recordingState === 'recording') {
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = Date.now() - (sessionSeconds * 1000);
      }

      interval = setInterval(() => {
        if (sessionStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
          if (elapsed >= MAX_LECTURE_SECONDS) {
            handleCancelSession();
            alert('Maximum 2-hour lecture session duration reached. Live recording stopped.');
            setSessionSeconds(0);
          } else {
            setSessionSeconds(elapsed);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState]);

  // Session Control Handlers
  const handleStartSession = () => {
    sessionStartTimeRef.current = Date.now();
    setSessionSeconds(0);
    handleStartListening();
    setRecordingState('recording');
  };

  const handlePauseSession = () => {
    handleStopListening();
    setRecordingState('paused');
  };

  const handleResumeSession = () => {
    sessionStartTimeRef.current = Date.now() - (sessionSeconds * 1000);
    handleStartListening();
    setRecordingState('recording');
  };

  const handleCancelSession = () => {
    handleStopListening();
    activeCaptionIdRef.current = null;
    sessionStartTimeRef.current = null;
    setRecordingState('idle');
    setSessionSeconds(0);
    if (activeCourse) {
      setCurrentCaption({
        id: `init-${activeCourse.id}`,
        time: 'Live',
        speaker: activeCourse.instructor || 'Course Instructor',
        english: `Translation cancelled. Select "${activeCourse.code}" and click "Start Live Microphone" to begin a new session.`,
        chinese: `同传已取消。选择 ${activeCourse.code} 课程并点击“启动实时麦克风”即可重新开始。`,
        detectedTerms: matchCSTerms(`Selected ${activeCourse.code}: ${activeCourse.title}`, customGlossary),
        bookmarked: false,
        courseId: activeCourse.id,
        userId: user?.id
      });
    }
  };

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

  // Ref to hold latest translation settings for speech callbacks to prevent stale closures
  const translationParamsRef = useRef({ translationProvider, geminiApiKey, openAiApiKey, openAiModel, customGlossary });
  useEffect(() => {
    translationParamsRef.current = { translationProvider, geminiApiKey, openAiApiKey, openAiModel, customGlossary };
  }, [translationProvider, geminiApiKey, openAiApiKey, openAiModel, customGlossary]);
  useEffect(() => { saveCourses(courses, user?.id); }, [courses, user?.id]);
  useEffect(() => { if (activeCourse) saveActiveCourseId(activeCourse.id); }, [activeCourse]);
  useEffect(() => { saveTranscripts(transcriptHistory, user?.id); }, [transcriptHistory, user?.id]);
  useEffect(() => { saveCustomGlossary(customGlossary, user?.id); }, [customGlossary, user?.id]);
  useEffect(() => {
    saveAppSettings({ fontSize, layoutOrder, theme, speechLang, translationProvider, geminiApiKey, openAiApiKey, openAiModel }, user?.id);
  }, [fontSize, layoutOrder, theme, speechLang, translationProvider, geminiApiKey, openAiApiKey, openAiModel, user?.id]);

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

  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');

  // Filter transcript history by currently active course & selected week filter
  const activeCourseHistory = transcriptHistory
    .filter(t => !t.courseId || t.courseId === activeCourse?.id)
    .filter(t => {
      if (selectedWeekFilter === 'all') return true;
      const itemWeek = t.weekNumber || calculateWeekNumber(activeCourse?.startDate, t.date ? new Date(t.date) : new Date());
      return itemWeek === selectedWeekFilter;
    });

  // Load cloud data from Supabase and merge with local data when authenticated
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

      // Merge courses (remote + local)
      if (remoteCourses) {
        setCourses(prevLocal => {
          const map = new Map<string, Course>();
          remoteCourses.forEach(c => map.set(c.id, c));
          prevLocal.forEach(c => {
            if (!map.has(c.id)) map.set(c.id, c);
          });
          const merged = Array.from(map.values());
          saveCourses(merged, user.id);
          return merged;
        });
      } else {
        // Upload local courses to Supabase if first time
        saveCourses(courses, user.id);
      }

      // Merge transcripts (remote + local)
      if (remoteTranscripts) {
        setTranscriptHistory(prevLocal => {
          const map = new Map<string, TranscriptSentence>();
          remoteTranscripts.forEach(t => map.set(t.id, t));
          prevLocal.forEach(t => {
            if (!map.has(t.id)) map.set(t.id, t);
          });
          const merged = Array.from(map.values());
          saveTranscripts(merged, user.id);
          return merged;
        });
      } else {
        saveTranscripts(transcriptHistory, user.id);
      }

      // Merge custom glossary (remote + local)
      if (remoteGlossary) {
        setCustomGlossary(prevLocal => {
          const map = new Map<string, CSTerm>();
          remoteGlossary.forEach(g => map.set(g.id, g));
          prevLocal.forEach(g => {
            if (!map.has(g.id)) map.set(g.id, g);
          });
          const merged = Array.from(map.values());
          saveCustomGlossary(merged, user.id);
          return merged;
        });
      } else {
        saveCustomGlossary(customGlossary, user.id);
      }

      if (remoteSettings) {
        setFontSize(remoteSettings.fontSize);
        setLayoutOrder(remoteSettings.layoutOrder);
        setTheme(remoteSettings.theme);
        setSpeechLang(remoteSettings.speechLang);
        if (remoteSettings.translationProvider) setTranslationProvider(remoteSettings.translationProvider);
        if (remoteSettings.geminiApiKey) setGeminiApiKey(remoteSettings.geminiApiKey);
        if (remoteSettings.openAiApiKey) setOpenAiApiKey(remoteSettings.openAiApiKey);
        if (remoteSettings.openAiModel) setOpenAiModel(remoteSettings.openAiModel);
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

    // Retrieve latest translation provider & keys dynamically from ref
    const {
      translationProvider: activeProvider,
      geminiApiKey: activeGeminiKey,
      openAiApiKey: activeOpenAiKey,
      openAiModel: activeOpenAiModel,
      customGlossary: activeGlossary
    } = translationParamsRef.current;

    // Auto-discover and save newly encountered academic terms into user dictionary
    const { updatedGlossary, newlyDiscovered } = autoExtractAndSaveTerms(text.trim(), activeGlossary);
    if (newlyDiscovered.length > 0) {
      setCustomGlossary(updatedGlossary);
    }

    const segments = segmentSpeechText(text.trim());
    if (segments.length === 0) return;

    const activeSegment = segments[segments.length - 1];
    // Completed segments are strictly previous chunks (excluding activeSegment)
    const completedSegments = segments.slice(0, -1);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const currentWeek = calculateWeekNumber(activeCourse?.startDate, now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Process previous completed segments if any
    completedSegments.forEach(seg => {
      if (seg.trim()) {
        const instantProcessed = translateWithTermPreservation(seg, activeGlossary);
        const segId = `live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const captionObj: TranscriptSentence = {
          id: segId,
          time: timeStr,
          speaker: activeCourse ? activeCourse.instructor : 'Live Professor',
          english: instantProcessed.original,
          chinese: instantProcessed.chinese,
          detectedTerms: instantProcessed.detectedTerms,
          bookmarked: false,
          courseId: activeCourse?.id,
          userId: user?.id,
          date: dateStr,
          weekNumber: currentWeek
        };

        setTranscriptHistory(prev => {
          const cleanPrev = prev.filter(t => !t.id.startsWith('init-'));
          return appendDeduplicatedTranscript(cleanPrev, captionObj);
        });

        // For completed segments, call the streaming translation service (in-memory LRU cache + stream queue)
        streamingTranslationService.translateStream(seg, activeGlossary, activeProvider, activeGeminiKey, activeOpenAiKey, activeOpenAiModel).then(onlineRes => {
          if (onlineRes && onlineRes.chinese) {
            setTranscriptHistory(prev => prev.map(item =>
              item.id === segId ? { ...item, chinese: onlineRes.chinese, detectedTerms: onlineRes.detectedTerms } : item
            ));
          }
        });
      }
    });

    if (completedSegments.length > 0) {
      activeCaptionIdRef.current = null;
    }

    // Process current active segment
    if (activeSegment.trim()) {
      latestSpeechTextRef.current = activeSegment.trim();
      const instantProcessed = translateWithTermPreservation(activeSegment, activeGlossary);

      if (!activeCaptionIdRef.current) {
        activeCaptionIdRef.current = `live-active-${Date.now()}`;
      }
      const activeId = activeCaptionIdRef.current;

      const activeCaptionObj: TranscriptSentence = {
        id: activeId,
        time: timeStr,
        speaker: activeCourse ? activeCourse.instructor : 'Live Professor',
        english: instantProcessed.original,
        chinese: instantProcessed.chinese,
        detectedTerms: instantProcessed.detectedTerms,
        bookmarked: false,
        courseId: activeCourse?.id,
        userId: user?.id,
        date: dateStr,
        weekNumber: currentWeek
      };

      setCurrentCaption(activeCaptionObj);

      // Always update transcriptHistory so the bottom history updates in real-time
      setTranscriptHistory(prev => {
        const cleanPrev = prev.filter(t => !t.id.startsWith('init-'));
        const exists = cleanPrev.some(item => item.id === activeId);
        if (exists) {
          return cleanPrev.map(item => item.id === activeId ? activeCaptionObj : item);
        } else {
          return [...cleanPrev, activeCaptionObj];
        }
      });

      if (isFinal) {
        activeCaptionIdRef.current = null;
      }

      // For interim streaming text, use fast Google Translate preview.
      // For final sentence results, use selected LLM provider (Gemini / OpenAI) to save API quota & prevent 429 rate limits.
      const liveProvider = isFinal ? activeProvider : 'google';

      streamingTranslationService.translateStream(activeSegment, activeGlossary, liveProvider, activeGeminiKey, activeOpenAiKey, activeOpenAiModel).then(onlineResult => {
        if (onlineResult && onlineResult.chinese && latestSpeechTextRef.current === activeSegment.trim()) {
          const upgradedObj: TranscriptSentence = {
            ...activeCaptionObj,
            chinese: onlineResult.chinese,
            detectedTerms: onlineResult.detectedTerms
          };

          setCurrentCaption(upgradedObj);

          setTranscriptHistory(prev => prev.map(item =>
            item.id === activeId ? upgradedObj : item
          ));
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
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.info('Speech recognition status:', err.error);
        }
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
    activeCaptionIdRef.current = null;

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
        <ErrorBoundary>
          <AudioControls
            user={user}
            onOpenAuthModal={() => setShowAuthModal(true)}
            activeCourse={activeCourse}
            onOpenCourseSelector={() => setShowCourseSelectorModal(true)}
            recordingState={recordingState}
            sessionSeconds={sessionSeconds}
            onStartSession={handleStartSession}
            onPauseSession={handlePauseSession}
            onResumeSession={handleResumeSession}
            onCancelSession={handleCancelSession}
            noiseSuppression={noiseSuppression}
            setNoiseSuppression={setNoiseSuppression}
            translationProvider={translationProvider}
            geminiApiKey={geminiApiKey}
            openAiApiKey={openAiApiKey}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        </ErrorBoundary>

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
              setLayoutOrder={setLayoutOrder}
            />

            {/* Quick Live Stream Summary underneath subtitle view */}
            <div style={{ maxWidth: '1200px', margin: '32px auto 0 auto', padding: '0 16px' }}>
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                      Recent Captions for {activeCourse ? activeCourse.code : 'Current Lecture'}
                    </h3>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#38bdf8" />
                      <select
                        value={selectedWeekFilter}
                        onChange={(e) => setSelectedWeekFilter(e.target.value)}
                        className="glass-card"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer',
                          borderColor: selectedWeekFilter !== 'all' ? '#38bdf8' : 'var(--border-glass)'
                        }}
                      >
                        <option value="all">All Weeks (1-50)</option>
                        {Array.from({ length: 50 }, (_, i) => `Week ${i + 1}`).map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button onClick={() => setCurrentView('transcript')} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
                    View Full Transcript Stream ({activeCourseHistory.length}) →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeCourseHistory.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      暂无同传记录。点击“启动实时麦克风”即可在此实时显示同传字幕记录。
                    </div>
                  ) : (
                    activeCourseHistory.slice(-4).reverse().map((item, idx) => (
                      <div key={item.id || idx} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid #38bdf8' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          {item.english}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500 }}>
                          {item.chinese}
                        </span>
                      </div>
                    ))
                  )}
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
            selectedWeek={selectedWeekFilter}
            onSelectWeek={setSelectedWeekFilter}
          />
        )}

        {/* View 3: CS Term Dictionary & Custom Glossary Bank */}
        {currentView === 'glossary' && (
          <GlossaryManager
            customGlossary={customGlossary}
            onAddCustomTerm={handleAddCustomTerm}
            onDeleteCustomTerm={handleDeleteCustomTerm}
            onSelectTerm={(term) => setSelectedTermForModal(term)}
            userId={user?.id}
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
          translationProvider={translationProvider}
          setTranslationProvider={setTranslationProvider}
          geminiApiKey={geminiApiKey}
          setGeminiApiKey={setGeminiApiKey}
          openAiApiKey={openAiApiKey}
          setOpenAiApiKey={setOpenAiApiKey}
          openAiModel={openAiModel}
          setOpenAiModel={setOpenAiModel}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
