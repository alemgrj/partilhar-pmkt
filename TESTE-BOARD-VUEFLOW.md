# Guia de Testes - Board Vue Flow

## O que foi implementado

O Board de Produção foi completamente reformulado usando **Vue Flow** com **Nested Nodes**:

- **Parent Nodes (Fases)**: Colunas fixas que representam cada fase do workflow
- **Child Nodes (Posts)**: Cards de postagens que podem ser arrastados dentro ou entre fases
- **Drag & Drop Inteligente**: Detecta quando um post é movido para outra fase e atualiza automaticamente no banco

---

## Arquitetura Nova

```
BoardPage.vue (VueFlow)
├── PhaseNode (Parent) - Fase "Ideias"
│   ├── PostNode (Child) - Post 1
│   └── PostNode (Child) - Post 2
├── PhaseNode (Parent) - Fase "Em Produção"
│   └── PostNode (Child) - Post 3
└── PhaseNode (Parent) - Fase "Pronto para Revisão"
    └── PostNode (Child) - Post 4
```

---

## Como Testar

### 1. Iniciar o Sistema

```bash
cd c:\Partilhar_unificado\p-flow
npm run dev
```

Acesse: `http://localhost:9000/board`

---

### 2. Teste Básico - Visualização

**Objetivo:** Verificar que o board renderiza corretamente

**Passos:**
1. Acesse `/board`
2. Verifique que as fases aparecem como colunas horizontais
3. Verifique que os posts aparecem dentro das respectivas fases
4. Verifique que cada fase tem um badge com o número de posts

**Resultado Esperado:**
- ✅ Fases renderizam com cores e ícones corretos
- ✅ Posts aparecem dentro das fases
- ✅ Badges mostram contagem correta

---

### 3. Teste de Drag - Dentro da Mesma Fase

**Objetivo:** Verificar que posts podem ser arrastados dentro da mesma fase

**Passos:**
1. Clique e segure um post
2. Arraste para cima/baixo dentro da mesma fase
3. Solte o post

**Resultado Esperado:**
- ✅ Post move visualmente
- ✅ Cursor muda para "grabbing"
- ✅ Post permanece na mesma fase
- ✅ NENHUMA atualização no banco (mesma fase)

---

### 4. Teste de Drag - Entre Fases ⭐ CRÍTICO

**Objetivo:** Verificar que posts mudam de fase e atualizam no banco

**Passos:**
1. Abra o Console do navegador (F12)
2. Arraste um post de "Ideias" para "Em Produção"
3. Observe os logs no console
4. Verifique a notificação (toast)
5. Recarregue a página (F5)
6. Verifique que o post permanece na nova fase

**Resultado Esperado:**
- ✅ Loading aparece ("Atualizando status...")
- ✅ Toast verde: "Post movido com sucesso!"
- ✅ Console mostra: `📦 Movendo post [id] de ideas para in_production`
- ✅ Console mostra: `✅ Post movido com sucesso`
- ✅ Badge da fase origem diminui (-1)
- ✅ Badge da fase destino aumenta (+1)
- ✅ Após F5, post está na nova fase (persistido no banco)

**Console Esperado:**
```
📦 Movendo post abc-123 de ideas para in_production
⚠️ Post já está sendo atualizado: abc-123 (se arrastar rápido demais)
✅ Post movido com sucesso
```

---

### 5. Teste de Erro - Drag com Rede Offline

**Objetivo:** Verificar rollback quando atualização falha

**Passos:**
1. Abra DevTools (F12) → Network tab
2. Selecione "Offline"
3. Arraste um post para outra fase
4. Observe o erro
5. Volte para "Online"

**Resultado Esperado:**
- ✅ Loading aparece
- ✅ Toast vermelho: "Erro ao mover post. Tente novamente."
- ✅ Post VOLTA para a fase original (rollback visual)
- ✅ Console mostra erro de rede

---

### 6. Teste de Click - Abrir Detalhes

**Objetivo:** Verificar que clicar em post abre os detalhes

**Passos:**
1. Clique em qualquer post
2. Verifique que navega para `/post/[id]`

**Resultado Esperado:**
- ✅ Navega para página de detalhes
- ✅ Detalhes do post são exibidos

---

### 7. Teste de Zoom & Pan

**Objetivo:** Verificar controles de navegação do Vue Flow

**Passos:**
1. Clique nos botões de zoom (+/-)
2. Arraste o background (pan)
3. Use scroll para pan horizontal

**Resultado Esperado:**
- ✅ Botões de zoom funcionam
- ✅ Pan funciona ao arrastar background
- ✅ Scroll horizontal move o board

---

### 8. Teste de Performance - Múltiplos Posts

**Objetivo:** Verificar que board suporta muitos posts

**Passos:**
1. Crie 10+ posts em diferentes fases
2. Arraste posts entre fases
3. Observe a fluidez

**Resultado Esperado:**
- ✅ Board renderiza sem lag
- ✅ Drag & drop é fluido
- ✅ Atualizações são rápidas

---

### 9. Teste de Estado Vazio

**Objetivo:** Verificar empty state quando fase está vazia

**Passos:**
1. Mova todos os posts de uma fase para outras
2. Observe a fase vazia

**Resultado Esperado:**
- ✅ Ícone de "inbox" aparece
- ✅ Texto: "Nenhum post nesta fase"

---

### 10. Teste de Múltiplos Drags Simultâneos

**Objetivo:** Verificar que flag `updating` previne conflitos

**Passos:**
1. Arraste um post muito rápido entre várias fases
2. Observe o console

**Resultado Esperado:**
- ✅ Console mostra: `⚠️ Post já está sendo atualizado: [id]`
- ✅ Segunda operação é ignorada
- ✅ Sem conflitos ou duplicações

---

## Checklist de Validação

Execute TODOS os testes e marque:

- [ ] 1. Visualização correta
- [ ] 2. Drag dentro da mesma fase
- [ ] 3. Drag entre fases (com atualização no banco) ⭐
- [ ] 4. Rollback em erro de rede
- [ ] 5. Click para abrir detalhes
- [ ] 6. Zoom & Pan funcionam
- [ ] 7. Performance com muitos posts
- [ ] 8. Empty state aparece
- [ ] 9. Flag updating previne conflitos

---

## Comparação: Antes vs Depois

### Antes (vuedraggable)
- ❌ Refresh na tela ao mover card
- ❌ Watch excessivo causando re-renders
- ❌ `fetchPosts()` no catch recarregando tudo
- ❌ Sem zoom/pan
- ❌ Limitado a drag & drop básico

### Depois (Vue Flow)
- ✅ Movimento suave SEM refresh
- ✅ Nested nodes nativos (parent/child)
- ✅ Rollback cirúrgico em erro
- ✅ Zoom & Pan built-in
- ✅ Extensível (mini-map, undo/redo futuro)
- ✅ Performance superior
- ✅ Eventos ricos (drag, drop, click, hover)

---

## Debugging

### Ver Estrutura de Nodes

Abra o console e execute:

```javascript
// Ver todos os nodes
window.$vueFlow = document.querySelector('.vue-flow').__vueParentComponent
console.log(window.$vueFlow.ctx.nodes)

// Ver apenas parent nodes (fases)
console.log(window.$vueFlow.ctx.nodes.filter(n => n.type === 'phase'))

// Ver apenas child nodes (posts)
console.log(window.$vueFlow.ctx.nodes.filter(n => n.type === 'post'))
```

### Ver Estado do PostsStore

```javascript
// No Vue DevTools → Pinia
// Ou no console:
const postsStore = usePostsStore()
console.log(postsStore.postsByStatus)
```

---

## Troubleshooting

### Problema: Posts não aparecem

**Causa:** Fases ou posts não foram carregados

**Solução:**
1. Verifique console: erros de API?
2. Verifique que `workflowStore.fetchPhases()` retornou dados
3. Verifique que `postsStore.fetchPosts()` retornou dados

---

### Problema: Drag não funciona

**Causa:** Node não tem `draggable: true`

**Solução:**
1. Verifique que `PostNode` tem `draggable: true`
2. Verifique que `PhaseNode` tem `draggable: false`

---

### Problema: Post não muda de fase

**Causa:** `extent: 'parent'` muito restritivo ou intersections não detectadas

**Solução:**
1. Verifique logs: `❌ Nenhuma fase encontrada nas intersections`
2. Arraste o post COMPLETAMENTE para dentro da fase destino
3. Certifique-se que soltou o post dentro dos limites da fase

---

### Problema: Erro 401/403 ao atualizar

**Causa:** RLS policies do Supabase

**Solução:**
1. Verifique que está autenticado
2. Verifique políticas RLS da tabela `posts`
3. Execute: `SELECT * FROM posts WHERE id = '[post-id]'` no Supabase SQL Editor

---

## Arquivos Criados/Modificados

### Criados
- `src/components/board-flow/PhaseNode.vue` - Parent node customizado
- `src/components/board-flow/PostNode.vue` - Child node customizado
- `src/composables/useBoardFlow.js` - Lógica do board

### Modificados
- `src/pages/BoardPage.vue` - Refatorado para Vue Flow
- `package.json` - Adicionado @vue-flow/core, background, controls

### A Remover (após validação)
- `src/components/board/BoardColumn.vue`
- `src/components/board/BoardColumnHeader.vue`
- `src/components/board/BoardColumnBody.vue`
- `src/components/board/PostCardDraggable.vue`
- `src/components/board/BoardEmptyState.vue`

---

## Próximos Passos (Opcional)

Se quiser expandir o board:

1. **Mini-map**: Mostrar visão geral do board
```vue
<MiniMap />
```

2. **Undo/Redo**: Histórico de mudanças
```javascript
import { useVueFlow } from '@vue-flow/core'
const { undo, redo } = useVueFlow()
```

3. **Salvar Posições**: Persistir layout customizado
```javascript
// Salvar posições no localStorage
localStorage.setItem('board-layout', JSON.stringify(nodes.value))
```

4. **Animações de Transição**: Suavizar mudanças
```css
.vue-flow__node {
  transition: transform 0.3s ease;
}
```

---

## Conclusão

O board foi **completamente migrado** para Vue Flow com sucesso! 🎉

**Vantagens principais:**
- Nested nodes nativos (parent/child)
- Drag & drop robusto e configurável
- Performance superior
- Zoom & Pan built-in
- Código mais limpo e manutenível

**Execute os testes acima e reporte qualquer problema!**

---

**Data:** 02/02/2026  
**Status:** ✅ Implementado e Pronto para Testes
