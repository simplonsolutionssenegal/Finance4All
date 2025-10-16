'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Service } from '@/types/Service';

interface ServiceItemProps {
  service: Service;
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  const formatFrais = () => {
    const parts = [];
    if (service.frais.montantFixe) {
      parts.push(`${service.frais.montantFixe} FCFA fixe`);
    }
    if (service.frais.pourcentage) {
      parts.push(`${service.frais.pourcentage}%`);
    }
    if (service.frais.minimum) {
      parts.push(`min: ${service.frais.minimum} FCFA`);
    }
    if (service.frais.maximum) {
      parts.push(`max: ${service.frais.maximum} FCFA`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Aucun frais';
  };

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle className='text-lg font-bold text-gray-900'>{service.name}</CardTitle>
            <CardDescription className='text-sm text-gray-600'>{service.longName}</CardDescription>
          </div>
          <Badge className='bg-cyan-400/30 text-cyan-800 px-3 py-1 rounded-xl'>
            {service.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-sm font-semibold text-gray-700 mb-1'>Frais</p>
          <p className='text-sm text-gray-600'>{formatFrais()}</p>
        </div>

        {service.conditionAccess.length > 0 && (
          <div>
            <p className='text-sm font-semibold text-gray-700 mb-2'>Conditions d&apos;accès</p>
            <div className='flex flex-wrap gap-1.5'>
              {service.conditionAccess.map((condition, index) => (
                <Badge key={index} variant='outline' className='text-xs'>
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {service.plafonds.length > 0 && (
          <div>
            <p className='text-sm font-semibold text-gray-700 mb-2'>Plafonds</p>
            <div className='flex flex-wrap gap-1.5'>
              {service.plafonds.map((plafond, index) => (
                <Badge key={index} variant='secondary' className='text-xs bg-blue-100'>
                  {plafond}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {service.infrastructureAccess.length > 0 && (
          <div>
            <p className='text-sm font-semibold text-gray-700 mb-2'>Infrastructure d&apos;accès</p>
            <div className='flex flex-wrap gap-1.5'>
              {service.infrastructureAccess.map((infra, index) => (
                <Badge key={index} variant='secondary' className='text-xs bg-green-100'>
                  {infra}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
