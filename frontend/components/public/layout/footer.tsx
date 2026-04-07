import Image from 'next/image';
import Link from 'next/link';

import { Separator } from '@/components/ui/separator';

export default function PublicFooter() {
  return (
    <footer className='bg-gray-900 text-white py-16 px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid md:grid-cols-4 gap-12 mb-12'>
          <div className='space-y-6'>
            <div className='inline-block bg-white p-2 rounded-sm'>
              <Image
                src='/assets/images/logo.avif'
                alt='Finance4All Logo'
                width={150}
                height={50}
                className='object-contain'
              />
            </div>
            <p className='text-gray-400 text-sm leading-relaxed pr-4'>
              Votre partenaire pour l&apos;inclusion financière au Sénégal et au Cameroun.
            </p>
          </div>

          <div>
            <h3 className='font-semibold mb-6 text-white'>Produits</h3>
            <nav className='flex flex-col gap-4 text-sm'>
              <Link
                href='/comparator'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                Comparateur
              </Link>
              <Link
                href='/simulator'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                Simulateur
              </Link>
              <Link
                href='/modules-formation'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                Catalogue de modules
              </Link>
            </nav>
          </div>

          <div>
            <h3 className='font-semibold mb-6 text-white'>Entreprise</h3>
            <nav className='flex flex-col gap-4 text-sm'>
              <Link
                href='/about'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                À propos
              </Link>
              <Link
                href='/partners'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                Partenaires
              </Link>
            </nav>
          </div>

          <div>
            <h3 className='font-semibold mb-6 text-white'>Support</h3>
            <nav className='flex flex-col gap-4 text-sm'>
              <Link
                href='/help'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                Centre d&apos;aide
              </Link>
              <Link
                href='/contact'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer w-fit'
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>

        <Separator className='bg-gray-800 mb-6' />
        <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-gray-400 text-sm'>© 2026 Finance4All. Tous droits réservés.</p>

          <div className='flex items-center gap-6 text-gray-400 text-sm'>
            <div className='flex items-center gap-2 cursor-pointer hover:text-white transition-colors'>
              <span aria-hidden='true'>🇸🇳</span>
              <span>Sénégal</span>
            </div>
            <div className='flex items-center gap-2 cursor-pointer hover:text-white transition-colors'>
              <span aria-hidden='true'>🇨🇲</span>
              <span>Cameroun</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
