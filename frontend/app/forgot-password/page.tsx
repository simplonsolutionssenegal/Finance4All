import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

export default function ForgotPassword() {
  return (
    <AuthLayout backHref='/login'>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
