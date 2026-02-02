# 🚀 Guia de Setup - PMkt

Este guia contém as instruções completas para configurar o ambiente e começar a usar o PMkt.

## ✅ Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git instalado

## 📋 Passo a Passo

### 1. Configurar o Supabase

#### 1.1 Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: PMkt (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte (guarde-a)
   - **Region**: Escolha a mais próxima de você
5. Clique em "Create new project" e aguarde (leva ~2 minutos)

#### 1.2 Executar o Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase-schema.sql` deste projeto
4. Copie **TODO** o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a execução (deve aparecer "Success")

#### 1.3 Configurar o Storage

1. No dashboard do Supabase, vá em **Storage** (menu lateral)
2. Clique em **Create a new bucket**
3. Preencha:
   - **Name**: `post-creatives`
   - **Public bucket**: Marque a opção (para permitir acesso público aos arquivos)
4. Clique em **Create bucket**
5. Entre no bucket criado
6. Clique em **Policies** (no topo)
7. Adicione as seguintes policies:

**Policy 1: Upload de arquivos**
```sql
CREATE POLICY "Authenticated users can upload creatives"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-creatives');
```

**Policy 2: Visualização de arquivos**
```sql
CREATE POLICY "Authenticated users can view creatives"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'post-creatives');
```

**Policy 3: Deletar arquivos**
```sql
CREATE POLICY "Users can delete own creatives"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-creatives');
```

#### 1.4 Obter Credenciais do Supabase

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (algo como: https://xxxxx.supabase.co)
   - **anon/public key** (chave longa que começa com "eyJ...")

### 2. Configurar o Projeto

#### 2.1 Instalar Dependências

```bash
npm install
```

#### 2.2 Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Abra o arquivo `.env` e preencha com suas credenciais:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Executar o Projeto

```bash
npm run dev
```

O projeto abrirá automaticamente no navegador em `http://localhost:9000` (ou outra porta disponível).

### 4. Criar Primeiro Usuário

1. Na tela de login, clique em **"Criar nova conta"**
2. Preencha:
   - **Email**: Seu email
   - **Senha**: Mínimo 6 caracteres
   - **Nome**: Seu nome
3. Clique em **"Criar Conta"**
4. Verifique seu email e clique no link de confirmação

### 5. Tornar Usuário Admin (Opcional)

Por padrão, novos usuários são criados com perfil "user". Para tornar um usuário admin:

1. No dashboard do Supabase, vá em **Table Editor** > **users**
2. Encontre o usuário criado
3. Clique na linha para editar
4. Altere o campo `role` de `user` para `admin`
5. Salve

Admins têm permissões especiais:
- Aprovar/rejeitar posts
- Deletar posts
- Ver estatísticas completas

## 🎉 Pronto!

Agora você pode:
- ✅ Criar postagens no Board
- ✅ Visualizar no Calendário
- ✅ Aprovar/solicitar ajustes
- ✅ Fazer upload de criativos
- ✅ Adicionar comentários
- ✅ Ver métricas no Dashboard

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Lint
npm run lint

# Format
npm run format

# Preview do build
npm run preview
```

## 🐛 Problemas Comuns

### Erro: "Invalid API key"
- Verifique se copiou corretamente as credenciais do Supabase no `.env`
- Certifique-se de que não há espaços extras

### Erro: "relation 'posts' does not exist"
- O schema SQL não foi executado corretamente
- Volte ao passo 1.2 e execute novamente

### Erro ao fazer upload de arquivos
- Verifique se o bucket `post-creatives` foi criado
- Verifique se as policies foram configuradas corretamente
- Certifique-se de que o bucket está marcado como "public"

### Página em branco após login
- Abra o console do navegador (F12) e verifique erros
- Verifique se todas as dependências foram instaladas (`npm install`)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console (F12 no navegador)
2. Verifique os logs do terminal onde está rodando `npm run dev`
3. Certifique-se de que seguiu todos os passos corretamente

## 📚 Recursos Adicionais

- [Documentação do Quasar](https://quasar.dev)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vue 3](https://vuejs.org)
