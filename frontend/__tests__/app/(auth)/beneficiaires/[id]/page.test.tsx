import { redirect } from 'next/navigation';

import BeneficiaireDetailRedirect from '@/app/(auth)/beneficiaires/[id]/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('BeneficiaireDetailRedirect', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  it('redirects to /recipients/:id with the correct id', async () => {
    const params = Promise.resolve({ id: 'user-123' });

    await BeneficiaireDetailRedirect({ params });

    expect(mockRedirect).toHaveBeenCalledWith('/recipients/user-123');
  });

  it('redirects with a different id', async () => {
    const params = Promise.resolve({ id: 'abc-456' });

    await BeneficiaireDetailRedirect({ params });

    expect(mockRedirect).toHaveBeenCalledWith('/recipients/abc-456');
  });

  it('calls redirect exactly once', async () => {
    const params = Promise.resolve({ id: 'test-id' });

    await BeneficiaireDetailRedirect({ params });

    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});
