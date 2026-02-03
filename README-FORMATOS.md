# Sistema de Formatos de Postagem

## 🎯 Objetivo

Implementar sistema completo de gerenciamento de formatos de postagem para diferentes plataformas sociais, incluindo ferramenta de enquadramento de imagens, seguindo as especificações de cada rede social.

## ✅ Implementação Completa

### 📱 Formatos por Plataforma

#### Instagram
- **9:16 (Reels/Stories)** - Principal - 1080x1920px
- **4:5 (Feed Retrato)** - Muito aceito - 1080x1350px  
- **1:1 (Feed Quadrado)** - Aceito - 1080x1080px

#### Facebook
- **1:1 (Feed Quadrado)** - Principal - 1200x1200px
- **4:5 (Feed Retrato)** - Muito aceito - 1080x1350px
- **9:16 (Stories/Reels)** - Aceito - 1080x1920px

#### TikTok
- **9:16 (Padrão)** - Absoluto - 1080x1920px
- **1:1 (Quadrado)** - Aceito - 1080x1080px

## 📂 Arquivos Implementados

### Novos Arquivos

```
src/
├── constants/
│   └── postFormats.js                    # ✅ Constantes de formatos
├── composables/
│   └── usePostFormats.js                 # ✅ Composable de gerenciamento
└── components/
    └── ImageCropper.vue                  # ✅ Componente de enquadramento
```

### Arquivos Modificados

```
src/
├── composables/
│   └── useCreativeValidation.js          # ✅ Atualizado com validação por formato
└── pages/
    └── CreatePostPage.vue                # ✅ Integração completa
```

### Documentação

```
├── GUIA-FORMATOS-POSTAGEM.md            # ✅ Guia completo
├── IMPLEMENTACAO-FORMATOS.md            # ✅ Resumo de implementação
└── README-FORMATOS.md                   # ✅ Este arquivo
```

## 🚀 Como Usar

### 1. Criação de Postagem

```vue
<template>
  <!-- Seleção de Plataforma -->
  <q-select
    v-model="form.social_network"
    :options="['instagram', 'facebook', 'tiktok']"
  />

  <!-- Seleção de Formato (auto-aparece) -->
  <q-select
    v-if="form.social_network"
    v-model="form.post_format"
    :options="formatOptions"
    hint="Formato auto-selecionado para o principal"
  />

  <!-- Upload de Imagem -->
  <input type="file" @change="onFileSelect" />

  <!-- Botão de Enquadramento -->
  <q-btn
    icon="crop"
    @click="openCropper"
    v-if="canCrop"
  >
    Enquadrar Imagem
  </q-btn>
</template>

<script setup>
import { usePostFormats } from 'src/composables/usePostFormats'

const {
  availableFormats,
  currentFormatConfig,
  setPlatform,
  setFormat
} = usePostFormats()

// Auto-seleciona formato principal ao escolher plataforma
watch(() => form.social_network, (platform) => {
  setPlatform(platform)
  form.post_format = selectedFormat.value
})
</script>
```

### 2. Enquadramento de Imagem

```vue
<q-dialog v-model="showCropperDialog" maximized>
  <ImageCropper
    :image-url="currentImage.url"
    :selected-format="selectedFormatConfig"
    @apply="onCropApply"
    @cancel="showCropperDialog = false"
  />
</q-dialog>
```

### 3. Validação

```javascript
import { useCreativeValidation } from 'src/composables/useCreativeValidation'

const { validateImage } = useCreativeValidation()

// Validar com formato específico
const results = await validateImage(
  file,
  width,
  height,
  'instagram',
  'reels'  // Formato específico
)
```

## 🎨 Recursos

### ImageCropper Component

- ✅ Área de recorte com proporção fixa
- ✅ Handles de redimensionamento (4 cantos)
- ✅ Movimentação por drag
- ✅ Controle de zoom (1x - 3x)
- ✅ Grade de composição (regra dos terços)
- ✅ Preview em tempo real
- ✅ Informações de dimensões
- ✅ Redefinir crop
- ✅ Aplicar/Cancelar

### Validação Inteligente

- ✅ Validação contextual por formato
- ✅ Avisos visuais de proporção
- ✅ Revalidação automática ao trocar formato
- ✅ Alertas não-bloqueantes

### Auto-seleção

- ✅ Formato principal selecionado automaticamente
- ✅ Badges coloridos de prioridade
- ✅ Descrições contextuais
- ✅ Dicas por formato

## 📊 API Reference

### postFormats.js

```javascript
// Obter formatos de uma plataforma
const formats = getFormatsByPlatform('instagram')

// Obter formato principal
const mainFormat = getMainFormat('instagram')

// Obter options para select
const options = getFormatOptions('instagram')

// Validar proporção
const isValid = validateAspectRatio(width, height, ratio, tolerance)

// Calcular dimensões ideais
const { width, height } = calculateIdealDimensions(w, h, ratio)

// Obter dicas
const tips = getFormatTips('instagram', 'reels')
```

### usePostFormats.js

```javascript
const {
  // State
  selectedPlatform,        // ref: plataforma selecionada
  selectedFormat,          // ref: formato selecionado
  
  // Computed
  availableFormats,        // computed: formatos disponíveis
  currentFormatConfig,     // computed: config do formato atual
  currentFormatTips,       // computed: dicas do formato
  
  // Methods
  setPlatform,            // fn: define plataforma
  setFormat,              // fn: define formato
  validateImageFormat,    // fn: valida imagem
  getIdealDimensions,     // fn: calcula dimensões
  getCropInfo,            // fn: info de recorte
  getPriorityColor,       // fn: cor do badge
  reset,                  // fn: reseta seleções
} = usePostFormats()
```

### ImageCropper.vue

**Props:**
```javascript
{
  imageUrl: String,        // URL da imagem (required)
  selectedFormat: Object   // { ratio, aspectRatio, width, height }
}
```

**Events:**
```javascript
@apply({ blob, url, cropData })  // Aplicar recorte
@cancel()                         // Cancelar
```

## 🎯 Fluxo Completo

```
1. Usuário seleciona PLATAFORMA
   └─> Sistema auto-seleciona FORMATO PRINCIPAL

2. Usuário faz UPLOAD da imagem
   └─> Sistema VALIDA proporção
       ├─> ✅ Proporção correta: continua
       └─> ⚠️ Proporção incorreta: mostra botão ENQUADRAR

3. Usuário clica ENQUADRAR
   └─> Abre ImageCropper em fullscreen
       ├─> Ajusta enquadramento (drag/resize/zoom)
       ├─> Visualiza em tempo real
       └─> Clica APLICAR

4. Sistema processa imagem
   └─> Upload da imagem enquadrada
       └─> Revalida proporção
           └─> ✅ Sucesso

5. Usuário completa postagem
   └─> Cria com formato correto garantido
```

## 🔧 Configuração

Não há configuração necessária. O sistema funciona automaticamente após importar os arquivos.

### Importações Necessárias

```javascript
// Em CreatePostPage.vue ou similar
import { getFormatOptions, getMainFormat } from 'src/constants/postFormats'
import { usePostFormats } from 'src/composables/usePostFormats'
import ImageCropper from 'src/components/ImageCropper.vue'
```

## 🎨 Customização

### Adicionar Nova Plataforma

Edite `src/constants/postFormats.js`:

```javascript
export const POST_FORMATS = {
  // ... existentes
  
  linkedin: {
    square: {
      label: 'Quadrado',
      ratio: 1,
      aspectRatio: '1:1',
      width: 1200,
      height: 1200,
      priority: 'principal',
      description: 'Formato principal do LinkedIn',
    },
    // ... mais formatos
  }
}

// Adicionar dicas
function getFormatTips(platform, formatKey) {
  const tips = {
    // ... existentes
    
    linkedin: {
      square: [
        'Profissionalismo é chave',
        'Evite muitos emojis',
        'Foque em conteúdo de valor',
      ]
    }
  }
  
  return tips[platform]?.[formatKey] || []
}
```

### Customizar Cores de Prioridade

Edite `src/composables/usePostFormats.js`:

```javascript
function getPriorityColor(priority) {
  const colors = {
    principal: 'green',        // Altere aqui
    'muito aceito': 'blue',    // Altere aqui
    aceito: 'orange',          // Altere aqui
    absoluto: 'deep-purple',   // Altere aqui
  }
  return colors[priority] || 'grey'
}
```

## 📈 Benefícios

### Para Usuários
- ✅ Processo intuitivo e visual
- ✅ Garantia de formato correto
- ✅ Sem necessidade de ferramentas externas
- ✅ Feedback imediato

### Para Desenvolvedores
- ✅ Código modular e testável
- ✅ Fácil manutenção
- ✅ Extensível
- ✅ Bem documentado

### Para o Negócio
- ✅ Conformidade com plataformas
- ✅ Melhor performance de posts
- ✅ Redução de erros
- ✅ Processo profissional

## 🐛 Troubleshooting

### Cropper não abre

**Problema:** Dialog não aparece ao clicar em enquadrar

**Solução:**
1. Verificar se formato foi selecionado
2. Confirmar que arquivo é imagem (não vídeo)
3. Checar console para erros

### Proporção incorreta após crop

**Problema:** Imagem continua com proporção errada

**Solução:**
1. Verificar `selectedFormatConfig` está correto
2. Inspecionar valores de `ratio` no cropper
3. Testar com zoom = 1

### Auto-seleção não funciona

**Problema:** Formato não é selecionado automaticamente

**Solução:**
1. Verificar `watch` do `social_network` em CreatePostPage
2. Confirmar `getMainFormat()` retorna valor correto
3. Checar logs no console

## 📚 Documentação Adicional

- **GUIA-FORMATOS-POSTAGEM.md** - Guia técnico completo
- **IMPLEMENTACAO-FORMATOS.md** - Resumo da implementação
- Comentários inline em cada arquivo

## ✨ Features Futuras

Possíveis melhorias:
- [ ] Presets de enquadramento (centrado, topo, base)
- [ ] Ajustes de brilho/contraste
- [ ] Filtros básicos
- [ ] Múltiplos crops para carrossel
- [ ] Histórico com undo/redo
- [ ] AI para sugestão de enquadramento
- [ ] Preview lado a lado (antes/depois)
- [ ] Templates por tipo de conteúdo

## 🤝 Contribuindo

Para adicionar novos formatos ou funcionalidades:

1. Edite `src/constants/postFormats.js` para adicionar formatos
2. Atualize `useCreativeValidation.js` se necessário
3. Teste com diferentes proporções
4. Documente mudanças
5. Adicione testes se possível

## 📝 Notas

- Canvas API é usada para manipulação eficiente
- Qualidade JPEG mantida em 95%
- Zoom limitado a 3x para preservar qualidade
- Tolerância de proporção padrão: 5%

## 🎉 Conclusão

Sistema completo e funcional implementado com sucesso!

Todos os requisitos foram atendidos:
- ✅ Formatos corretos por plataforma
- ✅ Enquadramento de imagem pelo usuário
- ✅ Código modularizado
- ✅ Fácil manutenção
- ✅ Bem documentado

---

**Desenvolvido para p-flow** | 2026
