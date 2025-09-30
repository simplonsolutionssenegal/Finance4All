'use client';

import { Eye, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import type { Service } from '@/models/service';

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
}

const thousandDot = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function ServiceList({ services, isLoading }: ServiceTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const paginatedServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center py-12'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>Aucun service</h3>
          <p className='mt-1 text-sm text-gray-500'>Commencez par ajouter un nouveau service.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-[#EAEAEA] text-black-900 text-sm font-bold'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-SemiBold text-[#000000] uppercase tracking-wider'>
                Désignation
              </th>
              <th className='px-6 py-3 text-left text-xs  font-SemiBold text-[#000000] uppercase tracking-wider'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs  font-SemiBold text-[#000000] uppercase tracking-wider'>
                Montant min.
              </th>
              <th className='px-6 py-3 text-left text-xs  font-SemiBold text-[#000000] uppercase tracking-wider'>
                Montant max.
              </th>
              <th className='px-6 py-3 text-left text-xs  font-SemiBold text-[#000000] uppercase tracking-wider'>
                Remboursement
              </th>
              <th className='px-6 py-3 text-left text-xs  font-SemiBold text-[#000000] uppercase tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {paginatedServices.map(service => (
              <tr key={service.id}>
                <td className='px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {service.designation}
                </td>
                <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900'>
                  {service.type}
                </td>
                <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900'>
                  {thousandDot.format(service.montantMin)}
                </td>
                <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900'>
                  {thousandDot.format(service.montantMax)}
                </td>
                <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900'>
                  {service.modesRemboursement}
                </td>
                <td className='px-4 py-2 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex items-center justify-end gap-2'>
                    <button
                      type='button'
                      title='Voir'
                      aria-label={`Voir ${service.designation}`}
                      className='inline-flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100'
                    >
                      <Eye className='h-4 w-4 text-[#EAEAEA]' strokeWidth={2.25} />
                    </button>
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <button
                          type='button'
                          title='Modifier'
                          aria-label={`Modifier ${service.designation}`}
                          className='inline-flex h-7 w-7 items-center justify-center rounded hover:bg-blue-700'
                        >
                          <SquarePen className='h-4 w-4 text-blue-600' strokeWidth={2.5} />
                        </button>
                      </DialogTrigger>
                    </Dialog>
                    <button
                      type='button'
                      title='Supprimer'
                      aria-label={`Supprimer ${service.designation}`}
                      className='inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 hover:bg-red-100'
                    >
                      <Trash2 className='h-4 w-4 text-red-600' strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className='flex justify-center items-center py-4 gap-2 border-t border-b border-[#EAEAEA]'>
          <button
            className='px-3 py-1 rounded text-white disabled:opacity-50'
            style={{ backgroundColor: '#6CB9C6' }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span className='text-sm text-gray-700'>
            Page {currentPage} / {totalPages}
          </span>
          <button
            className='px-3 py-1 rounded text-white disabled:opacity-50'
            style={{ backgroundColor: '#6CB9C6' }}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
