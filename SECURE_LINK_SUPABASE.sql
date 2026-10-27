-- SECURE LINK v5.45 – atskiras mokytojo jungiklis ir mokinių tyrimo pažanga.
-- Vykdyti vieną kartą Supabase SQL Editor. Pakartotinis paleidimas saugus.
-- Neištrinami ir nekeičiami jokie senų vertinimų, darbų ar CYBERLAB įrašai.
BEGIN;
CREATE TABLE IF NOT EXISTS public.secure_link_settings (
 class_id uuid PRIMARY KEY REFERENCES public.classes(id) ON DELETE CASCADE,
 topic_id text NOT NULL DEFAULT 'kriptografija' CHECK(topic_id='kriptografija'),
 enabled boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.secure_link_progress (
 class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
 student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 topic_id text NOT NULL DEFAULT 'kriptografija' CHECK(topic_id='kriptografija'),
 proof jsonb NOT NULL DEFAULT '[false,false,false,false,false]'::jsonb,
 quiz smallint CHECK(quiz IS NULL OR quiz BETWEEN 0 AND 2),
 answer text NOT NULL DEFAULT '' CHECK(length(answer)<=1600),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(class_id,student_id,topic_id),
 CONSTRAINT secure_link_proof_valid CHECK(jsonb_typeof(proof)='array' AND jsonb_array_length(proof)=5 AND jsonb_typeof(proof->0)='boolean' AND jsonb_typeof(proof->1)='boolean' AND jsonb_typeof(proof->2)='boolean' AND jsonb_typeof(proof->3)='boolean' AND jsonb_typeof(proof->4)='boolean')
);
CREATE INDEX IF NOT EXISTS secure_link_progress_class_idx ON public.secure_link_progress(class_id,updated_at DESC);
ALTER TABLE public.secure_link_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_link_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sl settings teacher read" ON public.secure_link_settings;
CREATE POLICY "sl settings teacher read" ON public.secure_link_settings FOR SELECT TO authenticated USING(public.is_teacher_of_class(class_id));
DROP POLICY IF EXISTS "sl settings student read" ON public.secure_link_settings;
CREATE POLICY "sl settings student read" ON public.secure_link_settings FOR SELECT TO authenticated USING(enabled AND public.is_student_in_class(class_id));
DROP POLICY IF EXISTS "sl settings teacher insert" ON public.secure_link_settings;
CREATE POLICY "sl settings teacher insert" ON public.secure_link_settings FOR INSERT TO authenticated
 WITH CHECK(public.is_teacher_of_class(class_id) AND topic_id='kriptografija' AND EXISTS(SELECT 1 FROM public.class_topics t WHERE t.class_id=secure_link_settings.class_id AND t.topic_id='kriptografija' AND NOT t.is_archived));
DROP POLICY IF EXISTS "sl settings teacher update" ON public.secure_link_settings;
CREATE POLICY "sl settings teacher update" ON public.secure_link_settings FOR UPDATE TO authenticated
 USING(public.is_teacher_of_class(class_id)) WITH CHECK(public.is_teacher_of_class(class_id) AND topic_id='kriptografija');
DROP POLICY IF EXISTS "sl progress student read" ON public.secure_link_progress;
CREATE POLICY "sl progress student read" ON public.secure_link_progress FOR SELECT TO authenticated
 USING(student_id=(SELECT auth.uid()) AND public.is_student_in_class(class_id));
DROP POLICY IF EXISTS "sl progress teacher read" ON public.secure_link_progress;
CREATE POLICY "sl progress teacher read" ON public.secure_link_progress FOR SELECT TO authenticated
 USING(public.is_teacher_of_class(class_id));
DROP POLICY IF EXISTS "sl progress student insert" ON public.secure_link_progress;
CREATE POLICY "sl progress student insert" ON public.secure_link_progress FOR INSERT TO authenticated
 WITH CHECK(student_id=(SELECT auth.uid()) AND topic_id='kriptografija' AND public.is_student_in_class(class_id)
 AND EXISTS(SELECT 1 FROM public.secure_link_settings s WHERE s.class_id=secure_link_progress.class_id AND s.enabled)
 AND EXISTS(SELECT 1 FROM public.topic_access t WHERE t.class_id=secure_link_progress.class_id AND t.topic_id='kriptografija' AND t.is_open));
DROP POLICY IF EXISTS "sl progress student update" ON public.secure_link_progress;
CREATE POLICY "sl progress student update" ON public.secure_link_progress FOR UPDATE TO authenticated
 USING(student_id=(SELECT auth.uid()) AND public.is_student_in_class(class_id))
 WITH CHECK(student_id=(SELECT auth.uid()) AND topic_id='kriptografija' AND public.is_student_in_class(class_id)
 AND EXISTS(SELECT 1 FROM public.secure_link_settings s WHERE s.class_id=secure_link_progress.class_id AND s.enabled)
 AND EXISTS(SELECT 1 FROM public.topic_access t WHERE t.class_id=secure_link_progress.class_id AND t.topic_id='kriptografija' AND t.is_open));
REVOKE ALL ON TABLE public.secure_link_settings FROM PUBLIC,anon;
REVOKE ALL ON TABLE public.secure_link_progress FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.secure_link_settings TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.secure_link_progress TO authenticated;
COMMIT;
