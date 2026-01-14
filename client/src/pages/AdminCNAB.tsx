import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, CheckCircle , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function AdminCNAB() {
  const [, navigate] = useLocation();
  const [folhas, setFolhas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ mes: "", ano: "", banco: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mes || !formData.ano || !formData.banco) {
      toast.error("Preencha todos os campos");
      return;
    }
    toast.success("CNAB gerado com sucesso");
    setShowForm(false);
  };

  const handleDownload = () => {
    toast.success("Arquivo CNAB 240 baixado");
  };

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Geração de CNAB</h1>
          <p className="text-gray-600 mt-1">Gerar arquivo CNAB 240 para envio ao banco</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Gerar CNAB
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo CNAB</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Mês</Label>
                  <Select value={formData.mes} onValueChange={(v) => setFormData({ ...formData, mes: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {String(m).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ano</Label>
                  <Input type="number" value={formData.ano} onChange={(e) => setFormData({ ...formData, ano: e.target.value })} />
                </div>
                <div>
                  <Label>Banco</Label>
                  <Select value={formData.banco} onValueChange={(v) => setFormData({ ...formData, banco: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="001">001 - Banco do Brasil</SelectItem>
                      <SelectItem value="033">033 - Santander</SelectItem>
                      <SelectItem value="104">104 - Caixa</SelectItem>
                      <SelectItem value="237">237 - Bradesco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Gerar CNAB</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CNABs Gerados</CardTitle>
          <CardDescription>Total: {folhas.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Funcionários</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Janeiro/2026</TableCell>
                  <TableCell>Banco do Brasil</TableCell>
                  <TableCell>25</TableCell>
                  <TableCell>R$ 75.000,00</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Pronto</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
