import React, { useState, useEffect } from "react";
import { MapPin, Clock, DollarSign, Star, Phone, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function AppMVPassageiro() {
  const [currentLocation, setCurrentLocation] = useState({ lat: -25.4383, lng: -49.2833 });
  const [destination, setDestination] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "found" | "in_progress" | "completed">("idle");
  const [mapa, setMapa] = useState<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!mapContainer) return;

    if (mapa) {
      mapa.remove();
    }

    const novoMapa = L.map(mapContainer).setView([currentLocation.lat, currentLocation.lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(novoMapa);

    // Marcador de localização atual
    L.circleMarker([currentLocation.lat, currentLocation.lng], {
      radius: 10,
      fillColor: "#FF6B35",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .bindPopup("Sua localização")
      .addTo(novoMapa);

    setMapa(novoMapa);
  }, [mapContainer]);

  const handleRequestRide = () => {
    setRideStatus("searching");
    setEstimatedPrice(Math.random() * 50 + 15);
    setTimeout(() => {
      setRideStatus("found");
    }, 3000);
  };

  const handleAcceptRide = () => {
    setRideStatus("in_progress");
  };

  const handleCompleteRide = () => {
    setRideStatus("completed");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">MV</div>
          <span className="text-sm">Martins Viagens</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Menu Dropdown */}
      {menuOpen && (
        <div className="bg-white border-b shadow-lg">
          <div className="p-4 space-y-3">
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2">
              <Star className="h-5 w-5" />
              Meu Perfil
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Histórico de Viagens
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 relative">
        <div ref={setMapContainer} className="w-full h-full" />

        {/* Card de Solicitação */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6 max-h-96 overflow-y-auto">
          {rideStatus === "idle" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Para onde você vai?</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <div className="text-sm text-gray-600">Localização atual</div>
                </div>

                <input
                  type="text"
                  placeholder="Destino"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <Button
                onClick={handleRequestRide}
                disabled={!destination}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold"
              >
                Solicitar Viagem
              </Button>
            </div>
          )}

          {rideStatus === "searching" && (
            <div className="space-y-4 text-center">
              <div className="animate-spin">
                <div className="h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
              <p className="text-lg font-semibold">Procurando motorista...</p>
              <p className="text-gray-600">Preço estimado: R$ {estimatedPrice.toFixed(2)}</p>
            </div>
          )}

          {rideStatus === "found" && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                <p className="text-lg font-bold text-green-700">✓ Motorista encontrado!</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Motorista</span>
                  <span className="font-bold">João Silva</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Veículo</span>
                  <span className="font-bold">Sprinter Branca - ABC1234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avaliação</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    4.9
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tempo de chegada</span>
                  <span className="font-bold">5 min</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAcceptRide} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Aceitar
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {rideStatus === "in_progress" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
                <p className="text-lg font-bold text-blue-700">🚗 Viagem em andamento</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tempo restante</span>
                  <span className="font-bold text-orange-600">8 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Distância</span>
                  <span className="font-bold">2.3 km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço estimado</span>
                  <span className="font-bold text-lg">R$ {estimatedPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar para Motorista
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {rideStatus === "completed" && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-green-700">✓ Viagem concluída!</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor total</span>
                  <span className="font-bold text-2xl text-orange-600">R$ {estimatedPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={() => setRideStatus("idle")} className="w-full bg-orange-600 hover:bg-orange-700">
                Nova Viagem
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
