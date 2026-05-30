-- ============================================================
-- SQL PARA EXCLUIR DEFINITIVAMENTE UM USUÁRIO (BD E AUTH)
-- Execute este script no SQL Editor do Supabase (banco SchoolGo)
-- ============================================================

CREATE OR REPLACE FUNCTION public.master_permanently_delete_profile(
  target_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Ignora RLS e roda como superusuário
AS $$
BEGIN
  -- Segurança: Garante que apenas usuários que são Master de verdade no BD possam executar isso
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores Master podem excluir definitivamente.';
  END IF;

  -- 1. Desvincular dependências de frotas
  UPDATE public.profiles 
  SET client_id = NULL 
  WHERE client_id = target_user_id::text;

  -- 2. Excluir rastreamento se existir
  DELETE FROM public.driver_tracking WHERE user_id = target_user_id;
  
  -- 3. Excluir histórico de arquivamento local
  DELETE FROM public.old_profiles WHERE user_id = target_user_id;
  
  -- 4. Excluir da tabela principal de perfis
  DELETE FROM public.profiles WHERE user_id = target_user_id;

  -- 5. Excluir da autenticação do Supabase (auth.users)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
