'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { x: 20, opacity: 0 },
  show: { x: 0, opacity: 1 },
};

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/simulator', label: 'Simulateur' },
    { href: '/comparator', label: 'Comparateur' },
    { href: '/modules-formation', label: 'Modules' },
    { href: '/about', label: 'A propos' },
  ];

  const isActive = (href: string) => (pathname ?? '/') === href;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-grey-200'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between'>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href='/' className='flex items-center gap-3 cursor-pointer'>
            <Image
              src='/assets/images/logo.avif'
              alt='Logo Finance4ALL'
              width={40}
              height={40}
              className='h-10 w-auto object-contain'
            />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <NavigationMenu className='hidden md:flex'>
          <NavigationMenuList>
            {navLinks.map(link => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    className={[
                      'transition-colors px-4 py-2 relative group',
                      isActive(link.href)
                        ? 'text-primary-400 font-bold'
                        : 'text-gray-600 hover:text-primary-300',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Action Buttons */}
        <div className='flex items-center gap-3'>
          <div className='hidden md:flex items-center gap-3'>
            <Link href='/login'>
              <Button variant='ghost' className='cursor-pointer text-grey-600 hover:bg-grey-100'>
                Se connecter
              </Button>
            </Link>
            <Link href='/register'>
              <Button className='cursor-pointer flex items-center justify-center gap-2 bg-gradient-primary hover:opacity-90 text-white shadow-lg transition-all active:scale-95'>
                <span className='flex items-center gap-2'>Commencer gratuitement</span>
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu*/}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button variant='ghost' size='icon' className='relative'>
                <AnimatePresence mode='wait'>
                  {isOpen ? (
                    <motion.div
                      key='close'
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className='h-6 w-6' />
                    </motion.div>
                  ) : (
                    <motion.div
                      key='menu'
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className='h-6 w-6' />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>

            <SheetContent
              side='right'
              className='w-full sm:w-[350px] border-l border-grey-100 px-2'
            >
              <SheetHeader className='text-left'>
                <Link href='/' className='flex items-center gap-3 cursor-pointer'>
                  <Image
                    src='/assets/images/logo.avif'
                    alt='Logo Finance4ALL'
                    width={40}
                    height={40}
                    className='h-10 w-auto object-contain'
                  />
                </Link>
              </SheetHeader>
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='show'
                className='flex flex-col gap-4 mt-12'
              >
                {navLinks.map(link => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link href={link.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant='ghost'
                        className={[
                          'w-full justify-start text-lg py-6 hover:bg-primary-50',
                          isActive(link.href)
                            ? 'text-primary-400 font-bold'
                            : 'text-grey-600 hover:text-primary-600',
                        ].join(' ')}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  variants={itemVariants}
                  className='border-t border-grey-200 pt-8 mt-4 space-y-4'
                >
                  <Link href='/login' onClick={() => setIsOpen(false)} className='block'>
                    <Button variant='outline' className='w-full py-6 border-grey-300'>
                      Se connecter
                    </Button>
                  </Link>
                  <Link href='/get-started' onClick={() => setIsOpen(false)} className='block'>
                    <Button className='w-full py-6 bg-gradient-primary text-white shadow-primary'>
                      Commencer gratuitement
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
