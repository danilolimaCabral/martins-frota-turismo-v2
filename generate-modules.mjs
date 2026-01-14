import fs from 'fs';
import path from 'path';

const modules = [
  {
    name: 'AdminCalendarioAvancado',
    icon: 'Calendar',
    title: 'Calendário Avançado',
    description: 'Gerenciamento de calendário com agendamentos',
    color: 'from-orange-500 to-orange-600',
    dataType: 'CalendarioData',
    fields: ['titulo', 'data', 'hora', 'descricao', 'categoria'],
  },
  {
    name: 'AdminControleFerias',
    icon: 'Palmtree',
    title: 'Controle de Férias',
    description: 'Gerenciamento de férias e períodos de descanso',
    color: 'from-green-500 to-green-600',
    dataType: 'FeriasData',
    fields: ['funcionario', 'dataInicio', 'dataFim', 'dias', 'status'],
  },
  {
    name: 'AdminDetalhesEvento',
    icon: 'Calendar',
    title: 'Detalhes do Evento',
    description: 'Visualização e gerenciamento de detalhes de eventos',
    color: 'from-pink-500 to-pink-600',
    dataType: 'EventoData',
    fields: ['nome', 'data', 'local', 'participantes', 'status'],
  },
  {
    name: 'AdminExportacaoGPS',
    icon: 'MapPin',
    title: 'Exportação GPS',
    description: 'Exportar dados de rastreamento GPS',
    color: 'from-blue-500 to-blue-600',
    dataType: 'GPSData',
    fields: ['veiculo', 'dataInicio', 'dataFim', 'formato', 'status'],
  },
  {
    name: 'AdminFolhaPagamentoAvancada',
    icon: 'DollarSign',
    title: 'Folha de Pagamento Avançada',
    description: 'Gerenciamento avançado de folha de pagamento',
    color: 'from-green-500 to-green-600',
    dataType: 'FolhaData',
    fields: ['funcionario', 'salario', 'descontos', 'adicionais', 'liquido'],
  },
  {
    name: 'AdminHistoricoRotas',
    icon: 'Route',
    title: 'Histórico de Rotas',
    description: 'Visualização do histórico de rotas realizadas',
    color: 'from-purple-500 to-purple-600',
    dataType: 'RotaData',
    fields: ['veiculo', 'data', 'origem', 'destino', 'duracao'],
  },
  {
    name: 'AdminIntegracaoInterna',
    icon: 'Zap',
    title: 'Integração Interna',
    description: 'Gerenciamento de integrações internas do sistema',
    color: 'from-indigo-500 to-indigo-600',
    dataType: 'IntegracaoData',
    fields: ['nome', 'status', 'ultimaSincronizacao', 'erros', 'tipo'],
  },
  {
    name: 'AdminIntegracoes',
    icon: 'Zap',
    title: 'Integrações',
    description: 'Gerenciamento de integrações externas',
    color: 'from-indigo-500 to-indigo-600',
    dataType: 'IntegracaoExternaData',
    fields: ['nome', 'status', 'apiKey', 'ultimaSincronizacao', 'tipo'],
  },
  {
    name: 'AdminNotificacoes',
    icon: 'Bell',
    title: 'Notificações',
    description: 'Gerenciamento de notificações do sistema',
    color: 'from-red-500 to-red-600',
    dataType: 'NotificacaoData',
    fields: ['titulo', 'mensagem', 'tipo', 'data', 'lida'],
  },
  {
    name: 'AdminRelatoriosAgenda',
    icon: 'BarChart3',
    title: 'Relatórios de Agenda',
    description: 'Relatórios e análises de agenda',
    color: 'from-blue-500 to-blue-600',
    dataType: 'RelatorioAgendaData',
    fields: ['periodo', 'eventos', 'participantes', 'taxa', 'status'],
  },
  {
    name: 'AdminRelatoriosRH',
    icon: 'BarChart3',
    title: 'Relatórios RH',
    description: 'Relatórios e análises de recursos humanos',
    color: 'from-blue-500 to-blue-600',
    dataType: 'RelatorioRHData',
    fields: ['periodo', 'funcionarios', 'admissoes', 'demissoes', 'rotatividade'],
  },
];

const generateModuleCode = (module) => {
const fieldsCode = module.fields.map((field, idx) => {
    if (field === 'status') {
      return `      <td className="py-3 px-4">
                        <span className={item.${field} === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} style={{padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500'}}>
                          {item.${field} === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>`;
    }
    return `      <td className="py-3 px-4">{item.${field}}</td>`;
  }).join('\n');

  const formFields = module.fields.map(field => {
    if (field === 'status') {
      return `              <div>
                <Label htmlFor="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Select value={formData.${field}} onValueChange={(value) => setFormData({ ...formData, ${field}: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>`;
    }
    return `              <div>
                <Label htmlFor="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input
                  id="${field}"
                  value={formData.${field}}
                  onChange={(e) => setFormData({ ...formData, ${field}: e.target.value })}
                  placeholder="${field}"
                />
              </div>`;
  }).join('\n');

  const formDataInit = module.fields.reduce((acc, field) => {
    acc += `    ${field}: "",\n`;
    return acc;
  }, '');

  return `import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ${module.icon}, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ${module.dataType} {
  id: number;
${module.fields.map(f => `  ${f}: string;`).join('\n')}
}

export default function ${module.name}() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
${formDataInit}  });

  const [dados, setDados] = useState<${module.dataType}[]>([
    {
      id: 1,
${module.fields.map((f, i) => `      ${f}: "Exemplo ${i + 1}",`).join('\n')}
    },
    {
      id: 2,
${module.fields.map((f, i) => `      ${f}: "Exemplo ${i + 2}",`).join('\n')}
    },
    {
      id: 3,
${module.fields.map((f, i) => `      ${f}: "Exemplo ${i + 3}",`).join('\n')}
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.${module.fields[0]}) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setDados(dados.map(d => d.id === editingId ? { ...d, ...formData } : d));
      toast.success("Registro atualizado com sucesso!");
    } else {
      const novoRegistro: ${module.dataType} = {
        id: Math.max(...dados.map(d => d.id), 0) + 1,
        ...formData,
      };
      setDados([...dados, novoRegistro]);
      toast.success("Registro criado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
${formDataInit}    });
    setEditingId(null);
  };

  const handleEdit = (item: ${module.dataType}) => {
    setFormData({
${module.fields.map(f => `      ${f}: item.${f},`).join('\n')}
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este registro?")) {
      setDados(dados.filter(d => d.id !== id));
      toast.success("Registro deletado com sucesso!");
    }
  };

  const filteredDados = dados.filter(d =>
    Object.values(d).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br ${module.color} rounded-lg">
            <${module.icon} className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">${module.title}</h1>
        </div>
        <p className="text-slate-600">${module.description}</p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r ${module.color} hover:opacity-90">
              <Plus className="h-5 w-5 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Registro" : "Novo Registro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
${formFields}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDados.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-semibold mb-2">Nenhum registro encontrado</p>
              <p className="text-sm">Clique em "Novo Registro" para adicionar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
${module.fields.map(f => `                    <th className="text-left py-3 px-4 font-semibold text-slate-700">${f.charAt(0).toUpperCase() + f.slice(1)}</th>`).join('\n')}
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
${fieldsCode}
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;
};

const outputDir = path.join(process.cwd(), 'client/src/pages');

modules.forEach((module) => {
  const code = generateModuleCode(module);
  const filePath = path.join(outputDir, `${module.name}.tsx`);
  
  fs.writeFileSync(filePath, code);
  console.log(`✅ Gerado: ${module.name}.tsx`);
});

console.log(`\n✨ ${modules.length} módulos gerados com sucesso!`);
