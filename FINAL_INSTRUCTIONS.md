# 🎉 Sistema de Fases e Comentários - Instruções Finais

## ✅ Implementação Completa!

Todos os componentes do sistema foram implementados com sucesso. Agora você precisa executar as migrações SQL no Supabase para ativar as novas funcionalidades.

---

## 📋 O QUE FOI IMPLEMENTADO

### 1. Sistema de Papéis Customizáveis (Roles)
- ✅ Tabela `roles` com papéis personalizáveis
- ✅ Papéis padrão: Founder/Cliente, Social Media, Designer, Copywriter
- ✅ Cada papel tem cor e ícone customizáveis
- ✅ Página de gestão de papéis em `/backoffice/roles`
- ✅ Usuários podem ser vinculados a papéis

### 2. Sistema de Fases Configuráveis (Workflow)
- ✅ Tabela `workflow_phases` com fases dinâmicas
- ✅ Fases padrão mantidas: Ideias, Em Produção, Pronto para Revisão, etc.
- ✅ Cada fase tem: título, cor, ícone, ordem, próxima fase
- ✅ Configuração de botão de aprovação por fase
- ✅ Página de gestão de fases em `/backoffice/phases`
- ✅ Drag & drop para reordenar fases

### 3. Sistema de Comentários por Fase
- ✅ Comentários vinculados à fase atual da postagem
- ✅ Badge do papel do usuário em cada comentário
- ✅ Comentários da fase atual: abertos e destacados
- ✅ Comentários de fases anteriores: colapsados e riscados
- ✅ Organização automática por fase

### 4. Sistema de Aprovação
- ✅ Botão de aprovação aparece em fases configuradas
- ✅ Apenas admins podem aprovar
- ✅ Aprovação cria registro em `post_approvals`
- ✅ Adiciona tag de aprovação ao post
- ✅ Move automaticamente para próxima fase
- ✅ Badges de aprovação visíveis no PostCard

### 5. Board Kanban Dinâmico
- ✅ Colunas carregadas do banco de dados
- ✅ Cores e ícones dinâmicos por fase
- ✅ Drag & drop entre fases funcional

### 6. Gestão de Usuários Aprimorada
- ✅ Campo papel (role) adicionado aos usuários
- ✅ Dialog para editar papel do usuário
- ✅ Badges de papel visíveis na lista

---

## 🚀 EXECUTAR AGORA - Migrações SQL

Execute os seguintes arquivos SQL **NA ORDEM** no Supabase SQL Editor:

### 1️⃣ roles-migration.sql
Cria tabela de papéis e adiciona coluna `role_id` em users.

**Como executar:**
1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Entre no seu projeto: `lwyemiozssszzkuwclcm`
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Abra o arquivo `roles-migration.sql` deste projeto
6. Copie TODO o conteúdo
7. Cole no SQL Editor
8. Clique em **Run** (ou Ctrl+Enter)
9. Aguarde "Success. No rows returned"

### 2️⃣ workflow-phases-migration.sql
Cria tabela de fases do workflow.

**Repita o mesmo processo:**
1. No SQL Editor, clique em **New Query**
2. Abra o arquivo `workflow-phases-migration.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**
6. Aguarde "Success"

### 3️⃣ post-comments-phase-migration.sql
Adiciona colunas `phase_status` e `role_id` em post_comments.

**Repita o processo:**
1. Novo Query
2. Copie conteúdo de `post-comments-phase-migration.sql`
3. Cole e Run
4. Aguarde "Success"

### 4️⃣ post-approvals-migration.sql
Cria tabela de aprovações e modifica post_tags.

**Último SQL:**
1. Novo Query
2. Copie conteúdo de `post-approvals-migration.sql`
3. Cole e Run
4. Aguarde "Success"

---

## ✔️ VERIFICAR SE DEU CERTO

Execute esta query no SQL Editor para verificar:

```sql
-- Verificar se todas as tabelas foram criadas
SELECT 
  'roles' as tabela, COUNT(*) as registros
FROM public.roles
UNION ALL
SELECT 
  'workflow_phases', COUNT(*)
FROM public.workflow_phases
UNION ALL
SELECT 
  'post_approvals', COUNT(*)
FROM public.post_approvals;
```

**Resultado esperado:**
```
roles           | 4
workflow_phases | 6
post_approvals  | 0
```

Se aparecer algo assim, está TUDO CERTO! ✅

---

## 🎯 COMO USAR O NOVO SISTEMA

### 1. Gerenciar Papéis
1. Menu lateral → **Papéis de Usuários** (somente admin)
2. Criar novos papéis com nome, descrição, cor e ícone
3. Visualizar quantos usuários têm cada papel

### 2. Gerenciar Fases
1. Menu lateral → **Fases do Workflow** (somente admin)
2. Criar novas fases ou editar existentes
3. Configurar:
   - Título e chave única
   - Ordem (arraste para reordenar)
   - Cor e ícone
   - Próxima fase (para onde vai após aprovação)
   - Botão de aprovação (checkbox)
   - Label da tag de aprovação

### 3. Vincular Usuários a Papéis
1. Menu lateral → **Usuários** (admin)
2. Clique nos 3 pontos de um usuário
3. Selecione **"Editar Papel"**
4. Escolha o papel desejado
5. Salvar

### 4. Usar Comentários com Papéis
1. Abra uma postagem
2. Adicione comentários normalmente
3. Cada comentário mostra:
   - Nome do usuário
   - Badge do papel (colorido)
   - Data/hora
4. Comentários são automaticamente organizados por fase:
   - **Fase atual**: Abertos
   - **Fases anteriores**: Colapsados e riscados

### 5. Aprovar Postagens
1. Abra uma postagem em fase com aprovação
2. Se você for admin, verá banner laranja: **"Esta fase requer aprovação"**
3. Clique em **"Aprovar"**
4. Adicione nota opcional
5. Confirmar
6. O sistema automaticamente:
   - Cria registro de aprovação
   - Adiciona tag verde no card da postagem
   - Move para próxima fase configurada

### 6. Board Dinâmico
1. Vá ao **Board de Produção**
2. As colunas agora vêm do banco de dados
3. Cada coluna tem:
   - Borda superior colorida
   - Ícone da fase
   - Contador de posts
4. Arraste e solte entre colunas normalmente

---

## 📚 ESTRUTURA DO BANCO

### Novas Tabelas

**roles**
- `id` (UUID)
- `name` (text) - Nome do papel
- `description` (text)
- `color` (text) - Cor para badges
- `icon` (text) - Ícone do Quasar

**workflow_phases**
- `id` (UUID)
- `key` (text) - Identificador único
- `title` (text) - Nome exibido
- `order_index` (integer) - Ordem no board
- `has_approval_button` (boolean)
- `approval_tag_label` (text)
- `next_phase_key` (text) - Próxima fase
- `color` (text)
- `icon` (text)

**post_approvals**
- `id` (UUID)
- `post_id` (UUID FK)
- `phase_key` (text)
- `approved_by` (UUID FK users)
- `approval_note` (text)
- `created_at` (timestamp)

### Colunas Adicionadas

**users**
- `role_id` (UUID FK roles) - Papel do usuário

**post_comments**
- `phase_status` (text) - Fase em que foi criado
- `role_id` (UUID FK roles) - Papel do usuário

**post_tags**
- Tipo `'approval'` adicionado ao CHECK constraint

---

## 🔥 NOVAS PÁGINAS E ROTAS

| Rota | Página | Acesso |
|------|--------|--------|
| `/backoffice/phases` | Gestão de Fases | Admin |
| `/backoffice/roles` | Gestão de Papéis | Admin |

---

## 🎨 NOVOS STORES

**`stores/workflow.js`**
- `fetchPhases()` - Buscar fases
- `createPhase()` - Criar fase
- `updatePhase()` - Atualizar fase
- `deletePhase()` - Excluir fase
- `approvePost()` - Aprovar postagem
- `getPhaseTitleByKey()` - Buscar título por chave

**`stores/roles.js`**
- `fetchRoles()` - Buscar papéis
- `createRole()` - Criar papel
- `updateRole()` - Atualizar papel
- `deleteRole()` - Excluir papel
- `getUserCountByRole()` - Contar usuários por papel

---

## ⚠️ IMPORTANTE

1. **EXECUTE AS MIGRAÇÕES NA ORDEM** mostrada acima
2. **NÃO PULE NENHUMA** migração
3. **REINICIE O DEV SERVER** após executar as migrações:
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```
4. **FAÇA LOGOUT E LOGIN** novamente após executar as migrações
5. **LIMPE O CACHE** do navegador se tiver problemas (Ctrl+Shift+Delete)

---

## 🆘 TROUBLESHOOTING

### Erro "relation does not exist"
- Você não executou todas as migrações
- Execute-as novamente na ordem

### Erro "infinite recursion"
- Execute o arquivo `fix-policies.sql` (já criado anteriormente)

### Fases não aparecem no Board
- Verifique se executou `workflow-phases-migration.sql`
- Limpe o cache do navegador
- Recarregue a página (F5)

### Papéis não aparecem
- Verifique se executou `roles-migration.sql`
- Confira se os 4 papéis padrão foram inseridos

### Comentários não mostram papéis
- Execute `post-comments-phase-migration.sql`
- Comentários antigos terão `role_id` NULL
- Novos comentários terão papel automaticamente

---

## 📦 DEPENDÊNCIAS INSTALADAS

- ✅ `vuedraggable@next` - Drag & drop para reordenar fases

---

## 🎊 PRONTO!

Após executar todas as migrações, o sistema estará 100% funcional com:

- ✅ Papéis customizáveis
- ✅ Fases configuráveis
- ✅ Comentários por fase e papel
- ✅ Sistema de aprovação
- ✅ Board dinâmico
- ✅ Tags de aprovação

**Bom uso do novo sistema! 🚀**
