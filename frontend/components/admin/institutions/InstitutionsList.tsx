'use client';

import { Search, Filter, Edit, Trash2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

const InstitutionsList = () => {
  const institutions = [
    {
      id: 1,
      name: 'Société générale',
      website: 'www.test.com',
      description: 'Achat de carte visa',
      status: 'Actif',
    },
    {
      id: 2,
      name: 'Société générale',
      website: 'www.test.com',
      description: 'Achat de carte visa',
      status: 'Actif',
    },
    {
      id: 3,
      name: 'Société générale',
      website: 'www.test.com',
      description: 'Achat de carte visa',
      status: 'Actif',
    },
  ];

  return (
    <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
      <h2 className='text-xl font-bold text-gray-900 mb-6'>Liste des instituts</h2>

      <div className='flex justify-between items-center gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Rechercher une institut'
              className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <button className='flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors'>
            <Filter className='w-5 h-5' />
            Filter
          </button>
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            variant={'default'}
            className='flex items-center bg-teal-500 text-white gap-2 px-6 py-3 rounded-xl transition-colors'
          >
            <Plus className='w-5 h-5' />
            Ajouter une institut
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200'>
              <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>
                Nom de l&apos;institut
              </th>
              <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>Site web</th>
              <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>
                Description
              </th>
              <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>Statut</th>
              <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map(institution => (
              <tr key={institution.id} className='border-b border-gray-100 hover:bg-gray-50'>
                <td className='py-4 px-4 text-sm text-gray-900'>{institution.name}</td>
                <td className='py-4 px-4 text-sm text-gray-600'>{institution.website}</td>
                <td className='py-4 px-4 text-sm text-gray-600'>{institution.description}</td>
                <td className='py-4 px-4'>
                  <span className='text-sm text-green-600 font-medium'>{institution.status}</span>
                </td>
                <td className='py-4 px-4'>
                  <div className='flex items-center gap-2'>
                    <button className='p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors'>
                      <Edit className='w-5 h-5' />
                    </button>
                    <button className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstitutionsList;
