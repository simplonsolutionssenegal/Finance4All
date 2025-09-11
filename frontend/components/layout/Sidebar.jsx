// frontend/components/layout/Sidebar.jsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ open, setOpen }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: '📊' },
    { name: 'Utilisateurs', href: '/admin/users', icon: '👥' },
    { name: 'Projets', href: '/projects', icon: '📁' },
    { name: 'Tâches', href: '/tasks', icon: '✅' },
    { name: 'Paramètres', href: '/settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-300 ease-in-out md:static md:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <div className="text-white font-bold text-xl">Mon App</div>
          <button
            className="text-white md:hidden"
            onClick={() => setOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;