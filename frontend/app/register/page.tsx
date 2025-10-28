import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/register-form';

export default function Register() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
