-- Migration: Adicionar campos para integração com Meta API
-- Data: Fevereiro 2026
-- Descrição: Adiciona campos necessários para publicar via Meta API (Facebook/Instagram)

-- Adicionar novos campos à tabela posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS publish_type VARCHAR(20) DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS scheduled_publish_time BIGINT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS placement VARCHAR(20),
ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(10),
ADD COLUMN IF NOT EXISTS ad_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_post_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS post_format VARCHAR(50);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_posts_account_id ON posts(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_publish_type ON posts(publish_type);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_publish_time ON posts(scheduled_publish_time);
CREATE INDEX IF NOT EXISTS idx_posts_placement ON posts(placement);
CREATE INDEX IF NOT EXISTS idx_posts_meta_post_id ON posts(meta_post_id);

-- Comentários explicativos
COMMENT ON COLUMN posts.account_id IS 'page_id (Facebook) ou instagram_business_account_id para Meta API';
COMMENT ON COLUMN posts.publish_type IS 'immediate (publicar agora) ou scheduled (agendar)';
COMMENT ON COLUMN posts.scheduled_publish_time IS 'UNIX timestamp em UTC - usado pela Meta API';
COMMENT ON COLUMN posts.media_type IS 'IMAGE, VIDEO ou CAROUSEL - formato para Meta API';
COMMENT ON COLUMN posts.placement IS 'feed, reels ou stories - onde será publicado';
COMMENT ON COLUMN posts.aspect_ratio IS 'Proporção da mídia (ex: 9:16, 4:5, 1:1)';
COMMENT ON COLUMN posts.ad_account_id IS 'ID da conta de anúncios (para tráfego pago)';
COMMENT ON COLUMN posts.meta_post_id IS 'ID retornado pela Meta API após publicação bem-sucedida';
COMMENT ON COLUMN posts.published_at IS 'Data/hora real da publicação (diferente de scheduled_date se houver atraso)';
COMMENT ON COLUMN posts.post_format IS 'Formato selecionado (reels, feed_square, stories, etc)';

-- Criar tabela para armazenar contas conectadas (para futuro OAuth)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'instagram' ou 'facebook'
  account_type VARCHAR(50) NOT NULL, -- 'page', 'business_account'
  account_id VARCHAR(255) NOT NULL, -- ID da página ou conta
  account_name VARCHAR(255),
  username VARCHAR(255),
  profile_picture_url TEXT,
  access_token TEXT NOT NULL, -- Token de acesso criptografado
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para connected_accounts
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_platform ON connected_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_is_active ON connected_accounts(is_active);

-- RLS para connected_accounts
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connected accounts"
  ON connected_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connected accounts"
  ON connected_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected accounts"
  ON connected_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts"
  ON connected_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários para connected_accounts
COMMENT ON TABLE connected_accounts IS 'Armazena contas do Facebook/Instagram conectadas via OAuth';
COMMENT ON COLUMN connected_accounts.access_token IS 'Token de acesso da Meta API (deve ser criptografado em produção)';
COMMENT ON COLUMN connected_accounts.token_expires_at IS 'Data de expiração do token (tokens devem ser renovados periodicamente)';
