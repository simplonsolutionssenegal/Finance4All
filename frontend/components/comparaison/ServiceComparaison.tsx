import { X, Plus, Minus, TrendingUp, Calculator } from 'lucide-react';
import React, { useState } from 'react';

import { formatCurrency, formatPercentage } from '../../data/MockData';
import type { FinancialService } from '../../types/FinancialServices';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ServiceComparisonProps {
  services: FinancialService[];
  isOpen: boolean;
  onClose: () => void;
}

interface SimulationData {
  serviceId: string;
  amount: number;
  duration: number;
}

export const ServiceComparison: React.FC<ServiceComparisonProps> = ({
  services,
  isOpen,
  onClose,
}) => {
  const [selectedServices, setSelectedServices] = useState<FinancialService[]>([]);
  const [simulations, setSimulations] = useState<SimulationData[]>([]);
  const [simulationAmount, setSimulationAmount] = useState<number>(1000000);
  const [simulationDuration, setSimulationDuration] = useState<number>(12);

  const addServiceToComparison = (service: FinancialService) => {
    if (selectedServices.length < 3 && !selectedServices.find(p => p.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
      setSimulations([
        ...simulations,
        {
          serviceId: service.id,
          amount: simulationAmount,
          duration: simulationDuration,
        },
      ]);
    }
  };

  const removeServiceFromComparison = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(p => p.id !== serviceId));
    setSimulations(simulations.filter(s => s.serviceId !== serviceId));
  };

  const calculateSimulation = (service: FinancialService, simulation: SimulationData) => {
    const { amount, duration } = simulation;
    const monthlyRate = service.interestRate / 100 / 12;

    if (service.type === 'Crédit') {
      const monthlyPayment =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
        (Math.pow(1 + monthlyRate, duration) - 1);
      const totalPayment = monthlyPayment * duration;
      const totalInterest = totalPayment - amount;

      return {
        monthlyPayment,
        totalPayment,
        totalInterest,
        finalAmount: 0,
        monthlyGain: 0,
        type: 'credit' as const,
      };
    }

    const finalAmount = amount * Math.pow(1 + monthlyRate, duration);
    const totalInterest = finalAmount - amount;

    return {
      monthlyPayment: 0,
      totalPayment: 0,
      finalAmount,
      totalInterest,
      monthlyGain: totalInterest / duration,
      type: 'savings' as const,
    };
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 p-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Comparaison de Produits & Simulations
            </h2>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        <div className='p-6'>
          <div className='mb-8'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Sélectionner les produits à comparer (max 3)
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
              {services.slice(0, 6).map(service => (
                <div key={service.id} className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-medium text-gray-900'>{service.designation}</h4>
                    <Badge variant={service.type === 'Epargne' ? 'info' : 'warning'}>
                      {service.type}
                    </Badge>
                  </div>
                  <p className='text-sm text-gray-600 mb-3'>{service.institution}</p>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-500'>
                      {formatPercentage(service.interestRate)}
                    </span>
                    {selectedServices.find(p => p.id === service.id) ? (
                      <Button
                        size='sm'
                        variant='outline'
                        icon={Minus}
                        onClick={() => removeServiceFromComparison(service.id)}
                      >
                        Retirer
                      </Button>
                    ) : (
                      <Button
                        size='sm'
                        icon={Plus}
                        onClick={() => addServiceToComparison(service)}
                        disabled={selectedServices.length >= 3}
                      >
                        Ajouter
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className='space-y-8'>
              <div className='bg-gray-50 rounded-lg p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
                  <Calculator className='w-5 h-5 mr-2' />
                  Paramètres de Simulation
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='simulation-amount'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Montant (FCFA)
                    </label>
                    <input
                      type='number'
                      id='simulation-amount'
                      value={simulationAmount}
                      onChange={e => setSimulationAmount(Number(e.target.value))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='simulation-duration'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Durée (mois)
                    </label>
                    <input
                      type='number'
                      id='simulation-duration'
                      value={simulationDuration}
                      onChange={e => setSimulationDuration(Number(e.target.value))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                  </div>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Critères
                      </th>
                      {selectedServices.map(service => (
                        <th
                          key={service.id}
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'
                        >
                          {service.designation}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    <tr>
                      <td className='px-6 py-4 font-medium text-gray-900'>Institution</td>
                      {selectedServices.map(service => (
                        <td key={service.id} className='px-6 py-4 text-gray-600'>
                          {service.institution}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className='px-6 py-4 font-medium text-gray-900'>Type</td>
                      {selectedServices.map(service => (
                        <td key={service.id} className='px-6 py-4'>
                          <Badge variant={service.type === 'Epargne' ? 'info' : 'warning'}>
                            {service.type}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className='px-6 py-4 font-medium text-gray-900'>Taux d&apos;intérêt</td>
                      {selectedServices.map(service => (
                        <td key={service.id} className='px-6 py-4 text-gray-600'>
                          {formatPercentage(service.interestRate)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className='px-6 py-4 font-medium text-gray-900'>Montant Maximum</td>
                      {selectedServices.map(service => (
                        <td key={service.id} className='px-6 py-4 text-gray-600'>
                          {formatCurrency(service.maxAmount)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className='px-6 py-4 font-medium text-gray-900'>Remboursement</td>
                      {selectedServices.map(service => (
                        <td key={service.id} className='px-6 py-4 text-gray-600'>
                          {service.reimbursement}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className='bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
                  <TrendingUp className='w-5 h-5 mr-2' />
                  Résultats des Simulations
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {selectedServices.map(service => {
                    const storedSimulation = simulations.find(s => s.serviceId === service.id);
                    const simulation = storedSimulation
                      ? {
                          ...storedSimulation,
                          amount: simulationAmount,
                          duration: simulationDuration,
                        }
                      : {
                          serviceId: service.id,
                          amount: simulationAmount,
                          duration: simulationDuration,
                        };

                    const results = calculateSimulation(service, simulation);

                    return (
                      <div key={service.id} className='bg-white rounded-lg p-4 shadow-sm'>
                        <h4 className='font-medium text-gray-900 mb-3'>{service.designation}</h4>

                        {results.type === 'credit' ? (
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-sm text-gray-600'>Mensualité:</span>
                              <span className='text-sm font-medium'>
                                {formatCurrency(results.monthlyPayment)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-sm text-gray-600'>Total à payer:</span>
                              <span className='text-sm font-medium'>
                                {formatCurrency(results.totalPayment)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-sm text-gray-600'>Intérêts totaux:</span>
                              <span className='text-sm font-medium text-red-600'>
                                {formatCurrency(results.totalInterest)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-sm text-gray-600'>Montant final:</span>
                              <span className='text-sm font-medium text-green-600'>
                                {formatCurrency(results.finalAmount)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-sm text-gray-600'>Gains totaux:</span>
                              <span className='text-sm font-medium text-green-600'>
                                {formatCurrency(results.totalInterest)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-sm text-gray-600'>Gain mensuel:</span>
                              <span className='text-sm font-medium'>
                                {formatCurrency(results.monthlyGain)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
