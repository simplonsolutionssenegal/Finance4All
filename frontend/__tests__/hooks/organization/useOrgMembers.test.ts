import { renderHook } from '@testing-library/react';

import { useOrgMembers } from '@/hooks/organization/useOrgMembers';

jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(),
}));

const mockUseOrganization = require('@clerk/nextjs').useOrganization;

describe('useOrgMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty members when no organization', () => {
    mockUseOrganization.mockReturnValue({
      organization: null,
      memberships: null,
      invitations: null,
    });

    const { result } = renderHook(() => useOrgMembers());

    expect(result.current.members).toEqual([]);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.totalCount).toBe(0);
  });

  it('should return members from organization', () => {
    mockUseOrganization.mockReturnValue({
      organization: { name: 'Test Org' },
      memberships: {
        data: [
          {
            id: 'mem_1',
            publicUserData: {
              userId: 'user_1',
              firstName: 'John',
              lastName: 'Doe',
              identifier: 'john@example.com',
              imageUrl: 'https://example.com/avatar.jpg',
            },
            role: 'org:admin',
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'mem_2',
            publicUserData: {
              userId: 'user_2',
              firstName: 'Jane',
              lastName: 'Smith',
              identifier: 'jane@example.com',
            },
            role: 'org:member',
            createdAt: new Date('2024-01-02'),
          },
        ],
        isLoading: false,
        revalidate: jest.fn(),
      },
      invitations: { data: [] },
    });

    const { result } = renderHook(() => useOrgMembers());

    expect(result.current.members).toHaveLength(2);
    expect(result.current.members[0].fullName).toBe('John Doe');
    expect(result.current.members[0].role).toBe('org:admin');
    expect(result.current.members[1].fullName).toBe('Jane Smith');
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.organizationName).toBe('Test Org');
  });

  it('should include pending invitations', () => {
    mockUseOrganization.mockReturnValue({
      organization: { name: 'Test Org' },
      memberships: {
        data: [
          {
            id: 'mem_1',
            publicUserData: {
              userId: 'user_1',
              firstName: 'John',
              lastName: 'Doe',
              identifier: 'john@example.com',
            },
            role: 'org:admin',
            createdAt: new Date('2024-01-01'),
          },
        ],
        isLoading: false,
        revalidate: jest.fn(),
      },
      invitations: {
        data: [
          {
            id: 'inv_1',
            emailAddress: 'pending@example.com',
            role: 'org:member',
            publicMetadata: { firstName: 'Pending', lastName: 'User' },
            createdAt: new Date('2024-01-03'),
          },
        ],
      },
    });

    const { result } = renderHook(() => useOrgMembers());

    expect(result.current.members).toHaveLength(2);
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.members[1].status).toBe('En attente');
    expect(result.current.members[1].email).toBe('pending@example.com');
  });

  it('should compute membersByRole correctly', () => {
    mockUseOrganization.mockReturnValue({
      organization: { name: 'Test Org' },
      memberships: {
        data: [
          {
            id: 'mem_1',
            publicUserData: { userId: 'u1', firstName: 'A', lastName: 'B', identifier: 'a@b.com' },
            role: 'org:admin',
            createdAt: new Date(),
          },
          {
            id: 'mem_2',
            publicUserData: { userId: 'u2', firstName: 'C', lastName: 'D', identifier: 'c@d.com' },
            role: 'org:member',
            createdAt: new Date(),
          },
          {
            id: 'mem_3',
            publicUserData: { userId: 'u3', firstName: 'E', lastName: 'F', identifier: 'e@f.com' },
            role: 'org:member',
            createdAt: new Date(),
          },
        ],
        isLoading: false,
        revalidate: jest.fn(),
      },
      invitations: { data: [] },
    });

    const { result } = renderHook(() => useOrgMembers());

    expect(result.current.membersByRole['org:admin']).toBe(1);
    expect(result.current.membersByRole['org:member']).toBe(2);
  });
});
