# Correções de Imports - Vue Flow

## Problemas Identificados e Corrigidos

### 1. Erro de Import do Composable ❌→✅

**Problema:**
```javascript
import { useBoardFlow } from 'composables/useBoardFlow'
// ❌ Failed to resolve import
```

**Causa:**
Vite não reconheceu o alias `composables/` sem o prefixo `src/`

**Solução:**
```javascript
import { useBoardFlow } from 'src/composables/useBoardFlow'
// ✅ Import resolvido
```

**Arquivo:** `src/pages/BoardPage.vue` (linha 67)

---

### 2. Erro de Export do Vue Flow ❌→✅

**Problema:**
```javascript
import { VueFlow, Background, Controls } from '@vue-flow/core'
// ❌ does not provide an export named 'Background'
// ❌ does not provide an export named 'Controls'
```

**Causa:**
`Background` e `Controls` **NÃO** são exportados do `@vue-flow/core`. Eles vêm de pacotes separados.

**Solução:**
```javascript
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
// ✅ Imports corretos dos pacotes separados
```

**Arquivo:** `src/pages/BoardPage.vue` (linha 63)

**CSS adicionado:**
```scss
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/background/dist/style.css';
```

---

### 3. Erro no Auth Subscription ❌→✅

**Problema:**
```javascript
authSubscription.value.unsubscribe()
// ❌ authSubscription.value.unsubscribe is not a function
```

**Causa:**
A estrutura retornada por `supabase.auth.onAuthStateChange()` é:
```javascript
{
  data: {
    subscription: {
      unsubscribe: Function
    }
  }
}
```

**Solução:**
```javascript
// ANTES (errado)
const { data: subscription } = supabase.auth.onAuthStateChange(...)
authSubscription.value = subscription
// ...
authSubscription.value.unsubscribe() // ❌ não existe

// DEPOIS (correto)
const { data } = supabase.auth.onAuthStateChange(...)
authSubscription.value = data
// ...
authSubscription.value.subscription.unsubscribe() // ✅ existe
```

**Arquivos corrigidos:**
- `src/stores/auth.js` (linha 36-37, 62, 248-249)

---

## Estrutura de Pacotes do Vue Flow

### Pacotes Instalados

```json
{
  "@vue-flow/core": "^1.48.2",
  "@vue-flow/background": "^1.x.x",
  "@vue-flow/controls": "^1.x.x"
}
```

### Imports Corretos

```javascript
// Core (componente principal)
import { VueFlow } from '@vue-flow/core'

// Background (padrão de fundo)
import { Background } from '@vue-flow/background'

// Controls (botões de zoom/pan)
import { Controls } from '@vue-flow/controls'

// Composables (hooks utilitários)
import { useVueFlow, useNodes, useEdges } from '@vue-flow/core'
```

### CSS Necessários

```scss
// Core (obrigatório)
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

// Background (se usar <Background />)
@import '@vue-flow/background/dist/style.css';

// Controls (se usar <Controls />)
@import '@vue-flow/controls/dist/style.css';
```

---

## Checklist de Validação

Execute e confirme:

- [x] Import do `useBoardFlow` corrigido (`src/` prefix)
- [x] Import do `Background` de `@vue-flow/background`
- [x] Import do `Controls` de `@vue-flow/controls`
- [x] CSS do `Background` importado
- [x] CSS do `Controls` importado
- [x] Auth subscription corrigida (`data.subscription.unsubscribe()`)
- [x] 0 erros de linting
- [ ] Board carrega sem erros no navegador
- [ ] Drag & drop funciona

---

## Como Testar

### 1. Limpar Cache do Vite

Se o erro persistir, limpe o cache:

```bash
# Parar o servidor (Ctrl+C)

# Remover cache
rm -rf node_modules/.q-cache
# ou no Windows PowerShell:
Remove-Item -Recurse -Force node_modules/.q-cache

# Reiniciar
npm run dev
```

### 2. Verificar Console

Abra o console do navegador (F12) e verifique:

**Sucesso:**
```
✅ Sessão recuperada: seu@email.com
✅ Perfil carregado: SeuNome
🔔 Auth event: INITIAL_SESSION seu@email.com
```

**Nenhum erro de import ou syntax error**

### 3. Verificar Board

Acesse: `http://localhost:9000/board`

**Deve renderizar:**
- ✅ Fases (colunas) visíveis
- ✅ Posts dentro das fases
- ✅ Controles de zoom (+/-) no canto inferior direito
- ✅ Background pattern

---

## Comparação: Antes vs Depois

### Antes (Errado) ❌

```javascript
// BoardPage.vue
import { VueFlow, Background, Controls } from '@vue-flow/core'  // ❌
import { useBoardFlow } from 'composables/useBoardFlow'          // ❌

// auth.js
const { data: subscription } = supabase.auth.onAuthStateChange(...)
authSubscription.value = subscription
authSubscription.value.unsubscribe()  // ❌
```

### Depois (Correto) ✅

```javascript
// BoardPage.vue
import { VueFlow } from '@vue-flow/core'                         // ✅
import { Background } from '@vue-flow/background'                 // ✅
import { Controls } from '@vue-flow/controls'                     // ✅
import { useBoardFlow } from 'src/composables/useBoardFlow'      // ✅

// auth.js
const { data } = supabase.auth.onAuthStateChange(...)
authSubscription.value = data
authSubscription.value.subscription.unsubscribe()  // ✅
```

---

## Troubleshooting

### Erro persiste após correções?

1. **Limpe o cache do Vite:**
   ```bash
   rm -rf node_modules/.q-cache
   npm run dev
   ```

2. **Force refresh no navegador:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

3. **Reinstale dependências do Vue Flow:**
   ```bash
   npm uninstall @vue-flow/core @vue-flow/background @vue-flow/controls
   npm install @vue-flow/core @vue-flow/background @vue-flow/controls
   ```

4. **Verifique versões compatíveis:**
   ```bash
   npm list @vue-flow/core @vue-flow/background @vue-flow/controls
   ```

---

## Documentação Oficial

- Vue Flow Core: https://vueflow.dev/guide/
- Background: https://vueflow.dev/guide/components/background.html
- Controls: https://vueflow.dev/guide/components/controls.html
- API Reference: https://vueflow.dev/typedocs/

---

**Data:** 02/02/2026  
**Status:** ✅ Corrigido  
**Próximo passo:** Testar o Board no navegador
