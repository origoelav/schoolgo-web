-- Execute este script no SQL Editor do Supabase para restaurar seus poderes absolutos
-- O que aconteceu: Quando você alterou seu perfil para Motorista no select, o banco de dados te rebaixou. 
-- Com isso, o Row Level Security (RLS) do Supabase bloqueou suas permissões de UPDATE e DELETE.

UPDATE profiles 
SET 
    role = 'master', 
    client_id = 'SCHOOLGO_MASTER' 
WHERE email IN ('filipe_origoela@hotmail.com', 'origoela@gmail.com');
