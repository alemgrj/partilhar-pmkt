# Guia de Formatos de Postagem

## 📋 Visão Geral

Este guia documenta a implementação do sistema de formatos de postagem para diferentes plataformas sociais. O sistema permite que usuários selecionem o formato ideal para cada tipo de postagem e oferece ferramenta de enquadramento de imagens.

## 🎯 Formatos Suportados

### Instagram

| Formato | Proporção | Dimensões | Prioridade | Uso |
|---------|-----------|-----------|------------|-----|
| Reels / Stories | 9:16 | 1080x1920 | **Principal** | Conteúdo vertical, melhor alcance orgânico |
| Feed (Retrato) | 4:5 | 1080x1350 | Muito aceito | Ocupa mais espaço no feed mobile |
| Feed (Quadrado) | 1:1 | 1080x1080 | Aceito | Formato clássico, bom para mosaico |

### Facebook

| Formato | Proporção | Dimensões | Prioridade | Uso |
|---------|-----------|-----------|------------|-----|
| Feed (Quadrado) | 1:1 | 1200x1200 | **Principal** | Formato mais familiar e comum |
| Feed (Retrato) | 4:5 | 1080x1350 | Muito aceito | Melhor engajamento no mobile |
| Stories / Reels | 9:16 | 1080x1920 | Aceito | Conteúdo imersivo de tela cheia |

### TikTok

| Formato | Proporção | Dimensões | Prioridade | Uso |
|---------|-----------|-----------|------------|-----|
| Padrão | 9:16 | 1080x1920 | **Absoluto** | Formato obrigatório para melhor performance |
| Quadrado | 1:1 | 1080x1080 | Aceito | Aceito mas não recomendado |

## 📁 Estrutura de Arquivos

```
src/
├── constants/
│   └── postFormats.js              # Definições de formatos e utilidades
├── composables/
│   ├── usePostFormats.js           # Composable para gerenciar formatos
│   └── useCreativeValidation.js    # Validação de criativos (atualizado)
├── components/
│   └── ImageCropper.vue            # Componente de enquadramento
└── pages/
    └── CreatePostPage.vue          # Página de criação (atualizado)
```

## 🔧 Arquivos Principais

### 1. `postFormats.js` - Constantes e Utilidades

```javascript
// Definição de formatos
export const POST_FORMATS = {
  instagram: {
    reels: { ratio: 9/16, aspectRatio: '9:16', ... },
    feed_portrait: { ratio: 4/5, aspectRatio: '4:5', ... },
    feed_square: { ratio: 1, aspectRatio: '1:1', ... }
  },
  // ... outros
}

// Funções utilitárias
getFormatsByPlatform(platform)      // Retorna formatos da plataforma
getMainFormat(platform)             // Retorna formato principal
getFormatOptions(platform)          // Retorna options para q-select
validateAspectRatio(w, h, ratio)    // Valida proporção
calculateIdealDimensions(w, h, r)   // Calcula dimensões ideais
getFormatTips(platform, format)     // Retorna dicas específicas
```

### 2. `usePostFormats.js` - Composable

```javascript
const {
  // State reativo
  selectedPlatform,
  selectedFormat,
  
  // Computed
  availableFormats,        // Formatos disponíveis
  currentFormatConfig,     // Config do formato atual
  currentFormatTips,       // Dicas do formato
  
  // Methods
  setPlatform,            // Define plataforma
  setFormat,              // Define formato
  validateImageFormat,    // Valida imagem
  getIdealDimensions,     // Calcula dimensões
  getCropInfo,            // Info de recorte necessário
} = usePostFormats()
```

### 3. `ImageCropper.vue` - Componente de Enquadramento

Componente interativo que permite:
- Visualização da imagem original
- Área de recorte com proporção fixa
- Handles de redimensionamento
- Controle de zoom
- Grade de composição (regra dos terços)
- Preview em tempo real

**Props:**
```javascript
{
  imageUrl: String,           // URL da imagem
  selectedFormat: Object      // Config do formato ({ ratio, aspectRatio, width, height })
}
```

**Events:**
```javascript
@apply  // { blob, url, cropData }  - Quando aplicar recorte
@cancel // void                     - Quando cancelar
```

## 🎨 Fluxo de Uso

### 1. Seleção de Formato

```vue
<!-- Seletor de plataforma -->
<q-select
  v-model="form.social_network"
  :options="socialNetworkOptions"
  @update:model-value="onPlatformChange"
/>

<!-- Seletor de formato (aparece após selecionar plataforma) -->
<q-select
  v-if="form.social_network"
  v-model="form.post_format"
  :options="formatOptions"
  label="Formato da Postagem"
/>
```

### 2. Upload de Imagem

Após upload, o sistema:
1. Valida o arquivo
2. Verifica proporção atual vs formato selecionado
3. Mostra avisos se necessário
4. Oferece botão de enquadramento

### 3. Enquadramento (Opcional)

```vue
<!-- Botão para abrir cropper -->
<q-btn
  icon="crop"
  @click="openCropper(file, index)"
  v-if="file.type.startsWith('image/')"
/>

<!-- Dialog com cropper -->
<q-dialog v-model="showCropperDialog" maximized>
  <ImageCropper
    :image-url="currentFile.url"
    :selected-format="selectedFormatConfig"
    @apply="onCropApply"
    @cancel="showCropperDialog = false"
  />
</q-dialog>
```

### 4. Validação

```javascript
// Validação com formato específico
const results = await validateImage(
  file,
  width,
  height,
  platform,
  selectedFormat  // Novo parâmetro
)
```

## 💡 Funcionalidades

### Auto-seleção de Formato

Quando o usuário seleciona uma plataforma, o sistema automaticamente seleciona o formato principal/recomendado:

```javascript
watch(() => form.value.social_network, (platform) => {
  if (platform) {
    const mainFormat = getMainFormat(platform)
    form.value.post_format = mainFormat.key
  }
})
```

### Validação Contextual

A validação considera o formato selecionado:

```javascript
// Sem formato selecionado: valida contra todos os formatos da plataforma
// Com formato selecionado: valida especificamente contra ele

validateImageAspectRatio(width, height, platform, selectedFormat)
```

### Indicadores Visuais

- **Badges de Prioridade:** Verde (principal), Azul (muito aceito), Laranja (aceito), Roxo (absoluto)
- **Avisos de Proporção:** Alertas visuais quando imagem não está na proporção ideal
- **Dicas Contextuais:** Dicas específicas por formato no painel lateral

## 🎯 Boas Práticas

### 1. Seleção de Formato

- Sempre mostrar o formato recomendado primeiro
- Indicar claramente a prioridade de cada formato
- Fornecer descrições sobre quando usar cada um

### 2. Enquadramento

- Permitir zoom para melhor composição
- Mostrar grade de composição (regra dos terços)
- Preservar qualidade da imagem (95% JPEG)
- Gerar na resolução ideal da plataforma

### 3. Validação

- Validar antes e depois do enquadramento
- Mostrar avisos claros mas não bloqueantes
- Permitir criação mesmo com avisos (exceto erros críticos)

### 4. UX

- Preview em tempo real
- Feedback visual imediato
- Processo reversível (pode reabrir cropper)
- Manter imagem original disponível

## 🔄 Extensibilidade

### Adicionar Nova Plataforma

```javascript
// Em postFormats.js
export const POST_FORMATS = {
  // ... existentes
  nova_plataforma: {
    formato_1: {
      label: 'Nome do Formato',
      ratio: 16/9,
      aspectRatio: '16:9',
      width: 1920,
      height: 1080,
      priority: 'principal',
      description: 'Descrição do uso',
    },
    // ... mais formatos
  }
}

// Em getFormatTips
nova_plataforma: {
  formato_1: [
    'Dica 1',
    'Dica 2',
  ]
}
```

### Adicionar Validações Customizadas

```javascript
// Em useCreativeValidation.js
function validateCustomRule(file, width, height, format) {
  // Sua lógica de validação
  return {
    isValid: boolean,
    message: string,
    severity: 'error' | 'warning' | 'info' | 'success'
  }
}
```

## 📊 Métricas e Recomendações

### Dimensões Ideais

- **Instagram Reels/Stories:** 1080x1920px (9:16)
- **Instagram Feed Portrait:** 1080x1350px (4:5)
- **Instagram Feed Square:** 1080x1080px (1:1)
- **Facebook Feed:** 1200x1200px (1:1)
- **TikTok:** 1080x1920px (9:16)

### Tamanhos de Arquivo

- **Imagens:** Máximo 10MB, recomendado até 5MB
- **Vídeos:** Máximo 100MB, recomendado até 50MB

### Qualidade

- **JPEG Quality:** 95% após crop
- **Resolução Mínima:** Conforme especificação da plataforma
- **Formato:** JPEG para fotos, MP4 para vídeos

## 🐛 Troubleshooting

### Cropper não abre
- Verificar se formato foi selecionado
- Confirmar que arquivo é imagem
- Checar console para erros

### Proporção incorreta após crop
- Verificar configuração do formato selecionado
- Confirmar cálculo de dimensões
- Testar com diferentes zooms

### Validação inconsistente
- Limpar cache de validações
- Recarregar imagem
- Verificar formato selecionado

## 📝 Notas de Desenvolvimento

### Modularização

O sistema foi projetado para ser modular:
- **Constantes separadas** para fácil manutenção
- **Composables reutilizáveis** em qualquer componente
- **Componentes independentes** testáveis isoladamente

### Performance

- Canvas API para manipulação eficiente de imagens
- Lazy loading do cropper (apenas quando necessário)
- Validações on-demand
- Debounce em eventos de drag/resize

### Acessibilidade

- Keyboard navigation no cropper
- Labels descritivos
- Feedback visual claro
- Tooltips informativos

## 🚀 Próximos Passos

Melhorias futuras possíveis:
1. Presets de enquadramento (centrado, superior, inferior)
2. Filtros e ajustes básicos de imagem
3. Múltiplas áreas de crop para carrossel
4. Histórico de crops com undo/redo
5. Templates por tipo de conteúdo
6. AI para sugerir melhor enquadramento
