import { db } from "../server/db";
import { users, vehicles, drivers, trips, customers, bookings } from "../drizzle/schema";
import { hashPassword } from "../server/auth";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Limpar dados existentes (exceto usuário admin)
    console.log("🗑️  Limpando dados antigos...");
    await db.delete(trips);
    await db.delete(drivers);
    await db.delete(vehicles);
    await db.delete(customers);

    // Adicionar clientes
    console.log("👥 Adicionando clientes...");
    const customersData = await db.insert(customers).values([
      {
        name: "Empresa ABC Ltda",
        email: "contato@empresaabc.com.br",
        phone: "(41) 3333-1111",
        document: "12.345.678/0001-90",
        address: "Rua das Empresas, 100 - Centro",
        city: "Curitiba",
        state: "PR",
        zipCode: "80010-000",
        active: true,
      },
      {
        name: "Indústria XYZ S/A",
        email: "rh@industriaxyz.com.br",
        phone: "(41) 3333-2222",
        document: "98.765.432/0001-10",
        address: "Av. Industrial, 500 - CIC",
        city: "Curitiba",
        state: "PR",
        zipCode: "81170-000",
        active: true,
      },
      {
        name: "Colégio Exemplo",
        email: "secretaria@colegioexemplo.com.br",
        phone: "(41) 3333-3333",
        document: "11.222.333/0001-44",
        address: "Rua da Educação, 200 - Batel",
        city: "Curitiba",
        state: "PR",
        zipCode: "80420-000",
        active: true,
      },
    ]);

    // Adicionar veículos
    console.log("🚌 Adicionando veículos...");
    const vehiclesData = await db.insert(vehicles).values([
      {
        plate: "ABC-1234",
        model: "Mercedes-Benz Sprinter",
        year: 2022,
        capacity: 20,
        type: "van",
        status: "available",
        lastMaintenance: new Date("2024-12-01"),
        nextMaintenance: new Date("2025-03-01"),
        mileage: 45000,
      },
      {
        plate: "DEF-5678",
        model: "Iveco Daily",
        year: 2021,
        capacity: 16,
        type: "van",
        status: "available",
        lastMaintenance: new Date("2024-11-15"),
        nextMaintenance: new Date("2025-02-15"),
        mileage: 62000,
      },
      {
        plate: "GHI-9012",
        model: "Volkswagen Constellation",
        year: 2023,
        capacity: 45,
        type: "bus",
        status: "available",
        lastMaintenance: new Date("2024-12-20"),
        nextMaintenance: new Date("2025-03-20"),
        mileage: 28000,
      },
      {
        plate: "JKL-3456",
        model: "Mercedes-Benz O 500",
        year: 2020,
        capacity: 50,
        type: "bus",
        status: "maintenance",
        lastMaintenance: new Date("2025-01-05"),
        nextMaintenance: new Date("2025-04-05"),
        mileage: 98000,
      },
      {
        plate: "MNO-7890",
        model: "Fiat Ducato",
        year: 2022,
        capacity: 15,
        type: "van",
        status: "available",
        lastMaintenance: new Date("2024-12-10"),
        nextMaintenance: new Date("2025-03-10"),
        mileage: 38000,
      },
    ]);

    // Adicionar motoristas
    console.log("🚗 Adicionando motoristas...");
    const driversData = await db.insert(drivers).values([
      {
        name: "João da Silva",
        cpf: "123.456.789-00",
        phone: "(41) 99999-1111",
        email: "joao.silva@mvturismo.com.br",
        licenseNumber: "12345678900",
        licenseCategory: "D",
        licenseExpiry: new Date("2026-06-15"),
        hireDate: new Date("2020-03-10"),
        status: "active",
      },
      {
        name: "Maria Santos",
        cpf: "987.654.321-00",
        phone: "(41) 99999-2222",
        email: "maria.santos@mvturismo.com.br",
        licenseNumber: "98765432100",
        licenseCategory: "E",
        licenseExpiry: new Date("2027-02-20"),
        hireDate: new Date("2019-08-15"),
        status: "active",
      },
      {
        name: "Carlos Oliveira",
        cpf: "456.789.123-00",
        phone: "(41) 99999-3333",
        email: "carlos.oliveira@mvturismo.com.br",
        licenseNumber: "45678912300",
        licenseCategory: "D",
        licenseExpiry: new Date("2025-11-30"),
        hireDate: new Date("2021-01-20"),
        status: "active",
      },
    ]);

    // Adicionar viagens
    console.log("🗺️  Adicionando viagens...");
    await db.insert(trips).values([
      {
        customerId: 1,
        vehicleId: 1,
        driverId: 1,
        origin: "Curitiba - PR",
        destination: "São Paulo - SP",
        departureDate: new Date("2025-01-20T08:00:00"),
        returnDate: new Date("2025-01-20T20:00:00"),
        passengers: 18,
        distance: 408,
        status: "scheduled",
        price: 2500.00,
      },
      {
        customerId: 2,
        vehicleId: 3,
        driverId: 2,
        origin: "Curitiba - PR",
        destination: "Florianópolis - SC",
        departureDate: new Date("2025-01-22T07:00:00"),
        returnDate: new Date("2025-01-22T21:00:00"),
        passengers: 42,
        distance: 300,
        status: "scheduled",
        price: 3800.00,
      },
      {
        customerId: 3,
        vehicleId: 5,
        driverId: 3,
        origin: "Curitiba - PR",
        destination: "Foz do Iguaçu - PR",
        departureDate: new Date("2025-01-25T06:00:00"),
        returnDate: new Date("2025-01-27T22:00:00"),
        passengers: 14,
        distance: 640,
        status: "scheduled",
        price: 4200.00,
      },
      {
        customerId: 1,
        vehicleId: 2,
        driverId: 1,
        origin: "Curitiba - PR",
        destination: "Morretes - PR",
        departureDate: new Date("2025-01-15T09:00:00"),
        returnDate: new Date("2025-01-15T18:00:00"),
        passengers: 15,
        distance: 70,
        status: "completed",
        price: 1200.00,
      },
      {
        customerId: 2,
        vehicleId: 3,
        driverId: 2,
        origin: "Curitiba - PR",
        destination: "Paranaguá - PR",
        departureDate: new Date("2025-01-10T08:00:00"),
        returnDate: new Date("2025-01-10T19:00:00"),
        passengers: 40,
        distance: 90,
        status: "completed",
        price: 1800.00,
      },
      {
        customerId: 3,
        vehicleId: 1,
        driverId: 3,
        origin: "Curitiba - PR",
        destination: "Ponta Grossa - PR",
        departureDate: new Date("2025-01-12T07:30:00"),
        returnDate: new Date("2025-01-12T20:00:00"),
        passengers: 18,
        distance: 115,
        status: "completed",
        price: 1500.00,
      },
      {
        customerId: 1,
        vehicleId: 2,
        driverId: 1,
        origin: "Curitiba - PR",
        destination: "Londrina - PR",
        departureDate: new Date("2025-02-01T06:00:00"),
        returnDate: new Date("2025-02-01T22:00:00"),
        passengers: 16,
        distance: 390,
        status: "scheduled",
        price: 2800.00,
      },
      {
        customerId: 2,
        vehicleId: 3,
        driverId: 2,
        origin: "Curitiba - PR",
        destination: "Gramado - RS",
        departureDate: new Date("2025-02-05T05:00:00"),
        returnDate: new Date("2025-02-07T23:00:00"),
        passengers: 45,
        distance: 450,
        status: "scheduled",
        price: 5200.00,
      },
      {
        customerId: 3,
        vehicleId: 5,
        driverId: 3,
        origin: "Curitiba - PR",
        destination: "Cambará do Sul - RS",
        departureDate: new Date("2025-02-10T06:00:00"),
        returnDate: new Date("2025-02-12T20:00:00"),
        passengers: 14,
        distance: 520,
        status: "scheduled",
        price: 4800.00,
      },
      {
        customerId: 1,
        vehicleId: 1,
        driverId: 1,
        origin: "Curitiba - PR",
        destination: "Balneário Camboriú - SC",
        departureDate: new Date("2025-02-15T07:00:00"),
        returnDate: new Date("2025-02-15T21:00:00"),
        passengers: 19,
        distance: 180,
        status: "scheduled",
        price: 2200.00,
      },
    ]);

    console.log("✅ Seed concluído com sucesso!");
    console.log("📊 Dados adicionados:");
    console.log("   - 3 clientes");
    console.log("   - 5 veículos");
    console.log("   - 3 motoristas");
    console.log("   - 10 viagens");
    console.log("\n🔐 Credenciais de acesso:");
    console.log("   Usuário: admin");
    console.log("   Senha: 123456");

  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n🎉 Banco de dados populado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Falha ao popular banco de dados:", error);
    process.exit(1);
  });
