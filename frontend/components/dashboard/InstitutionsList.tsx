'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';

export default function InstitutionsList() {
  const { institutions, isLoading } = useGetInstitutions({ limit: 10 });

  return (
    <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-semibold text-gray-900'>
          Institutions financieres
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-6'>
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='flex items-center justify-between py-3 animate-pulse'>
                <div className='h-4 w-40 bg-gray-200 rounded' />
                <div className='h-5 w-16 bg-gray-200 rounded-full' />
              </div>
            ))}
          </div>
        ) : institutions.length === 0 ? (
          <p className='text-sm text-gray-400 py-4 text-center'>Aucune institution enregistree</p>
        ) : (
          <div className='space-y-1'>
            {institutions.slice(0, 8).map(institution => (
              <div
                key={institution.id}
                className='flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0'
              >
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 truncate'>
                    {institution.name}
                  </div>
                  {institution.geographicZones?.length > 0 && (
                    <div className='text-xs text-gray-500 truncate'>
                      {institution.geographicZones.join(', ')}
                    </div>
                  )}
                </div>
                <Badge
                  variant='secondary'
                  className={
                    institution.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0 ml-3'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 ml-3'
                  }
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      institution.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {institution.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
