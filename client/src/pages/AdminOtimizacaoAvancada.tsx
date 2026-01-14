import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Car, Route, DollarSign, TrendingUp, Users, MapPin, Clock, Package } from 'lucide-react';

interface FleetData {
  id: string;
  route: string;
  cost: number;
  distance: number;
  time: number;
  optimizationScore: number;
}

const generateSimulatedData = (count: number): FleetData[] => {
  const data: FleetData[] = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      id: `rota-${i}`,
      route: `Rota ${String.fromCharCode(65 + Math.floor(Math.random() * 26))} para ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      cost: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
      distance: parseFloat((Math.random() * 500 + 100).toFixed(2)),
      time: parseFloat((Math.random() * 10 + 2).toFixed(2)),
      optimizationScore: parseFloat((Math.random() * 100).toFixed(2)),
    });
  }
  return data;
};

const AdminOtimizacaoAvancada: React.FC = () => {
  const [fleetData, setFleetData] = useState<FleetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula a busca de dados, como se fosse uma chamada tRPC
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de rede
      setFleetData(generateSimulatedData(10));
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalCost = fleetData.reduce((sum, item) => sum + item.cost, 0).toFixed(2);
  const averageOptimization = (fleetData.reduce((sum, item) => sum + item.optimizationScore, 0) / fleetData.length).toFixed(2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
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

        <p className="text-xl">Carregando dados de otimização...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-8 lg:p-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          <Car className="inline-block mr-3" size={48} />
          Admin Otimização Avançada de Frota
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
          Otimize rotas e reduza custos operacionais com análises detalhadas e insights acionáveis.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300">
          <div>
            <p className="text-sm font-medium text-blue-200">Custo Total da Frota</p>
            <p className="text-3xl font-bold mt-1">R$ {totalCost}</p>
          </div>
          <DollarSign size={40} className="text-blue-300" />
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300">
          <div>
            <p className="text-sm font-medium text-green-200">Score Médio de Otimização</p>
            <p className="text-3xl font-bold mt-1">{averageOptimization}%</p>
          </div>
          <TrendingUp size={40} className="text-green-300" />
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300">
          <div>
            <p className="text-sm font-medium text-purple-200">Total de Rotas</p>
            <p className="text-3xl font-bold mt-1">{fleetData.length}</p>
          </div>
          <Route size={40} className="text-purple-300" />
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300">
          <div>
            <p className="text-sm font-medium text-red-200">Veículos Ativos</p>
            <p className="text-3xl font-bold mt-1">{Math.floor(fleetData.length * 1.2)}</p>
          </div>
          <Users size={40} className="text-red-300" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center"><MapPin className="mr-2" /> Otimização de Rotas por Custo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fleetData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="route" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="cost" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center"><Clock className="mr-2" /> Tempo de Rota e Score de Otimização</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fleetData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="route" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
              <Legend />
              <Bar dataKey="time" fill="#82ca9d" name="Tempo (horas)" />
              <Bar dataKey="optimizationScore" fill="#8884d8" name="Score Otimização" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl font-bold mb-4 text-purple-400 flex items-center"><Package className="mr-2" /> Detalhes das Rotas Otimizadas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-600 text-left text-gray-200">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Rota</th>
                <th className="py-3 px-4">Custo (R$)</th>
                <th className="py-3 px-4">Distância (km)</th>
                <th className="py-3 px-4">Tempo (horas)</th>
                <th className="py-3 px-4">Score Otimização (%)</th>
              </tr>
            </thead>
            <tbody>
              {fleetData.map((item) => (
                <tr key={item.id} className="border-b border-gray-600 hover:bg-gray-600 transition-colors duration-200">
                  <td className="py-3 px-4">{item.id}</td>
                  <td className="py-3 px-4">{item.route}</td>
                  <td className="py-3 px-4">{item.cost}</td>
                  <td className="py-3 px-4">{item.distance}</td>
                  <td className="py-3 px-4">{item.time}</td>
                  <td className="py-3 px-4">{item.optimizationScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm mt-10">
        <p>&copy; {new Date().getFullYear()} Admin Otimização Avançada. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default AdminOtimizacaoAvancada;
