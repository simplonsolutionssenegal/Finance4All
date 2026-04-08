import { redirect } from 'next/navigation';

import BeneficiairesRedirect from '@/app/(auth)/beneficiaires/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('BeneficiairesRedirect', () => {
  it('should redirect to /recipients', () => {
    expect(() => BeneficiairesRedirect()).not.toThrow();
    expect(redirect).toHaveBeenCalledWith('/recipients');
  });
});
