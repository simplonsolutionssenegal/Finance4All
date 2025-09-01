import Link from 'next/link';
import NavLinks from './nav-links';
import { Plus, LogOut } from "lucide-react";
// import NavLinks from '@/app/ui/dashboard/nav-links';
// import AcmeLogo from '@/app/ui/acme-logo';
// import { PowerIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      {/* <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link> */}
      <div className="flex h-20 items-center justify-center rounded-md bg-[#7DB7CA] p-[0.5] md:h-auto text-white font-bold text-xl space-x-3 mb-4">
        <Plus className="h-6 w-6 " />
        <span>Dashboard</span>
      </div>
      <div className="mb-4 text-[#CCCCCC]">
        Menu
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full md:block  mt-2 ml-10 mr-10">
          <div className="hidden md:block border-t-[1.5px] border-[#EAEAEA] ml-4 mr-4 ">
            <span className="block  text-gray-500  text-xs mt-2">Profil</span>
            <span className="block  text-black  text-xs mt-2">Jajaar</span>
            <span className="block text-gray-500 text-xs">dgueye.ext@simplon.co</span>
          </div>
        </div>
        <form className="inline">
          <button className="inline-flex h-8 items-center w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-1 text-sm font-medium hover:bg-sky-100 hover:text-black md:flex-none md:justify-start md:p-2 md:px-3">
        <div className="flex grow items-center justify-center">
               {/* <LogOut className="h-4 w-4" aria-hidden="true" /> */}
                <LogOut className="h-4 w-4 scale-x-[-1]" aria-hidden="true" />
            <span className="leading-none ml-1">Log out</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
