import { Users } from 'lucide-react';
import Link from 'next/link';

export default function OrganizationDashboard() {
  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard Organisation</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Gerez vos beneficiaires et suivez leur progression.
          </p>
        </div>

        <div className='rounded-xl border border-gray-200 bg-white p-8 text-center'>
          <Users className='mx-auto h-12 w-12 text-gray-400' />
          <h2 className='mt-4 text-lg font-semibold text-gray-900'>Recipients</h2>
          <p className='mt-2 text-sm text-gray-500'>
            Consultez et gerez les beneficiaires de votre organisation.
          </p>
          <Link
            href='/recipients'
            className='mt-4 inline-block rounded-lg bg-primary-300 px-6 py-2 text-sm font-medium text-white hover:bg-primary-400'
          >
            Voir les recipients
          </Link>
        </div>
      </div>
    </div>
  );
}
