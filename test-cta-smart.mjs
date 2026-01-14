#!/usr/bin/env node

/**
 * Script de teste para sincronização CTA Smart
 * Testa conexão com API e sincronização de dados
 */

import fetch from 'node-fetch';
import xml2js from 'xml2js';

const CTA_SMART_URL = 'https://ctasmart.com.br:8443/SvWebSincronizaAbastecimentos';
const CTA_SMART_TOKEN = '8Uj0tAO8TJ';

const parser = new xml2js.Parser();

async function testarConexaoCTASmart() {
  console.log('🧪 Iniciando teste de conexão com API CTA Smart...\n');

  try {
    console.log('📡 Conectando a:', CTA_SMART_URL);
    console.log('🔑 Token:', CTA_SMART_TOKEN);
    console.log('');

    const response = await fetch(
      `${CTA_SMART_URL}?token=${CTA_SMART_TOKEN}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlData = await response.text();
    const jsonData = await parser.parseStringPromise(xmlData);

    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Verificar status
    const status = jsonData.CTAPLUS.STATUS[0];
    console.log('📊 Status da API:');
    console.log(`   Código: ${status.CODIGO[0]}`);
    console.log(`   Mensagem: ${status.MENSAGEM[0]}\n`);

    // Processar abastecimentos
    const abastecimentos = jsonData.CTAPLUS.ABASTECIMENTOS[0].ABASTECIMENTO;
    
    if (!abastecimentos) {
      console.log('⚠️  Nenhum abastecimento encontrado.');
      return;
    }

    const abastecimentosList = Array.isArray(abastecimentos)
      ? abastecimentos
      : [abastecimentos];

    console.log(`📦 Abastecimentos encontrados: ${abastecimentosList.length}\n`);

    // Exibir primeiro abastecimento como exemplo
    const primeiro = abastecimentosList[0];
    console.log('📋 Exemplo de abastecimento:');
    console.log(`   ID: ${primeiro.ID[0]}`);
    console.log(`   Placa: ${primeiro.VEICULO[0].PLACA[0]}`);
    console.log(`   Volume: ${primeiro.VOLUME[0]} litros`);
    console.log(`   Odômetro: ${primeiro.ODOMETRO[0]} km`);
    console.log(`   Custo: R$ ${primeiro.CUSTO[0]}`);
    console.log(`   Data: ${primeiro.DATA_INICIO[0]} ${primeiro.HORA_INICIO[0]}`);
    console.log(`   Posto: ${primeiro.POSTO[0].NOME[0]}`);
    console.log(`   Frentista: ${primeiro.FRENTISTA[0].NOME[0]}\n`);

    console.log('✅ Teste concluído com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`   ✓ Conexão com API: OK`);
    console.log(`   ✓ Autenticação: OK`);
    console.log(`   ✓ Dados recebidos: ${abastecimentosList.length} registros`);
    console.log(`   ✓ Estrutura XML: Válida`);

    return true;
  } catch (error) {
    console.error('❌ Erro durante o teste:');
    console.error(`   ${error.message}\n`);
    return false;
  }
}

// Executar teste
const resultado = await testarConexaoCTASmart();
process.exit(resultado ? 0 : 1);
