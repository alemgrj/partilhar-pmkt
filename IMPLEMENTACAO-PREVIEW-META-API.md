# Implementação: Preview Mobile Específico + Campos Meta API

## Status: CONCLUÍDO

**Data:** Fevereiro 2026  
**Impacto:** Alto - Preview realista + Preparação para integração Meta API

---

## O Que Foi Implementado

### 1. Preview Mobile com Ícones Específicos por Plataforma

Implementação completa de ícones de interação específicos para cada plataforma e formato, seguindo as diretrizes exatas de cada rede social.

#### Instagram

**Feed (1:1, 4:5):**
- Posição: Embaixo da imagem
- Ícones: Curtir → Comentar → Enviar (esquerda) | Salvar (direita)

**Reels/Stories (9:16):**
- Posição: Lateral direita
- Ícones: Curtir → Comentar → Enviar → Mais (⋯)
- Com contadores de interação
- Username e caption na parte inferior

#### Facebook

**Feed (1:1, 4:5):**
- Posição: Embaixo do post
- Ícones: Curtir (thumbs up) → Comentar → Compartilhar
- Salvar fica em menu secundário (não mostrado)

**Reels/Stories (9:16):**
- Posição: Lateral direita
- Ícones: Curtir → Comentar → Compartilhar
- SEM botão "Enviar" (diferente do Instagram)

#### TikTok

**Default (9:16) - SEMPRE:**
- Posição: SEMPRE lateral direita
- Ícones: Curtir → Comentar → Salvar → Compartilhar
- Todos com contadores
- 100% vertical, não tem variação de layout

### 2. Campos para Integração Meta API

Formulário reorganizado em **3 cards temáticos** com todos os campos necessários:

#### Card 1: Destino da Publicação
- Rede Social
- **Conta** (Facebook Page / Instagram Business Account)
- Tipo de Publicação (Orgânico / Tráfego Pago)
- Conta de Anúncios (se tráfego pago)

#### Card 2: Formato e Conteúdo
- Tipo de Criativo
- Formato da Postagem
- Upload de arquivos
- Legenda/Caption
- Tags

#### Card 3: Agendamento e Campanha
- **Quando Publicar** (Agora / Agendar)
- Data e Hora (condicional - só se agendado)
- Campanha (opcional)
- Nome da Postagem (se sem campanha)

### 3. Estrutura de Dados para Meta API

Os seguintes campos são preparados automaticamente ao criar postagem:

```javascript
{
  // Identificação
  platform: 'instagram' | 'facebook',
  account_id: string,  // page_id ou instagram_business_account_id
  
  // Conteúdo
  caption: string,
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL',
  media_urls: string[],
  aspect_ratio: '9:16' | '4:5' | '1:1',
  
  // Contexto
  post_type: 'ORGANIC' | 'ADS',
  placement: 'feed' | 'reels' | 'stories',
  
  // Agendamento
  publish_type: 'IMMEDIATE' | 'SCHEDULED',
  scheduled_publish_time: number,  // Unix timestamp UTC
  
  // Tráfego Pago
  ad_account_id: string,  // se post_type = 'paid'
}
```

---

## Arquivos Criados

### Código (3 novos arquivos)

1. **`src/constants/platformIcons.js`**
   - Mapeamento completo de ícones por plataforma
   - Função `getPlatformIcons(platform, placementType)`
   - Ordem e posicionamento corretos

2. **`src/utils/formatHelpers.js`**
   - `getPlacementType()` - Determina feed/reels/stories
   - `isVerticalFormat()` - Detecta formato vertical
   - `getMediaType()` - Converte para formato Meta API
   - `toUnixTimestamp()` - Converte data para UNIX
   - `validateFutureDate()` - Valida data de agendamento
   - `getMaxScheduleDays()` - Limites por plataforma

3. **`add-meta-api-fields.sql`**
   - Migration completa com novos campos
   - Índices para performance
   - Tabela `connected_accounts` para OAuth
   - Políticas RLS configuradas
   - Comentários explicativos

### Código (3 arquivos modificados)

4. **`src/components/previews/ImagePreview.vue`**
   - Ícones dinâmicos por plataforma
   - Layout adaptativo (bottom/side)
   - Overlay vertical para Reels/Stories

5. **`src/components/previews/VideoPreview.vue`**
   - Mesma lógica de ícones dinâmicos
   - Suporte a formatos verticais
   - Overlay lateral

6. **`src/pages/CreatePostPage.vue`**
   - Formulário reorganizado em 3 cards
   - Novos campos Meta API
   - Validações de data
   - Lógica de derivação de campos
   - Dialog de configuração de contas

### Documentação (1 arquivo)

7. **`IMPLEMENTACAO-PREVIEW-META-API.md`**
   - Este documento

---

## Diagrama do Fluxo

```
┌─────────────────────────────────────────────────────────┐
│                   CRIAR POSTAGEM                        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DESTINO     │  │  FORMATO     │  │ AGENDAMENTO  │
│              │  │              │  │              │
│ • Plataforma │  │ • Tipo       │  │ • Quando     │
│ • Conta      │  │ • Formato    │  │ • Data/Hora  │
│ • Tipo Post  │  │ • Upload     │  │ • Campanha   │
│              │  │ • Legenda    │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                ┌─────────────────┐
                │  DERIVAR CAMPOS │
                │                 │
                │ • media_type    │
                │ • placement     │
                │ • timestamp     │
                └─────────────────┘
                          │
                          ▼
                ┌─────────────────┐
                │  SALVAR NO BD   │
                └─────────────────┘
                          │
                          ▼
                ┌─────────────────┐
                │ FUTURO: META API│
                └─────────────────┘
```

---

## Especificações Técnicas

### Ícones por Plataforma/Formato

| Plataforma | Formato | Posição | Ícones |
|------------|---------|---------|--------|
| Instagram Feed | 1:1, 4:5 | Embaixo | ❤️ 💬 ➤ \| 🔖 |
| Instagram Reels | 9:16 | Lateral | ❤️ 💬 ➤ ⋯ |
| Facebook Feed | 1:1, 4:5 | Embaixo | 👍 💬 ↗️ |
| Facebook Reels | 9:16 | Lateral | 👍 💬 ↗️ |
| TikTok | 9:16 | Lateral | ❤️ 💬 🔖 ↗️ |

### Validações de Data

| Plataforma | Máximo de Dias no Futuro |
|------------|--------------------------|
| Instagram | 75 dias |
| Facebook | 365 dias |
| TikTok | 30 dias |

### Campos Obrigatórios por Plataforma

**Instagram/Facebook:**
- ✅ social_network
- ✅ account_id (obrigatório)
- ✅ post_type
- ✅ creative_type
- ✅ post_format
- ✅ publish_type
- ✅ scheduled_date (se scheduled)
- ✅ upload de arquivo
- ✅ caption

**TikTok/Google Ads:**
- ✅ social_network
- ✅ post_type
- ✅ creative_type
- ✅ post_format
- ✅ publish_type
- ✅ scheduled_date (se scheduled)
- ✅ upload de arquivo
- ✅ caption

---

## Como Funciona

### Fluxo do Usuário

1. **Seleciona Plataforma** (ex: Instagram)
2. **Seleciona Conta** (aparece dropdown - por enquanto vazio)
3. **Escolhe Tipo** (Orgânico ou Pago)
4. **Define Formato** (Reels 9:16 - auto-selecionado)
5. **Upload de arquivo**
6. **Escreve legenda**
7. **Escolhe quando publicar:**
   - "Publicar Agora" → publica imediatamente
   - "Agendar" → escolhe data/hora futura
8. **Cria postagem**

### Derivação Automática de Campos

```javascript
// Ao criar postagem, o sistema automaticamente deriva:

media_type = creative_type === 'image' ? 'IMAGE' 
           : creative_type === 'video' ? 'VIDEO' 
           : 'CAROUSEL'

placement = post_format.includes('reels') ? 'reels'
          : post_format.includes('stories') ? 'stories'
          : 'feed'

scheduled_publish_time = Math.floor(Date.parse(scheduled_date) / 1000)  // UNIX UTC

aspect_ratio = selectedFormatConfig.aspectRatio  // ex: '9:16'
```

### Preview Dinâmico

```javascript
// O preview detecta:
platform → 'instagram'
postFormat → 'reels'

// E busca os ícones corretos:
const icons = getPlatformIcons('instagram', 'reels')
// Resultado:
{
  position: 'side',
  icons: [
    { name: 'favorite_border', count: '1.2K' },
    { name: 'chat_bubble_outline', count: '89' },
    { name: 'send' },
    { name: 'more_vert' }
  ]
}

// Renderiza na lateral direita com estilo vertical
```

---

## Banco de Dados

### Tabela `posts` - Novos Campos

```sql
-- Campos adicionados:
account_id              VARCHAR(255)    -- ID da conta Meta
publish_type            VARCHAR(20)     -- immediate/scheduled
scheduled_publish_time  BIGINT          -- Unix timestamp
media_type              VARCHAR(20)     -- IMAGE/VIDEO/CAROUSEL
placement               VARCHAR(20)     -- feed/reels/stories
aspect_ratio            VARCHAR(10)     -- 9:16, 4:5, 1:1
ad_account_id           VARCHAR(255)    -- Para ads
meta_post_id            VARCHAR(255)    -- ID retornado pela Meta
published_at            TIMESTAMP       -- Quando foi publicado
post_format             VARCHAR(50)     -- reels, feed_square, etc
```

### Tabela `connected_accounts` - Nova

Preparada para futura implementação de OAuth:

```sql
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  platform VARCHAR(50),         -- instagram/facebook
  account_type VARCHAR(50),     -- page/business_account
  account_id VARCHAR(255),      -- ID da conta
  account_name VARCHAR(255),
  username VARCHAR(255),
  access_token TEXT,            -- Token OAuth
  token_expires_at TIMESTAMP,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Validações Implementadas

### Validação de Data

```javascript
function validateFutureDate(dateString) {
  // Verifica se data é futura
  // Verifica limite por plataforma (75 dias Instagram, 365 Facebook)
  // Retorna mensagem de erro ou true
}
```

### Validação de Conta

```javascript
const canCreate = computed(() => {
  // Para Instagram/Facebook, account_id é obrigatório
  const needsAccount = ['instagram', 'facebook'].includes(form.social_network)
  const hasAccount = needsAccount ? !!form.account_id : true
  
  return baseValidation && hasAccount && hasDate
})
```

### Hint Dinâmico

```javascript
function getScheduleDateHint() {
  // Instagram: "Agende até 75 dias no futuro"
  // Facebook: "Agende até 365 dias no futuro"
  // TikTok: "Agende até 30 dias no futuro"
}
```

---

## Testes Recomendados

### Teste 1: Preview Instagram Feed
1. Selecionar Instagram
2. Formato: Feed (1:1)
3. Upload imagem
4. **Verificar:**
   - ✅ Ícones embaixo: ❤️ 💬 ➤ | 🔖
   - ✅ Layout feed tradicional
   - ✅ Stats e caption visíveis

### Teste 2: Preview Instagram Reels
1. Selecionar Instagram
2. Formato: Reels (9:16)
3. Upload imagem/vídeo
4. **Verificar:**
   - ✅ Ícones na lateral direita: ❤️ 💬 ➤ ⋯
   - ✅ Com contadores (1.2K, 89)
   - ✅ Username embaixo
   - ✅ Fullscreen vertical

### Teste 3: Preview Facebook Feed
1. Selecionar Facebook
2. Formato: Feed (1:1)
3. Upload imagem
4. **Verificar:**
   - ✅ Ícones embaixo: 👍 💬 ↗️
   - ✅ SEM ícone salvar
   - ✅ Thumbs up (não coração)

### Teste 4: Preview TikTok
1. Selecionar TikTok
2. Formato: Padrão (9:16)
3. Upload vídeo
4. **Verificar:**
   - ✅ Ícones na lateral: ❤️ 💬 🔖 ↗️
   - ✅ Todos com contadores
   - ✅ Sempre vertical

### Teste 5: Campos Meta API
1. Selecionar Instagram
2. **Verificar:**
   - ✅ Campo "Conta Instagram" aparece
   - ✅ Campo obrigatório (validação)
   - ✅ Botão configurações presente
   - ✅ Mensagem "nenhuma conta conectada"

3. Selecionar "Tráfego Pago"
4. **Verificar:**
   - ✅ Campo "Conta de Anúncios" aparece

5. Selecionar "Publicar Agora"
6. **Verificar:**
   - ✅ Campo data/hora ESCONDE
   - ✅ Banner informativo aparece

7. Selecionar "Agendar Publicação"
8. **Verificar:**
   - ✅ Campo data/hora APARECE
   - ✅ Hint com limite de dias
   - ✅ Validação de data futura

### Teste 6: Criação de Post
1. Preencher todos os campos
2. Criar postagem
3. **Verificar console:**
   - ✅ `media_type` derivado corretamente
   - ✅ `placement` derivado corretamente
   - ✅ `scheduled_publish_time` em UNIX
   - ✅ `aspect_ratio` incluído

---

## Estrutura de Arquivos

```
src/
├── constants/
│   ├── postFormats.js          [existente]
│   └── platformIcons.js        [NOVO] ✨
├── utils/
│   └── formatHelpers.js        [NOVO] ✨
├── components/
│   ├── previews/
│   │   ├── ImagePreview.vue    [modificado]
│   │   └── VideoPreview.vue    [modificado]
│   └── ImageCropper.vue        [existente]
└── pages/
    └── CreatePostPage.vue      [modificado]

Database:
└── add-meta-api-fields.sql     [NOVO] ✨
```

---

## Comparação: Antes vs Depois

### Preview Mobile

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| Ícones | Genéricos (sempre iguais) | Específicos por plataforma |
| Posição | Sempre embaixo | Embaixo ou lateral conforme formato |
| Ordem | Sempre igual | Ordem correta por plataforma |
| Facebook | Ícone coração ❌ | Ícone thumbs up ✅ |
| TikTok | Layout feed ❌ | Sempre lateral ✅ |
| Contadores | Não tinha | Tem em formatos verticais ✅ |

### Formulário

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| Organização | 1 card único | 3 cards temáticos |
| Campos Meta | Não tinha | Todos incluídos |
| Conta | Não pedia | Obrigatório para Meta |
| Publicação | Sempre agendado | Agora ou Agendar |
| Validação de data | Básica | Contextual por plataforma |
| UX | Confuso | Claro e organizado |

---

## Meta API - Campos Preparados

### Para Imagem

```javascript
{
  platform: 'instagram',
  page_id: '123456789',  // ou instagram_business_account_id
  access_token: '...',
  caption: 'Texto da postagem',
  media_type: 'IMAGE',
  image_url: 'https://...',
  aspect_ratio: '9:16',
  post_type: 'ORGANIC',
  placement: 'reels',
  publish_type: 'SCHEDULED',
  scheduled_publish_time: 1738800000  // Unix timestamp
}
```

### Para Vídeo

```javascript
{
  platform: 'instagram',
  page_id: '123456789',
  access_token: '...',
  caption: 'Texto da postagem',
  media_type: 'VIDEO',
  video_url: 'https://...',
  aspect_ratio: '9:16',
  post_type: 'ORGANIC',
  placement: 'reels',
  publish_type: 'IMMEDIATE'
}
```

### Para Carrossel

```javascript
{
  platform: 'instagram',
  page_id: '123456789',
  access_token: '...',
  caption: 'Texto da postagem',
  media_type: 'CAROUSEL',
  children: [
    { image_url: 'https://...' },
    { image_url: 'https://...' },
    { video_url: 'https://...' }
  ],
  aspect_ratio: '4:5',
  post_type: 'ORGANIC',
  placement: 'feed',
  publish_type: 'SCHEDULED',
  scheduled_publish_time: 1738800000
}
```

---

## Próximos Passos (Futuro)

### Fase 2: Implementar OAuth
- [ ] Criar página `/settings/accounts`
- [ ] Implementar fluxo OAuth com Facebook
- [ ] Obter page_id e instagram_business_account_id
- [ ] Armazenar tokens em `connected_accounts`
- [ ] Popular dropdown de contas

### Fase 3: Publicação via Meta API
- [ ] Criar service `metaApiService.js`
- [ ] Implementar endpoints:
  - POST para criar postagem
  - GET para status
  - POST para publicar imediatamente
- [ ] Tratamento de erros da API
- [ ] Renovação automática de tokens

### Fase 4: Webhooks e Monitoramento
- [ ] Webhook para status de publicações
- [ ] Dashboard de métricas
- [ ] Notificações de publicação
- [ ] Log de erros

---

## Notas Importantes

### Segurança
- Tokens de acesso devem ser criptografados
- Renovar tokens periodicamente
- Não expor tokens no frontend
- Usar variáveis de ambiente

### Limites da Meta API
- Instagram: até 75 dias no futuro
- Facebook: até 365 dias
- Rate limits: 200 chamadas/hora/usuário
- Tokens expiram (geralmente 60 dias)

### Campos que Ficaram para Depois
- OAuth e gestão de contas
- Publicação real via API
- Renovação de tokens
- Webhooks de status
- Analytics de performance

---

## Código Exemplo - Integração Futura

### metaApiService.js (futuro)

```javascript
export async function publishToMeta(postData) {
  const { platform, account_id, media_type, placement } = postData
  
  // Para Instagram
  if (platform === 'instagram') {
    if (placement === 'reels') {
      return await publishInstagramReel(postData)
    } else {
      return await publishInstagramFeed(postData)
    }
  }
  
  // Para Facebook
  if (platform === 'facebook') {
    if (placement === 'reels') {
      return await publishFacebookReel(postData)
    } else {
      return await publishFacebookFeed(postData)
    }
  }
}

async function publishInstagramFeed(postData) {
  const endpoint = `https://graph.facebook.com/v18.0/${postData.account_id}/media`
  
  const payload = {
    image_url: postData.media_urls[0],
    caption: postData.caption,
    access_token: postData.access_token,
  }
  
  if (postData.publish_type === 'SCHEDULED') {
    payload.published = false
    payload.scheduled_publish_time = postData.scheduled_publish_time
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  
  return response.json()
}
```

---

## Documentação de Referência

- Meta Graph API: https://developers.facebook.com/docs/graph-api
- Instagram API: https://developers.facebook.com/docs/instagram-api
- Content Publishing: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
- OAuth Flow: https://developers.facebook.com/docs/facebook-login/guides/access-tokens

---

## Resumo Final

### Implementado ✅

1. ✅ Ícones específicos por plataforma (Instagram, Facebook, TikTok)
2. ✅ Posicionamento correto (embaixo vs lateral)
3. ✅ Ordem correta dos ícones
4. ✅ Formulário reorganizado em 3 cards
5. ✅ Campos Meta API completos
6. ✅ Validações de data por plataforma
7. ✅ Derivação automática de campos
8. ✅ Migration SQL completa
9. ✅ Preview dinâmico e realista
10. ✅ Preparação para OAuth

### Pendente para Futuro 🚀

- OAuth com Facebook/Instagram
- Publicação real via Meta API
- Gestão de contas conectadas
- Renovação de tokens
- Webhooks e monitoramento

---

**Status:** ✅ IMPLEMENTAÇÃO COMPLETA E FUNCIONAL

A base está 100% preparada para integração com Meta API quando a funcionalidade de OAuth for implementada.

---

*Implementado em Fevereiro 2026 - p-flow*
