-- ============================================================
-- SQL PARA SUPORTAR MOTORISTAS EXTRA NO PLANO MENSAL
-- Execute este script no SQL Editor do Supabase (banco SchoolGo)
-- ============================================================

-- 1. Adiciona a coluna is_extra_driver na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_extra_driver BOOLEAN DEFAULT FALSE;

-- 2. Cria a função RPC para alternar o tipo de motorista (Padrão / Extra) com bypass de RLS
CREATE OR REPLACE FUNCTION public.client_toggle_extra_driver(
  target_user_id UUID,
  is_extra BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios de superusuário, ignorando RLS
AS $$
BEGIN
  -- Permite alteração se:
  -- 1. O executor for um administrador Master ativo
  -- 2. O executor for o dono da frota (client_id do motorista é o user_id do executor)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = target_user_id AND (client_id = auth.uid()::text OR client_id = auth.uid()::varchar)
  ) THEN
    UPDATE public.profiles
    SET 
      is_extra_driver = is_extra,
      updated_at = NOW()
    WHERE user_id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Acesso negado: Você não tem permissão para alterar o tipo de faturamento deste motorista.';
  END IF;
END;
$$;
