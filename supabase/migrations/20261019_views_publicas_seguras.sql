-- Hardening posterior a criacao do esquema principal: views publicas sem SECURITY DEFINER.
-- Tabela publica somente com status tecnico resumido; notas, CREF e revisores permanecem privados.
CREATE TABLE IF NOT EXISTS public.exercise_public_status (
  exercise_id TEXT PRIMARY KEY REFERENCES public.central_exercises(id) ON DELETE CASCADE,
  biomechanical_status public.biomechanical_status_type NOT NULL DEFAULT 'sem_avaliacao',
  is_legacy_approval BOOLEAN NOT NULL DEFAULT FALSE,
  media_format TEXT NOT NULL DEFAULT 'nenhum',
  media_availability TEXT NOT NULL DEFAULT 'nao_verificado',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.exercise_public_status ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.exercise_public_status FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.exercise_public_status TO anon, authenticated;
DROP POLICY IF EXISTS exercise_public_status_select ON public.exercise_public_status;
CREATE POLICY exercise_public_status_select
ON public.exercise_public_status FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.sync_public_exercise_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.exercise_public_status WHERE exercise_id = OLD.exercise_id;
    RETURN OLD;
  END IF;
  INSERT INTO public.exercise_public_status (
    exercise_id, biomechanical_status, is_legacy_approval,
    media_format, media_availability, updated_at
  ) VALUES (
    NEW.exercise_id, NEW.biomechanical_status, NEW.is_legacy_approval,
    NEW.media_format, NEW.media_availability, NOW()
  ) ON CONFLICT (exercise_id) DO UPDATE SET
    biomechanical_status = EXCLUDED.biomechanical_status,
    is_legacy_approval = EXCLUDED.is_legacy_approval,
    media_format = EXCLUDED.media_format,
    media_availability = EXCLUDED.media_availability,
    updated_at = NOW();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_public_exercise_status() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_sync_public_exercise_status ON public.exercise_audit_records;
CREATE TRIGGER trg_sync_public_exercise_status
AFTER INSERT OR UPDATE OR DELETE ON public.exercise_audit_records
FOR EACH ROW EXECUTE FUNCTION public.sync_public_exercise_status();

ALTER VIEW public.v_catalog_showcase SET (security_invoker = true);
CREATE OR REPLACE VIEW public.v_public_exercise_status
WITH (security_invoker = true)
AS SELECT exercise_id, biomechanical_status, is_legacy_approval, media_format,
          media_availability
   FROM public.exercise_public_status;
GRANT SELECT ON public.v_public_exercise_status TO anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_central_exercise_compat_fields() FROM PUBLIC, anon, authenticated;
