-- ============================================================
-- SQL PARA LIBERAR CRIAÇÃO, EDIÇÃO E EXCLUSÃO NO PORTAL MASTER
-- Execute este script no SQL Editor do Supabase (banco SchoolGo)
-- ============================================================

-- 1. RPC para atualizar a função de qualquer usuário com segurança (Bypass de RLS)
CREATE OR REPLACE FUNCTION public.master_update_profile_role(
  target_user_id UUID,
  new_role TEXT,
  new_client_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios de superusuário, ignorando RLS
AS $$
BEGIN
  -- Segurança: Garante que apenas usuários que são Master de verdade no BD possam executar isso
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores Master podem alterar papéis.';
  END IF;

  UPDATE public.profiles
  SET 
    role = new_role,
    client_id = new_client_id,
    updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

-- 2. RPC para excluir/arquivar qualquer usuário com segurança (Bypass de RLS)
CREATE OR REPLACE FUNCTION public.master_delete_profile(
  target_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios de superusuário, ignorando RLS
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  -- Segurança: Garante que apenas usuários que são Master de verdade no BD possam executar isso
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores Master podem excluir perfis.';
  END IF;

  -- Busca o perfil atual para arquivamento
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = target_user_id;
  
  IF FOUND THEN
    -- Insere na tabela de arquivados
    INSERT INTO public.old_profiles (user_id, email, role, client_id)
    VALUES (v_profile.user_id, v_profile.email, v_profile.role, v_profile.client_id)
    ON CONFLICT DO NOTHING;
    
    -- Soft delete na tabela principal
    UPDATE public.profiles
    SET 
      is_deleted = TRUE,
      updated_at = NOW()
    WHERE user_id = target_user_id;
  END IF;
END;
$$;

-- 3. RPC para estender a degustação de qualquer usuário (Bypass de RLS)
CREATE OR REPLACE FUNCTION public.master_extend_trial(
  target_user_id UUID,
  new_expires_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores Master podem estender degustações.';
  END IF;

  UPDATE public.profiles
  SET 
    trial_expires_at = new_expires_at,
    subscription_status = 'trial',
    updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

-- 4. RPC para atualizar a assinatura de qualquer usuário (Bypass de RLS)
CREATE OR REPLACE FUNCTION public.master_update_subscription(
  target_user_id UUID,
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores Master podem atualizar assinaturas.';
  END IF;

  UPDATE public.profiles
  SET 
    subscription_status = new_status,
    trial_expires_at = CASE WHEN new_status = 'active' THEN NULL ELSE trial_expires_at END,
    updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;
