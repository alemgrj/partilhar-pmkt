-- PMkt Database Schema
-- Execute este script no SQL Editor do Supabase

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: users (extensão de auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABELA: posts
-- =============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_network TEXT NOT NULL CHECK (social_network IN ('instagram', 'tiktok', 'google_ads', 'facebook')),
  post_type TEXT NOT NULL CHECK (post_type IN ('organic', 'paid')),
  creative_type TEXT NOT NULL CHECK (creative_type IN ('image', 'video', 'carousel')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  caption TEXT,
  status TEXT NOT NULL CHECK (status IN ('ideas', 'in_production', 'ready_for_review', 'adjustments_requested', 'validated', 'published')) DEFAULT 'ideas',
  campaign_name TEXT,
  responsible_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON public.posts(scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_responsible ON public.posts(responsible_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON public.posts(created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON public.posts(deleted_at);

-- =============================================
-- TABELA: post_creatives
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_creatives_post_id ON public.post_creatives(post_id);
CREATE INDEX IF NOT EXISTS idx_post_creatives_order ON public.post_creatives(post_id, order_index);

-- =============================================
-- TABELA: post_comments
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- =============================================
-- TABELA: post_tags
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('objective', 'product')),
  tag_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_type_value ON public.post_tags(tag_type, tag_value);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES: users
-- =============================================

-- Usuários podem ver todos os outros usuários
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

-- Usuários podem atualizar apenas o próprio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins podem fazer tudo com usuários
CREATE POLICY "Admins can do everything with users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- POLICIES: posts
-- =============================================

-- Todos podem ver posts não deletados
CREATE POLICY "Users can view non-deleted posts" ON public.posts
  FOR SELECT USING (deleted_at IS NULL);

-- Usuários podem criar posts
CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

-- Usuários podem atualizar posts que criaram ou que são responsáveis
CREATE POLICY "Users can update own or assigned posts" ON public.posts
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = responsible_user_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem deletar (soft delete)
CREATE POLICY "Admins can delete posts" ON public.posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- POLICIES: post_creatives
-- =============================================

CREATE POLICY "Users can view creatives" ON public.post_creatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert creatives" ON public.post_creatives
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND (created_by = auth.uid() OR responsible_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete own creatives" ON public.post_creatives
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND (created_by = auth.uid() OR responsible_user_id = auth.uid())
    )
  );

-- =============================================
-- POLICIES: post_comments
-- =============================================

CREATE POLICY "Users can view comments" ON public.post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND deleted_at IS NULL
    )
  );

-- =============================================
-- POLICIES: post_tags
-- =============================================

CREATE POLICY "Users can view tags" ON public.post_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can manage tags" ON public.post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND (created_by = auth.uid() OR responsible_user_id = auth.uid())
    )
  );

-- =============================================
-- FUNÇÃO: Criar usuário automaticamente após signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE BUCKET para criativos
-- =============================================
-- Execute estes comandos no Storage do Supabase Dashboard:
-- 1. Criar bucket "post-creatives" (public ou private conforme necessidade)
-- 2. Configurar policies:

-- Policy para upload (autenticados)
-- CREATE POLICY "Authenticated users can upload creatives"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'post-creatives');

-- Policy para visualização (todos autenticados)
-- CREATE POLICY "Authenticated users can view creatives"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'post-creatives');

-- Policy para deletar (apenas donos ou admins)
-- CREATE POLICY "Users can delete own creatives"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'post-creatives' AND auth.uid() = owner);
