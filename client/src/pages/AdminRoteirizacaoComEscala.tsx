import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, MapPin, Clock, Users, AlertCircle, CheckCircle, Loader , ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

interface Colaborador {
  id: number;
  nome: string;
  rua: string;
  numero: number;
  complemento?: string;
  cep: string;
  bairro: string;
  cidade: string;
  turno: number;
  horario: string;
  endereco_completo?: string;
}

interface PontoEmbarque {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  colaboradores: Colaborador[];
  horario_embarque: string;
  distancia_media: number;
}

interface Escala {
  ponto_id: string;
  ponto_nome: string;
  horario: string;
  colaboradores: string[];
  quantidade: number;
}

export default function AdminRoteirizacaoComEscala() {
  const [, setLocation] = useLocation();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [pontos, setPontos] = useState<PontoEmbarque[]>([]);
  const [escala, setEscala] = useState<Escala[]>([]);
  const [distanciaMaxima, setDistanciaMaxima] = useState<number>(700); // em metros
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [etapa, setEtapa] = useState<"upload" | "parametros" | "resultado">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Ler a aba do turno selecionado
        const sheetName = `${turnoSelecionado} Turno`;
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          alert(`Aba "${sheetName}" não encontrada na planilha`);
          setIsLoading(false);
          return;
        }

        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        // Processar dados
        const colaboradoresProcessados: Colaborador[] = rows.map((row, idx) => ({
          id: row["__EMPTY"] || idx,
          nome: row["__EMPTY_1"] || "",
          rua: row["__EMPTY_2"] || "",
          numero: row["__EMPTY_3"] || 0,
          complemento: row["__EMPTY_4"] || "",
          cep: row["__EMPTY_5"] || "",
          bairro: row["__EMPTY_6"] || "",
          cidade: row["__EMPTY_7"] || "",
          turno: row["__EMPTY_8"] || 1,
          horario: row["__EMPTY_9"] || "",
          endereco_completo: `${row["__EMPTY_2"] || ""}, ${row["__EMPTY_3"] || ""} - ${row["__EMPTY_7"] || ""}, ${row["__EMPTY_5"] || ""}`,
        })).filter(c => c.nome && c.nome.trim() !== "");

        setColaboradores(colaboradoresProcessados);
        setEtapa("parametros");
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        alert("Erro ao processar arquivo. Verifique o formato.");
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const calcularRoteirizacao = () => {
    if (colaboradores.length === 0) {
      alert("Nenhum colaborador carregado");
      return;
    }

    setIsLoading(true);

    // Simular cálculo de pontos de embarque (agrupamento por proximidade)
    // Em produção, isso seria feito com Google Maps API ou similar
    const pontosCalculados: PontoEmbarque[] = [];
    const colaboradoresAgrupados = new Map<string, Colaborador[]>();

    // Agrupar por bairro como proxy de proximidade
    colaboradores.forEach((colab) => {
      const chave = colab.bairro || colab.cidade;
      if (!colaboradoresAgrupados.has(chave)) {
        colaboradoresAgrupados.set(chave, []);
      }
      colaboradoresAgrupados.get(chave)!.push(colab);
    });

    // Criar pontos de embarque
    let pontoId = 1;
    const horariosBase = [
      { turno: 1, inicio: "06:00", intervalo: 15 },
      { turno: 2, inicio: "14:00", intervalo: 15 },
      { turno: 3, inicio: "22:00", intervalo: 15 },
    ];

    const horarioConfig = horariosBase.find(h => h.turno === parseInt(turnoSelecionado)) || horariosBase[0];

    colaboradoresAgrupados.forEach((colab, bairro) => {
      const pontoNome = bairro.toUpperCase();
      const horarioEmbarque = calcularHorario(horarioConfig.inicio, (pontoId - 1) * horarioConfig.intervalo);

      pontosCalculados.push({
        id: `ponto-${pontoId}`,
        nome: pontoNome,
        latitude: 25.4284 + Math.random() * 0.1, // Simulado
        longitude: -49.2733 + Math.random() * 0.1, // Simulado
        colaboradores: colab,
        horario_embarque: horarioEmbarque,
        distancia_media: Math.random() * distanciaMaxima,
      });

      pontoId++;
    });

    setPontos(pontosCalculados);

    // Gerar escala
    const escalaGerada: Escala[] = pontosCalculados.map((ponto) => ({
      ponto_id: ponto.id,
      ponto_nome: ponto.nome,
      horario: ponto.horario_embarque,
      colaboradores: ponto.colaboradores.map((c) => c.nome),
      quantidade: ponto.colaboradores.length,
    }));

    setEscala(escalaGerada);
    setEtapa("resultado");
    setIsLoading(false);
  };

  const calcularHorario = (horarioBase: string, minutos: number): string => {
    const [horas, mins] = horarioBase.split(":").map(Number);
    const totalMinutos = horas * 60 + mins + minutos;
    const novasHoras = Math.floor(totalMinutos / 60);
    const novosMinutos = totalMinutos % 60;
    return `${String(novasHoras).padStart(2, "0")}:${String(novosMinutos).padStart(2, "0")}`;
  };

  const exportarEscala = () => {
    const dados = escala.map((e) => ({
      "Ponto de Embarque": e.ponto_nome,
      "Horário": e.horario,
      "Quantidade": e.quantidade,
      "Colaboradores": e.colaboradores.join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Escala");
    XLSX.writeFile(wb, `escala-roteirizacao-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🗺️ Roteirização com Escala</h1>
          <p className="text-slate-600">Importe uma planilha e gere automaticamente a melhor rota com escala de embarque</p>
        </div>

        {/* Etapa 1: Upload */}
        {etapa === "upload" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-500" />
                Passo 1: Importar Planilha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">Clique para selecionar a planilha Excel</p>
                <p className="text-sm text-slate-600">Ou arraste o arquivo aqui</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {colaboradores.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>{colaboradores.length} colaboradores carregados</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Parâmetros */}
        {etapa === "parametros" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Passo 2: Configurar Parâmetros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Turno
                  </label>
                  <Select value={turnoSelecionado} onValueChange={setTurnoSelecionado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1º Turno (06h - 14h15)</SelectItem>
                      <SelectItem value="2">2º Turno (14h - 22h15)</SelectItem>
                      <SelectItem value="3">3º Turno (22h - 06h15)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Distância Máxima (metros)
                  </label>
                  <Input
                    type="number"
                    value={distanciaMaxima}
                    onChange={(e) => setDistanciaMaxima(Number(e.target.value))}
                    placeholder="700"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Distância máxima do endereço do colaborador até o ponto de embarque
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setEtapa("upload")}
                  variant="outline"
                >
                  Voltar
                </Button>
                <Button
                  onClick={calcularRoteirizacao}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    "Calcular Roteirização"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Resultado */}
        {etapa === "resultado" && (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Pontos de Embarque</p>
                    <p className="text-3xl font-bold text-slate-900">{pontos.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Colaboradores</p>
                    <p className="text-3xl font-bold text-slate-900">{colaboradores.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Escala Gerada</p>
                    <p className="text-3xl font-bold text-slate-900">{escala.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Escala de Embarque */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Escala de Embarque
                  </CardTitle>
                  <Button
                    onClick={exportarEscala}
                    variant="outline"
                    size="sm"
                  >
                    📥 Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ponto de Embarque</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Horário</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Colaboradores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escala.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-900">{item.ponto_nome}</td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              🕐 {item.horario}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              👥 {item.quantidade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">
                            <details>
                              <summary className="cursor-pointer font-medium">Ver lista</summary>
                              <div className="mt-2 space-y-1">
                                {item.colaboradores.map((nome, i) => (
                                  <div key={i} className="text-slate-700">• {nome}</div>
                                ))}
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setEtapa("upload");
                  setColaboradores([]);
                  setPontos([]);
                  setEscala([]);
                }}
                variant="outline"
              >
                Importar Novo Arquivo
              </Button>
              <Button
                onClick={() => alert("Simulação em tempo real será aberta em breve!")}
                className="bg-green-500 hover:bg-green-600"
              >
                ▶️ Iniciar Simulação
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
