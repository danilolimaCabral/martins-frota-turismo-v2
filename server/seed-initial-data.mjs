#!/usr/bin/env node

/**
 * Script de Seed de Dados Iniciais
 * Popula vehicle_types e city_configs com dados padrão
 * 
 * Uso: node seed-initial-data.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "martins_frota",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Dados padrão de veículos
const vehicleTypes = [
  {
    name: "Van 15",
    capacity: 15,
    description: "Van com capacidade para 15 passageiros",
  },
  {
    name: "Van 19",
    capacity: 19,
    description: "Van com capacidade para 19 passageiros",
  },
  {
    name: "Micro",
    capacity: 25,
    description: "Microônibus com capacidade para 25 passageiros",
  },
  {
    name: "Ônibus",
    capacity: 45,
    description: "Ônibus com capacidade para 45 passageiros",
  },
  {
    name: "Ônibus Executivo",
    capacity: 50,
    description: "Ônibus executivo com capacidade para 50 passageiros",
  },
];

// Dados padrão de cidades
const cities = [
  { name: "Araucária", state: "PR" },
  { name: "Curitiba", state: "PR" },
  { name: "Contenda", state: "PR" },
  { name: "São José dos Pinhais", state: "PR" },
  { name: "Fazenda Rio Grande", state: "PR" },
  { name: "Pinhais", state: "PR" },
  { name: "Almirante Tamandaré", state: "PR" },
];

async function seedData() {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Iniciando seed de dados iniciais...\n");

    // Seed Vehicle Types
    console.log("📦 Inserindo tipos de veículos...");
    for (const vehicle of vehicleTypes) {
      const [result] = await connection.query(
        "INSERT IGNORE INTO vehicle_types (name, capacity, description) VALUES (?, ?, ?)",
        [vehicle.name, vehicle.capacity, vehicle.description]
      );

      if (result.affectedRows > 0) {
        console.log(`  ✅ ${vehicle.name} - ${vehicle.capacity} passageiros`);
      } else {
        console.log(`  ⏭️  ${vehicle.name} - já existe`);
      }
    }

    console.log();

    // Seed Cities
    console.log("🏙️  Inserindo cidades...");
    for (const city of cities) {
      const [result] = await connection.query(
        "INSERT IGNORE INTO city_configs (name, state) VALUES (?, ?)",
        [city.name, city.state]
      );

      if (result.affectedRows > 0) {
        console.log(`  ✅ ${city.name}, ${city.state}`);
      } else {
        console.log(`  ⏭️  ${city.name}, ${city.state} - já existe`);
      }
    }

    console.log();

    // Seed Route Prices (preços padrão)
    console.log("💰 Inserindo preços de rotas padrão...");
    
    // Buscar IDs dos veículos e cidades
    const [vehicleRows] = await connection.query("SELECT id, name FROM vehicle_types");
    const [cityRows] = await connection.query("SELECT id, name FROM city_configs");

    const vehicleMap = Object.fromEntries(vehicleRows.map((v) => [v.name, v.id]));
    const cityMap = Object.fromEntries(cityRows.map((c) => [c.name, c.id]));

    // Preços padrão (exemplo)
    const routePrices = [
      // Van 15
      { vehicle: "Van 15", city: "Araucária", pricePerTrip: 150, pricePerKm: 2.5 },
      { vehicle: "Van 15", city: "Curitiba", pricePerTrip: 200, pricePerKm: 3.0 },
      { vehicle: "Van 15", city: "Contenda", pricePerTrip: 180, pricePerKm: 2.8 },
      { vehicle: "Van 15", city: "São José dos Pinhais", pricePerTrip: 170, pricePerKm: 2.6 },
      { vehicle: "Van 15", city: "Fazenda Rio Grande", pricePerTrip: 160, pricePerKm: 2.5 },
      { vehicle: "Van 15", city: "Pinhais", pricePerTrip: 165, pricePerKm: 2.6 },
      { vehicle: "Van 15", city: "Almirante Tamandaré", pricePerTrip: 175, pricePerKm: 2.7 },

      // Van 19
      { vehicle: "Van 19", city: "Araucária", pricePerTrip: 180, pricePerKm: 2.8 },
      { vehicle: "Van 19", city: "Curitiba", pricePerTrip: 250, pricePerKm: 3.5 },
      { vehicle: "Van 19", city: "Contenda", pricePerTrip: 220, pricePerKm: 3.2 },
      { vehicle: "Van 19", city: "São José dos Pinhais", pricePerTrip: 200, pricePerKm: 3.0 },
      { vehicle: "Van 19", city: "Fazenda Rio Grande", pricePerTrip: 190, pricePerKm: 2.9 },
      { vehicle: "Van 19", city: "Pinhais", pricePerTrip: 195, pricePerKm: 3.0 },
      { vehicle: "Van 19", city: "Almirante Tamandaré", pricePerTrip: 210, pricePerKm: 3.1 },

      // Micro
      { vehicle: "Micro", city: "Araucária", pricePerTrip: 250, pricePerKm: 3.5 },
      { vehicle: "Micro", city: "Curitiba", pricePerTrip: 350, pricePerKm: 4.5 },
      { vehicle: "Micro", city: "Contenda", pricePerTrip: 300, pricePerKm: 4.0 },
      { vehicle: "Micro", city: "São José dos Pinhais", pricePerTrip: 280, pricePerKm: 3.8 },
      { vehicle: "Micro", city: "Fazenda Rio Grande", pricePerTrip: 270, pricePerKm: 3.6 },
      { vehicle: "Micro", city: "Pinhais", pricePerTrip: 275, pricePerKm: 3.7 },
      { vehicle: "Micro", city: "Almirante Tamandaré", pricePerTrip: 290, pricePerKm: 3.9 },

      // Ônibus
      { vehicle: "Ônibus", city: "Araucária", pricePerTrip: 400, pricePerKm: 5.0 },
      { vehicle: "Ônibus", city: "Curitiba", pricePerTrip: 600, pricePerKm: 7.0 },
      { vehicle: "Ônibus", city: "Contenda", pricePerTrip: 500, pricePerKm: 6.0 },
      { vehicle: "Ônibus", city: "São José dos Pinhais", pricePerTrip: 450, pricePerKm: 5.5 },
      { vehicle: "Ônibus", city: "Fazenda Rio Grande", pricePerTrip: 430, pricePerKm: 5.2 },
      { vehicle: "Ônibus", city: "Pinhais", pricePerTrip: 440, pricePerKm: 5.3 },
      { vehicle: "Ônibus", city: "Almirante Tamandaré", pricePerTrip: 480, pricePerKm: 5.8 },

      // Ônibus Executivo
      { vehicle: "Ônibus Executivo", city: "Araucária", pricePerTrip: 500, pricePerKm: 6.0 },
      { vehicle: "Ônibus Executivo", city: "Curitiba", pricePerTrip: 750, pricePerKm: 8.5 },
      { vehicle: "Ônibus Executivo", city: "Contenda", pricePerTrip: 600, pricePerKm: 7.0 },
      { vehicle: "Ônibus Executivo", city: "São José dos Pinhais", pricePerTrip: 550, pricePerKm: 6.5 },
      { vehicle: "Ônibus Executivo", city: "Fazenda Rio Grande", pricePerTrip: 530, pricePerKm: 6.2 },
      { vehicle: "Ônibus Executivo", city: "Pinhais", pricePerTrip: 540, pricePerKm: 6.3 },
      { vehicle: "Ônibus Executivo", city: "Almirante Tamandaré", pricePerTrip: 580, pricePerKm: 6.8 },
    ];

    let pricesInserted = 0;
    for (const price of routePrices) {
      const vehicleId = vehicleMap[price.vehicle];
      const cityId = cityMap[price.city];

      if (!vehicleId || !cityId) {
        console.log(
          `  ⚠️  Veículo ou cidade não encontrada: ${price.vehicle} → ${price.city}`
        );
        continue;
      }

      const [result] = await connection.query(
        `INSERT IGNORE INTO route_prices (vehicle_type_id, city_id, price_per_trip, price_per_km) 
         VALUES (?, ?, ?, ?)`,
        [vehicleId, cityId, price.pricePerTrip, price.pricePerKm]
      );

      if (result.affectedRows > 0) {
        pricesInserted++;
      }
    }

    console.log(`  ✅ ${pricesInserted} preços de rotas inseridos`);

    console.log("\n✨ Seed de dados concluído com sucesso!\n");
  } catch (error) {
    console.error("❌ Erro ao fazer seed de dados:", error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedData();
