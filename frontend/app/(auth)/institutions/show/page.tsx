// frontend/app/(auth)/institutions/show/page.tsx  (Server Component)
import InstituteHeader from '@/components/institutions/InstituteHeaderProps';
import InstitutionClient from '@/components/institutions/InstitutionClient';

type PageProps = {
  searchParams: { id?: string };
};

export default function InstitutionPage({ searchParams }: PageProps) {
  const institutionId = searchParams.id ?? '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';

  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <InstituteHeader
          logoSrc='/assets/images/sgbs.png'
          name='Nom de l’institut'
          status='ACTIF'
          website='www.institutname.com'
          description='Description : Lorem ipsum ubn hnnd sjjjlkllasfjj hjhjhjdfn hbsbjjh kbs Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio quos alias aperiam vero numquam totam similique soluta accusantium omnis quae. Veritatis laudantium reprehenderit nesciunt, dolores non consequatur pariatur ipsam quas!'
          zones={[
            { id: 1, label: 'Zone géographique A' },
            { id: 2, label: 'Zone géographique B' },
          ]}
        />
        <InstitutionClient institutionId={institutionId} />
      </div>
    </div>
  );
}
