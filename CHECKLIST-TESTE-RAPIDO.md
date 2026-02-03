# Checklist de Teste Rápido - Preview e Campos Meta API

## Como usar este checklist

Marque cada item testado com [x]. Tempo estimado: 10-15 minutos.

---

## Parte 1: Preview - Ícones Instagram (5 min)

### Instagram Feed (1:1)
1. [ ] Abrir página de criação
2. [ ] Selecionar **Instagram**
3. [ ] Escolher formato **Feed (1:1)**
4. [ ] Fazer upload de uma imagem
5. [ ] **Verificar preview:**
   - [ ] Ícones aparecem **embaixo** da imagem
   - [ ] Ordem: ❤️ Curtir → 💬 Comentar → ➤ Enviar
   - [ ] Ícone 🔖 Salvar aparece **separado à direita**
   - [ ] Fundo branco
   - [ ] Stats e caption visíveis

### Instagram Reels (9:16)
6. [ ] Trocar para formato **Reels (9:16)**
7. [ ] **Verificar preview:**
   - [ ] Ícones aparecem na **lateral direita**
   - [ ] Ordem (vertical): ❤️ → 💬 → ➤ → ⋮
   - [ ] Tem contadores (1.2K, 89)
   - [ ] Username e caption **embaixo**
   - [ ] Fundo preto
   - [ ] Imagem em fullscreen

---

## Parte 2: Preview - Ícones Facebook (3 min)

### Facebook Feed (1:1)
8. [ ] Selecionar **Facebook**
9. [ ] Formato **Feed (1:1)**
10. [ ] Upload de imagem
11. [ ] **Verificar preview:**
    - [ ] Ícone **👍 Thumbs Up** (não coração)
    - [ ] Ordem: 👍 Curtir → 💬 Comentar → ↗️ Compartilhar
    - [ ] **SEM** ícone salvar separado
    - [ ] Ícones embaixo da imagem

### Facebook Reels (9:16)
12. [ ] Trocar para **Stories/Reels (9:16)**
13. [ ] **Verificar preview:**
    - [ ] Ícones na **lateral direita**
    - [ ] 👍 Thumbs Up (não coração)
    - [ ] **SEM** botão "Enviar" (diferente do Instagram)
    - [ ] Apenas 3 ícones: 👍 💬 ↗️

---

## Parte 3: Preview - TikTok (2 min)

### TikTok Padrão (9:16)
14. [ ] Selecionar **TikTok**
15. [ ] Formato **Padrão (9:16)**
16. [ ] Upload de vídeo/imagem
17. [ ] **Verificar preview:**
    - [ ] Ícones **SEMPRE na lateral** (não muda)
    - [ ] 4 ícones: ❤️ → 💬 → 🔖 → ↗️
    - [ ] **Todos com contadores** (24.5K, 892, 1.8K)
    - [ ] Layout 100% vertical

---

## Parte 4: Campos Meta API (5 min)

### Seleção de Conta
18. [ ] Selecionar **Instagram**
19. [ ] **Verificar:**
    - [ ] Campo "Conta Instagram *" **aparece**
    - [ ] Campo é **obrigatório** (asterisco)
    - [ ] Botão ⚙️ "Gerenciar contas" presente
    - [ ] Dropdown vazio mostra mensagem "Nenhuma conta conectada"

20. [ ] Clicar no botão ⚙️
21. [ ] **Verificar:**
    - [ ] Dialog abre
    - [ ] Mensagem "Funcionalidade em Desenvolvimento"

22. [ ] Selecionar **Facebook**
23. [ ] **Verificar:**
    - [ ] Campo muda para "Página Facebook *"

24. [ ] Selecionar **TikTok**
25. [ ] **Verificar:**
    - [ ] Campo de conta **NÃO aparece**

### Tipo de Publicação
26. [ ] Selecionar "Tráfego Pago"
27. [ ] **Verificar:**
    - [ ] Campo "Conta de Anúncios" **aparece**

28. [ ] Voltar para "Orgânico"
29. [ ] **Verificar:**
    - [ ] Campo "Conta de Anúncios" **some**

### Agendamento
30. [ ] Encontrar campo "Quando Publicar"
31. [ ] Selecionar **"Publicar Agora"**
32. [ ] **Verificar:**
    - [ ] Campo "Data e Hora" **ESCONDE**
    - [ ] Banner azul aparece: "será publicada imediatamente"

33. [ ] Selecionar **"Agendar Publicação"**
34. [ ] **Verificar:**
    - [ ] Campo "Data e Hora" **APARECE**
    - [ ] Hint mostra limite de dias (ex: "Agende até 75 dias")

35. [ ] Tentar colocar data no passado
36. [ ] **Verificar:**
    - [ ] Erro de validação aparece
    - [ ] Mensagem sugere usar "Publicar Agora"

---

## Parte 5: Organização do Formulário (2 min)

### Estrutura em Cards
37. [ ] **Verificar presença dos 3 cards:**
    - [ ] Card 1: "Destino da Publicação" (ícone 📤)
    - [ ] Card 2: "Formato e Conteúdo" (ícone 🖼️)
    - [ ] Card 3: "Agendamento e Campanha" (ícone ⏰)

38. [ ] **Verificar campos em cada card:**
    - [ ] Card 1: Rede, Conta, Tipo
    - [ ] Card 2: Criativo, Formato, Upload, Legenda
    - [ ] Card 3: Quando Publicar, Data, Campanha

---

## Parte 6: Validações (3 min)

### Validação de Criação
39. [ ] Deixar formulário incompleto (sem conta)
40. [ ] **Verificar:**
    - [ ] Botão "Criar Postagem" **desabilitado**

41. [ ] Preencher conta (selecionar qualquer opção se houver, ou pular)
42. [ ] Preencher todos os campos obrigatórios
43. [ ] **Verificar:**
    - [ ] Botão "Criar Postagem" **habilitado**

### Validação de Data (Instagram)
44. [ ] Selecionar Instagram + Agendar
45. [ ] Colocar data 80 dias no futuro
46. [ ] **Verificar:**
    - [ ] Erro: "não pode ser mais de 75 dias no futuro"

47. [ ] Ajustar para 70 dias
48. [ ] **Verificar:**
    - [ ] Validação passa

### Validação de Data (Facebook)
49. [ ] Selecionar Facebook + Agendar
50. [ ] Colocar data 400 dias no futuro
51. [ ] **Verificar:**
    - [ ] Erro: "não pode ser mais de 365 dias no futuro"

---

## Parte 7: Fluxo Completo (5 min)

### Cenário: Post Instagram Reels

52. [ ] Selecionar **Instagram**
53. [ ] (Ignorar conta por enquanto)
54. [ ] Tipo: **Orgânico**
55. [ ] Criativo: **Vídeo**
56. [ ] Formato: **Reels (9:16)**
57. [ ] Upload de vídeo
58. [ ] **Verificar preview:**
    - [ ] Ícones lateral direita
    - [ ] Ordem correta: ❤️ 💬 ➤ ⋮
    - [ ] Fullscreen vertical

59. [ ] Preencher legenda
60. [ ] Quando Publicar: **Agendar**
61. [ ] Escolher data futura
62. [ ] Adicionar campanha (opcional)
63. [ ] **Verificar:**
    - [ ] Botão "Criar Postagem" habilitado
    - [ ] Todos os dados preenchidos

64. [ ] Clicar "Criar Postagem"
65. [ ] **Verificar:**
    - [ ] Postagem criada com sucesso
    - [ ] Redirecionado para board

---

## Parte 8: Migration SQL (2 min)

66. [ ] Abrir arquivo `add-meta-api-fields.sql`
67. [ ] **Verificar presença de:**
    - [ ] `ALTER TABLE posts ADD COLUMN account_id`
    - [ ] `ALTER TABLE posts ADD COLUMN publish_type`
    - [ ] `ALTER TABLE posts ADD COLUMN scheduled_publish_time`
    - [ ] `ALTER TABLE posts ADD COLUMN media_type`
    - [ ] `ALTER TABLE posts ADD COLUMN placement`
    - [ ] `ALTER TABLE posts ADD COLUMN aspect_ratio`
    - [ ] `CREATE TABLE connected_accounts`
    - [ ] Índices criados
    - [ ] RLS policies

68. [ ] Aplicar migration no Supabase
69. [ ] **Verificar:**
    - [ ] Migration executada sem erros
    - [ ] Campos criados na tabela

---

## Resumo dos Testes

### Obrigatórios ⚠️

Estes são críticos:

- [ ] Instagram Feed - ícones embaixo
- [ ] Instagram Reels - ícones lateral
- [ ] Facebook Feed - thumbs up, sem salvar
- [ ] TikTok - sempre lateral, 4 ícones
- [ ] Campo conta aparece para Meta
- [ ] Publicar Agora esconde data
- [ ] Agendar mostra data

### Opcionais ℹ️

Bom testar mas não crítico:

- [ ] Facebook Reels
- [ ] Validação de data por plataforma
- [ ] Conta de anúncios (tráfego pago)
- [ ] Dialog de configuração de contas

---

## Resultado Esperado

Após completar todos os testes:

✅ **Preview funciona perfeitamente** - Ícones corretos por plataforma  
✅ **Formulário organizado** - 3 cards claros  
✅ **Campos Meta API** - Todos presentes e funcionais  
✅ **Validações corretas** - Por plataforma e contexto  
✅ **Banco preparado** - Migration aplicada  

---

## Se Encontrar Problemas

### Preview não mostra ícones corretos
- Verificar console para erros
- Confirmar que `platformIcons.js` existe
- Verificar que `postFormat` está sendo passado

### Campo de conta não aparece
- Confirmar plataforma é Instagram ou Facebook
- Verificar computed `accountOptions`

### Data não valida
- Verificar import de `formatHelpers`
- Confirmar função `validateFutureDate` existe

### Migration falha
- Verificar sintaxe SQL
- Confirmar conexão com Supabase
- Verificar permissões

---

## Próximo Passo

Após completar este checklist:

1. ✅ Tudo funcionando → Deploy em produção
2. ⚠️ Encontrou problemas → Reportar issues
3. 🚀 Tudo ok → Planejar Fase 2 (OAuth)

---

**Total de itens:** 69  
**Tempo estimado:** 15-20 minutos  
**Criticidade:** Alta - Validação essencial

---

*Checklist de Teste - p-flow 2026*
