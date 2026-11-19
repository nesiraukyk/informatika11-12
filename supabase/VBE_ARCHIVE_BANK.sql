-- VBE teorijos archyvo atskiri duomenys. Neperrašo esamų testų/atsiskaitymų lentelių.
-- Vykdyti Supabase SQL editor tik patikrinus PR. 2026-10-27.
CREATE TABLE IF NOT EXISTS public.vbe_archive_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  year integer CHECK (year IS NULL OR year BETWEEN 1990 AND 2100),
  session text NOT NULL DEFAULT '',
  exam_type text NOT NULL DEFAULT '',
  title text NOT NULL,
  source_url text,
  total_questions integer CHECK (total_questions IS NULL OR total_questions >= 0),
  counting_method text NOT NULL DEFAULT '',
  review_status text NOT NULL DEFAULT 'NEPERŽIŪRĖTA',
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vbe_archive_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  year integer CHECK (year IS NULL OR year BETWEEN 1990 AND 2100),
  source_key text NOT NULL DEFAULT '',
  source_title text NOT NULL DEFAULT '',
  source_url text,
  original_number text NOT NULL DEFAULT '',
  question text NOT NULL CHECK (length(trim(question)) > 0),
  correct_answer text NOT NULL CHECK (length(trim(correct_answer)) > 0),
  explanation text NOT NULL CHECK (length(trim(explanation)) > 0),
  area text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  applicability_11 text NOT NULL DEFAULT 'IS_DALIES'
    CHECK (applicability_11 IN ('TAIP','IS_DALIES','NE')),
  origin text NOT NULL DEFAULT 'PERFRAZUOTA_PAGAL_EGZAMINA'
    CHECK (origin IN ('PERFRAZUOTA_PAGAL_EGZAMINA','AUTORINIS_MOKOMASIS')),
  verification_note text NOT NULL DEFAULT '',
  review_status text NOT NULL DEFAULT 'NEPATVIRTINTA'
    CHECK (review_status IN ('NEPATVIRTINTA','PATIKRINTA','REIKIA_TAISYTI')),
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vbe_archive_questions_year_idx
 ON public.vbe_archive_questions(year);
CREATE INDEX IF NOT EXISTS vbe_archive_questions_applicability_idx
 ON public.vbe_archive_questions(applicability_11);
CREATE INDEX IF NOT EXISTS vbe_archive_questions_source_idx
 ON public.vbe_archive_questions(source_key);

ALTER TABLE public.vbe_archive_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vbe_archive_questions ENABLE ROW LEVEL SECURITY;

-- Mokiniams NESUTEIKIAMA galimybė perskaityti klausimų ar atsakymų.
GRANT SELECT, INSERT, UPDATE ON public.vbe_archive_sources TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.vbe_archive_questions TO authenticated;
REVOKE ALL ON public.vbe_archive_sources FROM anon;
REVOKE ALL ON public.vbe_archive_questions FROM anon;

CREATE POLICY vbe_sources_teacher_read ON public.vbe_archive_sources
 FOR SELECT TO authenticated USING ((SELECT private.is_teacher_or_admin()));
CREATE POLICY vbe_sources_teacher_insert ON public.vbe_archive_sources
 FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_teacher_or_admin()));
CREATE POLICY vbe_sources_teacher_update ON public.vbe_archive_sources
 FOR UPDATE TO authenticated USING ((SELECT private.is_teacher_or_admin()))
 WITH CHECK ((SELECT private.is_teacher_or_admin()));

CREATE POLICY vbe_questions_teacher_read ON public.vbe_archive_questions
 FOR SELECT TO authenticated USING ((SELECT private.is_teacher_or_admin()));
CREATE POLICY vbe_questions_teacher_insert ON public.vbe_archive_questions
 FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_teacher_or_admin()));
CREATE POLICY vbe_questions_teacher_update ON public.vbe_archive_questions
 FOR UPDATE TO authenticated USING ((SELECT private.is_teacher_or_admin()))
 WITH CHECK ((SELECT private.is_teacher_or_admin()));

COMMENT ON TABLE public.vbe_archive_questions IS
 'Mokytojo VBE archyvas. Visi pirminio importo įrašai NEPATVIRTINTA, kol mokytojas patikrina atsakymą ir šaltinį.';
