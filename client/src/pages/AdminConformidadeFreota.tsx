import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VehicleDocumentation {
  id: number;
  vehicleName: string;
  fleetNumber: string;
  status: "completo" | "pendente" | "vencido";
  documents: {
    name: string;
    status: "ok" | "vencido" | "pendente";
    daysUntilExpiry: number;
    expiryDate: string;
  }[];
  overallCompliance: number;
}

export default function AdminConformidadeFreota() {
  const [selectedDocType, setSelectedDocType] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Dados simulados - em produção viriam do backend
  const vehicleData: VehicleDocumentation[] = [
    {
      id: 1,
      vehicleName: "Van Executiva 01",
      fleetNumber: "VAN001",
      status: "completo",
      documents: [
        {
          name: "Seguro RCO",
          status: "ok",
          daysUntilExpiry: 45,
          expiryDate: "2026-02-28",
        },
        {
          name: "Vistoria IMETRO",
          status: "ok",
          daysUntilExpiry: 120,
          expiryDate: "2026-05-14",
        },
        {
          name: "IPVA",
          status: "ok",
          daysUntilExpiry: 200,
          expiryDate: "2026-08-14",
        },
        {
          name: "Aferição Tacógrafo",
          status: "ok",
          daysUntilExpiry: 30,
          expiryDate: "2026-02-13",
        },
      ],
      overallCompliance: 100,
    },
    {
      id: 2,
      vehicleName: "Van Executiva 02",
      fleetNumber: "VAN002",
      status: "pendente",
      documents: [
        {
          name: "Seguro RCO",
          status: "vencido",
          daysUntilExpiry: -5,
          expiryDate: "2025-01-09",
        },
        {
          name: "Vistoria IMETRO",
          status: "ok",
          daysUntilExpiry: 90,
          expiryDate: "2026-04-14",
        },
        {
          name: "IPVA",
          status: "ok",
          daysUntilExpiry: 180,
          expiryDate: "2026-07-14",
        },
        {
          name: "Aferição Tacógrafo",
          status: "pendente",
          daysUntilExpiry: 0,
          expiryDate: "2026-01-14",
        },
      ],
      overallCompliance: 50,
    },
    {
      id: 3,
      vehicleName: "Ônibus Turismo 01",
      fleetNumber: "ONI001",
      status: "vencido",
      documents: [
        {
          name: "Seguro RCO",
          status: "ok",
          daysUntilExpiry: 60,
          expiryDate: "2026-03-14",
        },
        {
          name: "Vistoria IMETRO",
          status: "vencido",
          daysUntilExpiry: -30,
          expiryDate: "2024-12-15",
        },
        {
          name: "IPVA",
          status: "ok",
          daysUntilExpiry: 150,
          expiryDate: "2026-06-14",
        },
        {
          name: "Aferição Tacógrafo",
          status: "ok",
          daysUntilExpiry: 45,
          expiryDate: "2026-02-28",
        },
      ],
      overallCompliance: 75,
    },
    {
      id: 4,
      vehicleName: "Ônibus Turismo 02",
      fleetNumber: "ONI002",
      status: "completo",
      documents: [
        {
          name: "Seguro RCO",
          status: "ok",
          daysUntilExpiry: 75,
          expiryDate: "2026-03-29",
        },
        {
          name: "Vistoria IMETRO",
          status: "ok",
          daysUntilExpiry: 110,
          expiryDate: "2026-04-24",
        },
        {
          name: "IPVA",
          status: "ok",
          daysUntilExpiry: 210,
          expiryDate: "2026-08-24",
        },
        {
          name: "Aferição Tacógrafo",
          status: "ok",
          daysUntilExpiry: 50,
          expiryDate: "2026-03-04",
        },
      ],
      overallCompliance: 100,
    },
  ];

  const filteredVehicles = useMemo(() => {
    return vehicleData.filter((vehicle) => {
      const matchesSearch =
        vehicle.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "todos" || vehicle.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus]);

  const stats = useMemo(() => {
    const total = vehicleData.length;
    const completo = vehicleData.filter((v) => v.status === "completo").length;
    const pendente = vehicleData.filter((v) => v.status === "pendente").length;
    const vencido = vehicleData.filter((v) => v.status === "vencido").length;
    const avgCompliance =
      vehicleData.reduce((sum, v) => sum + v.overallCompliance, 0) / total;

    return { total, completo, pendente, vencido, avgCompliance };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-green-100 text-green-800";
      case "vencido":
        return "bg-red-100 text-red-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-4 h-4" />;
      case "vencido":
        return <AlertTriangle className="w-4 h-4" />;
      case "pendente":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance === 100) return "text-green-600";
    if (compliance >= 75) return "text-yellow-600";
    if (compliance >= 50) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            Conformidade de Frota
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o status de documentação de todos os veículos
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completo</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.completo}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendente</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.pendente}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencido</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.vencido}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Conformidade Média
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${getComplianceColor(stats.avgCompliance)}`}
                >
                  {stats.avgCompliance.toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por veículo ou número de frota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="completo">Completo</option>
              <option value="pendente">Pendente</option>
              <option value="vencido">Vencido</option>
            </select>

            <Button className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Conformidade */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Documentação ({filteredVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Veículo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Frota
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Seguro RCO
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Vistoria
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    IPVA
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Tacógrafo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Conformidade
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">{vehicle.vehicleName}</td>
                    <td className="py-3 px-4">{vehicle.fleetNumber}</td>
                    {vehicle.documents.map((doc, idx) => (
                      <td key={idx} className="py-3 px-4">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}
                        >
                          {getStatusIcon(doc.status)}
                          {doc.status === "ok"
                            ? "OK"
                            : doc.status === "vencido"
                              ? "Vencido"
                              : "Pendente"}
                        </div>
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              vehicle.overallCompliance === 100
                                ? "bg-green-600"
                                : vehicle.overallCompliance >= 75
                                  ? "bg-yellow-600"
                                  : vehicle.overallCompliance >= 50
                                    ? "bg-orange-600"
                                    : "bg-red-600"
                            }`}
                            style={{
                              width: `${vehicle.overallCompliance}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold">
                          {vehicle.overallCompliance}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === "completo"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vehicle.status === "completo"
                          ? "Completo"
                          : vehicle.status === "pendente"
                            ? "Pendente"
                            : "Vencido"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes de Documentação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {vehicle.vehicleName} ({vehicle.fleetNumber})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicle.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-600">
                        {doc.status === "ok"
                          ? `Vence em ${doc.daysUntilExpiry} dias`
                          : doc.status === "vencido"
                            ? `Vencido há ${Math.abs(doc.daysUntilExpiry)} dias`
                            : "Pendente de renovação"}
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}
                    >
                      {getStatusIcon(doc.status)}
                      {doc.status === "ok"
                        ? "OK"
                        : doc.status === "vencido"
                          ? "Vencido"
                          : "Pendente"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
