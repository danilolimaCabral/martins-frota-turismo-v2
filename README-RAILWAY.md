# 🚀 Deploy no Railway - Martins Frota Turismo

## Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Repositório GitHub conectado ao Railway
3. Banco de dados MySQL/TiDB configurado

## Passo a Passo

### 1. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte o repositório `danilolimaCabral/martins-frota-turismo-v2`

### 2. Adicionar Banco de Dados

1. No projeto, clique em "+ New"
2. Selecione "Database" → "MySQL"
3. Copie a `DATABASE_URL` gerada

### 3. Configurar Variáveis de Ambiente

No painel do Railway, vá em "Variables" e adicione:

#### Obrigatórias:
```
DATABASE_URL=mysql://... (copiada do passo anterior)
JWT_SECRET=gere-uma-chave-secreta-forte
NODE_ENV=production
PORT=3000
```

#### Para Autenticação Manus:
```
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
OWNER_OPEN_ID=seu-open-id
OWNER_NAME=Seu Nome
```

#### Para Forge API:
```
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=sua-frontend-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.forge.manus.im
```

#### Para CTA Smart (Opcional):
```
CTA_SMART_TOKEN=8Uj0tAO8TJ
CTA_SMART_API_URL=https://ctasmart.com.br:8443
```

### 4. Deploy

O Railway fará o deploy automaticamente após configurar as variáveis.

### 5. Verificar

Acesse a URL gerada pelo Railway para verificar se o sistema está funcionando.

## Comandos Úteis

```bash
# Build local
pnpm build

# Iniciar produção
pnpm start

# Rodar migrações
pnpm db:push

# Rodar testes
pnpm test
```

## Estrutura do Projeto

```
├── client/          # Frontend React + Vite
├── server/          # Backend Express + tRPC
├── drizzle/         # Schema do banco de dados
├── shared/          # Tipos compartilhados
├── railway.json     # Configuração Railway
└── Procfile         # Comando de start
```

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
