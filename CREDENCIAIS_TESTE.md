# 🔐 Credenciais de Teste - Martins Turismo

## Sistema Web

**URL:** https://martinsturismo-fspfzdk4.manus.space

---

## 👤 Usuários Criados

### Administrador
- **Usuário:** `admin`
- **Senha:** `123456`
- **Permissões:** Acesso total ao sistema

### Motorista 1 - João Silva
- **Usuário:** `joao.silva`
- **Senha:** `123456`
- **Email:** joao.silva@martinsturismo.com.br
- **Telefone:** (41) 98765-4321

### Motorista 2 - Maria Santos
- **Usuário:** `maria.santos`
- **Senha:** `123456`
- **Email:** maria.santos@martinsturismo.com.br
- **Telefone:** (41) 98765-1234

### Motorista 3 - Pedro Costa
- **Usuário:** `pedro.costa`
- **Senha:** `123456`
- **Email:** pedro.costa@martinsturismo.com.br
- **Telefone:** (41) 98765-5678

---

## 📱 Aplicativo Android

### Configuração
1. Descompactar `martins-app-final.zip`
2. Editar `src/config/api.ts`:
   ```typescript
   export const API_CONFIG = {
     baseURL: 'https://martinsturismo-fspfzdk4.manus.space/api/trpc',
   };
   ```
3. Gerar APK: `./GERAR_APK_AGORA.sh`

### Login no App
Use as mesmas credenciais dos motoristas acima.

---

## 🚀 Próximos Passos

### 1. Criar Veículos
Acesse o sistema como **admin** e cadastre veículos em:
- Menu → Frota → Cadastrar Veículo

**Sugestão de 3 veículos:**
- **Van Mercedes Sprinter** - Placa: ABC-1234 - Capacidade: 16
- **Micro-ônibus Iveco Daily** - Placa: DEF-5678 - Capacidade: 28
- **Ônibus Marcopolo Volare** - Placa: GHI-9012 - Capacidade: 44

### 2. Configurar Planos Preventivos
Para cada veículo, criar planos de manutenção:
- **Troca de Óleo:** A cada 10.000 km
- **Revisão de Freios:** A cada 20.000 km
- **Alinhamento:** A cada 6 meses

### 3. Testar Check-list
1. Motorista faz login no app Android
2. Seleciona veículo
3. Preenche check-list
4. Marca problemas encontrados
5. Tira fotos
6. Envia check-list

### 4. Verificar OS Automática
1. Admin acessa painel de manutenção
2. Verifica OS criada automaticamente
3. Atribui mecânico
4. Acompanha execução

---

## ⚠️ Importante

**Senha padrão:** Todos os usuários têm senha `123456` para facilitar os testes.

**Recomendação:** Alterar as senhas em produção para senhas fortes e únicas.

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@martinsturismo.com.br
- WhatsApp: (41) 99102-1445
