-- =============================================
-- MIGRATION: Roles (Papéis Customizáveis)
-- Execute este SQL no Supabase
-- =============================================

-- Criar tabela de papéis
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT 'person',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir papéis padrão
INSERT INTO public.roles (name, description, color, icon) VALUES
  ('Founder/Cliente', 'Cliente/Fundador da empresa', 'purple', 'business'),
  ('Social Media', 'Profissional de mídias sociais', 'green', 'campaign'),
  ('Designer', 'Designer gráfico', 'orange', 'palette'),
  ('Copywriter', 'Redator de conteúdo', 'blue', 'edit')
ON CONFLICT (name) DO NOTHING;

-- Adicionar coluna role_id na tabela users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role_id);

-- RLS para roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Todos podem ver os papéis
CREATE POLICY "enable_read_roles" ON public.roles
  FOR SELECT 
  USING (true);

-- Apenas admins podem modificar papéis
CREATE POLICY "enable_admin_manage_roles" ON public.roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar se funcionou
SELECT * FROM public.roles;
