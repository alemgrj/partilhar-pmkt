# 🔧 Correção: Logout Frequente

## 🔍 Problema Identificado

O sistema estava deslogando usuários com frequência devido a vários problemas na gestão de sessão:

### Causas Raiz:

1. **Subscription não armazenada**: O `onAuthStateChange` não estava armazenando a subscription, causando vazamento de memória e comportamento inesperado
2. **Parâmetro incorreto**: A função `signIn` estava tentando passar `persistSession` nas options do `signInWithPassword`, mas essa opção não existe no Supabase Auth v2
3. **Falta de renovação proativa**: Não havia verificação periódica da sessão como fallback
4. **Falta de logs**: Difícil debugar sem visibilidade dos eventos de autenticação
5. **Cleanup ausente**: Não havia limpeza das subscriptions ao destruir componentes

---

## ✅ Soluções Implementadas

### 1. **Correção da Store de Autenticação** (`src/stores/auth.js`)

#### A. Armazenamento da Subscription
```javascript
// ANTES (❌ Problema)
supabase.auth.onAuthStateChange(async (event, session) => {
  // ... lógica
})

// DEPOIS (✅ Correto)
const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
  // ... lógica
})
authSubscription.value = subscription
```

**Por quê?** Sem armazenar a subscription, não é possível fazer cleanup, causando múltiplas subscriptions duplicadas e comportamento errático.

---

#### B. Tratamento Completo de Eventos
```javascript
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔔 Auth event:', event, session?.user?.email)

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Token renovado com sucesso
    if (session?.user) {
      user.value = session.user
      await loadProfile()
      console.log('✅ Token atualizado/renovado')
    }
  } else if (event === 'SIGNED_OUT') {
    // Logout
    user.value = null
    profile.value = null
    console.log('👋 Usuário deslogado')
  } else if (event === 'USER_UPDATED') {
    // Dados do usuário atualizados
    if (session?.user) {
      user.value = session.user
      console.log('🔄 Usuário atualizado')
    }
  }
})
```

**Eventos tratados:**
- `SIGNED_IN` - Login realizado
- `SIGNED_OUT` - Logout realizado
- `TOKEN_REFRESHED` - Token renovado (importante!)
- `USER_UPDATED` - Dados do usuário mudaram

---

#### C. Função de Login Corrigida
```javascript
// ANTES (❌ Problema)
async function signIn(email, password, rememberMe = true) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      persistSession: rememberMe, // ❌ Não existe no Supabase v2
    }
  })
}

// DEPOIS (✅ Correto)
async function signIn(email, password, rememberMe = true) {
  // O Supabase já gerencia a persistência através da configuração global
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
}
```

**Por quê?** A persistência é configurada globalmente no `supabase.js`, não por login.

---

#### D. Função de Renovação Manual (Fallback)
```javascript
async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('⚠️ Erro ao renovar sessão:', error)
      return { success: false, error }
    }

    if (session?.user) {
      user.value = session.user
      console.log('✅ Sessão renovada manualmente')
      return { success: true }
    }

    return { success: false }
  } catch (error) {
    console.error('❌ Erro crítico ao renovar sessão:', error)
    return { success: false, error }
  }
}
```

**Por quê?** Fallback caso a renovação automática falhe.

---

#### E. Função de Cleanup
```javascript
function cleanup() {
  if (authSubscription.value) {
    authSubscription.value.unsubscribe()
    authSubscription.value = null
    console.log('🧹 Auth subscription limpa')
  }
}
```

**Por quê?** Previne vazamento de memória ao destruir a store.

---

### 2. **Configuração Aprimorada do Supabase** (`src/boot/supabase.js`)

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // ✅ Persiste sessão
    autoRefreshToken: true,       // ✅ Renova token automaticamente
    detectSessionInUrl: true,     // ✅ Detecta sessão em URL (OAuth)
    storage: window.localStorage, // ✅ Usa localStorage (persiste entre sessões)
    storageKey: 'pmkt-auth-token', // ✅ Chave customizada
    flowType: 'pkce',             // ✅ Fluxo seguro PKCE
  },
  global: {
    headers: {
      'x-client-info': 'pmkt-web', // ✅ Identificação do cliente
    },
  },
})
```

**Configurações importantes:**
- `persistSession: true` - Mantém sessão entre recargas de página
- `autoRefreshToken: true` - Renova token automaticamente antes de expirar
- `localStorage` - Persiste dados entre sessões do navegador
- `flowType: 'pkce'` - Fluxo de autenticação mais seguro

---

### 3. **Verificação Periódica de Sessão** (`src/App.vue`)

```javascript
onMounted(() => {
  authStore.initialize()

  // Verificar sessão a cada 5 minutos como fallback
  sessionCheckInterval = setInterval(
    async () => {
      if (authStore.isAuthenticated) {
        console.log('🔍 Verificação periódica de sessão...')
        await authStore.refreshSession()
      }
    },
    5 * 60 * 1000 // 5 minutos
  )
})

onBeforeUnmount(() => {
  // Limpar interval
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval)
  }

  // Limpar subscription do auth
  authStore.cleanup()
})
```

**Por quê?** 
- Garante que a sessão seja verificada regularmente
- Renova proativamente antes de expirar
- Faz cleanup adequado ao desmontar

---

## 🔍 Sistema de Logs Implementado

Agora o sistema tem logs detalhados para debug:

### Logs de Inicialização:
```
🔧 Supabase inicializado
📍 URL: https://[projeto].supabase.co
✅ Sessão recuperada: user@email.com
```

### Logs de Autenticação:
```
🔔 Auth event: SIGNED_IN user@email.com
✅ Login bem-sucedido: user@email.com
🔐 Sessão persistirá: Sim (localStorage)
```

### Logs de Renovação:
```
🔔 Auth event: TOKEN_REFRESHED user@email.com
✅ Token atualizado/renovado
🔍 Verificação periódica de sessão...
✅ Sessão renovada manualmente
```

### Logs de Logout:
```
🔔 Auth event: SIGNED_OUT
👋 Usuário deslogado
```

### Logs de Erro:
```
❌ Error initializing auth: [erro]
⚠️ Erro ao renovar sessão: [erro]
```

---

## 📊 Ciclo de Vida da Sessão

```
1. USUÁRIO FAZ LOGIN
   ↓
2. Supabase cria sessão com token (expira em 1 hora)
   ↓
3. Sessão é salva no localStorage
   ↓
4. Token é verificado a cada requisição
   ↓
5. [50 minutos depois] Token próximo de expirar
   ↓
6. autoRefreshToken renova automaticamente
   ↓
7. Evento TOKEN_REFRESHED disparado
   ↓
8. Store atualiza user com novo token
   ↓
9. Usuário continua logado sem interrupção
```

---

## 🛠️ Como Monitorar a Sessão

### No Console do Navegador:

```javascript
// Ver sessão atual
const { data: { session } } = await $supabase.auth.getSession()
console.log(session)

// Ver quando o token expira
const expiresAt = new Date(session.expires_at * 1000)
console.log('Token expira em:', expiresAt)

// Ver tempo restante
const timeLeft = session.expires_at * 1000 - Date.now()
console.log('Tempo restante:', Math.floor(timeLeft / 1000 / 60), 'minutos')
```

### Verificar localStorage:

```javascript
// Ver token armazenado
localStorage.getItem('pmkt-auth-token')
```

---

## 🧪 Como Testar

### 1. Teste de Login Persistente:
1. Faça login com "Lembrar de mim" marcado
2. Feche o navegador completamente
3. Reabra e acesse `http://localhost:9000`
4. ✅ Você deve permanecer logado

### 2. Teste de Renovação de Token:
1. Faça login
2. Abra o console do navegador
3. Aguarde 5 minutos
4. Observe os logs: `🔍 Verificação periódica de sessão...`
5. ✅ Sessão deve ser renovada automaticamente

### 3. Teste de Múltiplas Abas:
1. Faça login em uma aba
2. Abra o sistema em outra aba
3. ✅ Ambas devem estar logadas
4. Faça logout em uma aba
5. ✅ Ambas devem deslogar

### 4. Teste de Eventos:
1. Abra o console
2. Faça login
3. Observe: `🔔 Auth event: SIGNED_IN`
4. Aguarde alguns minutos
5. Observe: `🔔 Auth event: TOKEN_REFRESHED`
6. Faça logout
7. Observe: `🔔 Auth event: SIGNED_OUT`

---

## 📋 Checklist de Verificação

- [x] Store de autenticação corrigida
- [x] Subscription armazenada e gerenciada
- [x] Eventos de auth tratados corretamente
- [x] Função de renovação manual implementada
- [x] Cleanup implementado
- [x] Configuração do Supabase otimizada
- [x] Verificação periódica de sessão (App.vue)
- [x] Sistema de logs implementado
- [x] Documentação completa criada

---

## 🚨 Possíveis Problemas Remanescentes

### Se o logout ainda ocorrer:

1. **Verificar console**
   - Procure por erros de rede
   - Veja os logs de auth events
   - Verifique se TOKEN_REFRESHED está sendo disparado

2. **Verificar Supabase Dashboard**
   - Settings → Authentication → Session timeout
   - Deve estar em 3600 segundos (1 hora) ou mais
   - Certifique-se de que "Refresh Token Rotation" está habilitado

3. **Verificar RLS Policies**
   - Se as policies na tabela `users` estiverem bloqueando, o `loadProfile()` pode falhar
   - Isso causaria logout

4. **Limpar cache**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```
   - Recarregue e faça login novamente

5. **Verificar CORS**
   - Se houver problemas de CORS, as requisições de renovação podem falhar

---

## 🎯 Próximos Passos Opcionais

### 1. Notificação de Renovação (Opcional)
Adicionar notificação visual quando o token for renovado:

```javascript
if (event === 'TOKEN_REFRESHED') {
  $q.notify({
    type: 'info',
    message: 'Sessão renovada',
    position: 'bottom-right',
    timeout: 2000,
    icon: 'refresh',
  })
}
```

### 2. Aviso de Sessão Próxima a Expirar (Opcional)
Avisar usuário 5 minutos antes de expirar:

```javascript
// Em App.vue
const checkTokenExpiration = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const timeLeft = session.expires_at * 1000 - Date.now()
    if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
      $q.notify({
        type: 'warning',
        message: 'Sua sessão está prestes a expirar. Salvando dados...',
        timeout: 5000,
      })
    }
  }
}
```

### 3. Página de Debug de Sessão (Opcional)
Criar uma página admin para monitorar sessão em tempo real.

---

## 📚 Referências

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Auth Client](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Session Management Best Practices](https://supabase.com/docs/guides/auth/sessions)

---

**Última atualização:** 02/02/2026
**Status:** ✅ Implementado e Testado
