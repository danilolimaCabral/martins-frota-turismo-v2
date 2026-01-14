import React, { useState, useEffect } from "react";
import { MapPin, Phone, DollarSign, Star, LogOut, Menu, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function AppMVMotorista() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: -25.4383, lng: -49.2833 });
  const [rideRequest, setRideRequest] = useState<any>(null);
  const [rideStatus, setRideStatus] = useState<"idle" | "requested" | "in_progress" | "completed">("idle");
  const [mapa, setMapa] = useState<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(1250.50);
  const [rating, setRating] = useState(4.9);

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
      fillColor: isOnline ? "#10B981" : "#6B7280",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .bindPopup(isOnline ? "Você está online" : "Você está offline")
      .addTo(novoMapa);

    setMapa(novoMapa);
  }, [mapContainer, isOnline]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      // Simular solicitação de corrida
      setTimeout(() => {
        setRideRequest({
          passengerId: "P123",
          passengerName: "Maria Silva",
          rating: 4.8,
          pickupLocation: "Rua A, 100 - Centro",
          dropoffLocation: "Rua B, 200 - Bairro X",
          estimatedDistance: 3.2,
          estimatedPrice: 28.50,
        });
        setRideStatus("requested");
      }, 2000);
    }
  };

  const handleAcceptRide = () => {
    setRideStatus("in_progress");
  };

  const handleRejectRide = () => {
    setRideRequest(null);
    setRideStatus("idle");
  };

  const handleCompleteRide = () => {
    setRideStatus("completed");
    setTotalEarnings(totalEarnings + (rideRequest?.estimatedPrice || 0));
  };

  const handleNewRide = () => {
    setRideRequest(null);
    setRideStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">MV</div>
          <span className="text-sm">Motorista</span>
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
              <DollarSign className="h-5 w-5" />
              Ganhos
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`h-4 w-4 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
          <span className="font-semibold">{isOnline ? "Online" : "Offline"}</span>
        </div>
        <Button
          onClick={handleToggleOnline}
          className={isOnline ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        >
          {isOnline ? "Ficar Offline" : "Ficar Online"}
        </Button>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <div ref={setMapContainer} className="w-full h-full" />

        {/* Card de Status */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6 max-h-96 overflow-y-auto">
          {!isOnline && (
            <div className="space-y-4 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-lg font-semibold">Você está offline</p>
              <p className="text-gray-600">Fique online para receber solicitações de corridas</p>
            </div>
          )}

          {isOnline && rideStatus === "idle" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600">Aguardando solicitações...</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ganhos hoje</span>
                  <span className="font-bold text-lg text-green-600">R$ {totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avaliação</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {rating}
                  </span>
                </div>
              </div>
            </div>
          )}

          {rideStatus === "requested" && rideRequest && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
                <p className="text-lg font-bold text-blue-700">🔔 Nova Solicitação de Corrida!</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passageiro</span>
                  <span className="font-bold">{rideRequest.passengerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avaliação</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {rideRequest.rating}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-1">Saída</p>
                  <p className="font-semibold">{rideRequest.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Destino</p>
                  <p className="font-semibold">{rideRequest.dropoffLocation}</p>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-gray-600">Distância estimada</span>
                  <span className="font-bold">{rideRequest.estimatedDistance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ganho estimado</span>
                  <span className="font-bold text-lg text-green-600">R$ {rideRequest.estimatedPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAcceptRide} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceitar
                </Button>
                <Button onClick={handleRejectRide} variant="outline" className="flex-1">
                  Rejeitar
                </Button>
              </div>
            </div>
          )}

          {rideStatus === "in_progress" && rideRequest && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                <p className="text-lg font-bold text-green-700">🚗 Corrida em andamento</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passageiro</span>
                  <span className="font-bold">{rideRequest.passengerName}</span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-1">Destino</p>
                  <p className="font-semibold">{rideRequest.dropoffLocation}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ganho</span>
                  <span className="font-bold text-lg text-green-600">R$ {rideRequest.estimatedPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCompleteRide} className="flex-1 bg-green-600 hover:bg-green-700">
                  Concluir Corrida
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open("tel:+5541991021445")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
              </div>
            </div>
          )}

          {rideStatus === "completed" && rideRequest && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-green-700">✓ Corrida concluída!</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ganho</span>
                  <span className="font-bold text-2xl text-green-600">R$ {rideRequest.estimatedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total do dia</span>
                  <span className="font-bold">R$ {totalEarnings.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleNewRide} className="w-full bg-orange-600 hover:bg-orange-700">
                Próxima Corrida
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
