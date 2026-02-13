import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { AppProvider } from '@/contexts/app-provider';

const barlow = localFont({
  src: [
    {
      path: '../public/assets/fonts/Barlow-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Barlow-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Barlow-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Barlow-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Barlow-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Barlow-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Barlow-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finance4All',
  description: '',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='fr' suppressHydrationWarning>
      <body className={`${barlow.variable} antialiased`} suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
