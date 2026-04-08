/**
 * @jest-environment jsdom
 */

import { redirect } from 'next/navigation';

import BeneficiaireDashboardRedirect from '@/app/(auth)/beneficiaire-dashboard/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('BeneficiaireDashboardRedirect', () => {
  it('should redirect to /dashboard', () => {
    expect(() => BeneficiaireDashboardRedirect()).not.toThrow();
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
