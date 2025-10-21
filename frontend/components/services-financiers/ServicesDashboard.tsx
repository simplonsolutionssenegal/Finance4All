'use client';

import { Search, Filter, Grid3x3 as Grid3X3, List, BarChart3 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { ServicesChart } from '@/components/charts/ServicesCharts';
import { PDFExport } from '@/components/export/PDFExport';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type {
  FilterOptions,
  FinancialService,
  SearchAndFilterState,
  InstitutionWithServices,
} from '@/types/FinancialServices';

import {
  displayDesignation,
  displayInstitutionName,
  displayType,
  mapTypeToLabel,
} from './normalizeService';
import { Pagination } from './Pagination';
import { ServiceFilters } from './ServiceFilters';
import { ServicesGrid } from './ServicesGrid';
import { ServicesTable } from './ServicesTable';

// Map institution/service API response to FinancialService used by UI
function mapInstitutionsToServices(institutions: InstitutionWithServices[]): FinancialService[] {
  const services: FinancialService[] = [];

  institutions.forEach(inst => {
    const instObj = {
      id: inst.id,
      name: inst.name,
      description: inst.description,
      logoUrl: inst.logoUrl,
      status: inst.status,
      website: inst.website,
      geographicZones: inst.geographicZones || [],
      createdAt: inst.createdAt,
      updatedAt: inst.updatedAt,
    };

    (inst.services || []).forEach(s => {
      services.push({
        id: s.id,
        name: s.name,
        longName: s.longName,
        designation: s.longName || s.name,
        frais: s.frais || {},
        conditionAccess: s.conditionAccess || [],
        plafonds: s.plafonds || [],
        infrastructureAccess: s.infrastructureAccess || [],
        type: s.type || 'AUTRES',
        institutionId: s.institutionId,
        institution: instObj,
        status: inst.status,
        geographicZones: inst.geographicZones || [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        description: s.longName || inst.description,
      });
    });
  });

  return services;
}

// Helper predicates to keep callbacks shallow and readable
export function matchesSearchTerm(service: FinancialService, searchTerm: string) {
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

  const term = normalize(searchTerm || '');
  const designation = normalize(displayDesignation(service) || '');
  const institution = normalize(displayInstitutionName(service) || '');
  const type = normalize(mapTypeToLabel(service.type) || '');
  return designation.includes(term) || institution.includes(term) || type.includes(term);
}

export function matchesServiceTypeFilter(
  service: FinancialService,
  serviceTypeFilters: FilterOptions['serviceType']
) {
  if (!serviceTypeFilters || serviceTypeFilters.length === 0) return true;
  const mappedType = mapTypeToLabel(service.type);
  // Map types: Épargne and Crédit stay as-is, everything else becomes "Autre type"
  const filterType =
    mappedType === 'Épargne' || mappedType === 'Crédit' ? mappedType : 'Autre type';
  return serviceTypeFilters.includes(filterType as FilterOptions['serviceType'][number]);
}

export function matchesGeographicFilter(
  service: FinancialService,
  geographicFilters: FilterOptions['geographicZone']
) {
  if (!geographicFilters || geographicFilters.length === 0) return true;
  // Convert filter label then check if any service zone includes it
  return service.geographicZones.some(zone =>
    geographicFilters.some(filterZone =>
      zone.includes(filterZone.replace('Zone Géo ', 'Zone géographique '))
    )
  );
}

export function matchesInstitutFilter(
  service: FinancialService,
  institutFilters: FilterOptions['institut']
) {
  if (!institutFilters || institutFilters.length === 0) return true;
  const instName = displayInstitutionName(service);
  return institutFilters.some(institut => instName.includes(institut));
}

export const ServicesDashboard: React.FC = () => {
  const [searchAndFilter, setSearchAndFilter] = useState<SearchAndFilterState>({
    searchTerm: '',
    filters: {
      serviceType: [],
      geographicZone: [],
      institut: [],
      date: 'Récente',
    },
    sortBy: 'designation',
    sortOrder: 'asc',
    viewMode: 'table',
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  const [institutionsData, setInstitutionsData] = useState<InstitutionWithServices[]>([]);
  const [servicesData, setServicesData] = useState<FinancialService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...servicesData];

    // Recherche par terme
    if (searchAndFilter.searchTerm) {
      filtered = filtered.filter(service => matchesSearchTerm(service, searchAndFilter.searchTerm));
    }

    const { filters } = searchAndFilter;

    if (filters.serviceType.length > 0) {
      filtered = filtered.filter(service => matchesServiceTypeFilter(service, filters.serviceType));
    }

    if (filters.geographicZone.length > 0) {
      filtered = filtered.filter(service =>
        matchesGeographicFilter(service, filters.geographicZone)
      );
    }

    if (filters.institut.length > 0) {
      filtered = filtered.filter(service => matchesInstitutFilter(service, filters.institut));
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (searchAndFilter.sortBy === 'designation') {
        aValue = displayDesignation(a).toLowerCase();
        bValue = displayDesignation(b).toLowerCase();
      } else if (searchAndFilter.sortBy === 'institution') {
        aValue = displayInstitutionName(a).toLowerCase();
        bValue = displayInstitutionName(b).toLowerCase();
      } else if (searchAndFilter.sortBy === 'type') {
        aValue = displayType(a).toLowerCase();
        bValue = displayType(b).toLowerCase();
      } else if (searchAndFilter.sortBy === 'name' || searchAndFilter.sortBy === 'longName') {
        const rawA = a[searchAndFilter.sortBy];
        const rawB = b[searchAndFilter.sortBy];
        aValue = typeof rawA === 'string' ? rawA.toLowerCase() : '';
        bValue = typeof rawB === 'string' ? rawB.toLowerCase() : '';
      } else if (
        searchAndFilter.sortBy === 'maxAmount' ||
        searchAndFilter.sortBy === 'interestRate'
      ) {
        aValue = (a[searchAndFilter.sortBy] as number) ?? 0;
        bValue = (b[searchAndFilter.sortBy] as number) ?? 0;
      } else {
        aValue = 0;
        bValue = 0;
      }

      if (aValue < bValue) return searchAndFilter.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return searchAndFilter.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchAndFilter, servicesData]);

  useEffect(() => {
    let cancelled = false;

    function applyInstitutions(institutions: InstitutionWithServices[]) {
      setInstitutionsData(institutions);
      const mapped = mapInstitutionsToServices(institutions);
      setServicesData(mapped);
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Request a larger page size so the dashboard receives more institutions (and their services).
        // Backend defaults to limit=10 when no query params are provided. Requesting a bigger limit
        // avoids truncating services shown in the UI.
        const resp = await apiClient<{ data: InstitutionWithServices[] }>(
          'institutions?page=1&limit=100',
          'GET',
          null
        );
        const institutions: InstitutionWithServices[] = resp?.data || [];
        if (!cancelled) applyInstitutions(institutions);
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to load institutions from API', err);
          setError((err as Error)?.message || 'Erreur lors du chargement des institutions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute dynamic filter option lists from loaded data
  const dynamicFilterOptions = useMemo(() => {
    // Service types: map to human-friendly labels and dedupe
    const types = Array.from(
      new Set(servicesData.map(s => mapTypeToLabel(s.type) || displayType(s)))
    ).filter(Boolean) as string[];

    // Geographic zones: collect from institutions' geographicZones
    const zones = Array.from(
      new Set(institutionsData.flatMap(inst => inst.geographicZones || []))
    ) as string[];

    // Institut names
    const instituts = Array.from(new Set(institutionsData.map(inst => inst.name))).filter(
      Boolean
    ) as string[];

    const dates = ['Récente', 'Il y a 3 mois'];

    return { serviceTypes: types, geographicZones: zones, instituts, dates };
  }, [servicesData, institutionsData]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedServices.length / searchAndFilter.itemsPerPage);
  const startIndex = (searchAndFilter.currentPage - 1) * searchAndFilter.itemsPerPage;
  const paginatedServices = filteredAndSortedServices.slice(
    startIndex,
    startIndex + searchAndFilter.itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchAndFilter(prev => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1,
    }));
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    setSearchAndFilter(prev => ({
      ...prev,
      filters,
      currentPage: 1,
    }));
  };

  const handleSort = (field: SearchAndFilterState['sortBy']) => {
    setSearchAndFilter(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleViewModeChange = (viewMode: 'table' | 'grid') => {
    setSearchAndFilter(prev => ({ ...prev, viewMode }));
  };

  const handlePageChange = (page: number) => {
    setSearchAndFilter(prev => ({ ...prev, currentPage: page }));
  };

  const handleServiceAction = (action: string, service?: FinancialService) => {
    console.warn(`Action ${action} sur le service`, { service });
    // scheduling action intentionally removed; no-op
  };

  // Show loading state
  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto' />
          <p className='mt-4 text-gray-600'>Chargement des services financiers...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h3 className='text-red-800 font-semibold mb-2'>Erreur de chargement</h3>
          <p className='text-red-600'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
        <h2 className='text-xl font-semibold text-gray-900'>Service(s) financier(s)</h2>
        <div className='flex space-x-2'>{/* Add product button removed per design */}</div>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Rechercher un service financier'
            value={searchAndFilter.searchTerm}
            onChange={handleSearchChange}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
          />
        </div>

        <div className='flex space-x-2'>
          <Button variant='outline' icon={BarChart3} onClick={() => setShowCharts(!showCharts)}>
            Graphiques
          </Button>

          {/* Comparer button removed per request */}

          <Button variant='outline' icon={Filter} onClick={() => setIsFilterOpen(true)}>
            Filtrer
          </Button>

          <PDFExport
            services={filteredAndSortedServices}
            searchTerm={searchAndFilter.searchTerm}
            totalResults={filteredAndSortedServices.length}
          />

          <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
            <button
              onClick={() => handleViewModeChange('table')}
              aria-label='List'
              className={`p-2 ${searchAndFilter.viewMode === 'table' ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className='w-4 h-4' />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              aria-label='Grid'
              className={`p-2 ${searchAndFilter.viewMode === 'grid' ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid3X3 className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-gray-600'>
          {filteredAndSortedServices.length} résultat
          {filteredAndSortedServices.length > 1 ? 's' : ''} trouvé
          {filteredAndSortedServices.length > 1 ? 's' : ''}
        </p>
        {showCharts && (
          <div className='flex space-x-2'>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded ${chartType === 'bar' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Barres
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-sm rounded ${chartType === 'pie' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Secteurs
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded ${chartType === 'line' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Courbes
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      {showCharts && <ServicesChart services={filteredAndSortedServices} chartType={chartType} />}

      {/* Services Display */}
      {searchAndFilter.viewMode === 'table' ? (
        <ServicesTable
          services={paginatedServices}
          searchAndFilter={searchAndFilter}
          onSort={handleSort}
          onSchedule={service => handleServiceAction('schedule', service)}
        />
      ) : (
        <ServicesGrid
          services={paginatedServices}
          onSchedule={service => handleServiceAction('schedule', service)}
        />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={searchAndFilter.currentPage}
        totalPages={totalPages}
        totalItems={filteredAndSortedServices.length}
        itemsPerPage={searchAndFilter.itemsPerPage}
        onPageChange={handlePageChange}
      />

      {/* Filters Modal */}
      <ServiceFilters
        filters={searchAndFilter.filters}
        onFiltersChange={handleFiltersChange}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
        options={dynamicFilterOptions}
      />

      {/* Service comparison feature removed */}

      {/* Scheduling feature removed */}
    </div>
  );
};
