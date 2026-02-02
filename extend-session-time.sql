-- ====================================================
-- EXTENSÃO DO TEMPO DE SESSÃO (7 DIAS)
-- ====================================================
-- Execute este SQL no Supabase SQL Editor para aumentar
-- o tempo de duração dos tokens JWT de autenticação
-- 
-- ⚠️ ATENÇÃO: Isso mantém usuários logados por até 7 dias
-- Use apenas em ambientes onde segurança não é crítica
-- ====================================================

-- Este arquivo configura o tempo de expiração do JWT
-- NOTA: Esta configuração deve ser feita via Dashboard do Supabase
-- Não é possível alterar via SQL

-- ====================================================
-- INSTRUÇÕES PARA CONFIGURAR NO SUPABASE DASHBOARD:
-- ====================================================

/*

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJETO]

2. No menu lateral, clique em "Authentication"

3. Clique na aba "Settings"

4. Role até "Security and Authentication"

5. Encontre "JWT Expiry" (em segundos)
   
   Valores disponíveis:
   - 3600    = 1 hora (padrão)
   - 86400   = 24 horas (1 dia)
   - 604800  = 7 dias (recomendado)
   - 2592000 = 30 dias (máximo recomendado)

6. Digite: 604800 (para 7 dias)

7. Clique em "Save"

8. ✅ Pronto! Agora os tokens duram 7 dias


IMPORTANTE:
- Depois de alterar, faça logout e login novamente
- Tokens antigos ainda terão o tempo antigo
- Novos logins usarão o novo tempo

*/

-- ====================================================
-- VERIFICAÇÃO: Como saber se está funcionando
-- ====================================================

/*

No console do navegador (F12), execute:

// Ver sessão atual
const { data: { session } } = await supabase.auth.getSession()

// Ver quando expira (em data legível)
console.log('Token expira em:', new Date(session.expires_at * 1000))

// Ver quantos dias faltam
const diasRestantes = Math.floor((session.expires_at * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
console.log('Dias até expirar:', diasRestantes)

*/

-- ====================================================
-- ALTERNATIVA: Refresh Token Rotation
-- ====================================================

/*

Se você quiser que a sessão seja "infinita" enquanto houver atividade:

1. No Supabase Dashboard → Authentication → Settings

2. Ative "Refresh Token Rotation"

3. Configure "Refresh Token Reuse Interval" para 30 (segundos)

Isso faz com que cada atividade renove o token automaticamente,
mantendo o usuário logado indefinidamente enquanto usar o sistema.

*/

-- ====================================================
-- CONFIGURAÇÕES ADICIONAIS (OPCIONAL)
-- ====================================================

/*

Para máxima persistência de sessão:

1. JWT Expiry: 604800 (7 dias)
2. Refresh Token Rotation: ENABLED
3. Refresh Token Reuse Interval: 30 segundos
4. Auto Refresh Token: ON (já configurado no código)

Com essas configurações:
- Token dura 7 dias
- Se o usuário usar o sistema, renova automaticamente
- Sessão só expira após 7 dias SEM USO

*/

-- ====================================================
-- NOTAS DE SEGURANÇA
-- ====================================================

/*

⚠️ Este é um sistema interno sem dados sensíveis
⚠️ Se isso mudar no futuro, reduza o JWT Expiry

Riscos de sessões longas:
- Se alguém roubar o token, tem acesso por 7 dias
- Usuários podem esquecer de fazer logout

Mitigações:
- Use apenas em rede confiável
- Implemente 2FA se adicionar dados sensíveis
- Monitore acessos suspeitos

*/

-- ====================================================

SELECT 'Configuração deve ser feita no Supabase Dashboard' as instrucao,
       'Authentication → Settings → JWT Expiry = 604800' as caminho;
