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
