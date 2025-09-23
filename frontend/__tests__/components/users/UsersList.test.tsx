import { useOrganization, useUser, useOrganizationList } from '@clerk/nextjs';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UsersList from '@/components/users/UsersList';
import { useRemoveUserFromOrganization, useCreateUser } from '@/lib/clerk-utils';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(),
  useUser: jest.fn(),
  useOrganizationList: jest.fn(),
}));

// Mock clerk-utils
jest.mock('@/lib/clerk-utils', () => ({
  useRemoveUserFromOrganization: jest.fn(),
  useCreateUser: jest.fn(),
}));

// Mock child modals
jest.mock(
  '@/components/users/UserInfoModal',
  () =>
    ({ isOpen, onClose, onDeactivate, user }: any) =>
      isOpen ? (
        <div data-testid='user-info-modal' onClick={onClose}>
          UserInfo for {user.fullName}
          <button
            onClick={() => {
              onDeactivate();
            }}
          >
            Deactivate
          </button>
        </div>
      ) : null
);
jest.mock(
  '@/components/users/ConfirmDesactivationModal',
  () =>
    ({ isOpen, onClose, onConfirm }: any) =>
      isOpen ? (
        <div data-testid='confirm-deactivation-modal'>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      ) : null
);
jest.mock(
  '@/components/users/RoleEditModal',
  () =>
    ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div data-testid='role-edit-modal' onClick={onClose}>
          Role Edit Modal
        </div>
      ) : null
);
jest.mock(
  '@/components/users/AddUserModal',
  () =>
    ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div data-testid='add-user-modal' onClick={onClose}>
          Add User Modal
        </div>
      ) : null
);

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid='search-icon' />,
  Plus: () => <div data-testid='plus-icon' />,
  Trash2: () => <div data-testid='trash-icon' />,
  Edit: () => <div data-testid='edit-icon' />,
}));

// Mock window.alert
const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

// Setup mock return values
const mockUseUser = useUser as jest.Mock;
const mockUseOrganization = useOrganization as jest.Mock;
const mockUseOrganizationList = useOrganizationList as jest.Mock;
const mockUseRemoveUserFromOrganization = useRemoveUserFromOrganization as jest.Mock;
const mockUseCreateUser = useCreateUser as jest.Mock;

const mockMemberships = {
  data: [
    {
      id: 'mem_1',
      roleName: 'Admin',
      publicUserData: {
        userId: 'user_abc',
        firstName: 'Alice',
        lastName: 'Smith',
        identifier: 'alice@example.com',
      },
      createdAt: new Date(),
    },
    {
      id: 'mem_2',
      roleName: 'Member',
      publicUserData: {
        userId: 'user_def',
        firstName: 'Bob',
        lastName: 'Johnson',
        identifier: 'bob@example.com',
      },
      createdAt: new Date(),
    },
  ],
  isLoading: false,
};

const mockInvitations = {
  data: [
    {
      id: 'inv_1',
      roleName: 'Member',
      emailAddress: 'carol@example.com',
      publicMetadata: { firstName: 'Carol', lastName: 'White' },
      createdAt: new Date(),
    },
  ],
  isLoading: false,
};

describe('UsersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user_xyz', organizationMemberships: [{ organization: { id: 'org_123' } }] },
      isLoaded: true,
    });
    mockUseOrganizationList.mockReturnValue({ setActive: jest.fn(), isLoaded: true });
    mockUseRemoveUserFromOrganization.mockReturnValue({ removeUser: jest.fn(), isLoading: false });
    mockUseCreateUser.mockReturnValue({ createUser: jest.fn(), isCreating: false });
    alertMock.mockClear();
  });

  it('renders loading state initially', () => {
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: { isLoading: true },
    });
    render(<UsersList />);
    expect(screen.getByText(/Chargement des utilisateurs.../i)).toBeInTheDocument();
  });

  it('renders "no organization" message when not in an organization', async () => {
    mockUseOrganization.mockReturnValue({
      organization: null,
      isLoaded: true,
      memberships: { data: [], isLoading: false },
    });
    mockUseUser.mockReturnValue({
      user: { id: 'user_xyz', organizationMemberships: [] },
      isLoaded: true,
    });
    render(<UsersList />);
    await waitFor(() => {
      expect(screen.getByText(/Vous n'êtes membre d'aucune organisation./i)).toBeInTheDocument();
    });
  });

  it('renders "no users" message when there are no members or invitations', async () => {
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: { data: [], isLoading: false },
      invitations: { data: [], isLoading: false },
    });
    render(<UsersList />);
    await waitFor(() => {
      expect(screen.getByText(/Aucun utilisateur dans cette organisation/i)).toBeInTheDocument();
    });
  });

  it('renders the list of users and invitations correctly', () => {
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: mockMemberships,
      invitations: mockInvitations,
    });
    render(<UsersList />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('carol@example.com')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('filters users based on search term', async () => {
    const user = userEvent.setup();
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: mockMemberships,
      invitations: mockInvitations,
    });
    render(<UsersList />);

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Rechercher');
    await user.type(searchInput, 'Alice');

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('opens the Add User modal when "Ajouter un utilisateur" is clicked', async () => {
    const user = userEvent.setup();
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: mockMemberships,
      invitations: mockInvitations,
    });
    render(<UsersList />);

    const addButton = screen.getByText('Ajouter un utilisateur');
    await user.click(addButton);

    expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();
  });

  it('opens the Role Edit modal on click', async () => {
    const user = userEvent.setup();
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: mockMemberships,
      invitations: mockInvitations,
    });
    render(<UsersList />);

    await waitFor(() => expect(screen.getAllByTitle('Modifier le rôle').length).toBeGreaterThan(0));
    const editButtons = screen.getAllByTitle('Modifier le rôle');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('role-edit-modal')).toBeInTheDocument();
    });
  });

  it('opens user info modal on remove user click', async () => {
    const user = userEvent.setup();
    const removeUserMock = jest.fn().mockResolvedValue({ success: true });
    mockUseRemoveUserFromOrganization.mockReturnValue({
      removeUser: removeUserMock,
      isLoading: false,
    });
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
      memberships: mockMemberships,
      invitations: mockInvitations,
    });

    render(<UsersList />);

    await waitFor(() =>
      expect(screen.getAllByTitle("Retirer de l'organisation").length).toBeGreaterThan(0)
    );

    // 1. Click remove icon to open UserInfoModal
    const removeButtons = screen.getAllByTitle("Retirer de l'organisation");
    await user.click(removeButtons[0]);

    // 2. Assert UserInfoModal opens with correct user info
    const userInfoModal = await screen.findByTestId('user-info-modal');
    expect(userInfoModal).toBeInTheDocument();
    expect(screen.getByText('UserInfo for Alice Smith')).toBeInTheDocument();

    // 3. Verify the deactivate button is present in the modal
    expect(screen.getByText('Deactivate')).toBeInTheDocument();
  });
});
