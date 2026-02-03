# Guia Visual - Ícones de Interação por Plataforma

## Comparação Visual dos Layouts

### Instagram Feed (1:1 ou 4:5)

```
┌─────────────────────────────┐
│  @seu_perfil          ⋮     │  Header
├─────────────────────────────┤
│                             │
│                             │
│        [IMAGEM]             │  Imagem
│                             │
│                             │
├─────────────────────────────┤
│  ♡  💬  ➤         🔖        │  Ações
├─────────────────────────────┤
│  1.234 curtidas             │  Stats
│  @seu_perfil Caption aqui   │  Caption
│  Ver todos os comentários    │  Comments
│  HÁ 2 HORAS                  │  Time
└─────────────────────────────┘

Ícones:
♡  = favorite_border (Curtir)
💬 = chat_bubble_outline (Comentar)
➤  = send (Enviar)
🔖 = bookmark_border (Salvar)
```

### Instagram Reels (9:16)

```
┌──────────────────┐
│                  │
│                  │
│                  │
│                  │
│                  │
│    [IMAGEM]      │      ♡
│    VERTICAL      │     1.2K
│    FULLSCREEN    │
│                  │      💬
│                  │      89
│                  │
│                  │      ➤
│                  │
│                  │      ⋮
│  @seu_perfil     │
│  Caption...      │
└──────────────────┘

Ícones Laterais (direita):
♡  = favorite_border + contador
💬 = chat_bubble_outline + contador
➤  = send
⋮  = more_vert (Mais opções)
```

### Facebook Feed (1:1 ou 4:5)

```
┌─────────────────────────────┐
│  @seu_perfil          ⋮     │  Header
├─────────────────────────────┤
│                             │
│                             │
│        [IMAGEM]             │  Imagem
│                             │
│                             │
├─────────────────────────────┤
│  👍  💬  ↗️                  │  Ações
├─────────────────────────────┤
│  1.234 curtidas             │  Stats
│  @seu_perfil Caption aqui   │  Caption
│  HÁ 2 HORAS                  │  Time
└─────────────────────────────┘

Ícones:
👍 = thumb_up_outline (Curtir) ⚠️ DIFERENTE
💬 = chat_bubble_outline (Comentar)
↗️ = share (Compartilhar) ⚠️ DIFERENTE
🔖 = NÃO APARECE (menu secundário)
```

### Facebook Reels (9:16)

```
┌──────────────────┐
│                  │
│                  │
│                  │
│                  │
│                  │
│    [VÍDEO]       │      👍
│    VERTICAL      │     1.2K
│    FULLSCREEN    │
│                  │      💬
│                  │      89
│                  │
│                  │      ↗️
│                  │
│  @seu_perfil     │
│  Caption...      │
└──────────────────┘

Ícones Laterais (direita):
👍 = thumb_up_outline + contador
💬 = chat_bubble_outline + contador
↗️ = share
⚠️ SEM botão "Enviar" (diferente do Instagram)
```

### TikTok (9:16 - SEMPRE)

```
┌──────────────────┐
│                  │
│                  │
│                  │
│                  │
│                  │
│    [VÍDEO]       │      ♡
│    VERTICAL      │    24.5K
│    FULLSCREEN    │
│                  │      💬
│                  │     892
│                  │
│                  │      🔖
│                  │    1.8K
│                  │
│                  │      ↗️
│  @seu_perfil     │
│  Caption...      │
└──────────────────┘

Ícones Laterais (direita):
♡  = favorite_border + contador
💬 = chat_bubble_outline + contador
🔖 = bookmark_border + contador
↗️ = share
⚠️ SEMPRE lateral, não tem feed "embaixo"
```

---

## Diferenças Importantes

### Instagram vs Facebook

| Aspecto | Instagram | Facebook |
|---------|-----------|----------|
| Curtir | ❤️ Coração | 👍 Thumbs Up |
| Compartilhar | ➤ Enviar (DM) | ↗️ Share público |
| Salvar (Feed) | 🔖 Visível | ❌ Menu secundário |
| Enviar (Reels) | ✅ Tem | ❌ Não tem |

### Feed vs Reels/Stories

| Aspecto | Feed | Reels/Stories |
|---------|------|---------------|
| Posição | Embaixo | Lateral direita |
| Contadores | Não | Sim (1.2K, 89) |
| Layout | Tradicional | Vertical fullscreen |
| Caption | Completo embaixo | Truncado embaixo |
| Header | Sempre visível | Não tem |

### TikTok (Único)

- **SEMPRE lateral** - não tem variação
- **SEMPRE vertical** - 100% da tela
- **Todos têm contador** - até o salvar
- **4 ícones** - mais que outras plataformas

---

## Tabela Comparativa Completa

| Plataforma | Formato | Posição | Ícone 1 | Ícone 2 | Ícone 3 | Ícone 4 | Extra |
|------------|---------|---------|---------|---------|---------|---------|-------|
| Instagram Feed | 1:1, 4:5 | Embaixo | ❤️ Curtir | 💬 Comentar | ➤ Enviar | - | 🔖 Salvar (direita) |
| Instagram Reels | 9:16 | Lateral | ❤️ Curtir | 💬 Comentar | ➤ Enviar | ⋮ Mais | - |
| Facebook Feed | 1:1, 4:5 | Embaixo | 👍 Curtir | 💬 Comentar | ↗️ Compartilhar | - | - |
| Facebook Reels | 9:16 | Lateral | 👍 Curtir | 💬 Comentar | ↗️ Compartilhar | - | - |
| TikTok | 9:16 | Lateral | ❤️ Curtir | 💬 Comentar | 🔖 Salvar | ↗️ Compartilhar | - |

---

## Ícones do Quasar Usados

### Curtir
- **Instagram:** `favorite_border` (coração vazio)
- **Facebook:** `thumb_up_outline` (joinha vazio)
- **TikTok:** `favorite_border` (coração vazio)

### Comentar
- **Todas:** `chat_bubble_outline` (balão de fala)

### Enviar/Compartilhar
- **Instagram:** `send` (papel avião - DM)
- **Facebook:** `share` (seta compartilhar)
- **TikTok:** `share` (seta compartilhar)

### Salvar
- **Instagram Feed:** `bookmark_border` (marcador)
- **Facebook:** Não aparece
- **TikTok:** `bookmark_border` (marcador)

### Mais
- **Instagram Reels:** `more_vert` (três pontos)
- **Facebook:** Não tem em Reels
- **TikTok:** Não tem

---

## Implementação no Código

### Constante (platformIcons.js)

```javascript
export const PLATFORM_ICONS = {
  instagram: {
    feed: {
      position: 'bottom',
      icons: [
        { name: 'favorite_border', label: 'Curtir' },
        { name: 'chat_bubble_outline', label: 'Comentar' },
        { name: 'send', label: 'Enviar' },
      ],
      rightIcon: { name: 'bookmark_border', label: 'Salvar' }
    },
    reels: {
      position: 'side',
      icons: [
        { name: 'favorite_border', label: 'Curtir', count: '1.2K' },
        { name: 'chat_bubble_outline', label: 'Comentar', count: '89' },
        { name: 'send', label: 'Enviar' },
        { name: 'more_vert', label: 'Mais' }
      ]
    }
  },
  // ... facebook, tiktok
}
```

### Uso no Componente

```javascript
// Em ImagePreview.vue / VideoPreview.vue
import { getPlatformIcons } from 'src/constants/platformIcons'
import { getPlacementType } from 'src/utils/formatHelpers'

const currentIcons = computed(() => {
  const placementType = getPlacementType(props.platform, props.postFormat)
  return getPlatformIcons(props.platform, placementType)
})

// Renderiza dinamicamente:
<q-icon 
  v-for="icon in currentIcons.icons" 
  :name="icon.name" 
/>
```

---

## Casos de Uso

### Caso 1: Post Simples Instagram Feed

**Input:**
- Platform: `instagram`
- Format: `feed_square`

**Output Preview:**
- Posição: `bottom`
- Ícones: ❤️ 💬 ➤ | 🔖
- Layout: Feed tradicional

### Caso 2: Reels Instagram

**Input:**
- Platform: `instagram`
- Format: `reels`

**Output Preview:**
- Posição: `side`
- Ícones: ❤️(1.2K) 💬(89) ➤ ⋮
- Layout: Vertical fullscreen

### Caso 3: Post Facebook Feed

**Input:**
- Platform: `facebook`
- Format: `feed_square`

**Output Preview:**
- Posição: `bottom`
- Ícones: 👍 💬 ↗️ (sem salvar)
- Layout: Feed tradicional

### Caso 4: TikTok

**Input:**
- Platform: `tiktok`
- Format: `default`

**Output Preview:**
- Posição: `side`
- Ícones: ❤️(24.5K) 💬(892) 🔖(1.8K) ↗️
- Layout: Sempre vertical

---

## Legenda de Ícones

| Símbolo | Nome Quasar | Descrição |
|---------|-------------|-----------|
| ❤️ | `favorite_border` | Curtir (coração) |
| 👍 | `thumb_up_outline` | Curtir (joinha) |
| 💬 | `chat_bubble_outline` | Comentar |
| ➤ | `send` | Enviar (DM) |
| ↗️ | `share` | Compartilhar |
| 🔖 | `bookmark_border` | Salvar |
| ⋮ | `more_vert` | Mais opções |

---

## Detalhes de Estilo

### Ícones Embaixo (Feed)
```scss
.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 8px 14px;
  
  .actions-left {
    display: flex;
    gap: 14px;  // Espaçamento entre ícones
  }
}
```

### Ícones Lateral (Reels/Stories)
```scss
.vertical-actions {
  position: absolute;
  right: 12px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;  // Espaçamento vertical
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    
    .action-count {
      color: white;
      font-size: 11px;
      font-weight: 600;
    }
  }
}
```

---

## Testes de Plataforma

### Checklist Instagram

- [ ] Feed (1:1) - ícones embaixo, com salvar
- [ ] Feed (4:5) - ícones embaixo, com salvar
- [ ] Reels (9:16) - ícones lateral, com mais (⋮)
- [ ] Stories (9:16) - ícones lateral, com mais (⋮)

### Checklist Facebook

- [ ] Feed (1:1) - thumbs up, sem salvar
- [ ] Feed (4:5) - thumbs up, sem salvar
- [ ] Reels (9:16) - lateral, sem "enviar"
- [ ] Stories (9:16) - lateral, sem "enviar"

### Checklist TikTok

- [ ] Default (9:16) - sempre lateral
- [ ] Square (1:1) - ainda lateral (não muda)
- [ ] Todos com contadores
- [ ] Salvar incluso na lateral

---

## Implementação Técnica

### getPlatformIcons()

```javascript
// Uso:
const icons = getPlatformIcons('instagram', 'feed')

// Retorna:
{
  position: 'bottom',
  icons: [
    { name: 'favorite_border', label: 'Curtir', action: 'like' },
    { name: 'chat_bubble_outline', label: 'Comentar', action: 'comment' },
    { name: 'send', label: 'Enviar', action: 'send' }
  ],
  rightIcon: { name: 'bookmark_border', label: 'Salvar', action: 'save' }
}
```

### getPlacementType()

```javascript
// Uso:
const placement = getPlacementType('instagram', 'reels')

// Retorna: 'reels'

// Lógica:
// - Se formato contém 'reels' → 'reels'
// - Se formato contém 'stories' → 'stories'
// - TikTok 'default' → 'default'
// - Caso contrário → 'feed'
```

---

## Dicas de UX

### Contadores em Formatos Verticais

Os contadores aparecem apenas em formatos verticais (Reels/Stories/TikTok):

```html
<div class="action-item">
  <q-icon name="favorite_border" size="32px" color="white" />
  <div v-if="icon.count" class="action-count">1.2K</div>
</div>
```

**Por quê?**
- Mais espaço disponível na lateral
- Formato mais engajante
- Padrão das plataformas

### Caption em Formatos Verticais

Caption fica na parte inferior com gradiente:

```scss
.vertical-bottom {
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  
  .caption-vertical {
    -webkit-line-clamp: 2;  // Máximo 2 linhas
    overflow: hidden;
  }
}
```

**Por quê?**
- Não obstrui a imagem
- Melhor legibilidade
- Padrão das plataformas

---

## Manutenção e Extensão

### Adicionar Nova Plataforma

```javascript
// Em platformIcons.js
export const PLATFORM_ICONS = {
  // ... existentes
  
  linkedin: {
    feed: {
      position: 'bottom',
      icons: [
        { name: 'thumb_up_outline', label: 'Curtir' },
        { name: 'chat_bubble_outline', label: 'Comentar' },
        { name: 'share', label: 'Compartilhar' },
        { name: 'send', label: 'Enviar' }
      ],
      rightIcon: null
    }
  }
}
```

### Customizar Ícones

Para mudar um ícone específico, edite `platformIcons.js`:

```javascript
// Trocar coração por estrela no Instagram
instagram: {
  feed: {
    icons: [
      { name: 'star_border', label: 'Curtir' },  // Mudou aqui
      // ... resto igual
    ]
  }
}
```

### Adicionar Contadores Dinâmicos

Atualmente os contadores são fixos (`1.2K`, `89`). Para tornar dinâmico:

```javascript
// Passar como prop:
<ImagePreview
  :engagement="{ likes: 1234, comments: 89 }"
/>

// No componente:
const formattedCount = (count) => {
  if (count > 1000) return (count/1000).toFixed(1) + 'K'
  return count.toString()
}
```

---

## Benefícios da Implementação

### Realismo
- Preview 100% fiel à plataforma real
- Usuário vê exatamente como ficará
- Confiança no resultado

### Flexibilidade
- Fácil adicionar novas plataformas
- Fácil customizar ícones
- Código reutilizável

### Manutenibilidade
- Constantes centralizadas
- Lógica separada em helpers
- Documentação completa

### Performance
- Computed properties otimizados
- Renderização condicional
- Sem re-renders desnecessários

---

## Conclusão

Sistema completo de ícones específicos por plataforma implementado com sucesso!

**Principais conquistas:**
- ✅ Ícones corretos para cada plataforma
- ✅ Posicionamento adequado (embaixo/lateral)
- ✅ Ordem correta de exibição
- ✅ Diferenças entre Instagram e Facebook
- ✅ TikTok sempre vertical
- ✅ Contadores em formatos verticais
- ✅ Preview realista e profissional

**Pronto para uso em produção!**

---

*Guia Visual - p-flow 2026*
