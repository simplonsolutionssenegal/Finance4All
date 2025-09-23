import PublicFooter from '@/components/public/layout/footer';
import PublicHeader from '@/components/public/layout/header';

export default function Home() {
  return (
    <div className='min-h-screen'>
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className='bg-gradient-to-r from-teal-50 to-blue-50 py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h1 className='text-5xl font-bold text-gray-900 mb-6'>
                Finance4All :
                <br />
                Prenez le pouvoir
                <br />
                sur vos finances !
              </h1>
              <p className='text-xl text-gray-600 mb-8'>
                Formez-vous, simulez, et choisissez
                <br />
                les meilleures solutions financières
                <br />
                en toute autonomie.
              </p>
            </div>
            <div className='relative'>
              <div className='bg-gray-800 rounded-lg p-8 text-white'>
                <div className='h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-lg'>Graphiques financiers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold text-gray-900 mb-12'>
            Ils font confiance à Finance4or all
          </h2>
          <div className='flex justify-center items-center space-x-12 opacity-60'>
            <div className='w-24 h-12 bg-gray-200 rounded flex items-center justify-center'>
              Logo 1
            </div>
            <div className='w-24 h-12 bg-gray-200 rounded flex items-center justify-center'>
              Logo 2
            </div>
            <div className='w-24 h-12 bg-gray-200 rounded flex items-center justify-center'>
              Logo 3
            </div>
            <div className='w-24 h-12 bg-gray-200 rounded flex items-center justify-center'>
              Logo 4
            </div>
            <div className='w-24 h-12 bg-gray-200 rounded flex items-center justify-center'>
              Logo 5
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-4xl font-bold text-teal-600 mb-2'>À PROPOS DE NOUS</h2>
              <p className='text-gray-600 mb-6'>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
                It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged.
              </p>
              <button className='bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700'>
                Lire Plus
              </button>
            </div>
            <div className='relative'>
              <div className='bg-gray-800 rounded-lg overflow-hidden'>
                <div className='h-80 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white'>
                  <span>Image gratte-ciels + graphiques</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Icons Section */}
      <section className='py-16 bg-teal-600'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center text-white'>
              <div className='w-16 h-16 bg-white bg-opacity-20 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <span className='text-2xl'>📊</span>
              </div>
              <p className='text-sm'>Service 1</p>
            </div>
            <div className='text-center text-white'>
              <div className='w-16 h-16 bg-white bg-opacity-20 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <span className='text-2xl'>📈</span>
              </div>
              <p className='text-sm'>Service 2</p>
            </div>
            <div className='text-center text-white'>
              <div className='w-16 h-16 bg-white bg-opacity-20 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <span className='text-2xl'>🛡️</span>
              </div>
              <p className='text-sm'>Service 3</p>
            </div>
            <div className='text-center text-white'>
              <div className='w-16 h-16 bg-white bg-opacity-20 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <span className='text-2xl'>👤</span>
              </div>
              <p className='text-sm'>Service 4</p>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-center text-gray-900 mb-16'>
            Education financière
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[1, 2, 3].map(item => (
              <div key={item} className='bg-white rounded-lg shadow-lg overflow-hidden'>
                <div className='h-48 bg-gray-200 flex items-center justify-center'>
                  <span className='text-gray-500'>Image cours {item}</span>
                </div>
                <div className='p-6'>
                  <h3 className='text-xl font-bold mb-2'>Gestion de finance</h3>
                  <p className='text-gray-600 text-sm mb-4'>20 heures</p>
                  <div className='flex justify-between items-center'>
                    <button className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm'>
                      Voir Plus
                    </button>
                    <span className='text-gray-400 text-sm'>⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section className='py-20 bg-gradient-to-r from-teal-400 to-blue-500'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-center text-white mb-16'>
            Comparer selon vos besoins
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map(item => (
              <div key={item} className='bg-white rounded-lg p-6 text-center'>
                <div className='w-16 h-16 bg-teal-100 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                  <span className='text-2xl'>📄</span>
                </div>
                <h3 className='font-bold mb-2'>Service {item}</h3>
                <p className='text-gray-600 text-sm mb-4'>
                  Description du service et de ses avantages
                </p>
                <button className='text-teal-600 font-medium text-sm'>En savoir plus →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-center text-gray-900 mb-16'>Ils témoignent</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[1, 2, 3].map(item => (
              <div key={item} className='text-center'>
                <p className='text-gray-600 mb-6 italic'>
                  &quot;Lorem ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem ipsum has been the industry&apos;s standard dummy text ever since.&quot;
                </p>
                <div className='flex items-center justify-center space-x-4'>
                  <div className='w-12 h-12 bg-gray-200 rounded-full' />
                  <div>
                    <p className='font-bold'>John Doe</p>
                    <div className='text-yellow-400'>⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-white rounded-2xl p-8 shadow-lg'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
              <div>
                <h3 className='text-2xl font-bold mb-4'>
                  Abonnez-vous à notre newsletter pour rester informé
                </h3>
                <div className='flex space-x-2'>
                  <input
                    type='email'
                    placeholder='Votre email'
                    className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600'
                  />
                  <button className='bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700'>
                    S&apos;abonner
                  </button>
                </div>
              </div>
              <div className='text-center'>
                <div className='w-48 h-32 bg-teal-100 rounded-lg mx-auto flex items-center justify-center'>
                  <span className='text-teal-600'>📧 Newsletter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
