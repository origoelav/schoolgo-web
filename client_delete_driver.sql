-- ============================================================
-- SQL PARA GERENCIAMENTO SEGURO DE MOTORISTAS NO PORTAL DO CLIENTE (BYPASS RLS)
-- Execute este script no SQL Editor do Supabase (banco SchoolGo)
-- ============================================================

-- 1. Função para desassociar motorista da frota de forma segura
CREATE OR REPLACE FUNCTION public.client_delete_driver(
  target_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios de superusuário, ignorando RLS
AS $$
BEGIN
  -- Permite desassociação se:
  -- 1. O executor for um administrador Master ativo
  -- 2. O executor for o dono da frota (client_id do motorista é o user_id do executor)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master' AND NOT is_deleted
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = target_user_id AND (client_id = auth.uid()::text OR client_id = auth.uid()::varchar)
  ) THEN
    -- 1. Desvincula o motorista de todos os alunos da frota (define driver_id como NULL na tabela school_students)
    UPDATE public.school_students
    SET 
      driver_id = NULL,
      updated_at = NOW()
    WHERE driver_id = target_user_id;

    -- 2. Desassocia o motorista da frota do frotista (reseta client_id e is_extra_driver para o fluxo autônomo)
    -- A CONTA DO MOTORISTA É PRESERVADA TOTALMENTE (is_deleted = FALSE), ELE APENAS SAI DA FROTA DO PORTAL.
    UPDATE public.profiles
    SET 
      client_id = NULL,
      is_extra_driver = FALSE,
      updated_at = NOW()
    WHERE user_id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Acesso negado: Você não tem permissão para remover este motorista da frota.';
  END IF;
END;
$$;


-- 2. Função para criar e vincular o perfil do motorista de forma segura
CREATE OR REPLACE FUNCTION public.client_create_driver_profile(
  new_user_id UUID,
  new_email TEXT,
  new_display_name TEXT,
  new_plate TEXT,
  new_is_extra BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios de superusuário, ignorando RLS
AS $$
BEGIN
  -- Permite apenas se o executor for um frotista ou master ativo
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND (role = 'fleet_admin' OR role = 'master' OR role = 'fleet_admin_driver') 
      AND NOT is_deleted
  ) THEN
    -- Insere ou atualiza o perfil do motorista de forma segura
    INSERT INTO public.profiles (
      user_id,
      email,
      display_name,
      role,
      client_id,
      vehicle_plate,
      subscription_status,
      trial_expires_at,
      is_extra_driver,
      updated_at
    ) VALUES (
      new_user_id,
      LOWER(TRIM(new_email)),
      TRIM(new_display_name),
      'driver',
      auth.uid()::text,
      UPPER(TRIM(new_plate)),
      'trial',
      (NOW() + INTERVAL '7 days')::timestamp with time zone,
      new_is_extra,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      client_id = EXCLUDED.client_id,
      vehicle_plate = EXCLUDED.vehicle_plate,
      is_extra_driver = EXCLUDED.is_extra_driver,
      updated_at = NOW();
  ELSE
    RAISE EXCEPTION 'Acesso negado: Apenas frotistas ou administradores podem cadastrar motoristas.';
  END IF;
END;
$$;
