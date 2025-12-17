import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function PublicFooter() {
  return (
    <footer className='bg-grey-900 text-white py-16 px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid md:grid-cols-4 gap-12 mb-12'>
          {/* Brand Section */}
          <div className='space-y-6'>
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary'>
                <span className='text-white font-bold'>F4A</span>
              </div>
              <span className='text-2xl font-semibold'>Finance4All</span>
            </div>
            <p className='text-grey-400 text-sm'>
              Votre partenaire pour l&apos;inclusion financière au Sénégal et au Cameroun.
            </p>
            <div className='flex gap-2'>
              <Badge variant='outline' className='border-grey-700 text-grey-300'>
                🇸🇳 Sénégal
              </Badge>
              <Badge variant='outline' className='border-grey-700 text-grey-300'>
                🇨🇲 Cameroun
              </Badge>
            </div>
          </div>

          {/* Produits */}
          <div>
            <h3 className='font-semibold mb-4 text-white'>Produits</h3>
            <nav className='flex flex-col gap-3'>
              <Link href='/comparator'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Comparateur
                </Button>
              </Link>
              <Link href='/simulator'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Simulateur
                </Button>
              </Link>
              <Link href='/modules'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Catalogue de modules
                </Button>
              </Link>
              <Link href='/certificates'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Certificats
                </Button>
              </Link>
            </nav>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className='font-semibold mb-4 text-white'>Entreprise</h3>
            <nav className='flex flex-col gap-3'>
              <Link href='/about'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  À propos
                </Button>
              </Link>
              <Link href='/partners'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Partenaires
                </Button>
              </Link>
              <Link href='/blog'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Blog
                </Button>
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className='font-semibold mb-4 text-white'>Support</h3>
            <nav className='flex flex-col gap-3'>
              <Link href='/help'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Centre d&apos;aide
                </Button>
              </Link>
              <Link href='/contact'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Contact
                </Button>
              </Link>
              <Link href='/terms'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Conditions d&apos;utilisation
                </Button>
              </Link>
              <Link href='/privacy'>
                <Button
                  variant='link'
                  className='text-grey-400 hover:text-white p-0 h-auto justify-start'
                >
                  Confidentialité
                </Button>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className='bg-grey-800 mb-8' />
        <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-grey-400 text-sm'>
            © 2024 Finance4All. Tous droits réservés. Powered by Simplon Solutions.
          </p>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' className='text-grey-400 hover:text-white h-8'>
              Politique de cookies
            </Button>
            <Button variant='ghost' size='sm' className='text-grey-400 hover:text-white h-8'>
              Mentions légales
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
