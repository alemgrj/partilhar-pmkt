-- =============================================
-- MIGRATION: Campanhas
-- Execute este SQL no Supabase
-- =============================================

-- Criar tabela de campanhas
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT CHECK (objective IN ('awareness', 'consideration', 'conversion', 'retention', 'branding')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Trigger para updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by) WHERE deleted_at IS NULL;

-- Adicionar relacionamento de posts com campanhas
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_campaign ON public.posts(campaign_id) WHERE deleted_at IS NULL;

-- RLS para campanhas
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Todos podem ver campanhas não deletadas
CREATE POLICY "enable_read_campaigns" ON public.campaigns
  FOR SELECT 
  USING (deleted_at IS NULL);

-- Usuários podem criar campanhas
CREATE POLICY "enable_insert_campaigns" ON public.campaigns
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Usuários podem atualizar campanhas que criaram
CREATE POLICY "enable_update_campaigns" ON public.campaigns
  FOR UPDATE 
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Usuários podem deletar (soft) campanhas que criaram
CREATE POLICY "enable_delete_campaigns" ON public.campaigns
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Verificar se funcionou
SELECT * FROM public.campaigns LIMIT 1;
