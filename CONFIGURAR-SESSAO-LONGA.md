# 🔐 Configurar Sessão de 7 Dias (ou mais)

## 🎯 Objetivo

Manter usuários logados por **7 dias** sem deslogar automaticamente.

---

## ⚡ Passo a Passo RÁPIDO

### 1. Acesse o Supabase Dashboard

```
https://supabase.com/dashboard/project/[SEU_PROJETO]/settings/auth
```

### 2. Configure JWT Expiry

1. No menu lateral: **Authentication** → **Settings**
2. Role até **"JWT Settings"**
3. Encontre **"JWT expiry limit"**
4. Altere de `3600` para `604800` (7 dias)
5. Clique em **"Save"**

![JWT Settings](https://i.imgur.com/exemplo.png)

### 3. Ative Refresh Token Rotation

1. Ainda em **Authentication → Settings**
2. Role até **"Refresh Token Rotation"**
3. **Ative** o toggle
4. Configure **"Refresh Token Reuse Interval"**: `30` segundos
5. Clique em **"Save"**

### 4. Faça Logout e Login Novamente

- Os tokens antigos ainda expiram no tempo antigo
- Faça **logout completo** do sistema
- Faça **login novamente**
- ✅ Agora o token durará 7 dias!

---

## 📊 Valores de JWT Expiry

| Valor    | Tempo       | Uso Recomendado                    |
| -------- | ----------- | ---------------------------------- |
| 3600     | 1 hora      | Padrão (dados sensíveis)           |
| 86400    | 1 dia       | Aplicações internas                |
| **604800** | **7 dias** | **Seu caso (sem dados sensíveis)** |
| 2592000  | 30 dias     | Máximo recomendado                 |

---

## 🔍 Como Verificar se Está Funcionando

### Opção 1: Página de Debug

1. Acesse: `http://localhost:9000/debug/session`
2. Veja "Token expira em"
3. Deve mostrar **~7 dias** (ou ~168 horas)

### Opção 2: Console do Navegador

Abra o console (F12) e execute:

```javascript
// Ver sessão
const {
  data: { session },
} = await supabase.auth.getSession()

// Ver quando expira
console.log('Expira em:', new Date(session.expires_at * 1000))

// Ver dias restantes
const dias = Math.floor((session.expires_at * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
console.log('Dias até expirar:', dias)
```

**Resultado esperado:**
```
Expira em: Mon Feb 09 2026 15:30:00 GMT-0300
Dias até expirar: 7
```

---

## ✅ Configurações Implementadas no Código

Já foram implementadas automaticamente:

- ✅ `persistSession: true` - Salva sessão no localStorage
- ✅ `autoRefreshToken: true` - Renova token automaticamente
- ✅ Verificação a cada 30 minutos (fallback)
- ✅ Listener de eventos de renovação
- ✅ Storage persistente

**Você só precisa configurar o Supabase Dashboard!**

---

## 🎯 Resultado Final

Com as configurações corretas:

### ✅ Se o usuário USA o sistema regularmente:
```
Dia 1: Token válido por 7 dias
Dia 3: Token renovado automaticamente → válido por +7 dias
Dia 6: Token renovado automaticamente → válido por +7 dias
...
= SESSÃO INFINITA (enquanto houver uso)
```

### ⏰ Se o usuário NÃO USA o sistema:
```
Dia 1: Token válido por 7 dias
Dia 7: Token expira → LOGOUT
```

---

## 🐛 Troubleshooting

### Problema: Ainda está deslogando

#### Verifique:

1. **JWT Expiry foi salvo?**
   - Volte ao Dashboard
   - Confirme que está `604800`
   - Se não salvou, tente novamente

2. **Fez logout/login depois da mudança?**
   - Tokens antigos mantém o tempo antigo
   - Você DEVE fazer logout e login novo

3. **Navegador em modo privado?**
   - Modo privado limpa localStorage ao fechar
   - Use navegador normal

4. **Extensões bloqueando?**
   - Desabilite extensões de privacidade
   - Tente em navegador limpo

5. **Verifique o console**
   - Abra F12 → Console
   - Procure erros vermelhos
   - Veja se `TOKEN_REFRESHED` aparece

### Problema: "Não encontro JWT Expiry"

O caminho no Supabase mudou:

**Tente:**
- Authentication → **Policies** → JWT Expiry
- Settings → **API** → Auth Settings → JWT Expiry
- Project Settings → **Auth** → JWT Expiry

**A localização varia por versão do Supabase!**

---

## 🔒 Sobre Segurança

### Por que 7 dias é seguro NESTE CASO:

✅ **Sistema interno de marketing**
✅ **Sem dados financeiros**
✅ **Sem informações pessoais sensíveis**
✅ **Usuários conhecidos e confiáveis**

### Se no futuro você adicionar:

❌ Pagamentos
❌ Dados pessoais (CPF, endereço)
❌ Informações confidenciais

**→ Reduza o JWT Expiry para 3600 (1 hora)**

---

## 📝 Resumo - Lista de Checagem

- [ ] Acessei Supabase Dashboard
- [ ] Alterei JWT Expiry para `604800`
- [ ] Ativei Refresh Token Rotation
- [ ] Configurei Reuse Interval para `30`
- [ ] Salvei as configurações
- [ ] Fiz logout do sistema
- [ ] Fiz login novamente
- [ ] Verifiquei que o token expira em ~7 dias
- [ ] Testei deixar aberto por algumas horas
- [ ] ✅ Não deslogou!

---

## 🎉 Pronto!

Seu sistema agora mantém usuários logados por **até 7 dias**, e se eles usarem regularmente, a sessão **nunca expira**!

Se tiver qualquer problema, acesse:
- `/debug/session` no sistema
- Console do navegador (F12)
- E me envie os logs/screenshots

---

**Última atualização:** 02/02/2026
