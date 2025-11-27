'use client';

export default function QuizList() {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
      <div className='max-w-md mx-auto'>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            className='w-8 h-8 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Aucun quiz disponible</h3>
        <p className='text-gray-500 mb-6'>
          Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.
        </p>
      </div>
    </div>
  );
}
