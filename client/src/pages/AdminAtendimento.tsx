import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Clock, CheckCircle , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: number;
  cliente: string;
  email: string;
  categoria: string;
  assunto: string;
  descricao: string;
  dataCriacao: string;
  status: "aberto" | "em_atendimento" | "resolvido" | "fechado";
  prioridade: "baixa" | "media" | "alta";
  responsavel?: string;
}

const mockTickets: Ticket[] = [
  {
    id: 1,
    cliente: "Empresa XYZ",
    email: "contato@xyz.com",
    categoria: "orcamento",
    assunto: "Solicitação de orçamento para evento",
    descricao: "Preciso de orçamento para transporte de 50 pessoas",
    dataCriacao: "2026-01-18",
    status: "aberto",
    prioridade: "alta",
  },
  {
    id: 2,
    cliente: "João Silva",
    email: "joao@email.com",
    categoria: "reclamacao",
    assunto: "Atraso na viagem",
    descricao: "O ônibus chegou 30 minutos atrasado",
    dataCriacao: "2026-01-17",
    status: "em_atendimento",
    prioridade: "media",
    responsavel: "Carlos Santos",
  },
];

export function AdminAtendimento() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    cliente: "",
    email: "",
    categoria: "orcamento",
    assunto: "",
    descricao: "",
    prioridade: "media" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cliente || !formData.assunto || !formData.descricao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const novoTicket: Ticket = {
      id: Math.max(...tickets.map((t) => t.id), 0) + 1,
      ...formData,
      dataCriacao: new Date().toISOString().split("T")[0],
      status: "aberto",
    };

    setTickets([...tickets, novoTicket]);
    toast.success("Ticket criado com sucesso");

    setFormData({
      cliente: "",
      email: "",
      categoria: "orcamento",
      assunto: "",
      descricao: "",
      prioridade: "media",
    });
    setShowForm(false);
  };

  const handleUpdateStatus = (ticketId: number, newStatus: Ticket["status"]) => {
    setTickets(
      tickets.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus } : t
      )
    );
    toast.success("Status atualizado");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolvido":
      case "fechado":
        return "bg-green-100 text-green-800";
      case "em_atendimento":
        return "bg-blue-100 text-blue-800";
      case "aberto":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "media":
        return "bg-orange-100 text-orange-800";
      case "baixa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolvido":
      case "fechado":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "em_atendimento":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "aberto":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Atendimento ao Cliente</h1>
          <p className="text-gray-600 mt-1">Gestão de tickets e solicitações</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {tickets.filter((t) => t.status === "aberto").length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Abertos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {tickets.filter((t) => t.status === "em_atendimento").length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Em Atendimento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {tickets.filter((t) => t.prioridade === "alta").length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Alta Prioridade</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{tickets.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente *</Label>
                  <Input
                    value={formData.cliente}
                    onChange={(e) =>
                      setFormData({ ...formData, cliente: e.target.value })
                    }
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
                      <SelectItem value="reclamacao">Reclamação</SelectItem>
                      <SelectItem value="sugestao">Sugestão</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        prioridade: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Assunto *</Label>
                <Input
                  value={formData.assunto}
                  onChange={(e) =>
                    setFormData({ ...formData, assunto: e.target.value })
                  }
                  placeholder="Assunto do ticket"
                />
              </div>

              <div>
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descreva o problema ou solicitação"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Criar Ticket</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      cliente: "",
                      email: "",
                      categoria: "orcamento",
                      assunto: "",
                      descricao: "",
                      prioridade: "media",
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Total: {tickets.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">#{ticket.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.cliente}</div>
                        <div className="text-sm text-gray-500">{ticket.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.assunto}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPrioridadeColor(ticket.prioridade)}>
                        {ticket.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.dataCriacao}</TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(
                            ticket.id,
                            value as Ticket["status"]
                          )
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aberto">Aberto</SelectItem>
                          <SelectItem value="em_atendimento">
                            Em Atendimento
                          </SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                          <SelectItem value="fechado">Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
