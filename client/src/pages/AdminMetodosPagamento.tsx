
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, CreditCard, Banknote, TrendingUp, Wallet } from 'lucide-react';

// Dados simulados para métodos de pagamento
const simulatedPaymentMethods = [
  { id: '1', type: 'Cartão de Crédito', brand: 'Visa', last4: '4242', expiry: '12/25', status: 'Ativo', default: true },
  { id: '2', type: 'Cartão de Débito', brand: 'Mastercard', last4: '1111', expiry: '06/24', status: 'Ativo', default: false },
  { id: '3', type: 'PayPal', email: 'user@example.com', status: 'Ativo', default: false },
  { id: '4', type: 'Boleto Bancário', status: 'Ativo', default: false },
];

// Dados simulados para transações
const simulatedTransactions = [
  { id: 'T1', date: '2026-01-10', method: 'Visa **** 4242', amount: 150.75, status: 'Concluído' },
  { id: 'T2', date: '2026-01-09', method: 'Mastercard **** 1111', amount: 45.00, status: 'Pendente' },
  { id: 'T3', date: '2026-01-08', method: 'PayPal', amount: 200.00, status: 'Concluído' },
  { id: 'T4', date: '2026-01-07', method: 'Boleto Bancário', amount: 75.50, status: 'Aguardando Pagamento' },
  { id: 'T5', date: '2026-01-06', method: 'Visa **** 4242', amount: 30.20, status: 'Concluído' },
];

const AdminMetodosPagamento: React.FC = () => {
  // Aqui você integraria com tRPC para buscar dados reais
  // const { data: paymentMethods, isLoading: isLoadingMethods } = trpc.payment.getMethods.useQuery();
  // const { data: transactions, isLoading: isLoadingTransactions } = trpc.transactions.getRecent.useQuery();

  const totalRevenue = simulatedTransactions.reduce((sum, t) => t.status === 'Concluído' ? sum + t.amount : sum, 0);
  const activeMethods = simulatedPaymentMethods.filter(m => m.status === 'Ativo').length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Gestão de Métodos de Pagamento</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-white/80">+20.1% do mês passado</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Métodos Ativos</CardTitle>
            <CreditCard className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMethods}</div>
            <p className="text-xs text-white/80">Total de métodos cadastrados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Transação</CardTitle>
            <Banknote className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {simulatedTransactions[0].amount.toFixed(2)}</div>
            <p className="text-xs text-white/80">{simulatedTransactions[0].method}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Padrão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulatedPaymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.type}</TableCell>
                    <TableCell>
                      {'brand' in method && method.brand ? `${method.brand} **** ${method.last4}` : method.email || 'N/A'}
                      {'expiry' in method && method.expiry && <span className="ml-2 text-gray-500">({method.expiry})</span>}
                    </TableCell>
                    <TableCell>{method.status}</TableCell>
                    <TableCell>{method.default ? 'Sim' : 'Não'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de exemplo - você pode integrar uma biblioteca como Recharts ou Chart.js aqui */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Transações (Mensal)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <TrendingUp className="h-8 w-8 mr-2" />
            Gráfico de transações aqui (ex: Recharts, Chart.js)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetodosPagamento;
