/**
 * Serviço de geocodificação usando Nominatim API
 * Nominatim é o serviço de geocodificação do OpenStreetMap
 * Sem limites de requisições para uso não-comercial
 */

interface CoordenadaGeo {
  lat: number;
  lng: number;
  endereco?: string;
}

interface ResultadoNominatim {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Geocodificar endereço usando Nominatim API
 * @param endereco - Endereço completo
 * @param cep - CEP (opcional, melhora precisão)
 * @returns Coordenadas lat/lng ou null se não encontrado
 */
export async function geocodificarEndereco(
  endereco: string,
  cep?: string
): Promise<CoordenadaGeo | null> {
  try {
    // Construir query
    const query = cep
      ? `${endereco}, ${cep}, Brasil`
      : `${endereco}, Brasil`;

    // Fazer requisição para Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Martins-Frota-Turismo/1.0 (roteirizacao@martins.com.br)'
        }
      }
    );

    if (!response.ok) {
      console.error(`Geocodificação falhou: ${response.status} ${response.statusText}`);
      return null;
    }

    const dados: ResultadoNominatim[] = await response.json();

    if (dados.length === 0) {
      console.warn(`Nenhum resultado para: ${endereco}`);
      return null;
    }

    const resultado = dados[0];
    return {
      lat: parseFloat(resultado.lat),
      lng: parseFloat(resultado.lon),
      endereco: resultado.display_name
    };
  } catch (error) {
    console.error('Erro ao geocodificar:', error);
    return null;
  }
}

/**
 * Geocodificar múltiplos endereços em paralelo
 * @param enderecos - Array de endereços
 * @param ceps - Array de CEPs correspondentes
 * @returns Array de coordenadas
 */
export async function geocodificarMultiplos(
  enderecos: string[],
  ceps?: string[]
): Promise<(CoordenadaGeo | null)[]> {
  const promises = enderecos.map((endereco, idx) =>
    geocodificarEndereco(endereco, ceps?.[idx])
  );

  return Promise.all(promises);
}

/**
 * Geocodificação reversa: obter endereço a partir de coordenadas
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Endereço ou null
 */
export async function geocodificacaoReversa(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'Martins-Frota-Turismo/1.0 (roteirizacao@martins.com.br)'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const dados = await response.json();
    return dados.address?.road
      ? `${dados.address.road}, ${dados.address.house_number || ''}`
      : dados.display_name;
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    return null;
  }
}

/**
 * Validar CEP e retornar coordenadas aproximadas
 * @param cep - CEP no formato XXXXX-XXX ou XXXXXXXX
 * @returns Coordenadas ou null
 */
export async function validarCEP(cep: string): Promise<CoordenadaGeo | null> {
  try {
    // Remover formatação
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      console.warn(`CEP inválido: ${cep}`);
      return null;
    }

    // Usar CEP como query
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${cepLimpo} Brasil&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Martins-Frota-Turismo/1.0 (roteirizacao@martins.com.br)'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const dados: ResultadoNominatim[] = await response.json();

    if (dados.length === 0) {
      return null;
    }

    const resultado = dados[0];
    return {
      lat: parseFloat(resultado.lat),
      lng: parseFloat(resultado.lon),
      endereco: resultado.display_name
    };
  } catch (error) {
    console.error('Erro ao validar CEP:', error);
    return null;
  }
}

/**
 * Calcular distância entre duas coordenadas (Haversine)
 * @param lat1 - Latitude 1
 * @param lng1 - Longitude 1
 * @param lat2 - Latitude 2
 * @param lng2 - Longitude 2
 * @returns Distância em km
 */
export function calcularDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Obter bounding box (retângulo envolvente) de um conjunto de coordenadas
 * @param coordenadas - Array de coordenadas
 * @returns { minLat, maxLat, minLng, maxLng }
 */
export function obterBoundingBox(
  coordenadas: { lat: number; lng: number }[]
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const lats = coordenadas.map(c => c.lat);
  const lngs = coordenadas.map(c => c.lng);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  };
}

/**
 * Calcular centro (centróide) de um conjunto de coordenadas
 * @param coordenadas - Array de coordenadas
 * @returns Coordenada do centro
 */
export function calcularCentro(
  coordenadas: { lat: number; lng: number }[]
): { lat: number; lng: number } {
  const mediaLat = coordenadas.reduce((sum, c) => sum + c.lat, 0) / coordenadas.length;
  const mediaLng = coordenadas.reduce((sum, c) => sum + c.lng, 0) / coordenadas.length;

  return {
    lat: mediaLat,
    lng: mediaLng
  };
}
