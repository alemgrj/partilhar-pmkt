# 🐛 Guia de Debug de Sessão

## 📍 Acesso

A página de debug de sessão está disponível apenas para **administradores** em:

```
http://localhost:9000/debug/session
```

## 🎯 Para que serve?

Esta página permite monitorar em tempo real o estado da autenticação e diagnosticar problemas de logout frequente.

---

## 📊 Informações Disponíveis

### 1. **Status da Sessão**
- Se está autenticado
- Email do usuário
- ID do usuário
- Perfil (Admin/User)
- Papel (Role) atribuído

### 2. **Informações do Token**
- Tempo até expiração (atualizado em tempo real)
- Data/hora de expiração
- Data de criação
- Última atualização
- Cores indicativas:
  - 🟢 Verde: Token saudável (>15 min)
  - 🟡 Amarelo: Atenção (5-15 min)
  - 🟠 Laranja: Crítico (<5 min)
  - 🔴 Vermelho: Expirado

### 3. **Storage**
- Presença no localStorage
- Presença no sessionStorage
- Storage key utilizada

### 4. **Log de Eventos**
Histórico dos últimos 10 eventos de autenticação:
- `SIGNED_IN` - Login
- `SIGNED_OUT` - Logout
- `TOKEN_REFRESHED` - Token renovado
- `USER_UPDATED` - Dados atualizados

### 5. **Dados Brutos**
JSON completo da sessão do Supabase para análise técnica.

---

## 🛠️ Ações Disponíveis

### Renovar Sessão
Força a renovação manual do token.

**Quando usar:**
- Token está próximo de expirar
- Testar se a renovação está funcionando
- Após mudanças no código de autenticação

### Limpar Storage
Remove todos os dados do localStorage e sessionStorage.

**⚠️ ATENÇÃO:** Isso irá deslogar o usuário!

**Quando usar:**
- Sessão está corrompida
- Dados antigos causando problemas
- Após atualização do sistema de auth

### Verificar Sessão
Recarrega as informações da sessão atual.

**Quando usar:**
- Após ações que modificam a sessão
- Para ver dados atualizados

### Forçar Reload Profile
Recarrega o perfil do usuário do banco de dados.

**Quando usar:**
- Perfil não carregou corretamente
- Dados desatualizados
- Após mudanças no banco

---

## 🔍 Como Diagnosticar Problemas

### Problema: "Estou sendo deslogado frequentemente"

#### 1. Verifique o tempo de expiração do token
- Acesse `/debug/session`
- Veja "Token expira em"
- Se expirar muito rápido (< 30 min), há um problema

**Possível causa:**
- Configuração incorreta no Supabase
- Token não está sendo renovado

**Solução:**
- Verifique o console (F12) se há erros
- Procure por eventos `TOKEN_REFRESHED` no log
- Se não houver, o autoRefresh não está funcionando

---

#### 2. Verifique o Log de Eventos
- Procure por eventos `SIGNED_OUT` não esperados
- Se houver muitos `SIGNED_OUT` sem você ter clicado em logout:

**Possível causa:**
- Token expirou e não foi renovado
- Erro de rede impedindo renovação
- RLS policy bloqueando `loadProfile()`

**Solução:**
- Abra o console (F12) e veja os erros
- Verifique a aba Network se há requisições falhando (status 401, 403, 500)

---

#### 3. Verifique o Storage
- Ambos localStorage e sessionStorage devem estar "Presente"
- Se estiverem "Ausente":

**Possível causa:**
- Storage foi limpo manualmente
- Navegador em modo privado
- Extensões bloqueando storage

**Solução:**
- Desabilite modo privado
- Desabilite extensões que bloqueiam cookies/storage
- Tente outro navegador

---

#### 4. Monitore em Tempo Real
1. Abra `/debug/session`
2. Deixe aberto por 10-15 minutos
3. Observe:
   - O tempo até expiração está diminuindo?
   - Quando chegar perto de zero, o token renova automaticamente?
   - Aparece evento `TOKEN_REFRESHED` no log?

**Se o token NÃO renovar:**
- Há um problema com `autoRefreshToken`
- Verifique console por erros
- Teste o botão "Renovar Sessão" manualmente

---

### Problema: "Não consigo fazer login"

#### 1. Verifique os dados brutos
- Role até "Dados Brutos da Sessão"
- Se estiver vazio `{}`:

**Possível causa:**
- Credenciais incorretas
- Email não confirmado
- Erro no Supabase

**Solução:**
- Verifique o console (F12)
- Confirme o email se for conta nova
- Verifique o Supabase Dashboard → Authentication → Users

---

#### 2. Se a sessão existe mas perfil não carrega

**Possível causa:**
- Tabela `users` não foi criada
- RLS policy bloqueando leitura
- User não tem entrada na tabela `users`

**Solução:**
- Execute as migrações SQL
- Verifique as RLS policies
- Crie entrada manual na tabela `users`

---

### Problema: "Token renova mas ainda sou deslogado"

**Possível causa:**
- `loadProfile()` está falhando
- RLS policy bloqueando
- Tabela `users` com dados corrompidos

**Como verificar:**
1. Abra console (F12)
2. Aguarde o evento `TOKEN_REFRESHED`
3. Veja se há erro logo após

**Solução:**
- Verifique políticas RLS da tabela `users`
- Execute `fix-policies.sql`
- Verifique se seu usuário tem entrada válida em `users`

---

## 📈 Casos de Uso

### Desenvolvimento

```javascript
// Testar renovação
1. Faça login
2. Abra /debug/session
3. Aguarde token ficar amarelo
4. Clique "Renovar Sessão"
5. Verifique se funcionou
```

### Produção (Remover!)

⚠️ **Esta página NÃO deve estar disponível em produção!**

Para remover antes de deploy:

1. Delete o arquivo `src/pages/SessionDebugPage.vue`
2. Remova a rota em `src/router/routes.js`:
```javascript
// Remover esta rota:
{
  path: 'debug/session',
  component: () => import('pages/SessionDebugPage.vue'),
  meta: { requiresAdmin: true },
},
```

---

## 🎨 Interface

### Cores

**Verde** 🟢
- Sessão saudável
- Storage presente
- Autenticado

**Amarelo/Laranja** 🟡🟠
- Token próximo de expirar
- Atenção necessária

**Vermelho** 🔴
- Token expirado
- Não autenticado
- Storage ausente

**Azul** 🔵
- Informações gerais
- Eventos normais

**Roxo** 🟣
- Eventos de refresh/renovação

---

## 💡 Dicas

### Dica 1: Console ao lado
Mantenha o console (F12) aberto junto com `/debug/session` para correlacionar logs e eventos.

### Dica 2: Múltiplas abas
Abra `/debug/session` em duas abas e veja se eventos em uma refletem na outra (deveriam).

### Dica 3: Network tab
Use a aba Network do DevTools para ver todas as requisições ao Supabase.

### Dica 4: Teste de stress
Deixe a página aberta por 1-2 horas para verificar estabilidade a longo prazo.

---

## 📊 Interpretando os Logs

### Log Normal (Tudo OK)
```
[Info] Debug page iniciada
[Success] Sessão recuperada
[Refresh] Auth Event: TOKEN_REFRESHED  ← Esse deve aparecer ~50min depois
[Success] Token atualizado/renovado
[Refresh] Auth Event: TOKEN_REFRESHED  ← E novamente...
```

### Log com Problema
```
[Info] Debug page iniciada
[Success] Sessão recuperada
... 55 minutos depois, NADA ...
[Info] Auth Event: SIGNED_OUT  ← ❌ Não deveria!
[Warning] Nenhuma sessão ativa encontrada
```

Se você ver o segundo padrão, há um problema com a renovação automática.

---

## 🆘 Suporte

Se após usar esta página você ainda tiver problemas:

1. **Capture um screenshot** da página de debug
2. **Copie os logs** do console (F12)
3. **Copie o JSON** dos "Dados Brutos"
4. **Anote os horários** de quando ocorrem os logouts

Com essas informações, será possível diagnosticar o problema com precisão.

---

## 🔗 Ver Também

- `FIX-LOGOUT-FREQUENTE.md` - Documentação completa das correções
- `README.md` - Documentação geral do projeto
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Última atualização:** 02/02/2026
