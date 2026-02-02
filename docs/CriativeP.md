## 🎯 Objetivo do Sistema

Criar uma interface em Vue (Quasar) para organizar a rotina entre Founder e Time de Marketing, centralizando:

- Planejamento de postagens
- Gestão de criativos (imagem, vídeo, carrossel)
- Validação de conteúdo
- Visualização clara do calendário editorial
- Simulação realista de como o post será visto no celular
- Base de dados: Supabase (criar SQL)
- Login e autenticação: Supabase
- Perfis de usuários: admin e users

O sistema deve reduzir retrabalho, evitar validações fora de contexto (WhatsApp, PDF, Drive) e permitir decisões rápidas.

---

## 🧠 Conceito Central

Cada _postagem_ é um objeto único que:

- Vive como um _card_
- Aparece no _calendário_
- Percorre um _fluxo de validação_
- Possui um _preview nativo em formato de celular_

Calendário, produção e aprovação são apenas visões diferentes do mesmo dado.

---

## 🧱 Unidade Básica: Postagem

Cada postagem contém obrigatoriamente:

- Rede social (Instagram, TikTok, Google Ads, etc.)
- Tipo de postagem (Orgânico | Tráfego Pago)
- Tipo de criativo (Imagem | Vídeo | Carrossel)
- Data e horário de publicação
- Criativo(s) anexado(s)
- Texto do post (caption / copy)
- Status
- Responsável pela próxima ação
- Comentários internos

---

## 📅 Visão 1 — Calendário Editorial

### Características

- Visual mensal e semanal
- Cada dia exibe:
  - Ícones das redes sociais
  - Mini-cards das postagens previstas
- Clique no card abre o detalhe da postagem
- No calendário mensal (aquele com linhas e colunas), deixar algo com tags das postagens e preview delas.

### Cores por Status

- 🟡 Pendente
- 🔵 Em revisão
- 🟢 Validado
- 🔴 Ajuste solicitado

### Objetivo

Permitir leitura instantânea do planejamento:

- O que vai ao ar
- Quando
- O que ainda está travado

---

## 🗂️ Visão 2 — Board de Produção (Kanban)

### Colunas Fixas

- Ideias
- Em produção
- Pronto para revisão
- Ajustes solicitados
- Validado
- Publicado

### Comportamento

- Cada card representa uma postagem
- Arrastar o card altera o status
- Status é refletido automaticamente no calendário

### Objetivo

Visualizar gargalos e carga do time de marketing.

---

## 📝 Card da Postagem (Detalhe)

### Bloco 1 — Informações Gerais

- Rede social
- Tipo: Orgânico | Ads
- Campanha (ex: Inventário, Separação, Branding)
- Data e horário

### Bloco 2 — Conteúdo

- Upload de criativo(s)
- Campo de texto do post
- Campo de observações internas

### Bloco 3 — Preview Nativo (Celular)

- Simulação de smartphone
- Preview respeita a rede e o tipo de criativo
- Interações permitidas:
  - Scroll da legenda
  - Swipe em carrossel
  - Play / pause de vídeo
- Interações bloqueadas:
  - Curtir
  - Comentar
  - Compartilhar

### Bloco 4 — Validação

- Status atual
- Responsável pela próxima ação (Marketing | Founder)
- Comentários rápidos
- Ações:
  - ✅ Aprovar
  - ✏️ Solicitar ajuste
  - 🕓 Alterar data

---

## 📱 Preview Nativo por Tipo de Criativo

### 📸 Imagem Estática

- Renderizada no formato real da rede
- Respeita proporção (ex: 1:1, 4:5, 9:16)
- Se houver corte:
  - Aviso visual discreto: “conteúdo cortado”

### 🎞️ Vídeo

- Player embutido
- Loop curto (simulação de feed)
- Sem autoplay com som
- Aviso se duração não estiver ideal

### 🧩 Carrossel

- Swipe horizontal real
- Indicador de páginas
- Simula continuidade visual entre slides

---

## ⚠️ Validações Automáticas (MVP)

Sistema apenas alerta, não bloqueia:

- Proporção incorreta
- Vídeo fora do tempo recomendado
- Carrossel com poucas páginas

Objetivo: orientar sem engessar.

---

## 🏷️ Tags e Filtros

### Tags

- Plataforma
- Objetivo (Venda, Conteúdo, Autoridade)
- Produto (Partilhar, Blog, Landing)
- Status

### Filtros Rápidos

- Pendentes de mim
- Pendentes do marketing
- Essa semana
- Somente Ads

---

## 🔄 Fluxo Real de Uso

1. Marketing cria a postagem → _Em produção_
2. Anexa criativo e texto → _Pronto para revisão_
3. Founder abre o preview no celular simulado
4. Decide:
   - Aprovar → _Validado_
   - Solicitar ajuste → _Ajustes solicitados_
5. Marketing ajusta e reenvia
6. Post validado aparece no calendário na data correta
7. Após a data → _Publicado_

---

## 📊 Visão Executiva (Opcional)

Resumo semanal:

- Total de posts por rede
- Orgânico x Ads
- Pendências abertas
- Posts planejados x validados

---

## 🚧 Limites Deliberados do MVP

### Fora do escopo inicial

- Publicação automática
- Métricas pós-publicação
- Integrações com APIs das redes
- Simulação 100% fiel de UI nativa

### Dentro do escopo

- Preview honesto e funcional
- Fluxo de aprovação claro
- Calendário e board integrados

---

## 🧠 Princípio de Design

“Você aprova o post exatamente como o público vai ver.”

---

## 🛠️ Execução em Etapas (Roadmap)

### Fase 1 — Estrutura Base

- Modelo de Postagem
- Status e responsáveis
- Board Kanban
- Calendário editorial
- Tabelas SQL para base de dados (incluir usurio, creted_at, updtade_at, deleted_at) via supabase

### Fase 2 — Card Completo

- Upload de criativos
- Campo de texto
- Comentários internos
- Ações de aprovação

### Fase 3 — Preview Nativo

- Mock de celular
- Render por tipo de criativo
- Swipe em carrossel
- Player de vídeo

### Fase 4 — Validações e Filtros

- Alertas de formato
- Tags
- Filtros rápidos

### Fase 5 — Visão Executiva

- Resumo semanal
- Leitura rápida de pendências

---

## ✅ Resultado Esperado

- Menos retrabalho
- Aprovação mais rápida
- Comunicação centralizada
- Percepção clara de profissionalismo
- Base sólida para evolução futura
