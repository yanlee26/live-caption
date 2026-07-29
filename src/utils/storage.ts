import { Course, CSTerm, TranscriptSentence } from '../types';
import { INITIAL_COURSES } from '../data/courses';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  translationProvider: 'google' | 'gemini';
  geminiApiKey: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 22,
  layoutOrder: 'en-top',
  theme: 'dark',
  speechLang: 'en-US',
  translationProvider: 'google',
  geminiApiKey: ''
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

export function saveCourses(courses: Course[], userId?: string) {
  try {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  } catch (e) {
    console.warn('Failed to save courses to localStorage:', e);
  }

  if (isSupabaseConfigured() && supabase && userId) {
    syncCoursesToSupabase(courses, userId).catch(err => {
      console.warn('Sync courses error:', err);
    });
  }
}

export async function fetchCoursesFromSupabase(userId: string): Promise<Course[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42P01') {
        console.info('Supabase table "courses" does not exist yet. Please create tables in Supabase SQL Editor.');
      }
      return null;
    }
    if (!data) return null;

    return data.map(item => ({
      id: item.id,
      code: item.code,
      title: item.title,
      instructor: item.instructor || '',
      startDate: item.start_date || '2026-07-13',
      category: item.category || 'General Academic',
      description: item.description || '',
      isCustom: item.is_custom !== false,
      userId: item.user_id
    }));
  } catch (e) {
    return null;
  }
}

export async function syncCoursesToSupabase(courses: Course[], userId: string) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  try {
    const rows = courses.map(c => ({
      id: c.id,
      user_id: userId,
      code: c.code,
      title: c.title,
      instructor: c.instructor || '',
      start_date: c.startDate || '2026-07-13',
      category: c.category || 'General Academic',
      description: c.description || '',
      is_custom: c.isCustom !== false
    }));

    const { error } = await supabase.from('courses').upsert(rows, { onConflict: 'id' });
    if (error && error.code === '42P01') {
      console.info('Supabase table "courses" does not exist yet.');
    }
  } catch (e) {
    // Ignore error until tables are created
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

export function saveTranscripts(transcripts: TranscriptSentence[], userId?: string) {
  try {
    const trimmed = transcripts.slice(-500);
    localStorage.setItem(KEYS.TRANSCRIPTS, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save transcripts to localStorage:', e);
  }

  if (isSupabaseConfigured() && supabase && userId) {
    syncTranscriptsToSupabase(transcripts, userId).catch(err => {
      console.warn('Sync transcripts error:', err);
    });
  }
}

export async function fetchTranscriptsFromSupabase(userId: string): Promise<TranscriptSentence[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) {
      if (error.code === '42P01') {
        console.info('Supabase table "transcripts" does not exist yet.');
      }
      return null;
    }
    if (!data) return null;

    return data.map(item => ({
      id: item.id,
      speaker: item.speaker || 'Speaker 1',
      english: item.english,
      chinese: item.chinese,
      time: item.timestamp,
      bookmarked: item.bookmarked || false,
      courseId: item.course_id || undefined,
      userId: item.user_id
    }));
  } catch (e) {
    return null;
  }
}

export async function syncTranscriptsToSupabase(transcripts: TranscriptSentence[], userId: string) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  try {
    const recent = transcripts.slice(-500);
    const rows = recent.map(t => ({
      id: t.id,
      user_id: userId,
      course_id: t.courseId || null,
      speaker: t.speaker || 'Speaker 1',
      english: t.english,
      chinese: t.chinese,
      timestamp: t.time,
      bookmarked: Boolean(t.bookmarked)
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from('transcripts').upsert(rows, { onConflict: 'id' });
      if (error && error.code === '42P01') {
        console.info('Supabase table "transcripts" does not exist yet.');
      }
    }
  } catch (e) {
    // Ignore error until tables are created
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

export function saveCustomGlossary(glossary: CSTerm[], userId?: string) {
  try {
    localStorage.setItem(KEYS.CUSTOM_GLOSSARY, JSON.stringify(glossary));
  } catch (e) {
    console.warn('Failed to save custom glossary to localStorage:', e);
  }

  if (isSupabaseConfigured() && supabase && userId) {
    syncGlossaryToSupabase(glossary, userId).catch(err => {
      console.warn('Sync glossary error:', err);
    });
  }
}

export async function fetchGlossaryFromSupabase(userId: string): Promise<CSTerm[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('custom_glossary')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42P01') {
        console.info('Supabase table "custom_glossary" does not exist yet.');
      }
      return null;
    }
    if (!data) return null;

    return data.map(item => ({
      id: item.id,
      term: item.term,
      chinese: item.chinese,
      category: item.category || 'General Academic',
      definition: item.definition || '',
      definitionCn: item.definition_cn || '',
      isCustom: true
    }));
  } catch (e) {
    return null;
  }
}

export async function syncGlossaryToSupabase(glossary: CSTerm[], userId: string) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  try {
    const rows = glossary.map(g => ({
      id: g.id,
      user_id: userId,
      term: g.term,
      chinese: g.chinese,
      category: g.category || 'General Academic',
      definition: g.definition || '',
      definition_cn: g.definitionCn || ''
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from('custom_glossary').upsert(rows, { onConflict: 'id' });
      if (error && error.code === '42P01') {
        console.info('Supabase table "custom_glossary" does not exist yet.');
      }
    }
  } catch (e) {
    // Ignore error until tables are created
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

export function saveAppSettings(settings: AppSettings, userId?: string) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }

  if (isSupabaseConfigured() && supabase && userId) {
    syncSettingsToSupabase(settings, userId).catch(err => {
      console.warn('Sync settings error:', err);
    });
  }
}

export async function fetchSettingsFromSupabase(userId: string): Promise<AppSettings | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.info('Supabase table "user_settings" does not exist yet.');
      }
      return null;
    }
    if (!data) return null;

    return {
      fontSize: data.font_size ?? DEFAULT_SETTINGS.fontSize,
      layoutOrder: data.layout_order ?? DEFAULT_SETTINGS.layoutOrder,
      theme: data.theme ?? DEFAULT_SETTINGS.theme,
      speechLang: data.speech_lang ?? DEFAULT_SETTINGS.speechLang,
      translationProvider: data.translation_provider ?? DEFAULT_SETTINGS.translationProvider,
      geminiApiKey: data.gemini_api_key ?? DEFAULT_SETTINGS.geminiApiKey
    };
  } catch (e) {
    return null;
  }
}

export async function syncSettingsToSupabase(settings: AppSettings, userId: string) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  try {
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      font_size: settings.fontSize,
      layout_order: settings.layoutOrder,
      theme: settings.theme,
      speech_lang: settings.speechLang,
      translation_provider: settings.translationProvider,
      gemini_api_key: settings.geminiApiKey,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error && error.code === '42P01') {
      console.info('Supabase table "user_settings" does not exist yet.');
    }
  } catch (e) {
    // Ignore error until tables are created
  }
}
