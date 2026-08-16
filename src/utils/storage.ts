import { Course, CSTerm, TranscriptSentence, AcademicCategory, UserProfile } from '../types';
import { INITIAL_COURSES } from '../data/courses';
import { DEFAULT_CS_GLOSSARY } from '../data/csGlossary';
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
  translationProvider: 'google' | 'gemini' | 'openai';
  geminiApiKey: string;
  openAiApiKey: string;
  openAiModel: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 22,
  layoutOrder: 'en-top',
  theme: 'dark',
  speechLang: 'en-US',
  translationProvider: 'google',
  geminiApiKey: '',
  openAiApiKey: '',
  openAiModel: 'gpt-4o-mini'
};

// --- Users Storage & Sync ---
export async function syncUserToSupabase(user: UserProfile) {
  if (!isSupabaseConfigured() || !supabase || !user || !user.id) {
    console.info('[Supabase Sync] Bypassed user sync: Supabase not configured or invalid user object.');
    return;
  }
  try {
    const row = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      picture: user.picture || '',
      provider: user.provider || 'google',
      last_login_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('users').upsert(row, { onConflict: 'id' }).select();
    if (error) {
      if (error.code === '42P01') {
        console.warn('[Supabase Sync] Table "public.users" does not exist yet. Please execute supabase_schema.sql in Supabase SQL Editor.');
      } else {
        console.warn('[Supabase Sync] Failed to upsert user into public.users:', error.message, error);
      }
    } else {
      console.log('[Supabase Sync] Successfully synced user profile to "public.users" table:', data || row);
    }
  } catch (e) {
    console.warn('[Supabase Sync] Exception during syncUserToSupabase:', e);
  }
}

export async function fetchUserFromSupabase(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      provider: data.provider || 'google'
    };
  } catch (e) {
    return null;
  }
}

// --- Courses Storage ---
export function loadSavedCourses(): Course[] {
  try {
    const raw = localStorage.getItem(KEYS.COURSES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
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

export async function deleteCourseFromSupabase(courseId: string, userId: string) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', userId);
    if (error && error.code === '42P01') {
      console.info('Supabase table "courses" does not exist yet.');
    }
  } catch (e) {
    console.warn('Delete course error:', e);
  }
}

export async function deleteTranscriptsForCourseFromSupabase(courseId: string, userId: string) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  try {
    const { error } = await supabase
      .from('transcripts')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', userId);
    if (error && error.code === '42P01') {
      console.info('Supabase table "transcripts" does not exist yet.');
    }
  } catch (e) {
    console.warn('Delete transcripts for course error:', e);
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

// Helper to normalize English text for strict duplicate and prefix detection
export function normalizeTranscriptText(text: string): string {
  return (text || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Checks whether textA and textB are sub-sentences, prefixes, or misrecognized variants of each other
export function isSubsentenceOrPrefix(textA: string, textB: string): boolean {
  const normA = normalizeTranscriptText(textA);
  const normB = normalizeTranscriptText(textB);

  if (!normA || !normB) return false;

  // Exact match
  if (normA === normB) return true;

  // One is prefix of another (e.g. "in" -> "in the" -> "in the lecture")
  if (normB.startsWith(normA) || normA.startsWith(normB)) return true;

  // Substring match (e.g. "allow objects of unrelent" in "this will allow objects of unrelated classes")
  if (normA.length >= 6 && normB.length >= 6 && (normA.includes(normB) || normB.includes(normA))) {
    return true;
  }

  // Common prefix ratio (e.g. "this will allow objects of unrelent" vs "this will allow objects of unrelated classes to be presented")
  const minLen = Math.min(normA.length, normB.length);
  if (minLen >= 10) {
    let commonPrefix = 0;
    while (commonPrefix < minLen && normA[commonPrefix] === normB[commonPrefix]) {
      commonPrefix++;
    }
    // If common prefix covers >= 60% of the shorter text, treat as same sentence evolution
    if (commonPrefix / minLen >= 0.6) {
      return true;
    }
  }

  return false;
}

// Deduplicates transcript history by removing duplicate or near-identical consecutive/recent lines
export function deduplicateTranscripts(list: TranscriptSentence[]): TranscriptSentence[] {
  if (!list || list.length === 0) return [];

  // Filter out placeholder init items if real live captions exist
  const realCaptions = list.filter(t => !t.id.startsWith('init-'));
  const targetList = realCaptions.length > 0 ? realCaptions : list;

  const result: TranscriptSentence[] = [];

  for (const item of targetList) {
    if (!item.english || !item.english.trim()) continue;

    const normNew = normalizeTranscriptText(item.english);
    // Ignore 1-char noise fragments
    if (!normNew || normNew.length < 2) continue;

    // Search in the recent window of result for matching normalized text or matching ID or prefix/subsentence
    const recentWindow = result.slice(-10);
    const recentIndex = recentWindow.findIndex(existing => {
      if (existing.id === item.id) return true;
      return isSubsentenceOrPrefix(existing.english, item.english);
    });

    if (recentIndex !== -1) {
      const absIndex = result.length - (recentWindow.length - recentIndex);
      const existing = result[absIndex];

      // Prefer longer/more complete English text
      const isNewBetter = item.english.trim().length >= existing.english.trim().length;
      const longerEnglish = isNewBetter ? item.english : existing.english;

      // Prefer clean Chinese translation over fallback or raw text
      const isNewChineseBetter = item.chinese &&
        !item.chinese.includes('useaexpensekeywords') &&
        item.chinese !== item.english &&
        item.chinese.length >= (existing.chinese?.length || 0);

      const betterChinese = isNewChineseBetter
        ? item.chinese
        : (existing.chinese && !existing.chinese.includes('useaexpensekeywords') ? existing.chinese : item.chinese);

      result[absIndex] = {
        ...existing,
        id: isNewBetter ? item.id : existing.id,
        english: longerEnglish,
        chinese: betterChinese || item.chinese || existing.chinese,
        detectedTerms: (item.detectedTerms && item.detectedTerms.length >= (existing.detectedTerms?.length || 0))
          ? item.detectedTerms
          : existing.detectedTerms,
        bookmarked: existing.bookmarked || item.bookmarked,
        courseId: item.courseId || existing.courseId,
        weekNumber: item.weekNumber || existing.weekNumber,
        date: item.date || existing.date,
        userId: item.userId || existing.userId,
        speaker: isNewBetter ? (item.speaker || existing.speaker) : (existing.speaker || item.speaker),
        time: isNewBetter ? (item.time || existing.time) : (existing.time || item.time)
      };
    } else {
      result.push(item);
    }
  }

  // Secondary pass: filter out isolated short fragments (< 10 chars, e.g. "in", "in the", "this will") if followed by longer extending sentences
  const finalCleaned: TranscriptSentence[] = [];
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    const norm = normalizeTranscriptText(item.english);

    if (norm.length < 10 && i < result.length - 1) {
      const nextNorm = normalizeTranscriptText(result[i + 1].english);
      if (nextNorm.startsWith(norm) || nextNorm.includes(norm)) {
        // Skip short prefix fragment in favor of next extending sentence
        continue;
      }
    }
    finalCleaned.push(item);
  }

  return finalCleaned;
}

// --- Transcripts Storage ---
export function loadSavedTranscripts(): TranscriptSentence[] {
  try {
    const raw = localStorage.getItem(KEYS.TRANSCRIPTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return deduplicateTranscripts(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to load transcripts from localStorage:', e);
  }
  return [];
}

export function saveTranscripts(transcripts: TranscriptSentence[], userId?: string) {
  try {
    const deduped = deduplicateTranscripts(transcripts);
    const trimmed = deduped.slice(-500);
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
  if (!isSupabaseConfigured() || !supabase || !userId || userId === 'guest') return null;
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('user_id', userId)
      .limit(150);

    if (error) {
      if (error.code === '42P01' || error.code === '57014') {
        console.info('Supabase transcripts query bypassed:', error.message);
      }
      return null;
    }
    if (!data) return null;

    return data.map(item => {
      const createdAtDate = item.created_at ? new Date(item.created_at) : undefined;
      const dateStr = item.date || (createdAtDate && !isNaN(createdAtDate.getTime()) ? createdAtDate.toISOString().split('T')[0] : undefined);
      return {
        id: item.id,
        speaker: item.speaker || 'Speaker 1',
        english: item.english,
        chinese: item.chinese,
        time: item.timestamp || 'Live',
        bookmarked: item.bookmarked || false,
        courseId: item.course_id || undefined,
        userId: item.user_id,
        date: dateStr,
        weekNumber: item.week_number || item.weekNumber || undefined
      };
    });
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
      bookmarked: Boolean(t.bookmarked),
      date: t.date || null,
      week_number: t.weekNumber || null
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load custom glossary from localStorage:', e);
  }
  return DEFAULT_CS_GLOSSARY;
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
export interface GlossaryQueryParams {
  category?: AcademicCategory;
  search?: string;
  page?: number;
  pageSize?: number;
  userId?: string;
}

export interface GlossaryQueryResult {
  data: CSTerm[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchGlossaryTermsAPI(params: GlossaryQueryParams): Promise<GlossaryQueryResult> {
  const { category = 'All Categories', search = '', page = 1, pageSize = 6, userId } = params;

  // Attempt Supabase backend API query first if configured
  if (isSupabaseConfigured() && supabase && userId && userId !== 'guest') {
    try {
      let query = supabase.from('custom_glossary').select('*', { count: 'exact' }).eq('user_id', userId);

      if (category && category !== 'All Categories') {
        query = query.eq('category', category);
      }
      if (search && search.trim()) {
        const pattern = `%${search.trim()}%`;
        query = query.or(`term.ilike.${pattern},chinese.ilike.${pattern},definition.ilike.${pattern}`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const total = count || data.length;
        const totalPages = Math.ceil(total / pageSize);
        const mapped: CSTerm[] = data.map(item => ({
          id: item.id,
          term: item.term,
          chinese: item.chinese,
          category: item.category || 'General Academic',
          definition: item.definition || '',
          definitionCn: item.definition_cn || '',
          isCustom: true
        }));
        return { data: mapped, total, page, pageSize, totalPages };
      }
    } catch (e) {
      // Fallback to local memory API simulation
    }
  }

  // Memory/Local API query simulation
  const savedCustom = loadCustomGlossary();
  const allTerms = Array.from(new Map([...savedCustom, ...DEFAULT_CS_GLOSSARY].map(item => [item.term.toLowerCase(), item])).values());

  const filtered = allTerms.filter(item => {
    const matchesCat = category === 'All Categories' || item.category === category;
    const matchesSearch = !search ||
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.chinese.includes(search) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    data: pageData,
    total,
    page,
    pageSize,
    totalPages
  };
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

export function saveAppSettings(settings: AppSettings, _userId?: string) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

export async function fetchSettingsFromSupabase(_userId: string): Promise<AppSettings | null> {
  // Disabled as per user request
  return null;
}

export async function syncSettingsToSupabase(_settings: AppSettings, _userId: string) {
  // Disabled as per user request
  return;
}
