//Navlink

'use client'
import clsx from 'clsx'
import {
    Home,
    FileText,
    Users,
    LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Map of links to display in the side navigation.
// Avec Lucide, on importe les icônes directement
const links = [
    { name: 'Overview', href: '/', icon: LayoutDashboard  },
    { name: 'Institutions partenaires', href: '/dashboard/institutions', icon: FileText  },
    { name: 'Cours & Formations', href: '/', icon: LayoutDashboard  },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
]

export default function NavLinks() {
    const pathname = usePathname()

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-sky-100 text-blue-600': pathname === link.href,
                            },
                        )}
                    >
                        <LinkIcon className="w-6 h-6" />
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                )
            })}
        </>
    )
}