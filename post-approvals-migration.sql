-- =============================================
-- MIGRATION: Post Approvals (Histórico de Aprovações)
-- Execute este SQL no Supabase
-- =============================================

-- Criar tabela de aprovações
CREATE TABLE IF NOT EXISTS public.post_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  phase_key TEXT NOT NULL,
  approved_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  approval_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_post_approvals_post ON public.post_approvals(post_id);
CREATE INDEX IF NOT EXISTS idx_post_approvals_phase ON public.post_approvals(phase_key);
CREATE INDEX IF NOT EXISTS idx_post_approvals_approved_by ON public.post_approvals(approved_by);

-- RLS para post_approvals
ALTER TABLE public.post_approvals ENABLE ROW LEVEL SECURITY;

-- Todos usuários autenticados podem ver aprovações
CREATE POLICY "enable_read_approvals" ON public.post_approvals
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Apenas admins podem criar aprovações
CREATE POLICY "enable_admin_create_approvals" ON public.post_approvals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Modificar post_tags para incluir tipo 'approval'
ALTER TABLE public.post_tags 
  DROP CONSTRAINT IF EXISTS post_tags_tag_type_check;

ALTER TABLE public.post_tags
  ADD CONSTRAINT post_tags_tag_type_check 
  CHECK (tag_type IN ('objective', 'product', 'approval'));

-- Verificar se funcionou
SELECT * FROM public.post_approvals LIMIT 1;
