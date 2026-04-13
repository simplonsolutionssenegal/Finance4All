import { render, screen } from '@testing-library/react';

import MembersList from '@/components/organization/MembersList';
import type { OrgMember } from '@/hooks/organization/useOrgMembers';

// Mock useOrgMembers
jest.mock('@/hooks/organization/useOrgMembers', () => ({
  useOrgMembers: jest.fn(),
}));

// Mock useUserRoles
jest.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: jest.fn(() => ({ appRole: 'AdminOrg' })),
}));

// Mock @clerk/nextjs
jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(() => ({
    organization: { updateMember: jest.fn(), removeMember: jest.fn() },
  })),
}));

// Mock AddMemberModal
jest.mock('@/components/organization/AddMemberModal', () => {
  return function MockAddMemberModal() {
    return <div data-testid='add-member-modal' />;
  };
});

// Mock ConfirmDialog
jest.mock('@/components/dashboard/ConfirmDialog', () => ({
  ConfirmDialog: () => <div data-testid='confirm-dialog' />,
}));

const mockUseOrgMembers = require('@/hooks/organization/useOrgMembers').useOrgMembers as jest.Mock;

const baseMember: OrgMember = {
  id: 'mem-1',
  userId: 'user-1',
  firstName: 'Jean',
  lastName: 'Dupont',
  fullName: 'Jean Dupont',
  email: 'jean@example.com',
  role: 'org:admin',
  status: 'Actif',
  createdAt: new Date('2024-03-01'),
};

describe('MembersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when not loaded', () => {
    mockUseOrgMembers.mockReturnValue({
      members: [],
      isLoaded: false,
      reloadMembers: jest.fn(),
    });

    render(<MembersList />);

    expect(screen.getByText('Chargement des membres...')).toBeInTheDocument();
  });

  it('renders member rows with name, email, and role', () => {
    const members: OrgMember[] = [
      baseMember,
      {
        ...baseMember,
        id: 'mem-2',
        userId: 'user-2',
        firstName: 'Marie',
        lastName: 'Martin',
        fullName: 'Marie Martin',
        email: 'marie@example.com',
        role: 'org:member',
      },
    ];

    mockUseOrgMembers.mockReturnValue({
      members,
      isLoaded: true,
      reloadMembers: jest.fn(),
    });

    render(<MembersList />);

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin Organisation')).toBeInTheDocument();

    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.getByText('marie@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no members', () => {
    mockUseOrgMembers.mockReturnValue({
      members: [],
      isLoaded: true,
      reloadMembers: jest.fn(),
    });

    render(<MembersList />);

    expect(screen.getByText('Aucun membre dans cette organisation')).toBeInTheDocument();
  });

  it('shows add member button for admin users', () => {
    mockUseOrgMembers.mockReturnValue({
      members: [],
      isLoaded: true,
      reloadMembers: jest.fn(),
    });

    render(<MembersList />);

    expect(screen.getByText('Ajouter un membre')).toBeInTheDocument();
  });
});
