import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HardDrive, Plus, Download, Upload, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BackupData {
  id: number;
  nome: string;
  data: string;
  tamanho: string;
  status: "completo" | "parcial" | "falho";
  tipo: "manual" | "automático";
  descricao: string;
}

export default function AdminBackupRestore() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backups, setBackups] = useState<BackupData[]>([
    {
      id: 1,
      nome: "Backup_2024_01_13_Full",
      data: "2024-01-13 14:30:00",
      tamanho: "2.5 GB",
      status: "completo",
      tipo: "automático",
      descricao: "Backup completo do banco de dados",
    },
    {
      id: 2,
      nome: "Backup_2024_01_12_Full",
      data: "2024-01-12 02:00:00",
      tamanho: "2.4 GB",
      status: "completo",
      tipo: "automático",
      descricao: "Backup completo do banco de dados",
    },
    {
      id: 3,
      nome: "Backup_2024_01_13_Manual",
      data: "2024-01-13 10:15:00",
      tamanho: "1.8 GB",
      status: "completo",
      tipo: "manual",
      descricao: "Backup manual antes de atualização",
    },
    {
      id: 4,
      nome: "Backup_2024_01_11_Full",
      data: "2024-01-11 02:00:00",
      tamanho: "2.3 GB",
      status: "completo",
      tipo: "automático",
      descricao: "Backup completo do banco de dados",
    },
    {
      id: 5,
      nome: "Backup_2024_01_10_Partial",
      data: "2024-01-10 02:00:00",
      tamanho: "1.5 GB",
      status: "parcial",
      tipo: "automático",
      descricao: "Backup parcial (tabelas principais)",
    },
  ]);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "manual" as "manual" | "automático",
  });

  const handleCreateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome) {
      toast.error("Nome do backup é obrigatório");
      return;
    }

    const novoBackup: BackupData = {
      id: Math.max(...backups.map(b => b.id), 0) + 1,
      nome: formData.nome,
      data: new Date().toLocaleString('pt-BR'),
      tamanho: "2.5 GB",
      status: "completo",
      tipo: formData.tipo,
      descricao: formData.descricao,
    };

    setBackups([novoBackup, ...backups]);
    toast.success("Backup criado com sucesso!");
    setFormData({ nome: "", descricao: "", tipo: "manual" });
    setIsDialogOpen(false);
  };

  const handleRestore = (backup: BackupData) => {
    if (confirm(`Deseja restaurar o backup "${backup.nome}"? Isso pode levar alguns minutos.`)) {
      toast.loading("Restaurando backup...");
      setTimeout(() => {
        toast.success("Backup restaurado com sucesso!");
      }, 3000);
    }
  };

  const handleDownload = (backup: BackupData) => {
    toast.success(`Iniciando download de ${backup.nome}...`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este backup?")) {
      setBackups(backups.filter(b => b.id !== id));
      toast.success("Backup deletado com sucesso!");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completo":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "parcial":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "falho":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completo":
        return "Completo";
      case "parcial":
        return "Parcial";
      case "falho":
        return "Falho";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completo":
        return "bg-green-100 text-green-800";
      case "parcial":
        return "bg-yellow-100 text-yellow-800";
      case "falho":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Backup e Restauração</h1>
        </div>
        <p className="text-slate-600">Gerencie backups do banco de dados e restaure dados quando necessário</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{backups.length}</div>
            <p className="text-xs text-slate-500 mt-1">Backups armazenados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Espaço Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {(backups.reduce((acc, b) => acc + parseFloat(b.tamanho), 0)).toFixed(1)} GB
            </div>
            <p className="text-xs text-slate-500 mt-1">Utilizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Último Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{backups[0]?.data.split(" ")[0] || "N/A"}</div>
            <p className="text-xs text-slate-500 mt-1">Data do último backup</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <Plus className="h-5 w-5 mr-2" />
              Novo Backup
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Backup</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Backup *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Backup_2024_01_13"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Backup antes de atualização"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Criar Backup
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-semibold mb-2">Nenhum backup encontrado</p>
              <p className="text-sm">Clique em "Novo Backup" para criar um</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(backup.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{backup.nome}</h3>
                      <p className="text-sm text-slate-600">{backup.descricao}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {backup.data}
                        </span>
                        <span>{backup.tamanho}</span>
                        <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(backup.status)}`}>
                          {getStatusLabel(backup.status)}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                          {backup.tipo === "manual" ? "Manual" : "Automático"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(backup)}
                      title="Restaurar backup"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(backup)}
                      title="Baixar backup"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(backup.id)}
                      title="Deletar backup"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <ul className="list-disc list-inside space-y-1">
            <li>Backups automáticos são realizados diariamente às 2:00 AM</li>
            <li>Mantenha pelo menos 3 backups recentes para segurança</li>
            <li>Restaurações podem levar alguns minutos dependendo do tamanho</li>
            <li>Teste periodicamente a restauração de backups</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
