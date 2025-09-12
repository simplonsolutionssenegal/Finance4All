'use client';

<<<<<<< HEAD
import Link from 'next/link';

import { SidebarMenuButton } from '@/components/ui/sidebar';
=======
import Link from "next/link";

import { SidebarMenuButton } from "@/components/ui/sidebar";
>>>>>>> 32f7ef4 (fix: Resolve ESLint warnings and errors for code quality)

interface SidebarMenuItemLinkProps {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SidebarMenuItemLink({
  href,
  active = false,
  icon,
  children,
  className,
  ...props
}: Readonly<SidebarMenuItemLinkProps>) {
  return (
    <Link href={href} passHref>
      <SidebarMenuButton asChild isActive={active} className={className} {...props}>
        <div className='flex items-center'>
          {icon && <span className='mr-2'>{icon}</span>}
          {children}
        </div>
      </SidebarMenuButton>
    </Link>
  );
}
