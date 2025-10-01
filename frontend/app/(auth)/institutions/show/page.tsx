'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';

import { _BASE_URL } from '@/_constantes/url_base';
import InstituteHeader from '@/components/institutions/InstituteHeaderProps';
import SearchBar from '@/components/institutions/SearchBar';
import ServiceList from '@/components/institutions/ServiceList';
import type { Service } from '@/models/service';
import type { ApiResponse } from '@/types/ApiResponse';
import type { FilterOptions } from '@/types/FilterOptions';

const BASE_URL = `${_BASE_URL}/service/by-institution/1`;

function buildFilterQuery(f: FilterOptions) {
  const params = new URLSearchParams();

  // types multiples
  f.type.forEach(t => params.append('type', t));
  // zones multiples
  f.zone.forEach(z => params.append('zone', z));

  // date: respecte les valeurs backend (ex: '3mois' | 'recent')
  if (f.date) params.set('date', f.date);

  return params.toString();
}

//petit aide: y a-t-il au moins 1 filtre actif ?
function hasAnyFilter(f: FilterOptions) {
  return f.type.length > 0 || f.zone.length > 0 || !!f.date;
}

const InstitutionPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ type: [], zone: [], date: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterServicesBySearchTerm = (list: Service[], term: string) => {
    if (!term.trim()) return list;
    const q = term.toLowerCase();
    return list.filter(
      s =>
        s.designation.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.modesRemboursement.toLowerCase().includes(q)
    );
  };

  const filteredServices = useMemo(() => {
    let result = [...services];

    result = filterServicesBySearchTerm(result, searchTerm);
    return result;
  }, [services, searchTerm]);

  const loadServices = useCallback(async (currentFilters: FilterOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = BASE_URL;
      if (hasAnyFilter(currentFilters)) {
        const qs = buildFilterQuery(currentFilters);
        url = `${BASE_URL}/filter?${qs}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

      const api = (await res.json()) as ApiResponse<Service>;
      if (api.status !== 'success' || !Array.isArray(api.data)) {
        throw new Error('Format de réponse API inattendu');
      }

      setServices(api.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   loadServices(filters);
  // }, []);
  useEffect(() => {
    loadServices(filters);
  }, [filters, loadServices]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h2 className='text-lg font-semibold text-red-800 mb-2'>Erreur de chargement</h2>
          <p className='text-red-600'>{error}</p>
          <button
            onClick={() => loadServices(filters)}
            className='mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='border-b border-b-gray-200 bg-white p-2'>
        <InstituteHeader
          logoSrc='/assets/images/sgbs.png'
          name='Nom de l’institut'
          status='ACTIF'
          website='www.institutname.com'
          description='Description : Lorem ipsum ubn hnnd sjjjlkllasfjj hjhjhjdfn hbsbjjh kbs Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio quos alias aperiam vero numquam totam similique soluta accusantium omnis quae. Veritatis laudantium reprehenderit nesciunt, dolores non consequatur pariatur ipsam quas!'
          zones={[
            { id: 1, label: 'Zone géographique A' },
            { id: 2, label: 'Zone géographique B' },
          ]}
        />
      </div>

      <SearchBar
        onSearch={setSearchTerm}
        resultsCount={filteredServices.length}
        onApplyFilters={handleApplyFilters}
      />

      <ServiceList services={filteredServices} isLoading={isLoading} />
    </>
  );
};

export default InstitutionPage;
