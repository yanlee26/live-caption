export type AcademicCategory = 
  | "All Categories"
  | "Computer Science & AI"
  | "Engineering & Technology"
  | "Business & Economics"
  | "Science & Mathematics"
  | "Medicine & Life Sciences"
  | "Humanities & Social Sciences"
  | "General Academic";

export type CSCategory = AcademicCategory;

export interface CSTerm {
  id: string;
  term: string;
  chinese: string;
  category: AcademicCategory;
  pronunciation?: string;
  definition: string;
  definitionCn?: string;
  codeExample?: string;
  examplesInLecture?: string;
  isCustom?: boolean;
  isAutoSaved?: boolean;
}

export interface TranscriptSentence {
  id: string;
  time: string;
  speaker: string;
  english: string;
  chinese: string;
  keywords?: string[];
  detectedTerms?: CSTerm[];
  bookmarked?: boolean;
  courseId?: string;
  userId?: string;
  date?: string;
  weekNumber?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  startDate?: string;
  category?: AcademicCategory;
  description?: string;
  createdDate?: string;
  isCustom?: boolean;
  userId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: 'google' | 'auth0' | 'guest';
}

export interface TranslationResult {
  original: string;
  chinese: string;
  detectedTerms: CSTerm[];
}
