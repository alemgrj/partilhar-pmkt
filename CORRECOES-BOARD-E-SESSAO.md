# ✅ Correções: Board + Sessão Persistente

## 🎯 Problemas Corrigidos

### 1. ❌ Board não atualizava visualmente após drag & drop
**Causa:** O `updateStatus` não estava carregando os dados completos do post (criativos, tags, usuários relacionados)

**Solução:** Modificado `updatePost()` em `src/stores/posts.js` para:
1. Fazer o UPDATE no banco
2. Fazer um SELECT completo com todos os relacionamentos
3. Substituir o post inteiro no array (não fazer merge)

**Resultado:** ✅ Board atualiza INSTANTANEAMENTE ao arrastar posts entre colunas

---

### 2. ❌ Sistema deslogando com frequência
**Causa:** Múltiplos fatores
- Token expirando em 1 hora (padrão Supabase)
- Verificações muito frequentes (5 minutos)
- Configuração não otimizada

**Soluções:**

#### A. Redução de Verificações Periódicas
- **Antes:** Verificava sessão a cada 5 minutos
- **Agora:** Verifica a cada 30 minutos
- **Por quê:** Token vai durar 7 dias, então 30 min é mais que suficiente

#### B. Configuração do Supabase (VOCÊ PRECISA FAZER)
- **JWT Expiry:** Mudar de `3600` para `604800` (7 dias)
- **Refresh Token Rotation:** Ativar
- **Reuse Interval:** 30 segundos

---

## 📁 Arquivos Modificados

### 1. `src/stores/posts.js`
```javascript
// ANTES (❌ Problema)
async function updatePost(id, updates) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  // Mergeava com dados antigos (incompletos)
  posts.value[index] = { ...posts.value[index], ...data }
}

// DEPOIS (✅ Correto)
async function updatePost(id, updates) {
  // 1. Atualiza no banco
  await supabase.from('posts').update(updates).eq('id', id)
  
  // 2. Busca dados COMPLETOS com relacionamentos
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      created_by_user:created_by(id, name, avatar_url),
      responsible_user:responsible_user_id(id, name, avatar_url),
      post_creatives(*),
      post_tags(*)
    `)
    .eq('id', id)
    .single()
  
  // 3. Substitui o post inteiro
  posts.value[index] = data
}
```

**Efeito:** Board atualiza sem precisar de reload!

---

### 2. `src/App.vue`
```javascript
// ANTES
setInterval(() => {
  await authStore.refreshSession()
}, 5 * 60 * 1000) // 5 minutos ❌ Muito frequente

// DEPOIS
setInterval(() => {
  await authStore.refreshSession()
}, 30 * 60 * 1000) // 30 minutos ✅ Menos overhead
```

**Efeito:** Menos requisições desnecessárias ao servidor

---

## 📄 Arquivos Criados

### 1. `CONFIGURAR-SESSAO-LONGA.md`
- Guia passo a passo com screenshots
- Como configurar JWT Expiry no Supabase
- Como verificar se está funcionando
- Troubleshooting completo

### 2. `extend-session-time.sql`
- Documentação SQL das configurações
- Instruções alternativas
- Notas de segurança

### 3. `CORRECOES-BOARD-E-SESSAO.md` (este arquivo)
- Resumo técnico das mudanças

---

## 🚀 Como Testar

### Teste 1: Board Atualiza Instantaneamente

1. Acesse `http://localhost:9000/board`
2. Arraste um post de "Ideias" para "Em Produção"
3. ✅ O post deve aparecer imediatamente na nova coluna
4. ❌ **Não deve precisar** dar F5/reload

**Se não funcionar:**
- Abra console (F12)
- Veja se há erros
- Verifique se as migrations foram executadas

---

### Teste 2: Sessão Persiste por 7 Dias

**IMPORTANTE:** Você precisa **PRIMEIRO** configurar o Supabase!

1. **Configure o Supabase** (veja `CONFIGURAR-SESSAO-LONGA.md`)
   - JWT Expiry = 604800
   - Refresh Token Rotation = ON

2. **Faça logout e login novamente**
   - Tokens antigos mantêm tempo antigo
   - Precisa criar um token novo

3. **Verifique o tempo**
   - Acesse `/debug/session`
   - Veja "Token expira em"
   - Deve mostrar ~7 dias

4. **Teste persistência**
   - Deixe o sistema aberto por 2-3 horas
   - ✅ Não deve deslogar
   - ❌ Antes deslogaria em ~1 hora

---

## 📊 Antes vs Depois

### Board de Produção

| Situação                   | Antes                        | Depois                   |
| -------------------------- | ---------------------------- | ------------------------ |
| Drag post entre colunas    | Atualiza só após F5          | Atualiza instantaneamente |
| Criativos aparecem         | ❌ Às vezes sumiram          | ✅ Sempre aparecem       |
| Tags aparecem              | ❌ Às vezes sumiram          | ✅ Sempre aparecem       |
| Performance                | 2 queries (update + cache)   | 2 queries (update + select completo) |

### Sessão de Autenticação

| Configuração               | Antes                        | Depois                   |
| -------------------------- | ---------------------------- | ------------------------ |
| Tempo de token             | 1 hora (3600s)               | **7 dias (604800s)**     |
| Verificação periódica      | A cada 5 minutos             | A cada 30 minutos        |
| Renovação automática       | ✅ Sim                       | ✅ Sim                   |
| Persistência localStorage  | ✅ Sim                       | ✅ Sim                   |
| Experiência do usuário     | ❌ Desloga frequentemente    | ✅ Fica logado por dias  |

---

## 🎯 Próximos Passos

### VOCÊ PRECISA FAZER:

1. ✅ **Testar o Board** (já deve funcionar)
   - Arraste posts entre colunas
   - Verifique se atualiza sem reload

2. ⚠️ **Configurar Supabase** (OBRIGATÓRIO para sessão longa)
   - Siga `CONFIGURAR-SESSAO-LONGA.md`
   - Altere JWT Expiry para 604800
   - Ative Refresh Token Rotation
   - Faça logout e login novamente

3. ✅ **Verificar se funciona**
   - Acesse `/debug/session`
   - Veja se token expira em ~7 dias
   - Deixe aberto por algumas horas
   - Confirme que não desloga

---

## 🐛 Se Algo Não Funcionar

### Board não atualiza:
1. Abra console (F12)
2. Veja erros ao arrastar
3. Verifique Network tab (requisições falhando?)
4. Execute as migrations se ainda não fez

### Ainda está deslogando:
1. **Você configurou o Supabase?**
   - Sem isso, nada muda!
   - Token continua 1 hora
   
2. **Fez logout/login depois?**
   - Tokens antigos mantêm tempo antigo
   - Precisa gerar token novo

3. **Verifique `/debug/session`**
   - Veja quanto tempo falta para expirar
   - Se mostrar < 2 horas, configuração não funcionou

4. **Console mostra erros?**
   - Erros 401/403 = problema de RLS
   - Erros de rede = problema de conexão
   - Sem eventos TOKEN_REFRESHED = problema de renovação

---

## 📚 Documentação Relacionada

- `CONFIGURAR-SESSAO-LONGA.md` - **LEIA PRIMEIRO!**
- `FIX-LOGOUT-FREQUENTE.md` - Correções anteriores
- `SESSION-DEBUG-GUIDE.md` - Como usar `/debug/session`
- `README.md` - Documentação geral

---

## ✅ Checklist Final

- [x] Board atualiza instantaneamente (código corrigido)
- [x] Verificação periódica reduzida (30 min)
- [x] Documentação criada
- [ ] **Você precisa:** Configurar JWT Expiry no Supabase
- [ ] **Você precisa:** Fazer logout e login novamente
- [ ] **Você precisa:** Verificar que funciona

---

**Última atualização:** 02/02/2026
**Status:** ✅ Código corrigido | ⚠️ Aguardando configuração do Supabase
