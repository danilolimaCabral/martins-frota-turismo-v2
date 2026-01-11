import mysql from 'mysql2/promise';

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚐 Cadastrando veículos...\n');

// Veículo 1 - Van Mercedes
await connection.execute(
  `INSERT INTO vehicles (plate, type, brand, model, year, capacity, color, status, currentKm, ipvaExpiry, insuranceExpiry, licenseExpiry, notes) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    'ABC-1234', 
    'van', 
    'Mercedes-Benz', 
    'Sprinter 415', 
    2023, 
    16, 
    'Branco', 
    'ativo', 
    45230.00, 
    '2026-03-31', 
    '2026-06-30', 
    '2026-12-31',
    'Van executiva para transporte corporativo'
  ]
);
console.log('✅ Van Mercedes Sprinter ABC-1234 cadastrada');
console.log('   • Capacidade: 16 passageiros');
console.log('   • Quilometragem: 45.230 km');
console.log('   • Status: Ativo\n');

// Veículo 2 - Micro-ônibus Iveco
await connection.execute(
  `INSERT INTO vehicles (plate, type, brand, model, year, capacity, color, status, currentKm, ipvaExpiry, insuranceExpiry, licenseExpiry, notes) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    'DEF-5678', 
    'micro-onibus', 
    'Iveco', 
    'Daily 70C17', 
    2022, 
    28, 
    'Prata', 
    'ativo', 
    67890.00, 
    '2026-03-31', 
    '2026-06-30', 
    '2026-12-31',
    'Micro-ônibus para excursões e viagens'
  ]
);
console.log('✅ Micro-ônibus Iveco Daily DEF-5678 cadastrado');
console.log('   • Capacidade: 28 passageiros');
console.log('   • Quilometragem: 67.890 km');
console.log('   • Status: Ativo\n');

// Veículo 3 - Ônibus Marcopolo
await connection.execute(
  `INSERT INTO vehicles (plate, type, brand, model, year, capacity, color, status, currentKm, ipvaExpiry, insuranceExpiry, licenseExpiry, notes) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    'GHI-9012', 
    'onibus', 
    'Marcopolo', 
    'Volare W9', 
    2021, 
    44, 
    'Azul', 
    'ativo', 
    125000.00, 
    '2026-03-31', 
    '2026-06-30', 
    '2026-12-31',
    'Ônibus para viagens longas e turismo'
  ]
);
console.log('✅ Ônibus Marcopolo Volare GHI-9012 cadastrado');
console.log('   • Capacidade: 44 passageiros');
console.log('   • Quilometragem: 125.000 km');
console.log('   • Status: Ativo\n');

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ 3 VEÍCULOS CADASTRADOS COM SUCESSO!\n');
console.log('🚐 FROTA ATIVA:');
console.log('   1. ABC-1234 - Mercedes Sprinter (Van) - 16 lugares');
console.log('   2. DEF-5678 - Iveco Daily (Micro-ônibus) - 28 lugares');
console.log('   3. GHI-9012 - Marcopolo Volare (Ônibus) - 44 lugares\n');
console.log('📊 Total de passageiros: 88');
console.log('═══════════════════════════════════════════════════════════');

await connection.end();
