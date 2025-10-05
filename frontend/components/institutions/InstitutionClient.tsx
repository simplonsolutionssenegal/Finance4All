// frontend/components/institutions/InstitutionClient.tsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';

import SearchBar from '@/components/institutions/SearchBar';
import ServiceList from '@/components/institutions/ServiceList';
import { ServicesAPI } from '@/lib/api-services';
import type { Service } from '@/models/service';
import type { FilterOptions } from '@/types/FilterOptions';

type Props = { institutionId: string };
function hasAnyFilter(f: FilterOptions) {
  return f.type.length > 0 || f.zone.length > 0 || !!f.date;
}

const InstitutionClient: React.FC<Props> = ({ institutionId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ type: [], zone: [], date: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      s =>
        s.designation.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.modesRemboursement.toLowerCase().includes(q)
    );
  }, [services, searchTerm]);

  const loadServices = useCallback(
    async (currentFilters: FilterOptions) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = hasAnyFilter(currentFilters)
          ? await ServicesAPI.filterByInstitution(institutionId, currentFilters)
          : await ServicesAPI.getByInstitution(institutionId);
        setServices(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    },
    [institutionId]
  );

  useEffect(() => {
    void loadServices(filters);
  }, [filters, loadServices]);

  return error ? (
    <div className='p-6'>
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-red-800 mb-2'>Erreur de chargement</h2>
        <p className='text-red-600'>{error}</p>
        <button
          onClick={() => void loadServices(filters)}
          className='mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
        >
          Réessayer
        </button>
      </div>
    </div>
  ) : (
    <>
      <SearchBar
        onSearch={setSearchTerm}
        resultsCount={filteredServices.length}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
      <ServiceList services={filteredServices} isLoading={isLoading} />
    </>
  );
};

export default InstitutionClient;
