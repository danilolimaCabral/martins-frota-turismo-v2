import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";

// Coordenadas das cidades
const CITIES = {
  curitiba: { lat: -25.4284, lon: -49.2733, name: "Curitiba" },
  araucaria: { lat: -25.5931, lon: -49.4091, name: "Araucária" },
};

// Mapeamento de códigos WMO para descrições em português
const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Céu limpo", icon: "☀️" },
  1: { description: "Principalmente limpo", icon: "🌤️" },
  2: { description: "Parcialmente nublado", icon: "⛅" },
  3: { description: "Nublado", icon: "☁️" },
  45: { description: "Nevoeiro", icon: "🌫️" },
  48: { description: "Nevoeiro com geada", icon: "🌫️" },
  51: { description: "Chuvisco leve", icon: "🌦️" },
  53: { description: "Chuvisco moderado", icon: "🌦️" },
  55: { description: "Chuvisco intenso", icon: "🌦️" },
  61: { description: "Chuva leve", icon: "🌧️" },
  63: { description: "Chuva moderada", icon: "🌧️" },
  65: { description: "Chuva forte", icon: "🌧️" },
  71: { description: "Neve leve", icon: "🌨️" },
  73: { description: "Neve moderada", icon: "🌨️" },
  75: { description: "Neve forte", icon: "🌨️" },
  77: { description: "Granizo", icon: "🌨️" },
  80: { description: "Pancadas leves", icon: "🌦️" },
  81: { description: "Pancadas moderadas", icon: "🌦️" },
  82: { description: "Pancadas fortes", icon: "⛈️" },
  85: { description: "Pancadas de neve leves", icon: "🌨️" },
  86: { description: "Pancadas de neve fortes", icon: "🌨️" },
  95: { description: "Tempestade", icon: "⛈️" },
  96: { description: "Tempestade com granizo leve", icon: "⛈️" },
  99: { description: "Tempestade com granizo forte", icon: "⛈️" },
};

function getWeatherDescription(code: number) {
  return WEATHER_CODES[code] || { description: "Desconhecido", icon: "❓" };
}

// Cache simples em memória (10 minutos)
let weatherCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export const weatherRouter = router({
  // Buscar clima atual e previsão para Curitiba e Araucária
  getWeather: publicProcedure.query(async () => {
    // Verificar cache
    if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_DURATION) {
      return weatherCache.data;
    }

    try {
      const weatherData = await Promise.all(
        Object.entries(CITIES).map(async ([key, city]) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=4`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch weather for ${city.name}`);
          }

          const data = await response.json();

          // Processar dados atuais
          const current = {
            temperature: Math.round(data.current.temperature_2m),
            ...getWeatherDescription(data.current.weather_code),
          };

          // Processar previsão diária
          const forecast = data.daily.time.map((date: string, index: number) => {
            const dayOfWeek = new Date(date).toLocaleDateString("pt-BR", {
              weekday: "short",
            });
            return {
              day: index === 0 ? "Hoje" : dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
              date,
              maxTemp: Math.round(data.daily.temperature_2m_max[index]),
              minTemp: Math.round(data.daily.temperature_2m_min[index]),
              ...getWeatherDescription(data.daily.weather_code[index]),
            };
          });

          return {
            city: city.name,
            current,
            forecast,
          };
        })
      );

      const result = {
        curitiba: weatherData[0],
        araucaria: weatherData[1],
        lastUpdated: new Date().toISOString(),
      };

      // Atualizar cache
      weatherCache = {
        data: result,
        timestamp: Date.now(),
      };

      return result;
    } catch (error) {
      console.error("Error fetching weather:", error);
      throw new Error("Failed to fetch weather data");
    }
  }),
});
