import { Calendar, Download, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

import { formatCurrency } from '../../data/MockData';
import type { FinancialService } from '../../types/FinancialServices';
import { Button } from '../ui/button';

interface PaymentScheduleProps {
  service: FinancialService;
  amount: number;
  duration: number; // en mois
}

interface ScheduleItem {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ service, amount, duration }) => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const generateSchedule = (): ScheduleItem[] => {
    const schedule: ScheduleItem[] = [];
    const monthlyRate = service.interestRate / 100 / 12;

    if (service.type === 'Crédit') {
      // Calcul pour crédit - amortissement constant
      const monthlyPayment =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
        (Math.pow(1 + monthlyRate, duration) - 1);

      let remainingBalance = amount;

      for (let month = 1; month <= duration; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

        const date = new Date();
        date.setMonth(date.getMonth() + month);

        schedule.push({
          month,
          date: date.toLocaleDateString('fr-FR'),
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          remainingBalance: Math.max(0, remainingBalance),
        });
      }
    } else {
      // Calcul pour épargne - capitalisation mensuelle
      let currentBalance = amount;
      const monthlyDeposit = amount / duration; // Dépôt mensuel constant

      for (let month = 1; month <= duration; month++) {
        const interestEarned = currentBalance * monthlyRate;
        currentBalance += monthlyDeposit + interestEarned;

        const date = new Date();
        date.setMonth(date.getMonth() + month);

        schedule.push({
          month,
          date: date.toLocaleDateString('fr-FR'),
          payment: monthlyDeposit,
          principal: monthlyDeposit,
          interest: interestEarned,
          remainingBalance: currentBalance,
        });
      }
    }

    return schedule;
  };

  const schedule = generateSchedule();
  const displayedSchedule = showFullSchedule ? schedule : schedule.slice(0, 12);

  const totalPayments = schedule.reduce((sum, item) => sum + item.payment, 0);
  const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);

  const exportScheduleCSV = () => {
    const headers = ['Mois', 'Date', 'Paiement', 'Capital', 'Intérêts', 'Solde Restant'];
    const csvContent = [
      headers.join(','),
      ...schedule.map(item =>
        [
          item.month,
          item.date,
          item.payment.toFixed(2),
          item.principal.toFixed(2),
          item.interest.toFixed(2),
          item.remainingBalance.toFixed(2),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `echeancier-${service.designation.replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900 flex items-center'>
            <Calendar className='w-5 h-5 mr-2' />
            Échéancier Détaillé
          </h3>
          <p className='text-sm text-gray-600 mt-1'>
            {service.designation} - {service.institution}
          </p>
        </div>
        <Button variant='outline' icon={Download} onClick={exportScheduleCSV}>
          Exporter CSV
        </Button>
      </div>

      {/* Résumé */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-gray-900'>{formatCurrency(amount)}</div>
          <div className='text-sm text-gray-600'>
            {service.type === 'Crédit' ? 'Montant emprunté' : 'Capital initial'}
          </div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-teal-600'>{formatCurrency(totalPayments)}</div>
          <div className='text-sm text-gray-600'>
            {service.type === 'Crédit' ? 'Total à rembourser' : 'Total versé'}
          </div>
        </div>
        <div className='text-center'>
          <div
            className={`text-2xl font-bold ${service.type === 'Crédit' ? 'text-red-600' : 'text-green-600'}`}
          >
            {formatCurrency(totalInterest)}
          </div>
          <div className='text-sm text-gray-600'>
            {service.type === 'Crédit' ? 'Coût total' : 'Gains totaux'}
          </div>
        </div>
      </div>

      {/* Graphique simple des paiements */}
      <div className='mb-6'>
        <h4 className='text-lg font-medium text-gray-900 mb-3 flex items-center'>
          <TrendingUp className='w-4 h-4 mr-2' />
          Évolution {service.type === 'Crédit' ? 'du solde restant' : "de l'épargne"}
        </h4>
        <div className='h-32 bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg p-4 flex items-end space-x-1'>
          {schedule.slice(0, 24).map(item => {
            const maxBalance = Math.max(...schedule.map(s => s.remainingBalance));
            const height = (item.remainingBalance / maxBalance) * 100;

            return (
              <div
                key={`${item.month}-${item.date}`}
                className='flex-1 bg-teal-500 rounded-t opacity-70 hover:opacity-100 transition-opacity'
                style={{ height: `${height}%`, minHeight: '4px' }}
                title={`Mois ${item.month}: ${formatCurrency(item.remainingBalance)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Tableau de l'échéancier */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Mois
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {service.type === 'Crédit' ? 'Mensualité' : 'Dépôt'}
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Capital
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Intérêts
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {service.type === 'Crédit' ? 'Solde restant' : 'Épargne totale'}
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {displayedSchedule.map(item => (
              <tr
                key={`${item.month}-${item.date}`}
                className={item.month % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className='px-4 py-3 text-sm font-medium text-gray-900'>{item.month}</td>
                <td className='px-4 py-3 text-sm text-gray-600'>{item.date}</td>
                <td className='px-4 py-3 text-sm text-gray-900 text-right font-medium'>
                  {formatCurrency(item.payment)}
                </td>
                <td className='px-4 py-3 text-sm text-gray-600 text-right'>
                  {formatCurrency(item.principal)}
                </td>
                <td
                  className={`px-4 py-3 text-sm text-right font-medium ${
                    service.type === 'Crédit' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(item.interest)}
                </td>
                <td className='px-4 py-3 text-sm text-gray-900 text-right font-medium'>
                  {formatCurrency(item.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > 12 && (
        <div className='mt-4 text-center'>
          <Button variant='outline' onClick={() => setShowFullSchedule(!showFullSchedule)}>
            {showFullSchedule
              ? 'Afficher moins'
              : `Afficher les ${schedule.length - 12} mois restants`}
          </Button>
        </div>
      )}
    </div>
  );
};
