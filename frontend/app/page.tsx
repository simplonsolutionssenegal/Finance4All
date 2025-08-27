// app/page.tsx
 import { redirect } from 'next/navigation';

export default function Dashboard() {
   redirect('/dashboard');
  return null;
}