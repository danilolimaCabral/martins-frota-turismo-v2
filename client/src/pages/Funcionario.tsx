import { useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Fuel,
  Receipt,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  Upload,
  CheckCircle2,
  AlertCircle,
  Home,
  LogOut,
  User,
  FileText,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Funcionario() {
  const { user, logout } = useLocalAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "despesas" | "abastecimento" | "checklist">("dashboard");

  // Estado do formulário de despesas
  const [despesaForm, setDespesaForm] = useState({
    tipo: "alimentacao",
    valor: "",
    descricao: "",
    data: new Date().toISOString().split("T")[0],
  });

  // Estado do formulário de abastecimento
  const [abastecimentoForm, setAbastecimentoForm] = useState({
    vehicleId: "",
    litros: "",
    valorTotal: "",
    km: "",
    posto: "",
    data: new Date().toISOString().split("T")[0],
  });

  // Redirecionar se não estiver autenticado
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Verificar se é funcionário ou motorista
  if (user.role === "admin") {
    return <Redirect to="/admin" />;
  }

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-xs text-blue-200 capitalize">{user.role}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("despesas")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "despesas"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Receipt className="h-5 w-5" />
              <span className="font-medium">Lançar Despesa</span>
            </button>

            <button
              onClick={() => setActiveTab("abastecimento")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "abastecimento"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Fuel className="h-5 w-5" />
              <span className="font-medium">Abastecimento</span>
            </button>

            <button
              onClick={() => setActiveTab("checklist")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "checklist"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <ClipboardCheck className="h-5 w-5" />
              <span className="font-medium">Checklist Veículo</span>
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Portal do Funcionário
            </h1>
            <p className="text-gray-600">
              Bem-vindo, {user.name}! Gerencie suas atividades diárias.
            </p>
          </div>

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Despesas do Mês</p>
                        <h3 className="text-3xl font-bold">R$ 0,00</h3>
                      </div>
                      <DollarSign className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm mb-1">Abastecimentos</p>
                        <h3 className="text-3xl font-bold">0</h3>
                      </div>
                      <Fuel className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm mb-1">Checklists</p>
                        <h3 className="text-3xl font-bold">0</h3>
                      </div>
                      <CheckCircle2 className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma atividade registrada ainda.</p>
                    <p className="text-sm mt-2">
                      Comece lançando uma despesa ou abastecimento!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lançar Despesa */}
          {activeTab === "despesas" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Lançar Nova Despesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Despesa</Label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white mt-1"
                        value={despesaForm.tipo}
                        onChange={(e) =>
                          setDespesaForm({ ...despesaForm, tipo: e.target.value })
                        }
                      >
                        <option value="alimentacao">Alimentação</option>
                        <option value="hospedagem">Hospedagem</option>
                        <option value="pedagio">Pedágio</option>
                        <option value="estacionamento">Estacionamento</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={despesaForm.valor}
                        onChange={(e) =>
                          setDespesaForm({ ...despesaForm, valor: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={despesaForm.data}
                        onChange={(e) =>
                          setDespesaForm({ ...despesaForm, data: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Comprovante (Foto)</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input type="file" accept="image/*" />
                        <Button type="button" size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva a despesa..."
                      value={despesaForm.descricao}
                      onChange={(e) =>
                        setDespesaForm({ ...despesaForm, descricao: e.target.value })
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Lançar Despesa
                    </Button>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Abastecimento */}
          {activeTab === "abastecimento" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Registrar Abastecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Veículo</Label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white mt-1"
                        value={abastecimentoForm.vehicleId}
                        onChange={(e) =>
                          setAbastecimentoForm({
                            ...abastecimentoForm,
                            vehicleId: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecione o veículo</option>
                        <option value="1">Van Mercedes Sprinter - ABC1234</option>
                        <option value="2">Ônibus Marcopolo - XYZ5678</option>
                      </select>
                    </div>

                    <div>
                      <Label>Litros</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={abastecimentoForm.litros}
                        onChange={(e) =>
                          setAbastecimentoForm({
                            ...abastecimentoForm,
                            litros: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Valor Total (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={abastecimentoForm.valorTotal}
                        onChange={(e) =>
                          setAbastecimentoForm({
                            ...abastecimentoForm,
                            valorTotal: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Quilometragem Atual</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={abastecimentoForm.km}
                        onChange={(e) =>
                          setAbastecimentoForm({
                            ...abastecimentoForm,
                            km: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Posto</Label>
                      <Input
                        type="text"
                        placeholder="Nome do posto"
                        value={abastecimentoForm.posto}
                        onChange={(e) =>
                          setAbastecimentoForm({
                            ...abastecimentoForm,
                            posto: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={abastecimentoForm.data}
                        onChange={(e) =>
                          setAbastecimentoForm({
                            ...abastecimentoForm,
                            data: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Nota Fiscal (Foto)</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input type="file" accept="image/*" />
                        <Button type="button" size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-orange-600 to-orange-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Registrar Abastecimento
                    </Button>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Checklist */}
          {activeTab === "checklist" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Checklist do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Veículo</Label>
                    <select className="w-full h-10 px-3 rounded-lg border border-border bg-white mt-1">
                      <option value="">Selecione o veículo</option>
                      <option value="1">Van Mercedes Sprinter - ABC1234</option>
                      <option value="2">Ônibus Marcopolo - XYZ5678</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-4">
                    <h3 className="font-semibold text-lg">Itens de Verificação</h3>
                    
                    {[
                      "Nível de óleo",
                      "Água do radiador",
                      "Pneus (pressão e estado)",
                      "Freios",
                      "Luzes (faróis, lanternas, setas)",
                      "Limpadores de para-brisa",
                      "Cintos de segurança",
                      "Extintor de incêndio",
                      "Triângulo de sinalização",
                      "Documentação do veículo",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span>{item}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Alguma observação sobre o veículo?"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalizar Checklist
                    </Button>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
