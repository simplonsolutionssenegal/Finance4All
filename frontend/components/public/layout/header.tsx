'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-grey-200'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-3 cursor-pointer'>
          <Image
            src='/assets/images/logo.avif'
            alt="Finance4ALL - Plateforme d'éducation financière"
            width={40}
            height={40}
            style={{ height: 'auto', width: 'auto' }}
            className='h-10 object-contain'
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className='hidden md:flex'>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href='/simulator'
                  className='text-grey-600 hover:text-primary-600 transition-colors px-4 py-2'
                >
                  Simulateur
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href='/comparator'
                  className='text-grey-600 hover:text-primary-600 transition-colors px-4 py-2'
                >
                  Comparateur
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href='/modules'
                  className='text-grey-600 hover:text-primary-600 transition-colors px-4 py-2'
                >
                  Modules
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Action Buttons */}
        <div className='flex items-center gap-3'>
          {/* Desktop Buttons */}
          <div className='hidden md:flex items-center gap-3'>
            <Link href='/login'>
              <Button variant='ghost' className='text-grey-600'>
                Se connecter
              </Button>
            </Link>
            <Link href='/get-started'>
              <Button className='bg-gradient-primary hover:opacity-90 text-white shadow-primary'>
                Commencer
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button variant='ghost' size='icon'>
                <Menu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[300px]'>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className='flex flex-col gap-4 mt-8'>
                <Link href='/simulator' onClick={() => setIsOpen(false)}>
                  <Button variant='ghost' className='w-full justify-start text-grey-600'>
                    Simulateur
                  </Button>
                </Link>
                <Link href='/comparator' onClick={() => setIsOpen(false)}>
                  <Button variant='ghost' className='w-full justify-start text-grey-600'>
                    Comparateur
                  </Button>
                </Link>
                <Link href='/modules' onClick={() => setIsOpen(false)}>
                  <Button variant='ghost' className='w-full justify-start text-grey-600'>
                    Modules
                  </Button>
                </Link>
                <div className='border-t border-grey-200 pt-4 mt-4 space-y-2'>
                  <Link href='/login' onClick={() => setIsOpen(false)}>
                    <Button variant='outline' className='w-full'>
                      Se connecter
                    </Button>
                  </Link>
                  <Link href='/get-started' onClick={() => setIsOpen(false)}>
                    <Button className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                      Commencer
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
