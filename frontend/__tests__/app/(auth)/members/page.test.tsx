import { render, screen } from '@testing-library/react';

import MembersPage from '@/app/(auth)/members/page';

// Mock useOrgMembers
jest.mock('@/hooks/organization/useOrgMembers', () => ({
  useOrgMembers: jest.fn(() => ({
    organizationName: 'Finance4All Org',
    totalCount: 10,
    membersByRole: {
      'org:admin': 2,
      'org:member': 5,
    },
    pendingCount: 3,
    members: [],
    isLoaded: true,
    reloadMembers: jest.fn(),
  })),
}));

// Mock MembersList
jest.mock('@/components/organization/MembersList', () => {
  return function MockMembersList() {
    return <div data-testid='members-list' />;
  };
});

// Mock UI card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid='card' {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}));

describe('MembersPage', () => {
  it('renders page title "Membres"', () => {
    render(<MembersPage />);

    expect(screen.getByRole('heading', { name: 'Membres' })).toBeInTheDocument();
  });

  it('renders stats cards with correct values', () => {
    render(<MembersPage />);

    expect(screen.getByText('Total membres')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Admins')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    expect(screen.getByText('Membres', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders MembersList component', () => {
    render(<MembersPage />);

    expect(screen.getByTestId('members-list')).toBeInTheDocument();
  });

  it('displays organization name in description', () => {
    render(<MembersPage />);

    expect(screen.getByText('Gestion des membres de Finance4All Org')).toBeInTheDocument();
  });
});
