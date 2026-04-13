import { getBackendToken, getAuthStatus } from '@/lib/auth-utils';
import { auth } from '@clerk/nextjs/server';
import { resolveAppRole } from '@/lib/role-access';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/role-access', () => ({
  resolveAppRole: jest.fn(),
}));

const authMock = auth as unknown as jest.Mock;
const resolveAppRoleMock = resolveAppRole as unknown as jest.Mock;

describe('getBackendToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns template token when available', async () => {
    const getToken = jest.fn().mockResolvedValueOnce('template-token');

    const result = await getBackendToken(getToken);

    expect(result).toBe('template-token');
    expect(getToken).toHaveBeenCalledWith({ template: 'backend' });
    expect(getToken).toHaveBeenCalledTimes(1);
  });

  it('falls back to default token when template returns null', async () => {
    const getToken = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce('default-token');

    const result = await getBackendToken(getToken);

    expect(result).toBe('default-token');
    expect(getToken).toHaveBeenCalledTimes(2);
    expect(getToken).toHaveBeenNthCalledWith(1, { template: 'backend' });
    expect(getToken).toHaveBeenNthCalledWith(2);
  });

  it('falls back to default token when template throws', async () => {
    const getToken = jest
      .fn()
      .mockRejectedValueOnce(new Error('Template not found'))
      .mockResolvedValueOnce('default-token');

    const result = await getBackendToken(getToken);

    expect(result).toBe('default-token');
    expect(getToken).toHaveBeenCalledTimes(2);
    expect(getToken).toHaveBeenNthCalledWith(1, { template: 'backend' });
    expect(getToken).toHaveBeenNthCalledWith(2);
  });

  it('returns null when both return null', async () => {
    const getToken = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await getBackendToken(getToken);

    expect(result).toBeNull();
    expect(getToken).toHaveBeenCalledTimes(2);
  });
});

describe('getAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resolveAppRoleMock.mockReturnValue('Beneficiare');
  });

  it('returns null userId when not authenticated', async () => {
    authMock.mockResolvedValue({
      userId: undefined,
      orgId: undefined,
      orgRole: undefined,
      sessionClaims: undefined,
    });

    const result = await getAuthStatus();

    expect(result.userId).toBeNull();
    expect(result.orgId).toBeNull();
    expect(result.orgRole).toBeNull();
  });

  it('detects beneficiary from orgRole org:recipient', async () => {
    authMock.mockResolvedValue({
      userId: 'user_123',
      orgId: 'org_456',
      orgRole: 'org:recipient',
      sessionClaims: {},
    });
    resolveAppRoleMock.mockReturnValue('Recipient');

    const result = await getAuthStatus();

    expect(result.isBeneficiary).toBe(true);
    expect(result.userId).toBe('user_123');
    expect(result.orgId).toBe('org_456');
    expect(result.orgRole).toBe('org:recipient');
  });

  it('detects beneficiary from metadata role beneficiary', async () => {
    authMock.mockResolvedValue({
      userId: 'user_789',
      orgId: undefined,
      orgRole: undefined,
      sessionClaims: {
        metadata: { role: 'beneficiary' },
      },
    });
    resolveAppRoleMock.mockReturnValue('Beneficiare');

    const result = await getAuthStatus();

    expect(result.isBeneficiary).toBe(true);
    expect(result.userId).toBe('user_789');
  });

  it('detects beneficiary from metadata role BENEFICIAIRE', async () => {
    authMock.mockResolvedValue({
      userId: 'user_abc',
      orgId: undefined,
      orgRole: undefined,
      sessionClaims: {
        publicMetadata: { role: 'BENEFICIAIRE' },
      },
    });
    resolveAppRoleMock.mockReturnValue('Beneficiare');

    const result = await getAuthStatus();

    expect(result.isBeneficiary).toBe(true);
    expect(result.userId).toBe('user_abc');
  });

  it('non-beneficiary user with admin role', async () => {
    authMock.mockResolvedValue({
      userId: 'user_admin',
      orgId: 'org_admin',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        metadata: { role: 'admin' },
      },
    });
    resolveAppRoleMock.mockReturnValue('Admin');

    const result = await getAuthStatus();

    expect(result.isBeneficiary).toBe(false);
    expect(result.appRole).toBe('Admin');
    expect(result.userId).toBe('user_admin');
    expect(result.orgId).toBe('org_admin');
    expect(result.orgRole).toBe('org:admin');
  });

  it('passes correct args to resolveAppRole', async () => {
    const orgPublicMetadata = { type: 'partner' };
    const userMetadata = { role: 'member' };
    const userPublicMetadata = { role: 'member' };

    authMock.mockResolvedValue({
      userId: 'user_test',
      orgId: 'org_test',
      orgRole: 'org:member',
      sessionClaims: {
        org_public_metadata: orgPublicMetadata,
        metadata: userMetadata,
        publicMetadata: userPublicMetadata,
      },
    });
    resolveAppRoleMock.mockReturnValue('MemberOrg');

    await getAuthStatus();

    expect(resolveAppRoleMock).toHaveBeenCalledTimes(1);
    expect(resolveAppRoleMock).toHaveBeenCalledWith(orgPublicMetadata, 'org:member', {
      unsafeMetadata: userMetadata,
      publicMetadata: userPublicMetadata,
    });
  });
});
