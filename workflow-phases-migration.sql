-- =============================================
-- MIGRATION: Workflow Phases (Fases Configuráveis)
-- Execute este SQL no Supabase
-- =============================================

-- Criar tabela de fases do workflow
CREATE TABLE IF NOT EXISTS public.workflow_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  has_approval_button BOOLEAN DEFAULT false,
  approval_tag_label TEXT,
  next_phase_key TEXT,
  color TEXT DEFAULT 'grey',
  icon TEXT DEFAULT 'circle',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_workflow_phases_updated_at
  BEFORE UPDATE ON public.workflow_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_workflow_phases_order ON public.workflow_phases(order_index);
CREATE INDEX IF NOT EXISTS idx_workflow_phases_key ON public.workflow_phases(key);

-- Inserir fases atuais
INSERT INTO public.workflow_phases (key, title, order_index, has_approval_button, approval_tag_label, color, icon) VALUES
  ('ideas', 'Ideias', 1, false, NULL, 'grey', 'lightbulb'),
  ('in_production', 'Em Produção', 2, false, NULL, 'orange', 'construction'),
  ('ready_for_review', 'Pronto para Revisão', 3, true, 'Aprovado pelo Social Media', 'blue', 'rate_review'),
  ('adjustments_requested', 'Ajustes Solicitados', 4, false, NULL, 'red', 'edit'),
  ('validated', 'Validado', 5, true, 'Aprovado pelo Cliente', 'green', 'check_circle'),
  ('published', 'Publicado', 6, false, NULL, 'purple', 'public')
ON CONFLICT (key) DO NOTHING;

-- Configurar next_phase_key (executar após inserir todas as fases)
UPDATE public.workflow_phases SET next_phase_key = 'in_production' WHERE key = 'ideas';
UPDATE public.workflow_phases SET next_phase_key = 'adjustments_requested' WHERE key = 'ready_for_review';
UPDATE public.workflow_phases SET next_phase_key = 'published' WHERE key = 'validated';

-- Adicionar foreign key para next_phase_key
ALTER TABLE public.workflow_phases
  ADD CONSTRAINT fk_next_phase
  FOREIGN KEY (next_phase_key) 
  REFERENCES public.workflow_phases(key) 
  ON DELETE SET NULL;

-- RLS para workflow_phases
ALTER TABLE public.workflow_phases ENABLE ROW LEVEL SECURITY;

-- Todos podem ver as fases
CREATE POLICY "enable_read_workflow_phases" ON public.workflow_phases
  FOR SELECT 
  USING (true);

-- Apenas admins podem modificar fases
CREATE POLICY "enable_admin_manage_phases" ON public.workflow_phases
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar se funcionou
SELECT * FROM public.workflow_phases ORDER BY order_index;
