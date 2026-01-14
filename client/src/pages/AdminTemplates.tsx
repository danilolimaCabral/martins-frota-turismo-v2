import { useState } from 'react';
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Edit, Copy, Trash2, Eye, 
  CheckCircle2, XCircle, List 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function AdminTemplates() {
  const [, setLocation] = useLocation();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogTipo, setDialogTipo] = useState<'criar' | 'editar' | 'visualizar' | 'duplicar'>('criar');
  const [templateSelecionado, setTemplateSelecionado] = useState<any>(null);
  const [novoTemplate, setNovoTemplate] = useState({
    nome: '',
    tipoVeiculo: 'van' as 'van' | 'onibus' | 'micro-onibus' | 'carro',
    itens: [] as any[],
  });
  const [novoItem, setNovoItem] = useState({
    categoria: '',
    descricao: '',
    obrigatorio: true,
  });

  const { data: templates, refetch } = trpc.templates.listarTemplates.useQuery();
  const criarTemplate = trpc.templates.criarTemplate.useMutation();
  const duplicarTemplate = trpc.templates.duplicarTemplate.useMutation();
  const deletarTemplate = trpc.templates.deletarTemplate.useMutation();

  const abrirDialogCriar = () => {
    setDialogTipo('criar');
    setNovoTemplate({ nome: '', tipoVeiculo: 'van', itens: [] });
    setDialogAberto(true);
  };

  const abrirDialogDuplicar = (template: any) => {
    setDialogTipo('duplicar');
    setTemplateSelecionado(template);
    setDialogAberto(true);
  };

  const adicionarItem = () => {
    if (!novoItem.categoria || !novoItem.descricao) {
      toast.error('Preencha categoria e descrição');
      return;
    }

    setNovoTemplate({
      ...novoTemplate,
      itens: [
        ...novoTemplate.itens,
        {
          ...novoItem,
          ordem: novoTemplate.itens.length + 1,
        },
      ],
    });

    setNovoItem({ categoria: '', descricao: '', obrigatorio: true });
  };

  const removerItem = (index: number) => {
    setNovoTemplate({
      ...novoTemplate,
      itens: novoTemplate.itens.filter((_, i) => i !== index),
    });
  };

  const salvarTemplate = async () => {
    if (!novoTemplate.nome) {
      toast.error('Informe o nome do template');
      return;
    }

    if (novoTemplate.itens.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    try {
      await criarTemplate.mutateAsync(novoTemplate);
      toast.success('Template criado com sucesso');
      setDialogAberto(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const confirmarDuplicar = async () => {
    if (!templateSelecionado) return;

    const novoNome = prompt('Nome do novo template:', `${templateSelecionado.nome} (Cópia)`);
    if (!novoNome) return;

    try {
      await duplicarTemplate.mutateAsync({
        id: templateSelecionado.id,
        novoNome,
      });
      toast.success('Template duplicado com sucesso');
      setDialogAberto(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const confirmarDeletar = async (template: any) => {
    if (!confirm(`Deseja realmente deletar o template "${template.nome}"?`)) return;

    try {
      await deletarTemplate.mutateAsync({ id: template.id });
      toast.success('Template deletado com sucesso');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container py-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Templates de Check-list</h1>
          <p className="text-muted-foreground">Gerencie os templates de check-list para cada tipo de veículo</p>
        </div>
        <Button onClick={abrirDialogCriar}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template: any) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{template.nome}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {template.tipo_veiculo}
                    </Badge>
                  </CardDescription>
                </div>
                {template.ativo ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <List className="h-4 w-4" />
                <span>{template.total_itens} itens</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-1 h-3 w-3" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" onClick={() => abrirDialogDuplicar(template)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => confirmarDeletar(template)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogTipo === 'criar' ? 'Novo Template' : 'Duplicar Template'}
            </DialogTitle>
            <DialogDescription>
              Crie um template personalizado de check-list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Template</Label>
                <Input
                  value={novoTemplate.nome}
                  onChange={(e) => setNovoTemplate({ ...novoTemplate, nome: e.target.value })}
                  placeholder="Ex: Check-list Completo Van"
                />
              </div>
              <div>
                <Label>Tipo de Veículo</Label>
                <Select
                  value={novoTemplate.tipoVeiculo}
                  onValueChange={(value: any) => setNovoTemplate({ ...novoTemplate, tipoVeiculo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="micro-onibus">Micro-ônibus</SelectItem>
                    <SelectItem value="onibus">Ônibus</SelectItem>
                    <SelectItem value="carro">Carro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Itens do Check-list</h3>
              
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-3">
                  <Input
                    placeholder="Categoria"
                    value={novoItem.categoria}
                    onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value })}
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    placeholder="Descrição do item"
                    value={novoItem.descricao}
                    onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Checkbox
                    checked={novoItem.obrigatorio}
                    onCheckedChange={(checked) => setNovoItem({ ...novoItem, obrigatorio: !!checked })}
                  />
                  <Label className="text-xs">Obrigatório</Label>
                </div>
                <div className="col-span-1">
                  <Button onClick={adicionarItem} size="sm" className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {novoTemplate.itens.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-xs font-mono text-muted-foreground w-6">{index + 1}</span>
                    <Badge variant="outline" className="text-xs">{item.categoria}</Badge>
                    <span className="flex-1 text-sm">{item.descricao}</span>
                    {item.obrigatorio && <Badge variant="secondary" className="text-xs">Obrigatório</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => removerItem(index)}>
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={dialogTipo === 'duplicar' ? confirmarDuplicar : salvarTemplate}>
              {dialogTipo === 'duplicar' ? 'Duplicar' : 'Salvar Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
