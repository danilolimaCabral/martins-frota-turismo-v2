# Martins Turismo - TODO

## PRIORIDADE MÁXIMA: ROTEIRIZADOR INTELIGENTE

### Funcionalidade Principal
O roteirizador é o "tendão de Aquiles" do negócio - ferramenta essencial para fretamento corporativo que:
1. Recebe planilha Excel com lista de funcionários + endereços
2. Calcula automaticamente a rota mais econômica
3. Sugere pontos de embarque otimizados
4. Reduz custos e tempo de deslocamento

### Implementação
- [x] Criar tabela `rotas` no banco (id, nome, empresa_cliente, data_criacao, status)
- [x] Criar tabela `passageiros_rota` (id, rota_id, nome, endereco, lat, lng, ponto_embarque_sugerido, ordem_coleta)
- [x] Criar procedure tRPC para upload de planilha Excel (processarPlanilha)
- [x] Implementar parser de Excel (biblioteca xlsx instalada)
- [x] Criar 7 procedures tRPC (create, list, getById, addPassageiro, processarPlanilha, delete, deletePassageiro)
- [ ] Integrar Google Maps Geocoding API (converter endereços em coordenadas) - TODO
- [ ] Integrar Google Maps Directions API (calcular rotas otimizadas) - TODO
- [ ] Criar algoritmo de clusterização para sugerir pontos de embarque - TODO
- [ ] Implementar cálculo de rota mais econômica (TSP - Traveling Salesman Problem simplificado) - TODO
- [ ] Criar página /admin/roteirizador com interface drag-and-drop - TODO
- [ ] Adicionar visualização de mapa com marcadores e rota - TODO
- [ ] Implementar exportação de resultado (PDF com endereços e horários) - TODO
- [ ] Testar com dados reais - TODO

---

## AJUSTES SISTEMA ATUAL

### Orçamentos
- [x] Formulário de orçamento funcional (apenas coleta dados)
- [x] Tabela administrativa para visualizar solicitações
- [x] NÃO calcular preço automático (cliente faz manualmente)
- [ ] Simplificar painel AdminOrcamentos (remover cálculos automáticos)

### Rastreamento Life
- [x] Sistema simulado funcionando (60 veículos, Google Maps)
- [ ] Aguardar contato da Life para integração real
- [ ] Documentar requisitos de API quando disponível

---

## FUNCIONALIDADES COMPLETAS ✅

### Landing Page
- [x] Ticker de clima com API Open-Meteo
- [x] Formulário de orçamento (salva no banco + WhatsApp)
- [x] Formulário de contato (salva no banco)
- [x] Roteirização básica (cálculo de distância e custo)
- [x] Blog com 8 artigos completos
- [x] Design responsivo laranja

### Área Administrativa
- [x] Dashboard com KPIs
- [x] Painel de orçamentos (/admin/orcamentos)
- [x] Painel de blog (/admin/blog)
- [x] Rastreamento simulado (/rastreamento)
- [x] Gestão de veículos, motoristas, viagens, despesas

### Backend
- [x] 10 routers tRPC funcionais
- [x] Tabelas: users, vehicles, drivers, trips, expenses, blogPosts, orcamentos, contatos
- [x] API de clima integrada
- [x] Notificações ao proprietário

### GitHub
- [x] Repositório: https://github.com/danilolimaCabral/martins-turismo
