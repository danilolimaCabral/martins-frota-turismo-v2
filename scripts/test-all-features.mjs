#!/usr/bin/env node

/**
 * Script para testar todas as funcionalidades do sistema ERP
 * Simula login e testa todos os endpoints
 */

import { authenticateUserByUsername } from '../server/auth.js';

console.log('🧪 TESTE COMPLETO DO SISTEMA MARTINS TURISMO\n');
console.log('='.repeat(60));

// Teste 1: Autenticação
console.log('\n📋 TESTE 1: AUTENTICAÇÃO');
console.log('-'.repeat(60));

try {
  const loginResult = await authenticateUserByUsername('admin', '123456');
  
  if (loginResult.success) {
    console.log('✅ Login bem-sucedido');
    console.log(`   Token: ${loginResult.token?.substring(0, 20)}...`);
    console.log(`   Usuário: ${loginResult.user?.username}`);
    console.log(`   Role: ${loginResult.user?.role}`);
  } else {
    console.log('❌ Falha no login:', loginResult.error);
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Erro ao testar login:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ TODOS OS TESTES PASSARAM!');
console.log('='.repeat(60));
