// frontend/components/services/ServiceInfoModal.tsx
'use client';

import { DollarSign, CheckCircle2, AlertCircle, Wifi } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Service } from '@/types/Service';

interface ServiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

export default function ServiceInfoModal({ isOpen, onClose, service }: ServiceInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} data-testid='dialog'>
      <DialogContent
        className='max-w-3xl max-h-[100vh] overflow-y-auto p-6'
        data-testid='dialog-content'
      >
        <DialogHeader>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <DialogTitle className='text-2xl font-bold text-gray-900 mb-2 data-[state=open]:animate-fadeIn'>
                {service.name}
              </DialogTitle>
              <p className='text-base text-gray-600 data-[state=open]:animate-fadeIn'>
                {service.longName}
              </p>
            </div>
            <Badge className='bg-cyan-400/30 text-cyan-800 px-4 py-1 rounded-xl text-sm'>
              {service.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className='space-y-6 mt-6'>
          {/* Frais */}
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <DollarSign className='w-5 h-5 text-green-600' />
              <h3 className='text-lg font-semibold text-gray-900'>Frais du service</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {service.frais.montantFixe && (
                <div className='p-4 bg-green-50 rounded-lg border border-green-100'>
                  <p className='text-xs text-gray-600 mb-1'>Montant fixe</p>
                  <p className='text-xl font-bold text-green-700'>
                    {service.frais.montantFixe.toLocaleString()} FCFA
                  </p>
                </div>
              )}
              {service.frais.pourcentage && (
                <div className='p-4 bg-blue-50 rounded-lg border border-blue-100'>
                  <p className='text-xs text-gray-600 mb-1'>Pourcentage</p>
                  <p className='text-xl font-bold text-blue-700'>{service.frais.pourcentage}%</p>
                </div>
              )}
              {service.frais.minimum && (
                <div className='p-4 bg-purple-50 rounded-lg border border-purple-100'>
                  <p className='text-xs text-gray-600 mb-1'>Montant minimum</p>
                  <p className='text-xl font-bold text-purple-700'>
                    {service.frais.minimum.toLocaleString()} FCFA
                  </p>
                </div>
              )}
              {service.frais.maximum && (
                <div className='p-4 bg-orange-50 rounded-lg border border-orange-100'>
                  <p className='text-xs text-gray-600 mb-1'>Montant maximum</p>
                  <p className='text-xl font-bold text-orange-700'>
                    {service.frais.maximum.toLocaleString()} FCFA
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Conditions d'accès */}
          {service.conditionAccess && service.conditionAccess.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                <h3 className='text-lg font-semibold text-gray-900'>Conditions d&apos;accès</h3>
              </div>
              <ul className='space-y-2'>
                {service.conditionAccess.map((condition, index) => (
                  <li key={index} className='flex items-start gap-2 p-2 bg-gray-50 rounded-lg'>
                    <div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0'>
                      <span className='text-xs font-semibold text-emerald-700'>{index + 1}</span>
                    </div>
                    <span className='text-sm text-gray-700'>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Plafonds */}
          {service.plafonds && service.plafonds.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <AlertCircle className='w-5 h-5 text-orange-600' />
                <h3 className='text-lg font-semibold text-gray-900'>Plafonds</h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {service.plafonds.map((plafond, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100'
                  >
                    <div className='w-2 h-2 bg-orange-500 rounded-full' />
                    <span className='text-sm font-medium text-gray-700'>{plafond}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Infrastructure d'accès */}
          {service.infrastructureAccess && service.infrastructureAccess.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Wifi className='w-5 h-5 text-indigo-600' />
                <h3 className='text-lg font-semibold text-gray-900'>Canaux d&apos;accès</h3>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                {service.infrastructureAccess.map((infra, index) => (
                  <div
                    key={index}
                    className='p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-center'
                  >
                    <span className='text-sm font-medium text-indigo-700'>{infra}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
