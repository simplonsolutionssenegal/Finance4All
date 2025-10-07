// frontend/components/institutions/ProductsTableSkeleton.tsx

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

function TableRowSkeleton() {
  return (
    <tr
      className='w-full border-b border-gray-100 last-of-type:border-none
                   [&:first-child>td:first-child]:rounded-tl-lg
                   [&:first-child>td:last-child]:rounded-tr-lg
                   [&:last-child>td:first-child]:rounded-bl-lg
                   [&:last-child>td:last-child]:rounded-br-lg'
    >
      <td className='whitespace-nowrap px-4 py-3'>
        <div className='h-5 w-40 rounded bg-gray-100' />
      </td>
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-5 w-24 rounded bg-gray-100' />
      </td>
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-5 w-16 rounded bg-gray-100' />
      </td>
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-5 w-16 rounded bg-gray-100' />
      </td>
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-5 w-24 rounded bg-gray-100' />
      </td>
      <td className='whitespace-nowrap py-3 pl-6 pr-3'>
        <div className='ml-auto flex justify-end gap-2'>
          <div className='h-[28px] w-[28px] rounded bg-gray-100' />
          <div className='h-[28px] w-[28px] rounded bg-gray-100' />
          <div className='h-[28px] w-[28px] rounded bg-gray-100' />
        </div>
      </td>
    </tr>
  );
}

export function ProductsTableSkeleton() {
  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className={`${shimmer} relative overflow-hidden rounded-lg bg-gray-50 p-2 md:pt-0`}>
          {/* Mobile skeleton */}
          <div className='md:hidden'>
            <ProductsMobileSkeleton />
            <ProductsMobileSkeleton />
            <ProductsMobileSkeleton />
            <ProductsMobileSkeleton />
            <ProductsMobileSkeleton />
            <ProductsMobileSkeleton />
          </div>

          {/* Desktop table skeleton */}
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                {[
                  'Désignation',
                  'Type',
                  'Montant min.',
                  'Montant max.',
                  'Remboursement',
                  'Action',
                ].map(h => (
                  <th key={h} scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='bg-white'>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ProductsMobileSkeleton() {
  return (
    <div className='mb-2 w-full rounded-md bg-white p-4'>
      <div className='flex items-center justify-between border-b border-gray-100 pb-8'>
        <div className='flex items-center'>
          <div className='mr-2 h-8 w-8 rounded-full bg-gray-100' />
          <div className='h-6 w-28 rounded bg-gray-100' />
        </div>
        <div className='h-6 w-16 rounded bg-gray-100' />
      </div>
      <div className='flex w-full items-center justify-between pt-4'>
        <div>
          <div className='h-6 w-24 rounded bg-gray-100' />
          <div className='mt-2 h-6 w-32 rounded bg-gray-100' />
        </div>
        <div className='flex justify-end gap-2'>
          <div className='h-9 w-9 rounded bg-gray-100' />
          <div className='h-9 w-9 rounded bg-gray-100' />
        </div>
      </div>
    </div>
  );
}
