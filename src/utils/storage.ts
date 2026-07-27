import { Course, CSTerm, TranscriptSentence } from '../types';
import { INITIAL_COURSES } from '../data/courses';

const KEYS = {
  COURSES: 'live_caption_courses',
  ACTIVE_COURSE_ID: 'live_caption_active_course_id',
  TRANSCRIPTS: 'live_caption_transcripts',
  CUSTOM_GLOSSARY: 'live_caption_custom_glossary',
  SETTINGS: 'live_caption_settings'
};

export interface AppSettings {
  fontSize: number;
  layoutOrder: 'en-top' | 'cn-top';
  theme: 'dark' | 'light';
  speechLang: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 22,
  layoutOrder: 'en-top',
  theme: 'dark',
  speechLang: 'en-US'
};

// --- Courses Storage ---
export function loadSavedCourses(): Course[] {
  try {
    const raw = localStorage.getItem(KEYS.COURSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load courses from localStorage:', e);
  }
  return INITIAL_COURSES;
}

export function saveCourses(courses: Course[]) {
  try {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  } catch (e) {
    console.warn('Failed to save courses to localStorage:', e);
  }
}

// --- Active Course Storage ---
export function loadActiveCourseId(): string | null {
  try {
    return localStorage.getItem(KEYS.ACTIVE_COURSE_ID);
  } catch (e) {
    return null;
  }
}

export function saveActiveCourseId(courseId: string) {
  try {
    localStorage.setItem(KEYS.ACTIVE_COURSE_ID, courseId);
  } catch (e) {
    console.warn('Failed to save active course ID:', e);
  }
}

// --- Transcripts Storage ---
export function loadSavedTranscripts(): TranscriptSentence[] {
  try {
    const raw = localStorage.getItem(KEYS.TRANSCRIPTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load transcripts from localStorage:', e);
  }
  return [];
}

export function saveTranscripts(transcripts: TranscriptSentence[]) {
  try {
    // Keep max 500 recent transcript items in localStorage to stay within quota
    const trimmed = transcripts.slice(-500);
    localStorage.setItem(KEYS.TRANSCRIPTS, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save transcripts to localStorage:', e);
  }
}

// --- Custom Glossary Storage ---
export function loadCustomGlossary(): CSTerm[] {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_GLOSSARY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load custom glossary from localStorage:', e);
  }
  return [];
}

export function saveCustomGlossary(glossary: CSTerm[]) {
  try {
    localStorage.setItem(KEYS.CUSTOM_GLOSSARY, JSON.stringify(glossary));
  } catch (e) {
    console.warn('Failed to save custom glossary to localStorage:', e);
  }
}

// --- App Settings Storage ---
export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(settings: AppSettings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}
