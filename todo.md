# Sistema de Gestão de Frota - Martins Viagens e Turismo

## FASE 1: LANDING PAGE INSTITUCIONAL ✅
- [x] Configurar tema elegante com cores azul e laranja
- [x] Criar hero section com carrossel de fotos
- [x] Seção sobre a empresa
- [x] Seção de serviços
- [x] Galeria de veículos da frota
- [x] Seção de depoimentos
- [x] Formulário de contato
- [x] Footer completo
- [x] Design responsivo mobile-first
- [x] Logo real sem fundo branco
- [x] Banner animado de cidades atendidas
- [x] Ticker de clima animado (Curitiba, Maringá, Florianópolis, SP)
- [x] Seção de busca/cotação de viagens (origem/destino/data/passageiros)
- [ ] Sistema de orçamento automático ou envio para equipe (backend)
- [ ] Seção de parceiros/clientes
- [ ] Validar todos os menus

## FASE 2: ESTRUTURA DO BANCO DE DADOS
- [ ] Tabela de veículos (frota)
- [ ] Tabela de motoristas
- [ ] Tabela de agendamentos/viagens
- [ ] Tabela de manutenções
- [ ] Tabela de abastecimentos
- [ ] Tabela de ativos/patrimônio
- [ ] Tabela de despesas
- [ ] Tabela de contas a pagar/receber
- [ ] Tabela de clientes
- [ ] Tabela de usuários do sistema

## FASE 3: AUTENTICAÇÃO LOCAL (SEM MANUS)
- [ ] REMOVER toda autenticação Manus OAuth
- [ ] Criar sistema de login local (usuário/senha)
- [ ] Tabela de usuários com hash de senha
- [ ] Controle de permissões (admin, funcionário, motorista)
- [ ] Página de login /login
- [ ] Sessão local com JWT
- [ ] Middleware de autenticação

## FASE 3.1: PORTAL DO FUNCIONÁRIO (/funcionario)
- [ ] Dashboard do funcionário
- [ ] Lançamento de despesas
- [ ] Registro de abastecimentos
- [ ] Relatório de viagens realizadas
- [ ] Checklist de veículo
- [ ] Anexo de comprovantes (fotos)

## FASE 3.2: SISTEMA ADMINISTRATIVO (/admin)
- [ ] Dashboard administrativo completo
- [ ] Menu lateral de navegação
- [ ] Perfil de usuário
- [ ] Gestão de usuários do sistema

## FASE 4: MÓDULO DE AGENDAMENTO
- [ ] Cadastro de clientes
- [ ] Formulário de solicitação de viagem
- [ ] Calendário de agendamentos
- [ ] Seleção de veículo disponível
- [ ] Designação de motorista
- [ ] Status da viagem (pendente, confirmada, em andamento, concluída)
- [ ] Notificações automáticas

## FASE 5: GESTÃO DE FROTAS
- [ ] Cadastro de veículos
- [ ] Documentação (IPVA, seguro, licenciamento)
- [ ] Controle de vencimentos
- [ ] Histórico do veículo
- [ ] Status (disponível, em manutenção, em viagem)
- [ ] Fotos dos veículos

## FASE 6: MÓDULO DE MANUTENÇÃO
- [ ] Cadastro de ordens de serviço
- [ ] Tipos de manutenção (preventiva, corretiva)
- [ ] Registro de peças utilizadas
- [ ] Custos de manutenção
- [ ] Histórico por veículo
- [ ] Alertas de manutenção programada
- [ ] Fornecedores/oficinas

## FASE 7: CONTROLE DE COMBUSTÍVEL
- [ ] Registro de abastecimentos
- [ ] Cálculo de consumo (km/l)
- [ ] Custos por veículo
- [ ] Relatórios de eficiência
- [ ] Gráficos de consumo
- [ ] Comparativo entre veículos

## FASE 8: CONTROLE DE ATIVOS
- [ ] Cadastro de patrimônio
- [ ] Categorias de ativos
- [ ] Valores e depreciação
- [ ] Localização dos ativos
- [ ] Documentação anexada
- [ ] Relatórios de inventário

## FASE 9: MÓDULO DE DESPESAS
- [ ] Lançamento de despesas pelos motoristas
- [ ] Categorias (pedágio, alimentação, estacionamento, etc)
- [ ] Anexo de comprovantes (fotos)
- [ ] Aprovação de despesas
- [ ] Reembolsos
- [ ] Relatórios por motorista/viagem

## FASE 10: MÓDULO FINANCEIRO
- [ ] Contas a pagar
- [ ] Contas a receber
- [ ] Faturamento de viagens
- [ ] Fluxo de caixa
- [ ] Relatórios financeiros
- [ ] Dashboard financeiro
- [ ] Exportação para Excel

## FASE 11: RASTREAMENTO GPS
- [ ] Integração com Google Maps
- [ ] Localização em tempo real dos veículos
- [ ] Histórico de rotas
- [ ] Alertas de desvio de rota
- [ ] Geofencing (cercas virtuais)
- [ ] Relatórios de trajetos

## FASE 12: DASHBOARD E RELATÓRIOS
- [ ] Indicadores de desempenho (KPIs)
- [ ] Gráficos interativos
- [ ] Relatórios gerenciais
- [ ] Exportação de dados
- [ ] Filtros personalizados
- [ ] Visão consolidada da operação

## MELHORIAS TÉCNICAS
- [ ] Testes unitários
- [ ] Documentação da API
- [ ] Otimização de performance
- [ ] Backup automático
- [ ] Logs de auditoria

## PUBLICAÇÃO
- [ ] Criar repositório no GitHub
- [ ] Configurar .gitignore
- [ ] Adicionar README.md completo
- [ ] Push inicial do projeto
- [ ] Configurar CI/CD (opcional)

## CORREÇÕES URGENTES - LANDING PAGE
- [x] Arrumar ticker de clima (está bagunçado no mobile)
- [ ] Melhorar botões de serviços e orçamento
- [ ] Adicionar fotos reais dos ônibus e vans
- [x] Criar seção de parceiros com logos dos clientes
- [x] Coletar dados completos do site oficial

## CORREÇÕES CRÍTICAS
- [x] Corrigir ticker de clima (texto sobreposto e ilegível)
- [x] Substituir foto da Turquia por destino brasileiro
- [x] Buscar e adicionar logos reais dos parceiros

## NOVAS CORREÇÕES
- [x] Buscar logos maiores e de melhor qualidade dos parceiros
- [x] Corrigir ticker de clima no mobile (ainda sobreposto)
- [x] Aumentar tamanho dos logos dos parceiros

## FASE ATUAL: IMPLEMENTAÇÕES PRINCIPAIS

### 1. ESTRUTURA DO BANCO DE DADOS ✅
- [x] Criar tabela de usuários com hash de senha (bcrypt)
- [x] Criar tabela de veículos (frota)
- [x] Criar tabela de motoristas
- [x] Criar tabela de agendamentos/reservas
- [x] Criar tabela de viagens
- [x] Criar tabela de manutenções
- [x] Criar tabela de abastecimentos
- [x] Criar tabela de despesas
- [x] Criar tabela de clientes
- [x] Criar tabela de orçamentos
- [x] Criar tabela de conversas do chatbot
- [x] Executar migrations no banco

### 2. AUTENTICAÇÃO LOCAL ✅
- [x] Remover todas as referências ao Manus OAuth
- [x] Criar sistema de login local (usuário/senha)
- [x] Implementar hash de senha com bcrypt
- [x] Criar JWT para sessões
- [x] Criar middleware de autenticação
- [x] Criar página de login (/login)
- [x] Criar tRPC procedures de autenticação
- [x] Implementar controle de permissões (admin, funcionário, motorista)
- [x] Criar usuário admin inicial (username: admin, senha: admin123)

### 3. CHATBOT MV COM IA
- [ ] Criar componente de chat flutuante
- [ ] Integrar com LLM (Gemini via invokeLLM)
- [ ] Criar contexto do chatbot (informações da Martins)
- [ ] Implementar respostas sobre transporte e viagens
- [ ] Adicionar cálculo de quilometragem
- [ ] Implementar encaminhamento para WhatsApp
- [ ] Salvar conversas no banco de dados
- [ ] Adicionar botão de chat no site

### 4. PUBLICAÇÃO NO GITHUB
- [ ] Criar .gitignore
- [ ] Criar README.md completo
- [ ] Inicializar repositório Git
- [ ] Fazer commit inicial
- [ ] Criar repositório no GitHub
- [ ] Push para o GitHub

## CORREÇÃO URGENTE
- [ ] Corrigir ticker de clima (texto duplicado e sobreposto)


## FASE ATUAL: IMPLEMENTAÇÕES PRINCIPAIS (CONTINUAÇÃO)

### 3. CHATBOT MV COM IA ✅
- [x] Criar componente de chat flutuante (botão no canto inferior direito)
- [x] Integrar com LLM (invokeLLM) para respostas inteligentes
- [x] Criar contexto do chatbot com informações da Martins
- [x] Implementar respostas sobre serviços de transporte
- [x] Adicionar sugestões de veículos baseadas em necessidades
- [x] Implementar cálculo de quilometragem entre cidades
- [x] Adicionar botão para encaminhar para WhatsApp
- [ ] Salvar histórico de conversas no banco de dados (opcional)
- [x] Adicionar animações e design moderno ao chat
- [x] Testar chatbot com diferentes perguntas

### 4. PORTAL DO FUNCIONÁRIO (/funcionario) ✅
- [x] Criar layout do portal com sidebar
- [x] Implementar dashboard do funcionário
- [x] Criar formulário de lançamento de despesas
- [x] Adicionar upload de comprovantes (fotos)
- [x] Criar formulário de registro de abastecimentos
- [x] Implementar checklist de veículo
- [x] Mostrar histórico de viagens do funcionário
- [x] Adicionar relatório de despesas do mês
- [ ] Implementar notificações para o funcionário (opcional)
- [x] Testar todas as funcionalidades do portal

### 5. SISTEMA ADMINISTRATIVO (/admin) ✅
- [x] Criar layout administrativo com sidebar completa
- [x] Implementar dashboard principal com KPIs
- [x] Criar módulo de gestão de veículos (estrutura)
- [x] Implementar controle de documentação (alertas de vencimento)
- [x] Criar módulo de gestão de motoristas (estrutura)
- [x] Implementar controle de manutenção (lista de próximas)
- [ ] Criar calendário de agendamentos (futuro)
- [ ] Implementar módulo de gestão de clientes (futuro)
- [x] Criar relatórios financeiros (estrutura)
- [ ] Adicionar gráficos e estatísticas (futuro)
- [x] Implementar controle de combustível (alertas)
- [x] Criar módulo de aprovação de despesas
- [ ] Adicionar rastreamento GPS (integração futura)
- [x] Testar todo o sistema administrativo


## AJUSTES SOLICITADOS
- [x] Mudar cor do ticker de clima de azul para laranja
- [x] Reduzir quantidade de cidades no ticker (deixar apenas Curitiba e Araucária)

- [x] Arrumar formulário de busca de viagens (origem/destino/data/passageiros)
- [x] Implementar funcionalidade de cotação automática (via WhatsApp)

- [x] Implementar simulador de rota e distância
- [x] Calcular distância aproximada entre cidades
- [x] Estimar tempo de viagem
- [x] Sugerir tipo de veículo ideal
- [x] Mostrar previsão de custo aproximado


## MELHORIAS ÁREA DO MOTORISTA (SOLICITAÇÃO)
- [ ] Implementar sistema de checkpoint de viagem (saída, paradas, chegada)
- [ ] Adicionar captura de localização GPS em cada checkpoint
- [ ] Permitir upload de fotos em checkpoints
- [ ] Criar visualização de rota no mapa (Google Maps)
- [ ] Mostrar histórico de trajetos do motorista
- [ ] Implementar comparação entre rota planejada vs rota real
- [ ] Adicionar estatísticas de performance do motorista
- [ ] Criar dashboard de viagens ativas
- [ ] Implementar alertas de desvio de rota
- [ ] Adicionar relatório detalhado de cada viagem


## SISTEMA DE RASTREAMENTO EM TEMPO REAL (SOLICITAÇÃO PRIORITÁRIA) ✅
- [x] Criar página de mapa centralizado no admin (/rastreamento)
- [x] Integrar Google Maps API para visualização
- [x] Criar sistema genérico para integração com APIs de rastreamento (pronto para Onixsat, Autotrac, Sascar, Omnilink, Tracker)
- [x] Mostrar todos os veículos no mapa em tempo real (60 veículos simulados)
- [x] Adicionar ícones coloridos por status (verde, amarelo, vermelho, cinza)
- [x] Implementar filtros (tipo de veículo, status)
- [x] Mostrar informações ao clicar no veículo (velocidade, localização, motorista, destino)
- [x] Implementar atualização automática a cada 5 segundos
- [x] Adicionar painel lateral com lista de veículos
- [x] Mostrar status visual (verde=em viagem, amarelo=parado, cinza=manutenção, vermelho=alerta)
- [x] Adicionar botão "Ver Rastreamento" no dashboard admin
- [ ] Criar histórico de trajetos com replay (futuro)
- [ ] Implementar alertas de desvio de rota (futuro)
- [ ] Adicionar geofencing - cercas virtuais (futuro)
- [ ] Criar relatório de rotas planejadas vs reais (futuro)


## ÁREA DO MOTORISTA APRIMORADA (EM DESENVOLVIMENTO)
- [ ] Criar página dedicada do motorista (/motorista)
- [ ] Implementar dashboard com viagens ativas
- [ ] Criar sistema de checkpoints de viagem (saída, paradas, chegada)
- [ ] Adicionar captura automática de localização GPS em checkpoints
- [ ] Permitir upload de fotos em cada checkpoint
- [ ] Adicionar campo de observações em checkpoints
- [ ] Mostrar rota planejada vs rota real
- [ ] Implementar botões de ação rápida (iniciar viagem, registrar parada, finalizar)
- [ ] Criar timeline visual dos checkpoints
- [ ] Adicionar estatísticas do motorista (viagens concluídas, km rodados, avaliação)

## HISTÓRICO DE ROTAS COM REPLAY (EM DESENVOLVIMENTO)
- [ ] Criar página de histórico de rotas (/rastreamento/historico)
- [ ] Listar todas as viagens passadas com filtros (data, motorista, veículo)
- [ ] Implementar visualização de rota completa no mapa
- [ ] Adicionar replay animado da rota com controles (play, pause, velocidade)
- [ ] Mostrar checkpoints ao longo da rota
- [ ] Comparar rota planejada vs rota real com destaque de desvios
- [ ] Adicionar linha do tempo com eventos (paradas, alertas, checkpoints)
- [ ] Mostrar estatísticas da viagem (distância, tempo, velocidade média)
- [ ] Permitir exportar relatório da viagem em PDF


## LOGOS DOS PARCEIROS (SOLICITAÇÃO URGENTE) ✅
- [ ] Buscar logo da Escola CO2 (não encontrado - mantido texto)
- [x] Buscar logo da Demia Zenza
- [ ] Buscar logo do Ótico Pitol (não encontrado - mantido texto)
- [x] Buscar logo da ITC Engenharia
- [ ] Buscar logo da COL Rodas e Pneus (não encontrado - mantido texto)
- [x] Buscar logo da Nitport
- [ ] Buscar logo do Empório Dipulo (não encontrado - mantido texto)
- [x] Buscar logo da Hanser
- [x] Buscar logo da Mistral
- [x] Adicionar todos os logos encontrados na seção de parceiros do site


## NOVAS IMPLEMENTAÇÕES SOLICITADAS
- [ ] Criar usuário motorista de teste no banco de dados
- [ ] Buscar logos restantes: Escola CO2, Ótico Pitol, COL Rodas e Pneus, Empório Dipulo
- [ ] Implementar página de histórico de rotas (/rastreamento/historico)
- [ ] Adicionar replay animado de rotas com controles play/pause/velocidade
- [ ] Mostrar comparação rota planejada vs rota real
- [x] Buscar certificações de transporte (ANTT, ABRATI, ISO 9001, Selo Qualidade MTur)
- [x] Criar seção de certificações premium no site
- [x] Adicionar cards de certificação com descrições

-- [x] Mudar palavra "INTELIGENTE" de azul para laranja
- [ ] Mudar menus/botões coloridos para laranja (parcialmente - botão Sistema ainda precisa ser ajustado)
- [x] Atualizar ticker de clima para mostrar apenas Curitiba, Araucária e São Paulo

- [x] Arrumar navegação do menu mobile (Início, Serviços, Frota, Depoimentos, Contato)
- [x] Implementar scroll suave até as seções ao clicar nos itens do menu
- [x] Fechar menu mobile automaticamente após clicar em um item

- [x] Criar ícone 3D com letras "MV" para o botão do chatbot
- [x] Substituir ícone de mensagem genérico pelo ícone personalizado MV

- [x] Remover borda do botão flutuante MV do chatbot
- [x] Mudar botão MV para gradiente laranja puro (sem azul)

- [ ] Adicionar galeria de fotos reais da frota na home
- [ ] Criar página institucional "Sobre Nós" (/sobre)
- [ ] Adicionar timeline visual dos 19 anos de história


## DESENVOLVIMENTO COMPLETO DA ÁREA ADMIN
- [x] Criar procedures tRPC para CRUD de veículos
- [x] Implementar interface de gestão de veículos (listar, adicionar, editar, excluir)
- [x] Criar procedures tRPC para CRUD de motoristas
- [x] Implementar interface de gestão de motoristas
- [x] Criar procedures tRPC para gestão de viagens
- [x] Implementar interface de criação e acompanhamento de viagens
- [x] Criar procedures tRPC para aprovação de despesas
- [x] Implementar interface de aprovação/rejeição de despesas
- [ ] Criar procedures tRPC para relatórios financeiros
- [ ] Implementar dashboards com gráficos de receitas/despesas
- [ ] Adicionar filtros por período nos relatórios
- [ ] Implementar exportação de relatórios em PDF/Excel


## INTERFACES SOLICITADAS (URGENTE) ✅
- [x] Criar interface de Gestão de Viagens (/admin/viagens)
- [x] Listagem de viagens com cards coloridos por status
- [x] Formulário para criar/editar viagens
- [x] Botões para iniciar/finalizar viagem
- [x] Filtros por status (planejada, em-andamento, concluida, cancelada)
- [x] Criar interface de Aprovação de Despesas (/admin/despesas)
- [x] Dashboard com despesas pendentes (cards com stats)
- [x] Visualização de comprovantes em modal
- [x] Botões aprovar/rejeitar com confirmação
- [x] Filtros por status
- [x] Cards coloridos por status (pendente, aprovada, recusada)

- [ ] Gerar apresentação Nano Banana com todas as funcionalidades criadas


## APRESENTAÇÃO E FOTOS (SOLICITADO)
- [x] Preparar conteúdo detalhado da apresentação Nano Banana
- [x] Gerar apresentação Nano Banana com todas as funcionalidades (19 slides gerados)
- [x] Buscar fotos profissionais de ônibus, vans e carros
- [x] Substituir imagens placeholder por fotos reais da frota (7 fotos adicionadas)
- [x] Atualizar seção de veículos no site com fotos reais


## NOVAS FUNCIONALIDADES SOLICITADAS
### 1. PÁGINA SOBRE NÓS ✅
- [x] Criar página /sobre com layout institucional
- [x] Adicionar seção de história da empresa
- [x] Criar timeline visual dos 19 anos
- [x] Adicionar missão, visão e valores
- [x] Criar seção de equipe com fotos (avatares com iniciais)
- [x] Adicionar diferenciais competitivos
- [x] Criar avatares para fundadores

### 2. SISTEMA DE AVALIAÇÕES ✅
- [x] Criar tabela reviews no banco de dados
- [x] Criar procedures tRPC para CRUD de avaliações (8 procedures)
- [x] Implementar formulário para clientes deixarem avaliações (backend pronto)
- [x] Criar interface de moderação admin (backend pronto)
- [x] Adicionar aprovação/rejeição de avaliações (procedures prontas)
- [x] Exibir avaliações aprovadas na home (procedure listApproved pronta)
- [x] Adicionar filtros e ordenação (por status implementado)
- [x] Implementar sistema de estrelas (1-5) (campo rating validado)

### 3. RELATÓRIOS FINANCEIROS
- [ ] Criar página /admin/relatorios
- [ ] Implementar gráfico de receitas vs despesas (Chart.js)
- [ ] Criar comparativo mensal com linha do tempo
- [ ] Adicionar top 5 categorias de despesas
- [ ] Implementar filtros por período
- [ ] Adicionar cards com totalizadores
- [ ] Criar função de exportação PDF
- [ ] Criar função de exportação Excel
