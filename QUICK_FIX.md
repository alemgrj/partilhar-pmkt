# 🔧 Correção Rápida - Erros de Setup

## ❌ Erros Identificados

1. **Erro 500**: Tabela `users` não existe
2. **Bucket not found**: Storage não configurado

---

## ✅ Solução Passo a Passo

### 1️⃣ Executar o Schema SQL no Supabase

**IMPORTANTE**: Este passo é OBRIGATÓRIO e deve ser feito primeiro!

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Abra o arquivo `supabase-schema.sql` deste projeto
5. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
6. Cole no SQL Editor do Supabase
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde alguns segundos até aparecer "Success. No rows returned"

**Verificar se funcionou:**
```sql
-- Execute esta query para verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deve retornar: `users`, `posts`, `post_creatives`, `post_comments`, `post_tags`

---

### 2️⃣ Criar o Bucket de Storage

1. No dashboard do Supabase, vá em **Storage** (menu lateral)
2. Clique em **Create a new bucket**
3. Preencha:
   - **Name**: `post-creatives`
   - **Public bucket**: ✅ MARQUE ESTA OPÇÃO (importante!)
4. Clique em **Create bucket**

**Verificar se funcionou:**
- O bucket `post-creatives` deve aparecer na lista

---

### 3️⃣ Configurar Policies do Storage

1. Entre no bucket `post-creatives` que você acabou de criar
2. Clique na aba **Policies** (no topo)
3. Clique em **New Policy**
4. Selecione **For full customization**
5. Cole as policies abaixo, uma por vez:

#### Policy 1: Upload (INSERT)
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-creatives');
```

#### Policy 2: Visualização (SELECT)
```sql
CREATE POLICY "Public can view uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-creatives');
```

#### Policy 3: Deletar (DELETE)
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-creatives');
```

**OU** execute todas de uma vez no SQL Editor:

```sql
-- Policies para o bucket post-creatives

-- Upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-creatives');

-- Visualização
CREATE POLICY "Public can view uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-creatives');

-- Deletar
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-creatives');
```

---

### 4️⃣ Verificar Configuração

Execute estas queries no SQL Editor para verificar tudo:

```sql
-- 1. Verificar se tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar se trigger de usuário existe
SELECT * FROM auth.users LIMIT 1;

-- 3. Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

### 5️⃣ Criar seu Primeiro Usuário

1. **Faça logout** se estiver logado
2. Na tela de login, clique em **"Criar nova conta"**
3. Preencha:
   - Email: seu email
   - Senha: mínimo 6 caracteres
   - Nome: seu nome
4. Clique em **"Criar Conta"**
5. Verifique seu email e clique no link de confirmação
6. Volte ao app e faça login

---

### 6️⃣ Tornar-se Admin

Execute no SQL Editor do Supabase:

```sql
-- Substitua alemg_rj@yahoo.com.br pelo seu email
UPDATE public.users 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'alemg_rj@yahoo.com.br'
);
```

Depois faça **logout e login** novamente para atualizar as permissões.

---

### 7️⃣ Testar Upload

1. Acesse **Nova Postagem** no menu
2. Selecione uma rede social (ex: Instagram)
3. Escolha o tipo de criativo (ex: Carrossel)
4. Arraste algumas imagens
5. Deve fazer upload com sucesso!

---

## 🆘 Troubleshooting

### Erro persiste após executar SQL?
- Verifique se você está no projeto correto do Supabase
- Confirme que a URL do `.env` corresponde ao projeto
- Tente executar o SQL novamente

### Upload ainda não funciona?
- Verifique se o bucket é **público**
- Confirme que as policies foram criadas
- Teste fazer upload de um arquivo manualmente no dashboard do Supabase

### Erro 500 ao carregar perfil?
- Execute a query de verificação de tabelas
- Confirme que a tabela `users` existe
- Verifique se o trigger `on_auth_user_created` existe

### Como verificar se está tudo OK?
Execute no SQL Editor:
```sql
-- Deve retornar TRUE para todas
SELECT 
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as users_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') as posts_exists,
  EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') as trigger_exists;
```

---

## 📞 Ainda com problemas?

Se após seguir todos os passos ainda houver erros:

1. Abra o console do navegador (F12)
2. Vá na aba **Network**
3. Tente fazer a ação que dá erro
4. Veja qual request falhou
5. Clique nela e veja a resposta (Response tab)
6. Me mostre o erro específico

---

## ✅ Checklist

Marque conforme for completando:

- [ ] Schema SQL executado com sucesso
- [ ] Tabelas criadas (users, posts, etc)
- [ ] Bucket `post-creatives` criado como público
- [ ] Policies do Storage configuradas
- [ ] Usuário criado e confirmado por email
- [ ] Role `admin` atribuído
- [ ] Testado upload de arquivo com sucesso

Quando todos estiverem marcados, o sistema estará 100% funcional! 🎉
