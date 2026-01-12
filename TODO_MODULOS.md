# 📋 TODO - Finalização de Módulos

## 🎯 RH - RECURSOS HUMANOS (3 itens)

- [ ] **CNAB Generator** - Função para gerar arquivo CNAB 240
  - [ ] Criar `server/cnab-generator.ts`
  - [ ] Implementar formato CNAB 240
  - [ ] Validar dados bancários
  - [ ] Gerar download de arquivo
  - [ ] Adicionar router tRPC para download

- [ ] **Alertas de Documentos** - Verificar documentos vencendo
  - [ ] Criar `server/document-alerts-routers.ts`
  - [ ] Verificar CNH vencendo (30, 7 dias, no dia)
  - [ ] Verificar RNTRC vencendo
  - [ ] Implementar notificações automáticas
  - [ ] Criar dashboard de alertas
  - [ ] Criar `client/src/pages/AdminDocumentos.tsx`

- [ ] **Relatórios RH** - Relatórios avançados
  - [ ] Relatório de férias
  - [ ] Relatório de afastamentos
  - [ ] Relatório de rotatividade
  - [ ] Adicionar ao `AdminRelatorios.tsx`

---

## 💰 FINANCEIRO - 5 itens

- [ ] **Conciliação Bancária** - Importar e comparar extratos
  - [ ] Criar `server/bank-reconciliation-routers.ts`
  - [ ] Implementar importação OFX/CSV
  - [ ] Comparar com movimentações
  - [ ] Identificar divergências
  - [ ] Marcar como conciliado
  - [ ] Criar `client/src/pages/AdminConciliacao.tsx`

- [ ] **Fluxo de Caixa Avançado** - Projeção e análise
  - [ ] Criar `server/cash-flow-advanced-routers.ts`
  - [ ] Implementar projeção de caixa
  - [ ] Gráficos de tendência
  - [ ] Análise de sazonalidade
  - [ ] Alertas de saldo baixo
  - [ ] Adicionar ao `AdminFinanceiro.tsx`

- [ ] **Integração com Banco** - API do banco
  - [ ] Criar `server/bank-integration-routers.ts`
  - [ ] Conexão com API do banco
  - [ ] Importação automática de extratos
  - [ ] Sincronização em tempo real

- [ ] **Relatórios Financeiros** - DRE, balanço, análise
  - [ ] DRE (Demonstração de Resultado)
  - [ ] Balanço patrimonial
  - [ ] Análise de rentabilidade
  - [ ] Índices financeiros
  - [ ] Adicionar ao `AdminRelatorios.tsx`

- [ ] **Controle de Recebimentos** - Boleto, PIX, cartão, cheque
  - [ ] Criar `server/payment-methods-routers.ts`
  - [ ] Implementar boleto bancário
  - [ ] Implementar PIX
  - [ ] Implementar cartão de crédito
  - [ ] Implementar cheque
  - [ ] Rastrear status de recebimento

---

## 🗺️ ROTAS - ROTEIRIZAÇÃO (5 itens)

- [ ] **Exportação para GPS** - Exportar em GPX, KML
  - [ ] Criar `server/gps-export-routers.ts`
  - [ ] Exportar em formato GPX
  - [ ] Exportar em formato KML
  - [ ] Exportar para arquivo de banco
  - [ ] Adicionar download na interface
  - [ ] Adicionar ao `AdminRoteirizacao.tsx`

- [ ] **APP Motorista** - Interface mobile
  - [ ] Criar `mobile/motorista/` estrutura
  - [ ] Interface de navegação
  - [ ] Integração GPS
  - [ ] Confirmação de chegada
  - [ ] Comunicação em tempo real
  - [ ] Offline mode

- [ ] **APP Usuário** - Rastreamento em tempo real
  - [ ] Criar `mobile/usuario/` estrutura
  - [ ] Rastreamento em tempo real
  - [ ] Notificações de chegada
  - [ ] Ponto de embarque no mapa
  - [ ] ETA estimado
  - [ ] Histórico de viagens

- [ ] **Algoritmo Avançado** - Otimização inteligente
  - [ ] Considerar tráfego em tempo real
  - [ ] Otimizar por tempo (não só distância)
  - [ ] Restrições de horário
  - [ ] Preferências de rota
  - [ ] Atualizar `roteirizador-routers.ts`

- [ ] **Histórico e Análise** - Comparar planejado vs real
  - [ ] Salvar rotas realizadas
  - [ ] Comparar tempo planejado vs real
  - [ ] Análise de eficiência
  - [ ] Sugestões de melhoria
  - [ ] Criar `server/route-analytics-routers.ts`
  - [ ] Adicionar relatórios

---

## 💬 ATENDIMENTO - 5 itens

- [ ] **Chatbot IA Avançado** - Integração com LLM
  - [ ] Criar `server/chatbot-advanced-routers.ts`
  - [ ] Integração com LLM (já existe `invokeLLM`)
  - [ ] Respostas contextualizadas
  - [ ] Escalação automática
  - [ ] Histórico de conversas
  - [ ] Criar `client/src/pages/AdminChatbot.tsx`

- [ ] **Integração Interna** - Notificações e fila
  - [ ] Criar `server/ticket-management-routers.ts`
  - [ ] Notificações para equipe
  - [ ] Atribuição de tickets
  - [ ] Fila de atendimento
  - [ ] SLA de resposta
  - [ ] Dashboard de tickets

- [ ] **Formulário de Orçamento Completo** - Validação e cálculo
  - [ ] Validação de dados
  - [ ] Cálculo automático de valor
  - [ ] Envio por email
  - [ ] Confirmação de recebimento
  - [ ] Atualizar `AdminOrcamentos.tsx`

- [ ] **Gestão de Tickets** - Priorização e filtros
  - [ ] Priorização automática
  - [ ] Categorização avançada
  - [ ] Filtros avançados
  - [ ] Relatórios de atendimento
  - [ ] Atualizar `orcamento-routers.ts`

- [ ] **Satisfação do Cliente** - Pesquisa e NPS
  - [ ] Criar `server/satisfaction-routers.ts`
  - [ ] Pesquisa de satisfação
  - [ ] Avaliação do atendimento
  - [ ] NPS (Net Promoter Score)
  - [ ] Relatórios de satisfação

---

## 📅 AGENDA - 5 itens

- [ ] **Calendário Avançado** - Visualização e drag & drop
  - [ ] Criar `server/calendar-advanced-routers.ts`
  - [ ] Visualização por semana/dia
  - [ ] Drag and drop de eventos
  - [ ] Cores por status
  - [ ] Sincronização com Google Calendar
  - [ ] Criar `client/src/pages/AdminCalendario.tsx`

- [ ] **Detalhes de Evento** - Descrição, anexos, histórico
  - [ ] Descrição completa
  - [ ] Anexos (documentos, fotos)
  - [ ] Histórico de alterações
  - [ ] Comentários
  - [ ] Atualizar `AdminAgenda.tsx`

- [ ] **Pagamentos Avançados** - Parcelas e recibos
  - [ ] Implementar parcelas
  - [ ] Formas de pagamento
  - [ ] Geração de recibos
  - [ ] Relatório de recebimentos
  - [ ] Atualizar `agenda-routers.ts`

- [ ] **Notificações** - Lembretes e confirmações
  - [ ] Lembrete antes do evento
  - [ ] Confirmação de presença
  - [ ] Alterações no evento
  - [ ] Cancelamento
  - [ ] Implementar sistema de notificações

- [ ] **Relatórios Agenda** - Ocupação e receita
  - [ ] Ocupação de veículos
  - [ ] Receita por período
  - [ ] Eventos por motorista
  - [ ] Taxa de ocupação
  - [ ] Adicionar ao `AdminRelatorios.tsx`

---

## 📊 RESUMO

**Total de itens:** 23  
**RH:** 3 itens  
**Financeiro:** 5 itens  
**Rotas:** 5 itens  
**Atendimento:** 5 itens  
**Agenda:** 5 itens  

**Status:** Em progresso  
**Prioridade:** Alta  
**Tempo estimado:** 4-6 semanas
