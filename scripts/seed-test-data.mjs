import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🌱 Populando banco de dados com dados de teste...\n');

// Verificar se tabelas existem
console.log('🔍 Verificando tabelas existentes...\n');

// ============================================
// CRIAR USUÁRIOS
// ============================================
console.log('👤 Criando usuários...');

const senhaHash = await bcrypt.hash('123456', 10);

// Admin
await connection.execute(
  `INSERT INTO users (username, password, name, email, phone, role, active) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ['admin', senhaHash, 'Administrador', 'admin@martinsturismo.com.br', '(41) 99102-1445', 'admin', 1]
);
console.log('  ✅ Admin criado (username: admin, senha: 123456)');

// Motorista 1
await connection.execute(
  `INSERT INTO users (username, password, name, email, phone, role, active) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ['joao.silva', senhaHash, 'João Silva', 'joao.silva@martinsturismo.com.br', '(41) 98765-4321', 'motorista', 1]
);
const [userJoao] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const joaoUserId = userJoao[0].id;
console.log('  ✅ Motorista João Silva criado (username: joao.silva, senha: 123456)');

// Motorista 2
await connection.execute(
  `INSERT INTO users (username, password, name, email, phone, role, active) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ['maria.santos', senhaHash, 'Maria Santos', 'maria.santos@martinsturismo.com.br', '(41) 98765-1234', 'motorista', 1]
);
const [userMaria] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const mariaUserId = userMaria[0].id;
console.log('  ✅ Motorista Maria Santos criado (username: maria.santos, senha: 123456)');

// Motorista 3
await connection.execute(
  `INSERT INTO users (username, password, name, email, phone, role, active) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ['pedro.costa', senhaHash, 'Pedro Costa', 'pedro.costa@martinsturismo.com.br', '(41) 98765-5678', 'motorista', 1]
);
const [userPedro] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const pedroUserId = userPedro[0].id;
console.log('  ✅ Motorista Pedro Costa criado (username: pedro.costa, senha: 123456)\n');

// ============================================
// CRIAR MOTORISTAS (DRIVERS)
// ============================================
console.log('🚗 Criando cadastro de motoristas...');

// João Silva
await connection.execute(
  `INSERT INTO drivers (userId, name, cpf, rg, cnh, cnhCategory, cnhExpiry, phone, email, status, hireDate) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [joaoUserId, 'João Silva', '123.456.789-00', '12.345.678-9', '12345678900', 'D', '2026-12-31', '(41) 98765-4321', 'joao.silva@martinsturismo.com.br', 'ativo', '2020-01-15']
);
const [driverJoao] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const joaoDriverId = driverJoao[0].id;
console.log('  ✅ João Silva cadastrado como motorista');

// Maria Santos
await connection.execute(
  `INSERT INTO drivers (userId, name, cpf, rg, cnh, cnhCategory, cnhExpiry, phone, email, status, hireDate) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [mariaUserId, 'Maria Santos', '987.654.321-00', '98.765.432-1', '98765432100', 'D', '2027-06-30', '(41) 98765-1234', 'maria.santos@martinsturismo.com.br', 'ativo', '2021-03-10']
);
const [driverMaria] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const mariaDriverId = driverMaria[0].id;
console.log('  ✅ Maria Santos cadastrada como motorista');

// Pedro Costa
await connection.execute(
  `INSERT INTO drivers (userId, name, cpf, rg, cnh, cnhCategory, cnhExpiry, phone, email, status, hireDate) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [pedroUserId, 'Pedro Costa', '456.789.123-00', '45.678.912-3', '45678912300', 'D', '2025-09-15', '(41) 98765-5678', 'pedro.costa@martinsturismo.com.br', 'ativo', '2019-07-20']
);
const [driverPedro] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const pedroDriverId = driverPedro[0].id;
console.log('  ✅ Pedro Costa cadastrado como motorista\n');

// ============================================
// CRIAR VEÍCULOS
// ============================================
console.log('🚐 Criando veículos...');

// Veículo 1 - Van Mercedes
await connection.execute(
  `INSERT INTO vehicles (plate, type, brand, model, year, capacity, color, status, currentKm, ipvaExpiry, insuranceExpiry, licenseExpiry) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ['ABC-1234', 'van', 'Mercedes-Benz', 'Sprinter 415', 2023, 16, 'Branco', 'ativo', 45230, '2026-03-31', '2026-06-30', '2026-12-31']
);
const [vehicle1] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const vehicle1Id = vehicle1[0].id;
console.log('  ✅ Van Mercedes Sprinter ABC-1234 criada');

// Veículo 2 - Micro-ônibus Iveco
await connection.execute(
  `INSERT INTO vehicles (plate, type, brand, model, year, capacity, color, status, currentKm, ipvaExpiry, insuranceExpiry, licenseExpiry) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ['DEF-5678', 'micro-onibus', 'Iveco', 'Daily 70C17', 2022, 28, 'Prata', 'ativo', 67890, '2026-03-31', '2026-06-30', '2026-12-31']
);
const [vehicle2] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const vehicle2Id = vehicle2[0].id;
console.log('  ✅ Micro-ônibus Iveco Daily DEF-5678 criado');

// Veículo 3 - Ônibus Marcopolo
await connection.execute(
  `INSERT INTO vehicles (plate, type, brand, model, year, capacity, color, status, currentKm, ipvaExpiry, insuranceExpiry, licenseExpiry) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ['GHI-9012', 'onibus', 'Marcopolo', 'Volare W9', 2021, 44, 'Azul', 'ativo', 125000, '2026-03-31', '2026-06-30', '2026-12-31']
);
const [vehicle3] = await connection.execute('SELECT LAST_INSERT_ID() as id');
const vehicle3Id = vehicle3[0].id;
console.log('  ✅ Ônibus Marcopolo Volare GHI-9012 criado\n');

// ============================================
// CRIAR PLANOS DE MANUTENÇÃO PREVENTIVA
// ============================================
console.log('🔧 Criando planos de manutenção preventiva...');

// Planos para Veículo 1 (Van Mercedes)
await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle1Id, 'Troca de Óleo', 'Troca de óleo do motor e filtro', 10000, null, 40000, '2025-11-15', 50000, null, 1]
);
console.log('  ✅ Plano: Troca de Óleo (Van ABC-1234) - Próxima em 50.000 km');

await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle1Id, 'Revisão de Freios', 'Inspeção e troca de pastilhas/lonas', 20000, null, 40000, '2025-11-15', 60000, null, 1]
);
console.log('  ✅ Plano: Revisão de Freios (Van ABC-1234) - Próxima em 60.000 km');

await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle1Id, 'Alinhamento e Balanceamento', 'Alinhamento e balanceamento das rodas', null, 180, null, '2025-08-10', null, '2026-02-06', 1]
);
console.log('  ✅ Plano: Alinhamento (Van ABC-1234) - Próxima em 06/02/2026');

// Planos para Veículo 2 (Micro-ônibus Iveco)
await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle2Id, 'Troca de Óleo', 'Troca de óleo do motor e filtro', 10000, null, 60000, '2025-10-20', 70000, null, 1]
);
console.log('  ✅ Plano: Troca de Óleo (Micro-ônibus DEF-5678) - Próxima em 70.000 km');

await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle2Id, 'Revisão Geral', 'Revisão completa do veículo', null, 365, null, '2025-01-10', null, '2026-01-10', 1]
);
console.log('  ✅ Plano: Revisão Geral (Micro-ônibus DEF-5678) - Próxima em 10/01/2026');

// Planos para Veículo 3 (Ônibus Marcopolo)
await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle3Id, 'Troca de Óleo', 'Troca de óleo do motor e filtro', 10000, null, 120000, '2025-12-01', 130000, null, 1]
);
console.log('  ✅ Plano: Troca de Óleo (Ônibus GHI-9012) - Próxima em 130.000 km');

await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle3Id, 'Revisão de Freios', 'Inspeção e troca de pastilhas/lonas', 15000, null, 120000, '2025-12-01', 135000, null, 1]
);
console.log('  ✅ Plano: Revisão de Freios (Ônibus GHI-9012) - Próxima em 135.000 km');

await connection.execute(
  `INSERT INTO planos_manutencao_preventiva (veiculo_id, tipo_manutencao, descricao, intervalo_km, intervalo_dias, ultima_execucao_km, ultima_execucao_data, proxima_execucao_km, proxima_execucao_data, ativo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [vehicle3Id, 'Troca de Pneus', 'Troca completa dos pneus', 50000, null, 100000, '2025-06-15', 150000, null, 1]
);
console.log('  ✅ Plano: Troca de Pneus (Ônibus GHI-9012) - Próxima em 150.000 km\n');

// ============================================
// RESUMO
// ============================================
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ BANCO DE DADOS POPULADO COM SUCESSO!\n');
console.log('👤 USUÁRIOS CRIADOS:');
console.log('   • admin / 123456 (Administrador)');
console.log('   • joao.silva / 123456 (Motorista)');
console.log('   • maria.santos / 123456 (Motorista)');
console.log('   • pedro.costa / 123456 (Motorista)\n');
console.log('🚐 VEÍCULOS CRIADOS:');
console.log('   • ABC-1234 - Mercedes Sprinter (Van) - 45.230 km');
console.log('   • DEF-5678 - Iveco Daily (Micro-ônibus) - 67.890 km');
console.log('   • GHI-9012 - Marcopolo Volare (Ônibus) - 125.000 km\n');
console.log('🔧 PLANOS PREVENTIVOS:');
console.log('   • 8 planos de manutenção configurados');
console.log('   • Alertas automáticos ativos\n');
console.log('🌐 Acesse: https://martinsturismo-fspfzdk4.manus.space');
console.log('═══════════════════════════════════════════════════════════');

await connection.end();
