# 🧪 Guia de Teste Completo - Sistema Martins Turismo

## ✅ Dados Configurados

### 👤 Usuários (Senha: 123456)
- **admin** - Administrador
- **joao.silva** - Motorista João Silva
- **maria.santos** - Motorista Maria Santos
- **pedro.costa** - Motorista Pedro Costa

### 🚐 Veículos
1. **ABC-1234** - Mercedes Sprinter (Van) - 16 lugares - 45.230 km
2. **DEF-5678** - Iveco Daily (Micro-ônibus) - 28 lugares - 67.890 km
3. **GHI-9012** - Marcopolo Volare (Ônibus) - 44 lugares - 125.000 km

### 📋 Templates de Check-list
- **Van**: 19 itens (Documentação, Pneus, Iluminação, Freios, Fluidos, Segurança, Limpeza)
- **Micro-ônibus**: 22 itens (+ Conforto)
- **Ônibus**: 27 itens (+ ABS, Martelo quebra-vidro, Banheiro)

### 🔧 Planos de Manutenção Preventiva
**Van ABC-1234:**
- Troca de Óleo: Próxima em 50.000 km (faltam 4.770 km)
- Revisão de Freios: Próxima em 60.000 km
- Alinhamento: **VENCIDO!** (deveria ter sido feito em 45.000 km)

**Micro-ônibus DEF-5678:**
- Troca de Óleo: Próxima em 70.000 km (faltam 2.110 km)
- Revisão de Freios: Próxima em 80.000 km
- Troca de Filtros: Próxima em 75.000 km

**Ônibus GHI-9012:**
- Troca de Óleo: Próxima em 130.000 km (faltam 5.000 km)
- Revisão de Freios: Próxima em 135.000 km
- Troca de Pneus: Próxima em 150.000 km
- Revisão Geral: Próxima em 150.000 km

---

## 🧪 Roteiro de Testes

### Teste 1: Login no Sistema Web

1. Acesse: https://3000-izyjwjgk2lanoc9bvwy8y-452b99df.us2.manus.computer
2. Faça login como **admin** / **123456**
3. ✅ Deve entrar no sistema

### Teste 2: Visualizar Alertas de Manutenção Preventiva

1. Acesse o painel de manutenção (se houver menu)
2. ✅ Deve ver alerta de **Alinhamento vencido** da Van ABC-1234
3. ✅ Deve ver alertas de manutenções próximas

### Teste 3: Testar App Android - Check-list Completo

#### 3.1. Instalar o App
```bash
# Opção 1: Expo Go (Mais rápido)
cd /home/ubuntu/martins-checklist-app
npm install
npm start
# Escanear QR code com Expo Go

# Opção 2: Gerar APK
./GERAR_APK_AGORA.sh
```

#### 3.2. Login no App
1. Abrir app
2. Usuário: **joao.silva**
3. Senha: **123456**
4. ✅ Deve fazer login

#### 3.3. Selecionar Veículo
1. Deve listar os 3 veículos
2. Selecionar **ABC-1234 - Mercedes Sprinter**
3. ✅ Deve abrir tela de check-list

#### 3.4. Preencher Check-list
1. Informar KM atual: **45500**
2. Responder itens:
   - **Documentação** → OK
   - **Pneus dianteiros** → OK
   - **Pneus traseiros** → **PROBLEMA** ❌
     - Observação: "Pneu traseiro direito com desgaste irregular"
     - Tirar foto (simular)
   - **Estepe** → OK
   - **Faróis** → OK
   - **Lanternas** → **PROBLEMA** ❌
     - Observação: "Lanterna traseira esquerda queimada"
     - Tirar foto (simular)
   - Demais itens → OK
3. Clicar em **Finalizar Check-list**
4. ✅ Deve enviar e mostrar mensagem de sucesso

### Teste 4: Verificar Criação Automática de OS

1. Voltar ao sistema web como **admin**
2. Acessar painel de manutenção
3. ✅ Deve ter **2 novas OS criadas automaticamente**:
   - OS #1: "Pneu traseiro direito com desgaste irregular"
   - OS #2: "Lanterna traseira esquerda queimada"
4. ✅ Status: **Pendente**
5. ✅ Prioridade: **Média** ou **Alta**
6. ✅ Tipo: **Corretiva**

### Teste 5: Gerenciar Ordem de Serviço

1. Clicar na OS #2 (Lanterna)
2. Atribuir mecânico: "Carlos Silva"
3. Alterar status para: **Em Andamento**
4. Adicionar observação: "Comprar lanterna nova"
5. ✅ Salvar alterações

### Teste 6: Concluir Ordem de Serviço

1. Abrir OS #2 novamente
2. Informar:
   - Valor mão de obra: R$ 50,00
   - Peça utilizada: Lanterna traseira
   - Quantidade: 1
   - Valor unitário: R$ 120,00
3. Alterar status para: **Concluída**
4. ✅ Deve calcular valor total: R$ 170,00
5. ✅ Deve criar **Conta a Pagar** automaticamente

### Teste 7: Verificar Conta a Pagar

1. Acessar módulo Financeiro → Contas a Pagar
2. ✅ Deve ter conta criada:
   - Descrição: "OS #2 - Lanterna traseira"
   - Valor: R$ 170,00
   - Status: **Pendente**
   - Categoria: Manutenção

### Teste 8: Criar OS Preventiva Manualmente

1. Painel de Manutenção
2. Ver alerta: "Alinhamento vencido - Van ABC-1234"
3. Clicar em **Criar OS Preventiva**
4. ✅ Deve criar OS automaticamente:
   - Tipo: **Preventiva**
   - Descrição: "Alinhamento e Balanceamento"
   - Veículo: ABC-1234

---

## 📊 Resultados Esperados

### ✅ Checklist Completo
- [x] Login funcionando (web + app)
- [x] Listagem de veículos no app
- [x] Preenchimento de check-list
- [x] Upload de fotos (simulado)
- [x] Envio de check-list

### ✅ Fluxo Automatizado
- [x] Criação automática de OS a partir de problemas
- [x] Alertas de manutenção preventiva
- [x] Cálculo automático de custos
- [x] Geração automática de conta a pagar

### ✅ Gestão de Manutenção
- [x] Listagem de OS
- [x] Atribuição de mecânicos
- [x] Controle de status
- [x] Registro de peças utilizadas
- [x] Dashboard de custos

---

## 🐛 Problemas Conhecidos

### App Android
- **Câmera**: Funciona apenas em dispositivo físico (não no emulador)
- **Modo Offline**: Implementado mas não testado extensivamente

### Sistema Web
- **Erros TypeScript**: Alguns erros no AdminBlog.tsx (não afetam funcionalidade)

---

## 📞 Suporte

Encontrou algum problema? Anote:
- O que estava fazendo
- O que esperava que acontecesse
- O que realmente aconteceu
- Prints de tela (se possível)

---

## 🎯 Próximas Melhorias Sugeridas

1. **Notificações por Email**
   - Alertar admin quando OS é criada
   - Alertar quando manutenção está vencida

2. **Relatórios PDF**
   - Exportar histórico de manutenções
   - Gerar relatório de custos por veículo

3. **Dashboard Executivo**
   - Gráficos de custos mensais
   - Indicadores de performance da frota
   - Análise de disponibilidade dos veículos

4. **Integração com GPS**
   - Rastreamento em tempo real
   - Atualização automática de quilometragem
   - Alertas de desvio de rota

5. **Portal do Cliente**
   - Acompanhamento de viagens
   - Solicitação de orçamentos
   - Avaliações de serviço

---

**✅ SISTEMA PRONTO PARA TESTES!**
**Boa sorte! 🚀**
