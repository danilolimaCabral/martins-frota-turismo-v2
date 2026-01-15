import { db } from "./db";
import { trips, vehicles, cities, drivers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface ViagemData {
  turno: string;
  data: Date;
  veiculo: string;
  cidade: string;
  motorista: string;
  passageiros: number;
  kmInicial: number;
  kmFinal: number;
  combustivel: number;
  valor: number;
  tipo: "entrada" | "saida" | "extra";
}

export async function importViagensData(data: ViagemData[]) {
  try {
    console.log("🔄 Iniciando importação de dados de Viagens...");

    for (const item of data) {
      // Verificar/criar veículo
      let vehicleId: number;
      const existingVehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.name, item.veiculo))
        .limit(1);

      if (existingVehicle.length > 0) {
        vehicleId = existingVehicle[0].id;
      } else {
        const newVehicle = await db
          .insert(vehicles)
          .values({
            name: item.veiculo,
            type: "van",
            capacity: 15,
            createdAt: new Date(),
          })
          .returning();
        vehicleId = newVehicle[0].id;
      }

      // Verificar/criar cidade
      let cityId: number;
      const existingCity = await db
        .select()
        .from(cities)
        .where(eq(cities.name, item.cidade))
        .limit(1);

      if (existingCity.length > 0) {
        cityId = existingCity[0].id;
      } else {
        const newCity = await db
          .insert(cities)
          .values({
            name: item.cidade,
            state: "PR",
            createdAt: new Date(),
          })
          .returning();
        cityId = newCity[0].id;
      }

      // Verificar/criar motorista
      let driverId: number;
      const existingDriver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.name, item.motorista))
        .limit(1);

      if (existingDriver.length > 0) {
        driverId = existingDriver[0].id;
      } else {
        const newDriver = await db
          .insert(drivers)
          .values({
            name: item.motorista,
            phone: "",
            createdAt: new Date(),
          })
          .returning();
        driverId = newDriver[0].id;
      }

      // Registrar viagem
      await db.insert(trips).values({
        vehicleId,
        driverId,
        cityId,
        shift: item.turno,
        tripDate: item.data,
        passengers: item.passageiros,
        kmStart: item.kmInicial,
        kmEnd: item.kmFinal,
        fuelUsed: item.combustivel,
        value: item.valor,
        tripType: item.tipo,
        createdAt: new Date(),
      });

      console.log(`✅ Viagem registrada: ${item.veiculo} → ${item.cidade}`);
    }

    console.log("✅ Importação de dados de Viagens concluída!");
    return { success: true, message: "Dados importados com sucesso" };
  } catch (error) {
    console.error("❌ Erro ao importar dados de Viagens:", error);
    throw error;
  }
}
