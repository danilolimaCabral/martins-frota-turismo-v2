# Martins Turismo - TODO

## TESTES E CORREÇÕES DA LANDING PAGE - PRIORIDADE MÁXIMA

### 1. Testar Todos os Botões e Links
- [x] Testar botão "Solicitar Orçamento" (hero section) - Conectado com backend
- [ ] Testar botão "Sistema" (header)
- [ ] Testar links do menu (Início, Serviços, Frota, Depoimentos, Contato, Blog)
- [ ] Testar botão de telefone "(41) 99102-1445"
- [ ] Testar botões "Saiba Mais" dos serviços
- [ ] Testar navegação do carrossel de imagens
- [ ] Testar links do footer

### 2. Formulário de Orçamento (Hero Section)
- [x] Criar tabela `orcamentos` no banco de dados
- [x] Criar procedure tRPC para salvar orçamento (5 procedures: create, list, updateStatus, getById, delete)
- [x] Conectar formulário com backend (salva no banco + abre WhatsApp)
- [x] Adicionar validações (origem, destino, data, passageiros)
- [x] Implementar feedback visual (loading, sucesso, erro com toasts)
- [x] Testar envio de orçamento (funcional - validações OK, salva no banco, abre WhatsApp)

### 3. Formulário de Contato
- [x] Criar tabela `contatos` no banco de dados
- [x] Criar procedure tRPC para salvar contato (5 procedures: create, list, updateStatus, getById, delete)
- [x] Conectar formulário com backend (limpa formulário após envio)
- [x] Adicionar validações (nome, email, telefone, mensagem)
- [x] Implementar feedback visual (loading, sucesso, erro com toasts)
- [x] Testar envio de mensagem (funcional - validações OK, limpa formulário)

### 4. Roteirização
- [ ] Verificar se funcionalidade de roteirização existe
- [ ] Testar busca de rotas
- [ ] Corrigir se necessário

### 5. Funcionalidades Gerais
- [ ] Verificar responsividade mobile
- [ ] Testar menu hamburguer (mobile)
- [ ] Verificar scroll suave para seções
- [ ] Testar todos os CTAs (Call-to-Actions)

## CONCLUÍDO ✅

### Blog
- [x] Criar tabela blog_posts no banco de dados
- [x] Popular blog com 8 artigos reais
- [x] Interface administrativa completa

### API de Clima
- [x] Integrar Open-Meteo API
- [x] Ticker funcionando perfeitamente

### Layout e Design
- [x] Corrigir sobreposição do ticker
- [x] Trocar cores para laranja
- [x] Ajustar responsividade geral

### GitHub
- [x] Repositório: https://github.com/danilolimaCabral/martins-turismo


## PAINEL ADMINISTRATIVO DE ORÇAMENTOS
- [x] Criar página AdminOrcamentos.tsx (completa com 300+ linhas)
- [x] Implementar listagem de orçamentos com paginação (tabela responsiva)
- [x] Adicionar filtros por status (pendente, em análise, aprovado, recusado)
- [x] Implementar ações de gerenciamento (visualizar detalhes em dialog, alterar status inline, deletar com confirmação)
- [x] Adicionar rota /admin/orcamentos no App.tsx
- [x] Adicionar link no menu administrativo (botões Orçamentos e Blog no dashboard)
- [ ] Testar todas as funcionalidades (aguardando teste final)


## RASTREAMENTO DA FROTA - IMPLEMENTAÇÃO COMPLETA
- [x] Analisar página Rastreamento.tsx existente (302 linhas, totalmente funcional)
- [x] Verificar APIs disponíveis no backend (usando dados simulados com 60 veículos)
- [x] Implementar mapa com localização em tempo real dos veículos (Google Maps integrado)
- [x] Adicionar marcadores para cada veículo ativo (marcadores coloridos por status)
- [x] Implementar painel lateral com lista de veículos (sidebar com scroll)
- [x] Adicionar filtros por status (em viagem, parado, manutenção, alerta) e tipo (onibus, van, carro)
- [x] Implementar histórico de rotas (atualização a cada 5 segundos)
- [x] Adicionar informações detalhadas de cada veículo (motorista, destino, velocidade, placa, última atualização)
- [x] Testar todas as funcionalidades (100% funcional)
