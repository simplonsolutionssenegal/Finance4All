import { useOrganization, useOrganizationList, useUser } from '@clerk/nextjs';
import { renderHook, waitFor } from '@testing-library/react';

import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  useOrganization: jest.fn(),
  useOrganizationList: jest.fn(),
}));

const mockUseUser = useUser as jest.Mock;
const mockUseOrganization = useOrganization as jest.Mock;
const mockUseOrganizationList = useOrganizationList as jest.Mock;

describe('useBeneficiaries', () => {
  // ✅ CORRECTION: setActive doit retourner une Promise
  const mockSetActive = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    // ✅ Réinitialiser le mock pour retourner une Promise résolue
    mockSetActive.mockResolvedValue(undefined);

    // Default mocks
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
    });

    mockUseOrganization.mockReturnValue({
      organization: null,
      memberships: null,
      invitations: null,
    });

    mockUseOrganizationList.mockReturnValue({
      setActive: mockSetActive,
    });
  });

  describe('Initial state', () => {
    it('should start with loading true and empty data', () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
        memberships: { isLoading: true, data: [] },
        invitations: { data: [] },
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });
  });

  describe('No organization cases', () => {
    it('should set loading false when user has no organizations', () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          organizationMemberships: [],
        },
        isLoaded: true,
      });

      mockUseOrganization.mockReturnValue({
        organization: null,
        memberships: null,
        invitations: null,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    it('should try to set active organization when user has orgs but none active', async () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          organizationMemberships: [
            {
              organization: { id: 'org_123', name: 'Test Org' },
            },
          ],
        },
        isLoaded: true,
      });

      mockUseOrganization.mockReturnValue({
        organization: null,
        memberships: null,
        invitations: null,
      });

      renderHook(() => useBeneficiaries());

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({ organization: 'org_123' });
      });
    });

    it('should not try to set active organization multiple times', async () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          organizationMemberships: [
            {
              organization: { id: 'org_123', name: 'Test Org' },
            },
          ],
        },
        isLoaded: true,
      });

      mockUseOrganization.mockReturnValue({
        organization: null,
        memberships: null,
        invitations: null,
      });

      const { rerender } = renderHook(() => useBeneficiaries());

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledTimes(1);
      });

      rerender();
      rerender();

      expect(mockSetActive).toHaveBeenCalledTimes(1);
    });

    it('should handle setActive rejection gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSetActive.mockRejectedValue(new Error('Failed to set active'));

      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          organizationMemberships: [
            {
              organization: { id: 'org_123', name: 'Test Org' },
            },
          ],
        },
        isLoaded: true,
      });

      mockUseOrganization.mockReturnValue({
        organization: null,
        memberships: null,
        invitations: null,
      });

      renderHook(() => useBeneficiaries());

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalled();
      });

      // Should not throw
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Active members filtering', () => {
    it('should return active beneficiaries from memberships', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john.doe@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toMatchObject({
        id: 'user_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
      });
    });

    it('should filter out non-recipient roles', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'member_2',
              role: 'org:admin',
              publicUserData: {
                userId: 'user_2',
                firstName: 'Admin',
                lastName: 'User',
                identifier: 'admin@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'member_3',
              role: 'org:member',
              publicUserData: {
                userId: 'user_3',
                firstName: 'Member',
                lastName: 'User',
                identifier: 'member@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].firstName).toBe('John');
    });

    it('should handle role without prefix', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].firstName).toBe('John');
    });

    it('should handle uppercase roles', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'ORG:RECIPIENT',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
    });

    it('should handle missing publicUserData fields', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {},
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toMatchObject({
        id: 'member_1',
        firstName: '',
        lastName: '',
        email: '',
        phone: undefined,
      });
    });

    it('should use member id as fallback when userId is missing', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data[0].id).toBe('member_1');
    });
  });

  describe('Pending invitations filtering', () => {
    it('should return inactive beneficiaries from invitations', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: {
          data: [
            {
              id: 'invite_1',
              role: 'org:recipient',
              emailAddress: 'invited@example.com',
              publicMetadata: {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '+221771234567',
              },
              createdAt: '2024-01-02T00:00:00Z',
            },
          ],
        },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toMatchObject({
        id: 'invite_1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'invited@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.INACTIVE,
        progressPercent: 0,
      });
    });

    it('should filter out non-recipient invitations', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: {
          data: [
            {
              id: 'invite_1',
              role: 'org:recipient',
              emailAddress: 'recipient@example.com',
              publicMetadata: { firstName: 'Jane', lastName: 'Doe' },
              createdAt: '2024-01-02T00:00:00Z',
            },
            {
              id: 'invite_2',
              role: 'org:admin',
              emailAddress: 'admin@example.com',
              publicMetadata: { firstName: 'Admin', lastName: 'User' },
              createdAt: '2024-01-02T00:00:00Z',
            },
          ],
        },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].firstName).toBe('Jane');
    });

    it('should handle missing publicMetadata', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: {
          data: [
            {
              id: 'invite_1',
              role: 'org:recipient',
              emailAddress: 'invited@example.com',
              createdAt: '2024-01-02T00:00:00Z',
            },
          ],
        },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toMatchObject({
        firstName: '',
        lastName: '',
        email: 'invited@example.com',
        phone: undefined,
      });
    });
  });

  describe('Combined memberships and invitations', () => {
    it('should return both active and inactive beneficiaries', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: {
          data: [
            {
              id: 'invite_1',
              role: 'org:recipient',
              emailAddress: 'jane@example.com',
              publicMetadata: {
                firstName: 'Jane',
                lastName: 'Smith',
              },
              createdAt: '2024-01-02T00:00:00Z',
            },
          ],
        },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].status).toBe(BeneficiaryStatus.ACTIVE);
      expect(result.current.data[1].status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should maintain correct order (members first, then invitations)', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'Member',
                lastName: 'One',
                identifier: 'member1@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: {
          data: [
            {
              id: 'invite_1',
              role: 'org:recipient',
              emailAddress: 'invite1@example.com',
              publicMetadata: {
                firstName: 'Invite',
                lastName: 'One',
              },
              createdAt: '2024-01-02T00:00:00Z',
            },
          ],
        },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data[0].firstName).toBe('Member');
      expect(result.current.data[1].firstName).toBe('Invite');
    });
  });

  describe('Loading states', () => {
    it('should show loading when organization exists but memberships are loading', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: true,
          data: [],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(true);
    });

    it('should show loading when memberships is null', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: null,
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(true);
    });

    it('should stop loading when memberships finish loading', () => {
      const { result, rerender } = renderHook(() => useBeneficiaries());

      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      rerender();

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Date handling', () => {
    it('should convert valid date to ISO string', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T10:30:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data[0].createdAt).toBe('2024-01-01T10:30:00.000Z');
    });

    it('should handle invalid date gracefully', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: 'invalid-date',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      // Should fall back to current date
      expect(result.current.data[0].createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('should handle null date', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: null,
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data[0].createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty memberships and invitations', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    it('should handle null role', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: null,
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      // Should filter out null role
      expect(result.current.data).toHaveLength(0);
    });

    it('should handle whitespace in role', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: '  org:recipient  ',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);
    });

    it('should handle undefined role', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: undefined,
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(0);
    });

    it('should handle large number of beneficiaries', () => {
      const largeMemberships = Array.from({ length: 100 }, (_, i) => ({
        id: `member_${i}`,
        role: 'org:recipient',
        publicUserData: {
          userId: `user_${i}`,
          firstName: `First${i}`,
          lastName: `Last${i}`,
          identifier: `user${i}@example.com`,
        },
        createdAt: '2024-01-01T00:00:00Z',
      }));

      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: largeMemberships,
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(100);
    });
  });

  describe('Reactivity', () => {
    it('should update when organization changes', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result, rerender } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(1);

      // Change organization
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_456' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: { data: [] },
      });

      rerender();

      expect(result.current.data).toHaveLength(0);
    });

    it('should update when memberships data changes', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result, rerender } = renderHook(() => useBeneficiaries());

      expect(result.current.data).toHaveLength(0);

      // Add new member
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      rerender();

      expect(result.current.data).toHaveLength(1);
    });
  });

  describe('Type safety', () => {
    it('should return proper Beneficiary structure', () => {
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_123' },
        memberships: {
          isLoading: false,
          data: [
            {
              id: 'member_1',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_1',
                firstName: 'John',
                lastName: 'Doe',
                identifier: 'john@example.com',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        invitations: { data: [] },
      });

      mockUseUser.mockReturnValue({
        user: { id: 'admin_123', organizationMemberships: [] },
        isLoaded: true,
      });

      const { result } = renderHook(() => useBeneficiaries());

      const beneficiary = result.current.data[0];

      expect(beneficiary).toHaveProperty('id');
      expect(beneficiary).toHaveProperty('firstName');
      expect(beneficiary).toHaveProperty('lastName');
      expect(beneficiary).toHaveProperty('email');
      expect(beneficiary).toHaveProperty('phone');
      expect(beneficiary).toHaveProperty('status');
      expect(beneficiary).toHaveProperty('progressPercent');
      expect(beneficiary).toHaveProperty('createdAt');

      expect(typeof beneficiary.id).toBe('string');
      expect(typeof beneficiary.firstName).toBe('string');
      expect(typeof beneficiary.lastName).toBe('string');
      expect(typeof beneficiary.email).toBe('string');
      expect(typeof beneficiary.status).toBe('string');
      expect(typeof beneficiary.progressPercent).toBe('number');
      expect(typeof beneficiary.createdAt).toBe('string');
    });
  });
});
