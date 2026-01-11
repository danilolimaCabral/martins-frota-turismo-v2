#!/usr/bin/env node
/**
 * Script de Seed para Popular Banco de Dados
 * Adiciona dados de exemplo para demonstração do sistema
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Iniciando seed do banco de dados...\n');

// 1. Criar usuários
console.log('👥 Criando usuários...');
const hashedPassword = await bcrypt.hash('123456', 10);

const usuarios = [
  {
    username: 'gerente',
    password: hashedPassword,
    name: 'Carlos Gerente',
    email: 'gerente@mvturismo.com.br',
    role: 'admin',
    active: true,
  },
  {
    username: 'supervisor',
    password: hashedPassword,
    name: 'Ana Supervisora',
    email: 'supervisor@mvturismo.com.br',
    role: 'user',
    active: true,
  },
  {
    username: 'motorista1',
    password: hashedPassword,
    name: 'João Silva',
    email: 'joao@mvturismo.com.br',
    role: 'user',
    active: true,
  },
];

for (const usuario of usuarios) {
  await db.insert(schema.user).values(usuario).onDuplicateKeyUpdate({ set: { name: usuario.name } });
  console.log(`  ✓ ${usuario.name} (${usuario.username})`);
}

// 2. Criar motoristas
console.log('\n🚗 Criando motoristas...');
const motoristas = [
  {
    name: 'João Silva',
    cpf: '123.456.789-00',
    cnh: '12345678900',
    cnhCategory: 'D',
    cnhExpiry: new Date('2026-12-31'),
    phone: '(41) 99999-1111',
    email: 'joao@mvturismo.com.br',
    address: 'Rua das Flores, 123',
    city: 'Curitiba',
    state: 'PR',
    active: true,
  },
  {
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    cnh: '98765432100',
    cnhCategory: 'D',
    cnhExpiry: new Date('2027-06-30'),
    phone: '(41) 99999-2222',
    email: 'maria@mvturismo.com.br',
    address: 'Av. Brasil, 456',
    city: 'Curitiba',
    state: 'PR',
    active: true,
  },
  {
    name: 'Pedro Oliveira',
    cpf: '456.789.123-00',
    cnh: '45678912300',
    cnhCategory: 'D',
    cnhExpiry: new Date('2025-03-15'),
    phone: '(41) 99999-3333',
    email: 'pedro@mvturismo.com.br',
    address: 'Rua Paraná, 789',
    city: 'Curitiba',
    state: 'PR',
    active: true,
  },
];

const motoristasIds = [];
for (const motorista of motoristas) {
  const [result] = await db.insert(schema.driver).values(motorista);
  motoristasIds.push(result.insertId);
  console.log(`  ✓ ${motorista.name}`);
}

// 3. Criar veículos
console.log('\n🚌 Criando veículos...');
const veiculos = [
  {
    plate: 'ABC-1234',
    model: 'Mercedes-Benz Sprinter',
    year: 2022,
    capacity: 20,
    type: 'van',
    color: 'Branco',
    chassis: 'CHASSIS123456',
    renavam: 'RENAVAM123456',
    status: 'available',
    lastMaintenance: new Date('2024-12-01'),
    nextMaintenance: new Date('2025-03-01'),
    active: true,
  },
  {
    plate: 'DEF-5678',
    model: 'Volkswagen Constellation',
    year: 2021,
    capacity: 44,
    type: 'bus',
    color: 'Azul',
    chassis: 'CHASSIS789012',
    renavam: 'RENAVAM789012',
    status: 'available',
    lastMaintenance: new Date('2024-11-15'),
    nextMaintenance: new Date('2025-02-15'),
    active: true,
  },
  {
    plate: 'GHI-9012',
    model: 'Iveco Daily',
    year: 2023,
    capacity: 16,
    type: 'van',
    color: 'Prata',
    chassis: 'CHASSIS345678',
    renavam: 'RENAVAM345678',
    status: 'available',
    lastMaintenance: new Date('2024-12-10'),
    nextMaintenance: new Date('2025-03-10'),
    active: true,
  },
  {
    plate: 'JKL-3456',
    model: 'Marcopolo Paradiso',
    year: 2020,
    capacity: 50,
    type: 'bus',
    color: 'Branco',
    chassis: 'CHASSIS901234',
    renavam: 'RENAVAM901234',
    status: 'maintenance',
    lastMaintenance: new Date('2025-01-05'),
    nextMaintenance: new Date('2025-04-05'),
    active: true,
  },
  {
    plate: 'MNO-7890',
    model: 'Fiat Ducato',
    year: 2022,
    capacity: 15,
    type: 'van',
    color: 'Vermelho',
    chassis: 'CHASSIS567890',
    renavam: 'RENAVAM567890',
    status: 'available',
    lastMaintenance: new Date('2024-11-20'),
    nextMaintenance: new Date('2025-02-20'),
    active: true,
  },
];

const veiculosIds = [];
for (const veiculo of veiculos) {
  const [result] = await db.insert(schema.vehicle).values(veiculo);
  veiculosIds.push(result.insertId);
  console.log(`  ✓ ${veiculo.model} (${veiculo.plate})`);
}

// 4. Criar viagens
console.log('\n🗺️  Criando viagens...');
const viagens = [
  {
    vehicleId: veiculosIds[0],
    driverId: motoristasIds[0],
    origin: 'Curitiba, PR',
    destination: 'Florianópolis, SC',
    departureDate: new Date('2025-01-20T08:00:00'),
    returnDate: new Date('2025-01-20T18:00:00'),
    passengers: 18,
    distance: 300,
    status: 'scheduled',
    notes: 'Excursão para praias de Florianópolis',
  },
  {
    vehicleId: veiculosIds[1],
    driverId: motoristasIds[1],
    origin: 'Curitiba, PR',
    destination: 'Foz do Iguaçu, PR',
    departureDate: new Date('2025-01-22T06:00:00'),
    returnDate: new Date('2025-01-24T20:00:00'),
    passengers: 42,
    distance: 640,
    status: 'scheduled',
    notes: 'Passeio para Cataratas do Iguaçu - 3 dias',
  },
  {
    vehicleId: veiculosIds[2],
    driverId: motoristasIds[2],
    origin: 'Curitiba, PR',
    destination: 'Morretes, PR',
    departureDate: new Date('2025-01-18T09:00:00'),
    returnDate: new Date('2025-01-18T17:00:00'),
    passengers: 14,
    distance: 70,
    status: 'completed',
    notes: 'Passeio gastronômico - Barreado',
  },
  {
    vehicleId: veiculosIds[0],
    driverId: motoristasIds[0],
    origin: 'Curitiba, PR',
    destination: 'Gramado, RS',
    departureDate: new Date('2025-01-25T07:00:00'),
    returnDate: new Date('2025-01-27T21:00:00'),
    passengers: 19,
    distance: 420,
    status: 'scheduled',
    notes: 'Natal Luz - 3 dias',
  },
  {
    vehicleId: veiculosIds[4],
    driverId: motoristasIds[1],
    origin: 'Curitiba, PR',
    destination: 'Paranaguá, PR',
    departureDate: new Date('2025-01-15T10:00:00'),
    returnDate: new Date('2025-01-15T16:00:00'),
    passengers: 12,
    distance: 90,
    status: 'completed',
    notes: 'Passeio ao litoral',
  },
  {
    vehicleId: veiculosIds[1],
    driverId: motoristasIds[2],
    origin: 'Curitiba, PR',
    destination: 'São Paulo, SP',
    departureDate: new Date('2025-01-28T05:00:00'),
    returnDate: new Date('2025-01-28T23:00:00'),
    passengers: 40,
    distance: 400,
    status: 'scheduled',
    notes: 'Excursão para shows e eventos',
  },
  {
    vehicleId: veiculosIds[2],
    driverId: motoristasIds[0],
    origin: 'Curitiba, PR',
    destination: 'Vila Velha, PR',
    departureDate: new Date('2025-01-12T08:00:00'),
    returnDate: new Date('2025-01-12T14:00:00'),
    passengers: 15,
    distance: 100,
    status: 'completed',
    notes: 'Parque Estadual de Vila Velha',
  },
  {
    vehicleId: veiculosIds[0],
    driverId: motoristasIds[1],
    origin: 'Curitiba, PR',
    destination: 'Balneário Camboriú, SC',
    departureDate: new Date('2025-02-01T06:00:00'),
    returnDate: new Date('2025-02-03T22:00:00'),
    passengers: 18,
    distance: 280,
    status: 'scheduled',
    notes: 'Fim de semana na praia - 3 dias',
  },
  {
    vehicleId: veiculosIds[4],
    driverId: motoristasIds[2],
    origin: 'Curitiba, PR',
    destination: 'Ponta Grossa, PR',
    departureDate: new Date('2025-01-10T09:00:00'),
    returnDate: new Date('2025-01-10T18:00:00'),
    passengers: 13,
    distance: 120,
    status: 'completed',
    notes: 'Parque Vila Velha e Buraco do Padre',
  },
  {
    vehicleId: veiculosIds[1],
    driverId: motoristasIds[0],
    origin: 'Curitiba, PR',
    destination: 'Campos do Jordão, SP',
    departureDate: new Date('2025-02-05T05:00:00'),
    returnDate: new Date('2025-02-07T23:00:00'),
    passengers: 38,
    distance: 480,
    status: 'scheduled',
    notes: 'Festival de Inverno - 3 dias',
  },
];

for (const viagem of viagens) {
  await db.insert(schema.trip).values(viagem);
  console.log(`  ✓ ${viagem.origin} → ${viagem.destination}`);
}

console.log('\n✅ Seed concluído com sucesso!');
console.log('\n📊 Resumo:');
console.log(`  • ${usuarios.length} usuários criados`);
console.log(`  • ${motoristas.length} motoristas criados`);
console.log(`  • ${veiculos.length} veículos criados`);
console.log(`  • ${viagens.length} viagens criadas`);
console.log('\n🔐 Credenciais de acesso:');
console.log('  • admin / 123456 (Administrador)');
console.log('  • gerente / 123456 (Gerente)');
console.log('  • supervisor / 123456 (Supervisor)');
console.log('  • motorista1 / 123456 (Motorista)');

await connection.end();
