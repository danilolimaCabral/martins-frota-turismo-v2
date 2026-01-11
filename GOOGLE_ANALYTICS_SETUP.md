# 📊 Configuração do Google Analytics 4

## Status Atual

O código do Google Analytics 4 já está integrado no site (`client/index.html`), mas precisa ser configurado com o ID real da propriedade.

---

## 🚀 Como Configurar

### Passo 1: Criar Propriedade no Google Analytics

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Faça login com sua conta Google
3. Clique em **Admin** (engrenagem no canto inferior esquerdo)
4. Em **Conta**, clique em **Criar conta**
5. Preencha:
   - Nome da conta: **MV Turismo**
   - Nome da propriedade: **MV Turismo Website**
   - Fuso horário: **Brasil/São Paulo (GMT-3)**
   - Moeda: **Real brasileiro (R$)**
6. Clique em **Criar**
7. Aceite os termos de serviço

### Passo 2: Configurar Fluxo de Dados

1. Selecione **Web** como plataforma
2. Preencha:
   - URL do site: **https://mvturismo.vip**
   - Nome do fluxo: **MV Turismo Web**
3. Clique em **Criar fluxo**
4. **COPIE O ID DE MEDIÇÃO** (formato: `G-XXXXXXXXXX`)

### Passo 3: Atualizar o Código

1. Abra o arquivo `client/index.html`
2. Localize as linhas 74 e 79:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
3. Substitua **G-XXXXXXXXXX** pelo ID real copiado
4. Salve o arquivo
5. Faça commit e publique o site

### Passo 4: Verificar Instalação

1. Acesse o site: https://mvturismo.vip
2. No Google Analytics, vá em **Relatórios** → **Tempo real**
3. Você deve ver sua visita aparecendo em tempo real
4. Se aparecer, está funcionando! ✅

---

## 📈 Eventos Recomendados para Rastrear

### Eventos Automáticos (já rastreados)
- ✅ `page_view` - Visualizações de página
- ✅ `session_start` - Início de sessão
- ✅ `first_visit` - Primeira visita
- ✅ `scroll` - Rolagem de página

### Eventos Personalizados (implementar depois)

#### 1. Solicitação de Orçamento
```javascript
gtag('event', 'solicitar_orcamento', {
  'event_category': 'conversao',
  'event_label': 'Formulário de orçamento',
  'value': 1
});
```

#### 2. Clique no Telefone
```javascript
gtag('event', 'click_telefone', {
  'event_category': 'contato',
  'event_label': '(41) 99102-1445'
});
```

#### 3. Visualização de Veículo
```javascript
gtag('event', 'view_vehicle', {
  'event_category': 'frota',
  'event_label': 'Van Mercedes Sprinter',
  'vehicle_type': 'van'
});
```

#### 4. Login no Sistema
```javascript
gtag('event', 'login', {
  'method': 'username'
});
```

---

## 🎯 Metas de Conversão Sugeridas

Configure estas metas no Google Analytics:

1. **Solicitação de Orçamento**
   - Tipo: Evento
   - Nome do evento: `solicitar_orcamento`
   - Valor: Alta prioridade

2. **Contato por Telefone**
   - Tipo: Evento
   - Nome do evento: `click_telefone`
   - Valor: Média prioridade

3. **Tempo no Site > 2 minutos**
   - Tipo: Engajamento
   - Condição: `engagement_time_msec > 120000`

4. **Visualização de 3+ Páginas**
   - Tipo: Engajamento
   - Condição: `page_view >= 3`

---

## 📊 Relatórios Importantes

### 1. Relatório de Aquisição
- **Onde:** Relatórios → Aquisição → Visão geral
- **O que ver:** De onde vêm os visitantes (Google, redes sociais, direto)

### 2. Relatório de Comportamento
- **Onde:** Relatórios → Engajamento → Páginas e telas
- **O que ver:** Páginas mais visitadas, tempo médio

### 3. Relatório de Conversões
- **Onde:** Relatórios → Conversões → Eventos
- **O que ver:** Quantas solicitações de orçamento, cliques no telefone

### 4. Relatório em Tempo Real
- **Onde:** Relatórios → Tempo real
- **O que ver:** Visitantes online agora, páginas sendo visualizadas

---

## 🔗 Links Úteis

- [Google Analytics](https://analytics.google.com/)
- [Documentação GA4](https://support.google.com/analytics/answer/9304153)
- [Guia de Eventos](https://support.google.com/analytics/answer/9267735)
- [Google Tag Assistant](https://tagassistant.google.com/)

---

## ✅ Checklist de Configuração

- [ ] Criar conta no Google Analytics
- [ ] Criar propriedade MV Turismo
- [ ] Copiar ID de medição (G-XXXXXXXXXX)
- [ ] Atualizar client/index.html com ID real
- [ ] Publicar site
- [ ] Verificar em Tempo Real
- [ ] Configurar metas de conversão
- [ ] Implementar eventos personalizados (opcional)
- [ ] Configurar alertas de tráfego (opcional)

---

**Tempo estimado:** 15-20 minutos

**Dificuldade:** Fácil ⭐

**Prioridade:** Alta 🔴
