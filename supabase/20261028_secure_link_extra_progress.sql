-- SECURE LINK v5.51 – papildomų eksperimentų pažangos saugojimas.
-- Saugi, pakartotinai vykdoma migracija: nekeičia esamų mokinių bandymų.
BEGIN;
ALTER TABLE public.secure_link_progress
 ADD COLUMN IF NOT EXISTS extra jsonb NOT NULL DEFAULT '{"trust":false,"signature":false,"hybrid":false}'::jsonb;
ALTER TABLE public.secure_link_progress
 DROP CONSTRAINT IF EXISTS secure_link_extra_valid;
ALTER TABLE public.secure_link_progress
 ADD CONSTRAINT secure_link_extra_valid CHECK (
   jsonb_typeof(extra)='object'
   AND pg_column_size(extra)<2048
   AND jsonb_typeof(coalesce(extra->'trust','false'::jsonb))='boolean'
   AND jsonb_typeof(coalesce(extra->'signature','false'::jsonb))='boolean'
   AND jsonb_typeof(coalesce(extra->'hybrid','false'::jsonb))='boolean'
 );
COMMIT;