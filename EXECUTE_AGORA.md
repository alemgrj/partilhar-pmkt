# 🚨 EXECUTE AGORA NO SUPABASE

## ⚠️ PROBLEMA ATUAL

Você está tendo erro de **"infinite recursion"** porque as policies do banco estão incorretas.

---

## ✅ SOLUÇÃO - Execute estes 2 arquivos SQL na ordem:

### 1️⃣ PRIMEIRO: `fix-policies.sql`

Este arquivo corrige o erro de recursão infinita.

**Como executar:**
1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Entre no seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `fix-policies.sql` deste projeto
6. Copie **TODO** o conteúdo
7. Cole no SQL Editor
8. Clique em **Run** (ou Ctrl+Enter)
9. Aguarde aparecer "Success"

### 2️⃣ SEGUNDO: `campaigns-migration.sql`

Este arquivo cria a tabela de campanhas.

**Como executar:**
1. No mesmo SQL Editor do Supabase
2. Clique em **New Query** novamente
3. Abra o arquivo `campaigns-migration.sql` deste projeto
4. Copie **TODO** o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou Ctrl+Enter)
7. Aguarde aparecer "Success"

### 3️⃣ VERIFICAR: Se deu certo

Execute esta query no SQL Editor:

```sql
-- Verificar se está tudo OK
SELECT 
  tablename, 
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

Deve retornar algo como:
```
campaigns   | 4
posts       | 3
users       | 2
...
```

---

## 🪣 CRIAR BUCKET DE STORAGE

Depois de executar os SQLs acima, crie o bucket:

1. No Supabase Dashboard, vá em **Storage** (menu lateral)
2. Clique em **Create a new bucket**
3. Preencha:
   - **Name**: `post-creatives`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO**
4. Clique em **Create bucket**

### Configurar Policies do Bucket

No SQL Editor, execute:

```sql
-- Policies para o bucket post-creatives

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-creatives');

CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-creatives');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-creatives');
```

---

## 🔄 DEPOIS DE EXECUTAR TUDO

1. **Faça logout** da aplicação (se estiver logado)
2. **Recarregue** a página (F5)
3. **Faça login** novamente
4. Tudo deve funcionar perfeitamente! 🎉

---

## ✅ O QUE FOI ADICIONADO

### 1. Preview nos Detalhes da Postagem
- ✅ Preview nativo igual ao de criar postagem
- ✅ Funciona com Imagem, Vídeo e Carrossel
- ✅ Upload de novos criativos
- ✅ Remoção de criativos

### 2. Módulo de Campanhas (`/campaigns`)
**Campos da Campanha:**
- Nome (obrigatório)
- Descrição
- Objetivo: Awareness, Consideration, Conversion, Retention, Branding
- Status: Rascunho, Ativa, Pausada, Concluída, Cancelada
- Data de Início
- Data de Fim
- Orçamento (R$)

**Funcionalidades:**
- ✅ Listar campanhas
- ✅ Criar campanha
- ✅ Editar campanha
- ✅ Excluir campanha (soft delete)
- ✅ Filtrar por status e objetivo
- ✅ Buscar por nome

### 3. Módulo de Usuários (`/users` - apenas Admin)
**Funcionalidades:**
- ✅ Listar todos os usuários
- ✅ Ver perfil (Admin/User)
- ✅ Alternar perfil (Admin ↔ User)
- ✅ Excluir usuário
- ✅ Filtrar por perfil
- ✅ Buscar por nome ou email
- ✅ Proteção: não pode excluir a si mesmo

### 4. Integração com Campanhas
- ✅ Posts podem ser vinculados a campanhas
- ✅ Seletor de campanha na criação de post
- ✅ Botão para criar campanha rápida
- ✅ Se não vincular campanha, pode dar nome customizado

### 5. Melhorias no Menu
- ✅ Adicionada aba "Campanhas"
- ✅ Adicionada aba "Usuários" (apenas para admins)
- ✅ Seção "Administração" separada no menu

---

## 🎯 ESTRUTURA DE DADOS - CAMPANHAS

```
campaigns
├── id (UUID)
├── name (text) - Nome da campanha
├── description (text) - Descrição
├── objective (enum) - awareness, consideration, conversion, retention, branding
├── start_date (date) - Data de início
├── end_date (date) - Data de fim
├── budget (decimal) - Orçamento em R$
├── status (enum) - draft, active, paused, completed, cancelled
├── created_by (UUID FK users)
├── created_at (timestamp)
├── updated_at (timestamp)
└── deleted_at (timestamp)
```

Posts agora têm:
- `campaign_id` (UUID FK campaigns) - Relacionamento com campanha
- `campaign_name` (text) - Nome customizado (se não vincular campanha)

---

## 📋 CHECKLIST FINAL

Execute na ordem:

- [ ] 1. Executar `fix-policies.sql` no SQL Editor
- [ ] 2. Executar `campaigns-migration.sql` no SQL Editor
- [ ] 3. Criar bucket `post-creatives` (público)
- [ ] 4. Executar SQL das policies do Storage
- [ ] 5. Fazer logout e login novamente
- [ ] 6. Testar criação de postagem com upload
- [ ] 7. Testar preview nos detalhes da postagem
- [ ] 8. Criar uma campanha em `/campaigns`
- [ ] 9. Vincular post a uma campanha
- [ ] 10. Verificar módulo de usuários (se for admin)

---

## 🆘 SE AINDA DER ERRO

Se após executar tudo ainda houver problemas, me mostre:
1. A mensagem de erro completa
2. O resultado da query de verificação
3. Se o bucket foi criado corretamente

---

Siga esta ordem e tudo funcionará! 🚀
