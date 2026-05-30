-- ============================================================
-- SQL PARA GERENCIAMENTO SEGURO DE MOTORISTAS (BYPASS RLS)
-- Execute este script no SQL Editor do Supabase (banco SchoolGo)
-- ============================================================

-- 1. Função para buscar motorista existente pela placa (bypassando RLS)
CREATE OR REPLACE FUNCTION public.client_search_driver_by_plate(
  target_plate TEXT
)
RETURNS TABLE (
  found_user_id UUID,
  found_display_name TEXT,
  found_role TEXT,
  found_client_id TEXT,
  found_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como superusuário
AS $$
BEGIN
  RETURN QUERY
  SELECT user_id, display_name, role, client_id, email
  FROM public.profiles
  WHERE UPPER(TRIM(vehicle_plate)) = UPPER(TRIM(target_plate)) AND NOT is_deleted
  LIMIT 1;
END;
$$;


-- 2. Função para vincular motorista existente pelo ID (bypassando RLS)
CREATE OR REPLACE FUNCTION public.client_link_driver_secure(
  target_user_id UUID,
  driver_plate TEXT
)
RETURNS TABLE (
  linked_user_id UUID,
  linked_display_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como superusuário
AS $$
DECLARE
  found_display_name TEXT;
  current_client_id TEXT;
  found_role TEXT;
  existing_standard_count INT;
BEGIN
  -- Busca o motorista por ID de forma segura
  SELECT display_name, client_id, role 
  INTO found_display_name, current_client_id, found_role
  FROM public.profiles
  WHERE user_id = target_user_id AND NOT is_deleted
  LIMIT 1;

  -- Se não encontrar o perfil
  IF found_display_name IS NULL THEN
    RAISE EXCEPTION 'Perfil do motorista não encontrado.';
  END IF;

  -- Validações de função administrativa
  IF found_role = 'master' THEN
    RAISE EXCEPTION 'Este usuário possui perfil de Administrador Master e não pode ser vinculado.';
  ELSIF found_role = 'fleet_admin' THEN
    RAISE EXCEPTION 'Este usuário possui perfil de Frotista e não pode ser vinculado.';
  END IF;

  -- Valida se o motorista já pertence a outra frota de frotista
  IF current_client_id IS NOT NULL AND current_client_id <> auth.uid()::text AND current_client_id <> 'SCHOOLGO_MASTER' THEN
    RAISE EXCEPTION 'Este motorista já está vinculado a outra frota.';
  END IF;

  -- Conta quantos motoristas padrão (Assinatura) o frotista já tem
  SELECT COUNT(*) INTO existing_standard_count
  FROM public.profiles
  WHERE client_id = auth.uid()::text AND NOT is_deleted AND NOT is_extra_driver;

  -- Vincula o motorista à frota do frotista e atualiza a placa do veículo e faturamento
  UPDATE public.profiles
  SET 
    client_id = auth.uid()::text,
    vehicle_plate = UPPER(TRIM(driver_plate)),
    is_extra_driver = (existing_standard_count >= 2),
    updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN QUERY SELECT target_user_id, found_display_name;
END;
$$;


-- 3. Função para vincular motorista existente pelo e-mail (bypassando RLS)
CREATE OR REPLACE FUNCTION public.client_link_existing_driver(
  driver_email TEXT,
  driver_plate TEXT
)
RETURNS TABLE (
  linked_user_id UUID,
  linked_display_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como superusuário
AS $$
DECLARE
  found_user_id UUID;
  found_display_name TEXT;
  current_client_id TEXT;
  found_role TEXT;
  existing_standard_count INT;
BEGIN
  -- Busca o motorista por email de forma case-insensitive e ignora deletados
  SELECT user_id, display_name, client_id, role 
  INTO found_user_id, found_display_name, current_client_id, found_role
  FROM public.profiles
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(driver_email)) AND NOT is_deleted
  LIMIT 1;

  -- Se não encontrar o perfil, retorna vazio para que o frontend crie a conta
  IF found_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Validações de função administrativa
  IF found_role = 'master' THEN
    RAISE EXCEPTION 'Este usuário possui perfil de Administrador Master e não pode ser vinculado.';
  ELSIF found_role = 'fleet_admin' THEN
    RAISE EXCEPTION 'Este usuário possui perfil de Frotista e não pode ser vinculado.';
  END IF;

  -- Valida se o motorista já pertence a outra frota de frotista
  IF current_client_id IS NOT NULL AND current_client_id <> auth.uid()::text AND current_client_id <> 'SCHOOLGO_MASTER' THEN
    RAISE EXCEPTION 'Este motorista já está vinculado a outra frota.';
  END IF;

  -- Conta quantos motoristas padrão (Assinatura) o frotista já tem
  SELECT COUNT(*) INTO existing_standard_count
  FROM public.profiles
  WHERE client_id = auth.uid()::text AND NOT is_deleted AND NOT is_extra_driver;

  -- Vincula o motorista à frota do frotista e atualiza a placa do veículo e faturamento
  UPDATE public.profiles
  SET 
    client_id = auth.uid()::text,
    vehicle_plate = UPPER(TRIM(driver_plate)),
    is_extra_driver = (existing_standard_count >= 2),
    updated_at = NOW()
  WHERE user_id = found_user_id;

  RETURN QUERY SELECT found_user_id, found_display_name;
END;
$$;


-- 4. Script de correção retroativa para motoristas existentes
-- Este bloco garante que cada frotista tenha NO MÁXIMO 2 motoristas na Assinatura (is_extra_driver = FALSE).
-- Todos os excedentes são marcados como Extra (is_extra_driver = TRUE) automaticamente, priorizando a data de criação.
WITH ranked_drivers AS (
  SELECT 
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY client_id 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.profiles
  WHERE 
    client_id IS NOT NULL 
    AND NOT is_deleted 
    AND (role = 'driver' OR role = 'fleet_admin_driver')
)
UPDATE public.profiles p
SET 
  is_extra_driver = TRUE,
  updated_at = NOW()
FROM ranked_drivers rd
WHERE 
  p.user_id = rd.user_id 
  AND rd.row_num > 2 
  AND NOT p.is_extra_driver;
