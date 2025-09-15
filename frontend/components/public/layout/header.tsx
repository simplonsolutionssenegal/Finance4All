export default function PublicHeader() {
  return (
    <header className='bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <span className='text-2xl font-bold text-teal-600'>Finance4All</span>
          </div>
          <nav className='hidden md:flex space-x-8'>
            <a href='/comparator' className='text-gray-700 hover:text-teal-600'>
              Comparateur
            </a>
            <a href='/formations' className='text-gray-700 hover:text-teal-600'>
              Formation
            </a>
            <a href='/faq' className='text-gray-700 hover:text-teal-600'>
              FAQ
            </a>
            <a href='/about-us' className='text-gray-700 hover:text-teal-600'>
              À Propos
            </a>
          </nav>
          <button className='bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700'>
            Se connecter
          </button>
        </div>
      </div>
    </header>
  );
}
