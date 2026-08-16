-- =================================================================
-- Academic Live Caption — Supabase Database Schema (Idempotent DDL)
-- Execute this SQL script in your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- =================================================================

-- 1. Users Table (记录 Google / Auth0 登录的用户 ID、Email 等信息)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,                       -- e.g. "google-11234567890..."
  email TEXT NOT NULL,                        -- e.g. "student@gmail.com"
  name TEXT,                                  -- e.g. "Alex Rivera"
  picture TEXT,                               -- Google profile avatar URL
  provider TEXT DEFAULT 'google',             -- Auth provider ('google')
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user email for quick lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);


-- 2. Courses Table (记录每个用户绑定的大学课程)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,                       -- e.g. "comp9021" or "course-1234"
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                         -- e.g. "COMP9021"
  title TEXT NOT NULL,                        -- e.g. "Principles of Programming"
  instructor TEXT,                            -- e.g. "Prof. Alan Turing"
  start_date TEXT DEFAULT '2026-07-13',
  category TEXT DEFAULT 'General Academic',
  description TEXT,
  is_custom BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Safe migration for existing courses table (如果旧表未建立 user_id 字段)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses (user_id);


-- 3. Transcripts Table (记录用户在特定课程下的实时同传听课记录与笔记)
CREATE TABLE IF NOT EXISTS public.transcripts (
  id TEXT PRIMARY KEY,                       -- e.g. "t-1700000000"
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  speaker TEXT DEFAULT 'Speaker 1',
  english TEXT NOT NULL,                      -- 英文原文
  chinese TEXT,                               -- 中文翻译
  timestamp TEXT,                             -- 播放或录制时间点 (e.g. "10:15 AM" 或 "Live")
  bookmarked BOOLEAN DEFAULT FALSE,           -- 是否收藏为重点笔记
  date TEXT,                                  -- 记录日期 (e.g. "2026-08-17")
  week_number TEXT,                           -- 讲座周数 (e.g. "Week 3")
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Safe migration for existing transcripts table
ALTER TABLE public.transcripts ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.transcripts ADD COLUMN IF NOT EXISTS course_id TEXT;
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON public.transcripts (user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_course_id ON public.transcripts (course_id);


-- 4. Custom Glossary Table (记录用户专属添加的学科学术词表)
CREATE TABLE IF NOT EXISTS public.custom_glossary (
  id TEXT PRIMARY KEY,                       -- e.g. "term-123"
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,                         -- 英文术语
  chinese TEXT NOT NULL,                      -- 中文翻译
  category TEXT DEFAULT 'General Academic',   -- 学科分类
  definition TEXT,                            -- 英文定义
  definition_cn TEXT,                         -- 中文释义
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Safe migration for existing custom_glossary table
ALTER TABLE public.custom_glossary ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_custom_glossary_user_id ON public.custom_glossary (user_id);
CREATE INDEX IF NOT EXISTS idx_custom_glossary_term ON public.custom_glossary (term);


-- 5. Row Level Security (RLS) Enablement & Safe Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_glossary ENABLE ROW LEVEL SECURITY;

-- Safely create policies if they don't already exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on users') THEN
    CREATE POLICY "Allow public read/write on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on courses') THEN
    CREATE POLICY "Allow public read/write on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on transcripts') THEN
    CREATE POLICY "Allow public read/write on transcripts" ON public.transcripts FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on custom_glossary') THEN
    CREATE POLICY "Allow public read/write on custom_glossary" ON public.custom_glossary FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
