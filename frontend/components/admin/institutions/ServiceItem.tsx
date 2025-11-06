import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Service } from '@/types/Service';

type ServiceItemProps = {
  services: Service[];
  onView?: (service: Service) => void;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
};

const ServiceItem = ({ services, onView, onEdit, onDelete }: ServiceItemProps) => {
  if (!services || services.length === 0) {
    return <div className='text-center text-gray-500 py-10'>Aucun service pour le moment.</div>;
  }

  const formatNumber = (n: number) => {
    try {
      return new Intl.NumberFormat('fr-FR').format(n);
    } catch {
      return String(n);
    }
  };

  const formatAmountRange = (service: Service) => {
    const min = service.montantMin;
    const max = service.montantMax;
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;
    if (hasMin && hasMax) {
      if (min === 0 && max === 0) return '_';
      return `${formatNumber(min)} - ${formatNumber(max)} FCFA`;
    }
    if (hasMin) return `≥ ${formatNumber(min)} FCFA`;
    if (hasMax) return `≤ ${formatNumber(max)} FCFA`;
    return '—';
  };

  const formatFrais = (service: Service) => {
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
    if (service.frais.fraisChange) {
      parts.push(`frais de change: ${service.frais.fraisChange} ${service.frais.devise}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Aucun frais';
  };

  return (
    <div className='w-full rounded-2xl bg-white shadow-md'>
      <div className=' overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 border-b border-gray-200'>
              <TableHead className='w-[40%] min-w-[200px] ps-4'>Service</TableHead>
              <TableHead className='w-[15%] min-w-[100px]'>Type</TableHead>
              <TableHead className='w-[30%] min-w-[140px]'>Montants</TableHead>
              <TableHead className='w-[10%] min-w-[120px]'>Frais</TableHead>
              <TableHead className='w-[5%] min-w-[80px] text-right pr-4'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(service => {
              return (
                <TableRow
                  key={service.id}
                  className='hover:bg-gray-200 border-b border-gray-200 last:border-0'
                >
                  <TableCell className='py-2 ps-4'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-medium text-gray-900 text-sm'>{service.name}</span>
                      {service.longName && (
                        <span className='text-xs text-gray-500 line-clamp-1'>
                          {service.longName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='py-2'>
                    <Badge className='rounded-xl bg-gray-100 text-gray-800'>{service.type}</Badge>
                  </TableCell>
                  <TableCell className='py-2 text-sm text-gray-700'>
                    <div className='line-clamp-2'>{formatAmountRange(service)}</div>
                  </TableCell>
                  <TableCell className='py-2 text-sm text-gray-700'>
                    <div className='flex flex-col gap-0.5'>{formatFrais(service)}</div>
                  </TableCell>
                  <TableCell className='py-2 text-right pr-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                          <EllipsisVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align='end'
                        sideOffset={6}
                        className='w-40 rounded-xl p-1 border border-gray-200 bg-white shadow-md'
                      >
                        {onView && (
                          <DropdownMenuItem
                            onClick={() => onView(service)}
                            className='flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-gray-700
                               focus:bg-gray-100 data-[highlighted]:bg-gray-100 cursor-pointer'
                          >
                            <Eye className='h-4 w-4 text-gray-500' />
                            Voir les détails
                          </DropdownMenuItem>
                        )}

                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(service)}
                            className='flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-gray-700
                               focus:bg-gray-100 data-[highlighted]:bg-gray-100 cursor-pointer'
                          >
                            <Pencil className='h-4 w-4 text-gray-500' />
                            Modifier
                          </DropdownMenuItem>
                        )}

                        {(onView || onEdit) && onDelete && (
                          <DropdownMenuSeparator className='my-1' />
                        )}

                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(service)}
                            className='flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-red-600
                               focus:bg-red-50 data-[highlighted]:bg-red-50 cursor-pointer'
                          >
                            <Trash2 className='h-4 w-4 text-red-600' />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServiceItem;
