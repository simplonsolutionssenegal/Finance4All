import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import type { FinancialService } from '../../types/FinancialServices';

interface ServicesChartProps {
  services: FinancialService[];
  chartType: 'bar' | 'pie' | 'line';
}

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ServicesChart: React.FC<ServicesChartProps> = ({ services, chartType }) => {
  if (!services || services.length === 0) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Analyse des Produits Financiers
        </h3>
        <div className='flex items-center justify-center h-64 text-gray-500'>
          Aucun service à afficher
        </div>
      </div>
    );
  }

  // Données pour graphique en barres - Montants par type
  const barData = services.reduce(
    (
      acc: Array<{ type: string; count: number; totalAmount: number; avgAmount: number }>,
      service
    ) => {
      // Skip services with missing required properties
      if (!service || !service.type || typeof service.maxAmount !== 'number') {
        return acc;
      }

      const existing = acc.find(item => item.type === service.type);
      if (existing) {
        existing.count += 1;
        existing.totalAmount += service.maxAmount;
        existing.avgAmount = existing.totalAmount / existing.count;
      } else {
        acc.push({
          type: service.type,
          count: 1,
          totalAmount: service.maxAmount,
          avgAmount: service.maxAmount,
        });
      }
      return acc;
    },
    []
  );

  // Données pour graphique circulaire - Répartition par type
  const pieData = services.reduce((acc: Array<{ name: string; value: number }>, service) => {
    if (!service || !service.type) {
      return acc;
    }

    const existing = acc.find(item => item.name === service.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: service.type,
        value: 1,
      });
    }
    return acc;
  }, []);

  // Données pour graphique linéaire - Évolution des taux
  const lineData: Array<{ name: string; taux: number; montant: number }> = services
    .filter(service => service && service.designation && typeof service.interestRate === 'number')
    .map(service => ({
      name: `${service.designation.substring(0, 10)}...`,
      taux: service.interestRate,
      montant: service.maxAmount / 1000000, // En millions
    }));

  const renderBarChart = () => (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='type' />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'avgAmount' ? `${value.toLocaleString()} FCFA` : value,
            name === 'avgAmount' ? 'Montant moyen' : name === 'count' ? 'Nombre de produits' : name,
          ]}
        />
        <Bar dataKey='count' fill='#14b8a6' name='Nombre de produits' />
        <Bar dataKey='avgAmount' fill='#f59e0b' name='Montant moyen' />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx='50%'
          cy='50%'
          labelLine={false}
          outerRadius={80}
          fill='#8884d8'
          dataKey='value'
        >
          {pieData.map((entry: { name: string; value: number }, idx: number) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis yAxisId='left' />
        <YAxis yAxisId='right' orientation='right' />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'montant' ? `${value} M FCFA` : `${value}%`,
            name === 'montant' ? 'Montant (Millions)' : "Taux d'intérêt",
          ]}
        />
        <Line yAxisId='left' type='monotone' dataKey='taux' stroke='#14b8a6' strokeWidth={2} />
        <Line yAxisId='right' type='monotone' dataKey='montant' stroke='#f59e0b' strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>Analyse des Produits Financiers</h3>
      {chartType === 'bar' && renderBarChart()}
      {chartType === 'pie' && renderPieChart()}
      {chartType === 'line' && renderLineChart()}
    </div>
  );
};
