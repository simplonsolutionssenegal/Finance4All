import { redirect } from 'next/navigation';

export default function BeneficiaireDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/recipients/${params.id}`);
}
