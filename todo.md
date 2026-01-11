# Martins Turismo - TODO

## FASE ATUAL: INTEGRAÇÃO API CLIMA + ANÁLISE + ADMIN

### API de Clima Real (Open-Meteo - Gratuita)
- [x] Criar procedure tRPC para buscar clima de Curitiba e Araucária (weather-routers.ts)
- [x] Integrar Open-Meteo API (sem necessidade de chave) - 100% gratuita
- [x] Atualizar ticker no frontend para consumir dados reais (Home.tsx)
- [x] Implementar cache de 10 minutos para evitar excesso de requisições (backend + frontend)

### Análise Completa do Sistema
- [x] Revisar todas as páginas e funcionalidades existentes (16 páginas, 10 routers)
- [x] Identificar bugs e problemas de UX (3 erros TypeScript, páginas admin incompletas)
- [x] Listar funcionalidades faltantes na área administrativa (dashboard, upload, relatórios)
- [ ] Verificar responsividade mobile

### Completar Área Administrativa
- [ ] Dashboard com estatísticas gerais (TODO: implementar gráficos e métricas)
- [ ] CRUD completo de veículos (estrutura criada, precisa testar)
- [ ] CRUD completo de motoristas (estrutura criada, precisa testar)
- [ ] CRUD completo de viagens (estrutura criada, precisa testar)
- [ ] CRUD completo de manutenções (TODO: criar tabela e routers)
- [ ] Relatórios e exportação de dados (TODO: implementar)
- [ ] Gestão de usuários (TODO: criar interface admin)

### Testes
- [ ] Testar todas as funcionalidades administrativas
- [ ] Testar blog (criar, editar, excluir posts)
- [ ] Testar responsividade
- [ ] Testar fluxos de usuário

## CONCLUÍDO

### Blog Completo ✅
- [x] Criar tabela blog_posts no banco de dados (blogPosts com 18 campos)
- [x] Criar procedures tRPC para CRUD de posts (10 procedures)
- [x] Desenvolver página do blog (/blog) com listagem de artigos
- [x] Criar página de artigo individual (/blog/:slug)
- [x] Implementar sistema de categorias (8 categorias)
- [x] Criar interface de gerenciamento de posts no admin
- [x] Adicionar editor de conteúdo para criar/editar artigos

### Conteúdo do Blog ✅
- [x] Criar artigo sobre Gramado/RS (Natal Luz, parques temáticos)
- [x] Criar artigo sobre Beto Carrero World
- [x] Criar artigo sobre praias de Santa Catarina
- [x] Criar artigo sobre Aparecida/SP (Santuário Nacional)
- [x] Criar artigo sobre cidades históricas de Minas
- [x] Criar artigo sobre Fernando de Noronha
- [x] Criar artigo sobre Foz do Iguaçu
- [x] Criar artigo sobre Bonito/MS

### Correções de Layout ✅
- [x] Corrigir seção de motivos/diferenciais (layout, espaçamento)
- [x] Corrigir ticker de notícias sobrepondo conteúdo
- [x] Ajustar altura e padding do ticker

### Identidade Visual ✅
- [x] Trocar botão "Solicitar Orçamento" para laranja
- [x] Trocar todos os elementos azuis para laranja

### Ticker de Clima ✅
- [x] Remover ticker de notícias de viagens
- [x] Implementar ticker de clima com previsão de 4 dias

### GitHub ✅
- [x] Criar repositório no GitHub (danilolimaCabral/martins-turismo)
- [x] Fazer push do código (545 objetos, 24.57 MiB)
- [x] Repositório: https://github.com/danilolimaCabral/martins-turismo


## CORREÇÃO URGENTE - TICKER DE TEMPERATURA
- [x] Analisar problema de sobreposição no ticker (10 itens x 2 = 20 itens causando sobreposição)
- [x] Corrigir CSS e layout para evitar texto sobreposto (reduzido para 6 itens: 2 atuais + 4 previsões)
- [x] Testar ticker com dados reais da API (funcionando perfeitamente com scroll suave)
