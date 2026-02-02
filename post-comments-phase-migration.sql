-- =============================================
-- MIGRATION: Post Comments - Adicionar Phase e Role
-- Execute este SQL no Supabase
-- =============================================

-- Adicionar colunas phase_status e role_id
ALTER TABLE public.post_comments
  ADD COLUMN IF NOT EXISTS phase_status TEXT,
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_post_comments_phase ON public.post_comments(post_id, phase_status);
CREATE INDEX IF NOT EXISTS idx_post_comments_role ON public.post_comments(role_id);

-- Atualizar comentários existentes com a fase atual do post
UPDATE public.post_comments pc
SET phase_status = p.status
FROM public.posts p
WHERE pc.post_id = p.id AND pc.phase_status IS NULL;

-- Atualizar comentários existentes com o role_id do usuário
UPDATE public.post_comments pc
SET role_id = u.role_id
FROM public.users u
WHERE pc.user_id = u.id AND pc.role_id IS NULL;

-- Verificar se funcionou
SELECT 
  pc.id,
  pc.comment,
  pc.phase_status,
  u.name as user_name,
  r.name as role_name
FROM public.post_comments pc
LEFT JOIN public.users u ON pc.user_id = u.id
LEFT JOIN public.roles r ON pc.role_id = r.id
LIMIT 10;
