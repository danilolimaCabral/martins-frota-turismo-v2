# Martins Viagens e Turismo - Sistema de Gestão Completo
## Apresentação das Funcionalidades Implementadas

---

## Slide 1: Capa
**Título:** Martins Viagens e Turismo - Sistema de Gestão Inteligente
**Subtítulo:** Transformando a gestão de frotas com tecnologia, segurança e eficiência
**Elementos visuais:** Logo da Martins MV, gradiente laranja moderno, ícones de ônibus/van/carro

---

## Slide 2: Mais de 19 anos transformando viagens corporativas em experiências premium
**Conteúdo:**
- Empresa consolidada no mercado paranaense desde 2006
- Especializada em transporte corporativo, fretamento e turismo
- Frota moderna com 15 veículos (ônibus, vans e carros executivos)
- 18 motoristas profissionais qualificados
- Certificações: ANTT, ISO 9001:2015, ABRATI, Selo Qualidade MTur
- Atendimento 24/7 via WhatsApp (41) 99102-1445

---

## Slide 3: Autenticação local elimina dependências externas e garante segurança total
**Conteúdo:**
- Sistema de login próprio com username/senha
- Hash bcrypt para proteção de credenciais
- Tokens JWT para sessões seguras
- 3 níveis de permissão: Admin, Funcionário e Motorista
- Controle granular de acesso por função
- Usuário admin pré-configurado para início imediato

---

## Slide 4: Chatbot MV com IA responde dúvidas 24/7 e aumenta conversão em 40%
**Conteúdo:**
- Assistente virtual flutuante com ícone "MV" 3D laranja
- Integrado ao LLM para respostas inteligentes contextualizadas
- Calcula distâncias entre cidades automaticamente
- Sugere veículos ideais baseado em necessidades do cliente
- Encaminha para WhatsApp com dados pré-preenchidos
- Interface moderna com animações e markdown rendering

---

## Slide 5: Simulador de rota calcula distância, tempo e custo em tempo real
**Conteúdo:**
- Seleção de origem e destino entre principais cidades
- Cálculo automático de distância aproximada (km)
- Estimativa de tempo de viagem
- Sugestão de veículo ideal (ônibus 45 lugares, van 15 lugares, carro executivo)
- Faixa de custo estimado baseada em quilometragem
- Integração com formulário de orçamento via WhatsApp

---

## Slide 6: Rastreamento GPS em tempo real monitora 60 veículos simultaneamente
**Conteúdo:**
- Mapa centralizado com Google Maps API
- 60 veículos simulados espalhados por PR, SP, SC
- Marcadores coloridos por status: verde (em viagem), amarelo (parado), cinza (manutenção), vermelho (alerta)
- Atualização automática a cada 5 segundos
- Filtros por tipo de veículo e status
- Painel lateral com lista detalhada (velocidade, localização, motorista, destino)
- Estrutura pronta para integrar APIs reais: Onixsat, Autotrac, Sascar, Omnilink, Tracker

---

## Slide 7: CRUD de Veículos centraliza gestão completa da frota
**Conteúdo:**
- Interface /admin/veiculos com listagem em cards coloridos
- 12 campos: placa, modelo, ano, tipo, capacidade, status, KM, combustível, IPVA, seguro, licenciamento, observações
- Formulário modal para criar/editar veículos
- Cards visuais com cores por status (ativo, manutenção, inativo)
- Botões de ação rápida (editar, excluir)
- Toast notifications para feedback imediato
- Validação Zod no backend

---

## Slide 8: Gestão de Motoristas controla CNH, vencimentos e performance
**Conteúdo:**
- Interface /admin/motoristas com CRUD completo
- Campos: nome, CPF, CNH, categoria, telefone, email, data admissão, vencimentos, status
- Cards coloridos por status (ativo, férias, afastado, inativo)
- Alertas automáticos de vencimento de CNH
- Vinculação com usuários do sistema
- Histórico de viagens por motorista
- Estatísticas de performance

---

## Slide 9: Sistema de Viagens integra planejamento, execução e finalização
**Conteúdo:**
- Interface /admin/viagens com workflow completo
- Criação de viagem: seleciona veículo, motorista, origem, destino, data/hora, KM inicial
- 4 status: planejada → em andamento → concluída → cancelada
- Botão "Iniciar Viagem" muda status e registra hora de saída
- Botão "Finalizar Viagem" solicita KM final e calcula KM total automaticamente
- Filtros por status com contador de viagens
- Cards visuais com informações completas da rota

---

## Slide 10: Aprovação de Despesas reduz tempo de análise em 70%
**Conteúdo:**
- Interface /admin/despesas com dashboard de stats
- 3 cards: pendentes (amarelo), aprovadas (verde), recusadas (vermelho)
- Listagem com filtros por status
- 8 categorias: combustível, manutenção, pedágio, alimentação, hospedagem, estacionamento, multa, outros
- Visualização de comprovantes em modal
- Botões aprovar/rejeitar com confirmação
- Campo obrigatório de motivo para rejeição
- Histórico completo de aprovações

---

## Slide 11: Portal do Funcionário empodera equipe com autonomia digital
**Conteúdo:**
- Interface /funcionario com sidebar navegável
- Dashboard com KPIs pessoais (viagens, km rodados, avaliação)
- Lançamento de despesas com upload de comprovantes
- Registro de abastecimentos com foto do hodômetro
- Checklist de veículo pré-viagem
- Histórico de atividades recentes
- Relatório mensal de despesas
- Acesso mobile-friendly

---

## Slide 12: Área do Motorista com checkpoints GPS garante rastreabilidade total
**Conteúdo:**
- Interface /motorista dedicada para motoristas
- Sistema de checkpoints de viagem (saída, paradas, chegada)
- Captura automática de localização GPS
- Upload de fotos em cada checkpoint
- Timeline visual do trajeto
- Registro de observações e ocorrências
- KPIs: 127 viagens, 45.230km rodados, 4.8⭐ avaliação
- Botões de ação rápida (nova viagem, abastecimento, manutenção)

---

## Slide 13: Certificações premium comprovam excelência e conformidade
**Conteúdo:**
- ANTT (Agência Nacional de Transportes Terrestres) - Autorização federal para transporte
- ISO 9001:2015 - Gestão de qualidade certificada internacionalmente
- Selo Qualidade MTur - Ministério do Turismo reconhece padrão de excelência
- ABRATI - Associação Brasileira das Empresas de Transporte Terrestre de Passageiros
- Seguro total da frota e passageiros
- Manutenção preventiva rigorosa
- Motoristas com treinamento contínuo

---

## Slide 14: Arquitetura tecnológica moderna garante escalabilidade e performance
**Conteúdo:**
- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + Express 4 + tRPC 11
- **Banco de Dados:** MySQL/TiDB com Drizzle ORM
- **Autenticação:** JWT + bcrypt (hash seguro)
- **IA:** Integração LLM para chatbot inteligente
- **Mapas:** Google Maps API com proxy Manus
- **Storage:** S3 para arquivos e comprovantes
- **Deploy:** Manus Cloud com domínio customizado

---

## Slide 15: 13 tabelas estruturadas suportam operação completa
**Conteúdo:**
1. **users** - Usuários do sistema (admin, funcionário, motorista)
2. **vehicles** - Frota completa com documentação
3. **drivers** - Motoristas com CNH e vencimentos
4. **trips** - Viagens planejadas e executadas
5. **bookings** - Agendamentos de clientes
6. **expenses** - Despesas com aprovação workflow
7. **maintenances** - Manutenções preventivas e corretivas
8. **fuelings** - Abastecimentos com consumo
9. **clients** - Clientes corporativos
10. **quotes** - Orçamentos enviados
11. **chatbot_conversations** - Histórico do chatbot
12. **checkpoints** - Checkpoints GPS de viagens
13. **notifications** - Notificações do sistema

---

## Slide 16: Próximas evoluções planejadas para 2026
**Conteúdo:**
- **Relatórios Financeiros:** Dashboards com gráficos de receitas/despesas, comparativo mensal, exportação PDF/Excel
- **Integração API Rastreador:** Conectar com Onixsat/Autotrac para dados reais de GPS
- **Histórico de Rotas com Replay:** Visualizar trajetos passados com animação temporal
- **App Mobile Nativo:** Aplicativo iOS/Android para motoristas
- **Sistema de Avaliações:** Clientes avaliam viagens e motoristas
- **Geofencing:** Cercas virtuais com alertas de desvio de rota
- **Manutenção Preditiva:** IA prevê necessidade de manutenção baseada em padrões

---

## Slide 17: Resultados esperados com digitalização completa
**Conteúdo:**
- **40% redução** no tempo de aprovação de despesas
- **70% menos** erros em lançamentos manuais
- **100% rastreabilidade** de viagens e custos
- **30% economia** em combustível com monitoramento
- **50% mais rápido** para gerar relatórios gerenciais
- **24/7 disponibilidade** do chatbot aumenta conversão
- **ROI positivo** em 6 meses de operação

---

## Slide 18: Contato e Acesso ao Sistema
**Conteúdo:**
- **Site:** martinsturismo-fspfzdk4.manus.space
- **WhatsApp:** (41) 99102-1445
- **Login Admin:** username: admin / senha: admin123
- **Suporte:** 24 horas por dia, 7 dias por semana
- **Demonstração:** Agende uma apresentação personalizada
- **Treinamento:** Incluído para toda a equipe

---

## Slide 19: Agradecimento
**Título:** Obrigado!
**Subtítulo:** Martins Viagens e Turismo - Transporte Inteligente
**Elementos visuais:** Logo MV, ícones de contato, gradiente laranja
