-- =============================================
-- FIX: Infinite Recursion in Users Table
-- Execute este SQL no Supabase para corrigir
-- =============================================

-- 1. Remover todas as policies antigas da tabela users
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can do everything with users" ON public.users;

-- 2. Criar policies mais simples e sem recursão

-- Policy 1: Todos podem ver todos os usuários
CREATE POLICY "enable_read_for_all_users" ON public.users
  FOR SELECT 
  USING (true);

-- Policy 2: Usuários podem atualizar apenas o próprio perfil
CREATE POLICY "enable_update_for_users_based_on_user_id" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Remover policies problemáticas de posts
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

-- 4. Recriar policy de posts sem referência à tabela users
CREATE POLICY "enable_delete_for_authenticated" ON public.posts
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Verificar se está tudo OK
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'posts')
ORDER BY tablename, policyname;
