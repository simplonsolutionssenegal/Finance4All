import React from 'react';

export default function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className='mb-4'>
      {title && <legend className='text-sm font-bold text-black mt-2'>{title}</legend>}
      <div className='mt-2 mb-3 h-px bg-[#EAEAEA] w-full' />
      {children}
    </fieldset>
  );
}
