'use client';

import {
  Search,
  Filter,
  Plus,
  Grid3x3 as Grid3X3,
  List,
  BarChart3,
  GitCompare,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { financialServices, institutions } from '../../data/MockData';
import type {
  FilterOptions,
  FinancialService,
  SearchAndFilterState,
} from '../../types/FinancialServices';
import { ServicesChart } from '../charts/ServicesCharts';
import { ServiceComparison } from '../comparaison/ServiceComparaison';
import { PDFExport } from '../export/PDFExport';
import { PaymentSchedule } from '../schedule/PaymentSchedule';
import { Button } from '../ui/button';

import { InstitutionCard } from './InstitutionCard';
import { Pagination } from './Pagination';
import { ServiceFilters } from './ServiceFilters';
import { ServicesGrid } from './ServicesGrid';
import { ServicesTable } from './ServicesTable';

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
  const [showComparison, setShowComparison] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedServiceForSchedule, setSelectedServiceForSchedule] =
    useState<FinancialService | null>(null);

  // Filtrage et tri des produits
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...financialServices];

    // Recherche par terme
    if (searchAndFilter.searchTerm) {
      const searchTerm = searchAndFilter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        service =>
          service.designation.toLowerCase().includes(searchTerm) ||
          service.institution.toLowerCase().includes(searchTerm) ||
          service.type.toLowerCase().includes(searchTerm)
      );
    }

    const { filters } = searchAndFilter;

    if (filters.serviceType.length > 0) {
      filtered = filtered.filter(service => {
        const mappedType: FilterOptions['serviceType'][number] =
          service.type === 'Assurance' ? 'Autre type' : service.type;
        return filters.serviceType.includes(mappedType);
      });
    }

    if (filters.geographicZone.length > 0) {
      filtered = filtered.filter(service =>
        service.geographicZones.some(zone =>
          filters.geographicZone.some(filterZone =>
            zone.includes(filterZone.replace('Zone Géo ', 'Zone géographique '))
          )
        )
      );
    }

    if (filters.institut.length > 0) {
      filtered = filtered.filter(service =>
        filters.institut.some(institut => service.institution.includes(institut))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      const rawA: string | number = a[searchAndFilter.sortBy];
      const rawB: string | number = b[searchAndFilter.sortBy];
      const aValue = typeof rawA === 'string' ? rawA.toLowerCase() : rawA;
      const bValue = typeof rawB === 'string' ? rawB.toLowerCase() : rawB;

      if (aValue < bValue) return searchAndFilter.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return searchAndFilter.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchAndFilter]);

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
    console.warn(`Action ${action} sur le produit`, { service });

    if (action === 'schedule' && service) {
      setSelectedServiceForSchedule(service);
      setShowSchedule(true);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Institution Card */}
      <InstitutionCard institution={institutions[0]} />

      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
        <h2 className='text-xl font-semibold text-gray-900'>Produits financier</h2>
        <div className='flex space-x-2'>
          <Button icon={Plus}>Ajouter un produit</Button>
        </div>
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

          <Button variant='outline' icon={GitCompare} onClick={() => setShowComparison(true)}>
            Comparer
          </Button>

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
              className={`p-2 ${searchAndFilter.viewMode === 'table' ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className='w-4 h-4' />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
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
          onEdit={service => handleServiceAction('edit', service)}
          onDelete={id => handleServiceAction('delete', { id } as FinancialService)}
          onView={service => handleServiceAction('view', service)}
          onSchedule={service => handleServiceAction('schedule', service)}
        />
      ) : (
        <ServicesGrid
          services={paginatedServices}
          onEdit={service => handleServiceAction('edit', service)}
          onDelete={id => handleServiceAction('delete', { id } as FinancialService)}
          onView={service => handleServiceAction('view', service)}
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
      />

      {/* Service Comparison Modal */}
      <ServiceComparison
        services={filteredAndSortedServices}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

      {/* Payment Schedule Modal */}
      {showSchedule && selectedServiceForSchedule && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b border-gray-200 p-4'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Échéancier - {selectedServiceForSchedule.designation}
                </h2>
                <button
                  onClick={() => setShowSchedule(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ×
                </button>
              </div>
            </div>
            <div className='p-6'>
              <PaymentSchedule
                service={selectedServiceForSchedule}
                amount={1000000}
                duration={12}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
