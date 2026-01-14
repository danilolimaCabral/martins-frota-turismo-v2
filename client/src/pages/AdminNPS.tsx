
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Gauge, ThumbsUp, ThumbsDown, Users, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

// Dados simulados para o NPS
const generateNPSData = () => {
  const data = [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let currentNPS = 50;

  for (let i = 0; i < 12; i++) {
    const promoters = Math.floor(Math.random() * 300) + 200; // 200-500
    const passives = Math.floor(Math.random() * 150) + 50;   // 50-200
    const detractors = Math.floor(Math.random() * 100) + 30; // 30-130
    const total = promoters + passives + detractors;
    const nps = ((promoters - detractors) / total) * 100;
    currentNPS = parseFloat(nps.toFixed(2));

    data.push({
      month: months[i],
      promoters,
      passives,
      detractors,
      nps: currentNPS,
    });
  }
  return data;
};

const generateFeedbackData = () => {
  const feedbackTypes = ['Produto', 'Atendimento', 'Preço', 'Entrega', 'Interface'];
  const sentiments = ['Positivo', 'Neutro', 'Negativo'];
  const data = [];

  for (let i = 0; i < 20; i++) {
    data.push({
      id: i + 1,
      customer: `Cliente ${i + 1}`,
      type: feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)],
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      comment: `Comentário ${i + 1} sobre o ${feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)]}.`,
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
    });
  }
  return data;
};

const AdminNPSModule: React.FC = () => {
  const [npsData, setNpsData] = useState(generateNPSData());
  const [feedbackData, setFeedbackData] = useState(generateFeedbackData());
  const [loading, setLoading] = useState(false);

  const currentNPS = npsData[npsData.length - 1]?.nps || 0;
  const promotersCount = npsData[npsData.length - 1]?.promoters || 0;
  const detractorsCount = npsData[npsData.length - 1]?.detractors || 0;
  const totalResponses = promotersCount + npsData[npsData.length - 1]?.passives + detractorsCount || 0;

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setNpsData(generateNPSData());
      setFeedbackData(generateFeedbackData());
      setLoading(false);
    }, 1500);
  };

  // Simulação de integração tRPC (apenas placeholder)
  const trpc = {
    nps: {
      getNPSHistory: async () => {
        // Simula uma chamada tRPC
        return new Promise(resolve => setTimeout(() => resolve(generateNPSData()), 500));
      },
      getRecentFeedback: async () => {
        // Simula uma chamada tRPC
        return new Promise(resolve => setTimeout(() => resolve(generateFeedbackData()), 500));
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const history = await trpc.nps.getNPSHistory();
      const feedback = await trpc.nps.getRecentFeedback();
      setNpsData(history as any);
      setFeedbackData(feedback as any);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">Admin NPS</h1>
        <Button onClick={handleRefreshData} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
          {loading ? 'Atualizando...' : <><RefreshCcw className="mr-2 h-5 w-5" /> Atualizar Dados</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg border-none bg-white rounded-xl overflow-hidden transform transition duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">NPS Atual</CardTitle>
            <Gauge className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{currentNPS.toFixed(1)}</div>
            <p className="text-xs text-gray-500">Baseado em {totalResponses} respostas</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-none bg-white rounded-xl overflow-hidden transform transition duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promotores</CardTitle>
            <ThumbsUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{promotersCount}</div>
            <p className="text-xs text-gray-500">Clientes satisfeitos</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-none bg-white rounded-xl overflow-hidden transform transition duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Detratores</CardTitle>
            <ThumbsDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{detractorsCount}</div>
            <p className="text-xs text-gray-500">Clientes insatisfeitos</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-none bg-white rounded-xl overflow-hidden transform transition duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Respostas</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalResponses}</div>
            <p className="text-xs text-gray-500">Pesquisas respondidas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg border-none bg-white rounded-xl p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Histórico do NPS</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={npsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" className="text-sm text-gray-600" />
                <YAxis domain={[-100, 100]} className="text-sm text-gray-600" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="nps" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} name="NPS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-none bg-white rounded-xl p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Distribuição de Respostas</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npsData.slice(-1)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" className="text-sm text-gray-600" />
                <YAxis type="category" dataKey="month" hide />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="promoters" fill="#4CAF50" name="Promotores" />
                <Bar dataKey="passives" fill="#FFC107" name="Passivos" />
                <Bar dataKey="detractors" fill="#F44336" name="Detratores" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none bg-white rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Feedback Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px] text-gray-700">ID</TableHead>
                  <TableHead className="text-gray-700">Cliente</TableHead>
                  <TableHead className="text-gray-700">Tipo</TableHead>
                  <TableHead className="text-gray-700">Sentimento</TableHead>
                  <TableHead className="text-gray-700">Comentário</TableHead>
                  <TableHead className="text-gray-700">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackData.map((feedback) => (
                  <TableRow key={feedback.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800">{feedback.id}</TableCell>
                    <TableCell className="text-gray-700">{feedback.customer}</TableCell>
                    <TableCell className="text-gray-700">{feedback.type}</TableCell>
                    <TableCell className={`font-semibold ${feedback.sentiment === 'Positivo' ? 'text-green-600' : feedback.sentiment === 'Negativo' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {feedback.sentiment}
                    </TableCell>
                    <TableCell className="text-gray-700">{feedback.comment}</TableCell>
                    <TableCell className="text-gray-700">{feedback.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNPSModule;
