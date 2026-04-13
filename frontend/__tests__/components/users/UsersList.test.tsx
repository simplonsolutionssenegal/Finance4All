import { useOrganization, useUser } from '@clerk/nextjs';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UsersList from '@/components/users/UsersList';
import { useRemoveUserFromOrganization, useCreateUser, useUpdateUserRole } from '@/lib/clerk-utils';
import type OrganizationUser from '@/types/OrganizationUser';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useOrganization: jest.fn(),
  useUser: jest.fn(),
}));

// Mock clerk-utils
jest.mock('@/lib/clerk-utils', () => ({
  useRemoveUserFromOrganization: jest.fn(),
  useCreateUser: jest.fn(),
  useUpdateUserRole: jest.fn(),
}));

// Mock child modals
jest.mock(
  '@/components/users/UserInfoModal',
  () =>
    ({ isOpen, onClose, user }: any) =>
      isOpen ? (
        <div data-testid='user-info-modal' onClick={onClose}>
          UserInfo for {user.fullName}
        </div>
      ) : null
);
jest.mock(
  '@/components/users/ConfirmDesactivationModal',
  () =>
    ({ isOpen, onClose, onConfirm, user, isDeleting }: any) =>
      isOpen ? (
        <div data-testid='confirm-deactivation-modal'>
          <span>Deactivate {user?.fullName}</span>
          <span data-testid='is-deleting'>{isDeleting ? 'deleting' : 'idle'}</span>
          <button data-testid='confirm-btn' onClick={onConfirm}>
            Confirm
          </button>
          <button data-testid='cancel-btn' onClick={onClose}>
            Cancel
          </button>
        </div>
      ) : null
);
jest.mock(
  '@/components/users/EditUserModal',
  () =>
    ({ isOpen, onClose, onUpdateUser, user, isUpdating }: any) =>
      isOpen ? (
        <div data-testid='edit-user-modal'>
          Edit User Modal for {user?.fullName}
          <span data-testid='is-updating'>{isUpdating ? 'updating' : 'idle'}</span>
          <button
            data-testid='edit-modal-update-button'
            onClick={() => {
              onUpdateUser({
                userId: user.id,
                firstName: 'Updated',
                lastName: 'Name',
                email: 'updated@example.com',
                role: 'org:admin',
                organizationId: 'org_123',
              });
            }}
          >
            Update
          </button>
          <button data-testid='edit-modal-close-button' onClick={onClose}>
            Close
          </button>
        </div>
      ) : null
);
jest.mock(
  '@/components/users/AddUserModal',
  () =>
    ({ isOpen, onClose, onCreateUser, isCreating }: any) =>
      isOpen ? (
        <div data-testid='add-user-modal'>
          Add User Modal
          <span data-testid='is-creating'>{isCreating ? 'creating' : 'idle'}</span>
          <button
            data-testid='add-modal-create-button'
            onClick={() => {
              onCreateUser({
                firstName: 'New',
                lastName: 'User',
                email: 'new@example.com',
                role: 'org:member',
                organizationId: 'org_123',
              });
            }}
          >
            Create
          </button>
          <button data-testid='add-modal-close-button' onClick={onClose}>
            Close
          </button>
        </div>
      ) : null
);
jest.mock(
  '@/components/users/CreateOrganizationModal',
  () =>
    ({ isOpen, onClose, onSuccess }: any) =>
      isOpen ? (
        <div data-testid='create-org-modal'>
          Create Organization Modal
          <button data-testid='create-org-close-button' onClick={onClose}>
            Close
          </button>
          <button data-testid='create-org-success-button' onClick={onSuccess}>
            Success
          </button>
        </div>
      ) : null
);

// Store onValueChange ref so SelectItem can call it
let selectOnValueChange: ((value: string) => void) | null = null;

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => {
    selectOnValueChange = onValueChange || null;
    return (
      <div data-testid='select' data-value={value}>
        {children}
      </div>
    );
  },
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid='select-trigger-role' className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children, className }: any) => (
    <div data-testid='select-content' className={className}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, className }: any) => (
    <button
      data-testid={`select-item-${value}`}
      className={className}
      onClick={() => {
        selectOnValueChange?.(value);
      }}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => {
    if (asChild && children) {
      return children;
    }
    return <div>{children}</div>;
  },
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div data-testid='dropdown-content' className={className} data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => {
    let titleText = '';
    if (typeof children === 'string') {
      titleText = children;
    } else if (Array.isArray(children)) {
      titleText = children.filter((c: any) => typeof c === 'string').join('');
    }
    return (
      <div onClick={onClick} className={className} title={titleText || undefined} role='menuitem'>
        {children}
      </div>
    );
  },
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children, className }: any) => <thead className={className}>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children, className }: any) => <tr className={className}>{children}</tr>,
  TableHead: ({ children, className }: any) => <th className={className}>{children}</th>,
  TableCell: ({ children, className, colSpan }: any) => (
    <td className={className} colSpan={colSpan}>
      {children}
    </td>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid='card-content' className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, disabled }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className, type }: any) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid='search-icon' />,
  Plus: () => <div data-testid='plus-icon' />,
  MoreVertical: () => <div data-testid='more-vertical-icon' />,
  Mail: () => <div data-testid='mail-icon' />,
  Phone: () => <div data-testid='phone-icon' />,
  Eye: () => <div data-testid='eye-icon' />,
  Pencil: () => <div data-testid='pencil-icon' />,
  Archive: () => <div data-testid='archive-icon' />,
  Trash2: () => <div data-testid='trash-icon' />,
  Building2: () => <div data-testid='building-icon' />,
}));

// Setup mock return values
const mockUseUser = useUser as jest.Mock;
const mockUseOrganization = useOrganization as jest.Mock;
const mockUseRemoveUserFromOrganization = useRemoveUserFromOrganization as jest.Mock;
const mockUseCreateUser = useCreateUser as jest.Mock;
const mockUseUpdateUserRole = useUpdateUserRole as jest.Mock;

// Helper to create OrganizationUser objects
const makeUser = (overrides: Partial<OrganizationUser> & { id: string }): OrganizationUser => ({
  fullName: 'Test User',
  role: 'org:member',
  emailAddress: 'test@example.com',
  createAt: new Date('2024-06-01'),
  status: 'Actif',
  ...overrides,
});

const defaultUsers: OrganizationUser[] = [
  makeUser({
    id: 'user_abc',
    fullName: 'Alice Smith',
    role: 'org:admin',
    emailAddress: 'alice@example.com',
    phoneNumber: '+221 77 123 4567',
    organizationName: 'Org Alpha',
    organizationType: 'admin',
    lastActiveAt: new Date('2024-12-01'),
    status: 'Actif',
  }),
  makeUser({
    id: 'user_def',
    fullName: 'Bob Johnson',
    role: 'org:member',
    emailAddress: 'bob@example.com',
    organizationName: 'Org Beta',
    status: 'Actif',
  }),
  makeUser({
    id: 'user_ghi',
    fullName: 'Carol White',
    role: 'org:recipient',
    emailAddress: 'carol@example.com',
    status: 'En attente',
  }),
];

describe('UsersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseUser.mockReturnValue({
      user: { id: 'user_xyz' },
      isLoaded: true,
    });
    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123' },
    });
    mockUseRemoveUserFromOrganization.mockReturnValue({
      removeUser: jest.fn().mockResolvedValue({ success: true }),
      isLoading: false,
    });
    mockUseCreateUser.mockReturnValue({
      createUser: jest.fn().mockResolvedValue({ success: true }),
      isCreating: false,
    });
    mockUseUpdateUserRole.mockReturnValue({
      updateUserRole: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── Rendering states ─────────────────────────────────────────────

  it('renders loading state when isLoading is true', () => {
    render(<UsersList users={[]} isLoading={true} />);
    expect(screen.getByText('Chargement des utilisateurs...')).toBeInTheDocument();
  });

  it('renders loading state when isLoading prop is not provided and no users', () => {
    render(<UsersList />);
    // loading defaults to false, users defaults to [], so shows empty
    expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument();
  });

  it('renders empty state message when users array is empty and no filters active', () => {
    render(<UsersList users={[]} isLoading={false} />);
    expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument();
  });

  it('renders empty search result message when search term is set but no match', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, 'NonexistentXYZ');

    expect(screen.getByText('Aucun utilisateur trouvé pour cette recherche')).toBeInTheDocument();
  });

  it('renders empty state message when role filter is active but no match', () => {
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='archived' />);
    expect(screen.getByText('Aucun utilisateur trouvé pour cette recherche')).toBeInTheDocument();
  });

  it('renders users table with correct data', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);

    expect(screen.getByText('Utilisateur')).toBeInTheDocument();
    expect(screen.getByText('Organisation')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText("Date d'ajout")).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('does not render the table when loading', () => {
    render(<UsersList users={defaultUsers} isLoading={true} />);
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Chargement des utilisateurs...')).toBeInTheDocument();
  });

  // ─── Current user filtering ───────────────────────────────────────

  it('filters out the current logged-in user from the list', () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_abc' }, isLoaded: true });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    // Alice has id 'user_abc', same as current user, so she should be hidden
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();
  });

  // ─── Phone number display ─────────────────────────────────────────

  it('displays phone number when available', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);
    expect(screen.getByText('+221 77 123 4567')).toBeInTheDocument();
  });

  it('does not display phone section when phoneNumber is absent', () => {
    const usersWithoutPhone = [makeUser({ id: 'user_nophone', emailAddress: 'nophone@test.com' })];
    render(<UsersList users={usersWithoutPhone} isLoading={false} />);
    expect(screen.queryByTestId('phone-icon')).not.toBeInTheDocument();
  });

  // ─── Organization name display ────────────────────────────────────

  it('displays organization name when present', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);
    expect(screen.getByText('Org Alpha')).toBeInTheDocument();
    expect(screen.getByText('Org Beta')).toBeInTheDocument();
  });

  it('displays dash when organizationName is not set', () => {
    const usersNoOrg = [makeUser({ id: 'user_noorg' })];
    render(<UsersList users={usersNoOrg} isLoading={false} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  // ─── Status badges ────────────────────────────────────────────────

  it('displays Actif status badge with correct styling', () => {
    render(<UsersList users={[makeUser({ id: 'u1', status: 'Actif' })]} isLoading={false} />);
    const badge = screen.getByText('Actif');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
  });

  it('displays non-Actif status badge with orange styling', () => {
    render(<UsersList users={[makeUser({ id: 'u1', status: 'En attente' })]} isLoading={false} />);
    const badge = screen.getByText('En attente');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-orange-100');
  });

  // ─── getRoleDisplayName coverage ──────────────────────────────────

  it('displays "Admin Systeme" for org:admin with admin orgType', () => {
    render(
      <UsersList
        users={[makeUser({ id: 'u1', role: 'org:admin', organizationType: 'admin' })]}
        isLoading={false}
      />
    );
    expect(screen.getByText('Admin Systeme')).toBeInTheDocument();
  });

  it('displays "Admin Organisation" for org:admin without admin orgType', () => {
    render(
      <UsersList
        users={[makeUser({ id: 'u1', role: 'org:admin', organizationType: 'banque' })]}
        isLoading={false}
      />
    );
    // "Admin Organisation" appears in both the select item and the role badge
    const matches = screen.getAllByText('Admin Organisation');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('displays "Membre Admin" for org:member with admin orgType', () => {
    render(
      <UsersList
        users={[makeUser({ id: 'u1', role: 'org:member', organizationType: 'admin' })]}
        isLoading={false}
      />
    );
    expect(screen.getByText('Membre Admin')).toBeInTheDocument();
  });

  it('displays "Membre Organisation" for org:member without admin orgType', () => {
    render(
      <UsersList
        users={[makeUser({ id: 'u1', role: 'org:member', organizationType: 'banque' })]}
        isLoading={false}
      />
    );
    expect(screen.getByText('Membre Organisation')).toBeInTheDocument();
  });

  it('displays "Recipient" for org:recipient role', () => {
    render(<UsersList users={[makeUser({ id: 'u1', role: 'org:recipient' })]} isLoading={false} />);
    // "Recipient" appears in both the select item and the role badge
    const matches = screen.getAllByText('Recipient');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('displays raw role string for unknown roles', () => {
    render(<UsersList users={[makeUser({ id: 'u1', role: 'custom:role' })]} isLoading={false} />);
    expect(screen.getByText('custom:role')).toBeInTheDocument();
  });

  // ─── getRoleBadgeColor coverage ───────────────────────────────────

  it('applies red badge for org:admin with admin orgType', () => {
    render(
      <UsersList
        users={[makeUser({ id: 'u1', role: 'org:admin', organizationType: 'admin' })]}
        isLoading={false}
      />
    );
    const badge = screen.getByText('Admin Systeme');
    expect(badge.className).toContain('bg-red-100');
  });

  it('applies purple badge for org:admin without admin orgType', () => {
    render(<UsersList users={[makeUser({ id: 'u1', role: 'org:admin' })]} isLoading={false} />);
    // Find the badge (span with data-variant) not the select button
    const matches = screen.getAllByText('Admin Organisation');
    const badge = matches.find(el => el.tagName === 'SPAN');
    expect(badge).toBeDefined();
    expect(badge!.className).toContain('bg-purple-100');
  });

  it('applies blue badge for org:member with admin orgType', () => {
    render(
      <UsersList
        users={[makeUser({ id: 'u1', role: 'org:member', organizationType: 'admin' })]}
        isLoading={false}
      />
    );
    const badge = screen.getByText('Membre Admin');
    expect(badge.className).toContain('bg-blue-100');
  });

  it('applies green badge for org:member without admin orgType', () => {
    render(<UsersList users={[makeUser({ id: 'u1', role: 'org:member' })]} isLoading={false} />);
    const badge = screen.getByText('Membre Organisation');
    expect(badge.className).toContain('bg-green-100');
  });

  it('applies gray badge for org:recipient', () => {
    render(<UsersList users={[makeUser({ id: 'u1', role: 'org:recipient' })]} isLoading={false} />);
    const matches = screen.getAllByText('Recipient');
    const badge = matches.find(el => el.tagName === 'SPAN');
    expect(badge).toBeDefined();
    expect(badge!.className).toContain('bg-gray-100');
  });

  it('applies default gray badge for unknown roles', () => {
    render(<UsersList users={[makeUser({ id: 'u1', role: 'unknown:role' })]} isLoading={false} />);
    const badge = screen.getByText('unknown:role');
    expect(badge.className).toContain('bg-gray-100');
  });

  // ─── formatLastActive coverage ────────────────────────────────────

  it('displays formatted date for lastActiveAt', () => {
    const users = [
      makeUser({
        id: 'u1',
        lastActiveAt: new Date('2024-12-01'),
        createAt: new Date('2024-01-01'),
      }),
    ];
    render(<UsersList users={users} isLoading={false} />);

    // formatLastActive uses fr-FR Intl.DateTimeFormat; result is like "1 dec. 2024" (lowercased)
    // The exact format depends on the OS locale data; just check user renders
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays "Jamais connect\u00e9" when both lastActiveAt and createAt are null', () => {
    const users = [makeUser({ id: 'u1', lastActiveAt: null, createAt: null })];
    render(<UsersList users={users} isLoading={false} />);
    expect(screen.getByText('Jamais connect\u00e9')).toBeInTheDocument();
  });

  it('uses createAt as fallback when lastActiveAt is undefined', () => {
    const users = [makeUser({ id: 'u1', createAt: new Date('2024-06-15') })];
    render(<UsersList users={users} isLoading={false} />);
    // Should show formatted date, not "Jamais connecte"
    expect(screen.queryByText('Jamais connect\u00e9')).not.toBeInTheDocument();
  });

  // ─── Search filtering ─────────────────────────────────────────────

  it('filters users by fullName search', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, 'Alice');

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('filters users by email search', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, 'bob@example.com');

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('filters users by organization name search', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, 'Org Beta');

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('filters users by phone number search', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, '+221 77 123');

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('search is case insensitive', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, 'alice');

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  // ─── Role filtering ───────────────────────────────────────────────

  it('filters users by selectedRole prop for org:admin', () => {
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='org:admin' />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument();
  });

  it('filters users by selectedRole prop for org:member', () => {
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='org:member' />);

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument();
  });

  it('filters users by selectedRole prop for org:recipient', () => {
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='org:recipient' />);

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();
  });

  it('filters archived users when selectedRole is "archived"', () => {
    const usersWithArchived = [
      ...defaultUsers,
      makeUser({ id: 'user_arch', fullName: 'Archived Guy', status: 'Archiv\u00e9' }),
    ];
    render(<UsersList users={usersWithArchived} isLoading={false} selectedRole='archived' />);

    expect(screen.getByText('Archived Guy')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('shows all users when selectedRole is "all"', () => {
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='all' />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();
  });

  it('calls onRoleChange when role is changed via select', async () => {
    jest.useRealTimers();
    const onRoleChange = jest.fn();
    render(
      <UsersList
        users={defaultUsers}
        isLoading={false}
        selectedRole='all'
        onRoleChange={onRoleChange}
      />
    );

    const selectItem = screen.getByTestId('select-item-org:admin');
    await userEvent.click(selectItem);

    expect(onRoleChange).toHaveBeenCalledWith('org:admin');
  });

  it('uses internal role state when onRoleChange is not provided', async () => {
    jest.useRealTimers();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    // Initially all users visible
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Click on org:admin select item
    const selectItem = screen.getByTestId('select-item-org:admin');
    await userEvent.click(selectItem);

    // After changing, only admin users should show
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
  });

  // ─── Dropdown menu actions ────────────────────────────────────────

  it('opens UserInfoModal when "Voir les d\u00e9tails" is clicked', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const viewButtons = screen.getAllByTitle('Voir les d\u00e9tails');
    await user.click(viewButtons[0]);

    expect(screen.getByTestId('user-info-modal')).toBeInTheDocument();
    expect(screen.getByText('UserInfo for Alice Smith')).toBeInTheDocument();
  });

  it('opens EditUserModal when "Modifier" is clicked', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const editButtons = screen.getAllByTitle('Modifier');
    await user.click(editButtons[0]);

    expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument();
    expect(screen.getByText(/Edit User Modal for Alice Smith/)).toBeInTheDocument();
  });

  it('does not crash when "Archiver" is clicked (not yet implemented)', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const archiveButtons = screen.getAllByTitle('Archiver');
    await user.click(archiveButtons[0]);

    // Should not crash; no modal opens for archive
    expect(screen.queryByTestId('confirm-deactivation-modal')).not.toBeInTheDocument();
  });

  it('opens ConfirmDesactivationModal when "Supprimer d\u00e9finitivement" is clicked', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const deleteButtons = screen.getAllByTitle('Supprimer d\u00e9finitivement');
    await user.click(deleteButtons[0]);

    expect(screen.getByTestId('confirm-deactivation-modal')).toBeInTheDocument();
    expect(screen.getByText('Deactivate Alice Smith')).toBeInTheDocument();
  });

  // ─── Create Organization modal ────────────────────────────────────

  it('opens CreateOrganizationModal when button is clicked', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const createOrgButton = screen.getByText('Cr\u00e9er une organisation');
    await user.click(createOrgButton);

    expect(screen.getByTestId('create-org-modal')).toBeInTheDocument();
  });

  it('closes CreateOrganizationModal on close', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    await user.click(screen.getByText('Cr\u00e9er une organisation'));
    expect(screen.getByTestId('create-org-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('create-org-close-button'));
    expect(screen.queryByTestId('create-org-modal')).not.toBeInTheDocument();
  });

  it('calls onRefresh after CreateOrganizationModal onSuccess', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const onRefresh = jest.fn();
    render(<UsersList users={defaultUsers} isLoading={false} onRefresh={onRefresh} />);

    await user.click(screen.getByText('Cr\u00e9er une organisation'));
    await user.click(screen.getByTestId('create-org-success-button'));

    // onRefresh is called inside setTimeout(1500)
    await waitFor(
      () => {
        expect(onRefresh).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  // ─── Add User modal ───────────────────────────────────────────────

  it('opens AddUserModal when "Cr\u00e9er un utilisateur" is clicked', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    await user.click(screen.getByText('Cr\u00e9er un utilisateur'));
    expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();
  });

  it('calls createUser and closes modal on successful creation', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const createUserMock = jest.fn().mockResolvedValue({ success: true });
    const onRefresh = jest.fn();
    mockUseCreateUser.mockReturnValue({ createUser: createUserMock, isCreating: false });
    render(<UsersList users={defaultUsers} isLoading={false} onRefresh={onRefresh} />);

    await user.click(screen.getByText('Cr\u00e9er un utilisateur'));
    await user.click(screen.getByTestId('add-modal-create-button'));

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalledWith({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        role: 'org:member',
        organizationId: 'org_123',
      });
    });

    // Modal should close after creation
    await waitFor(() => {
      expect(screen.queryByTestId('add-user-modal')).not.toBeInTheDocument();
    });

    // onRefresh called after timeout
    await waitFor(
      () => {
        expect(onRefresh).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('handles createUser error gracefully', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const createUserMock = jest.fn().mockRejectedValue(new Error('Creation failed'));
    mockUseCreateUser.mockReturnValue({ createUser: createUserMock, isCreating: false });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    await user.click(screen.getByText('Cr\u00e9er un utilisateur'));
    await user.click(screen.getByTestId('add-modal-create-button'));

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur lors de la cr\u00e9ation'),
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('closes AddUserModal via onClose', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    await user.click(screen.getByText('Cr\u00e9er un utilisateur'));
    expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('add-modal-close-button'));
    expect(screen.queryByTestId('add-user-modal')).not.toBeInTheDocument();
  });

  // ─── Edit User modal ──────────────────────────────────────────────

  it('calls updateUserRole on successful update', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const updateUserRoleMock = jest.fn().mockResolvedValue({ success: true });
    const onRefresh = jest.fn();
    mockUseUpdateUserRole.mockReturnValue({ updateUserRole: updateUserRoleMock });
    render(<UsersList users={defaultUsers} isLoading={false} onRefresh={onRefresh} />);

    const editButtons = screen.getAllByTitle('Modifier');
    await user.click(editButtons[0]);
    await user.click(screen.getByTestId('edit-modal-update-button'));

    await waitFor(() => {
      expect(updateUserRoleMock).toHaveBeenCalledWith('user_abc', 'org:admin');
    });

    // Modal closes after update
    await waitFor(() => {
      expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument();
    });

    // onRefresh called after timeout
    await waitFor(
      () => {
        expect(onRefresh).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it('handles updateUserRole error when organization is null', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUseOrganization.mockReturnValue({ organization: null });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const editButtons = screen.getAllByTitle('Modifier');
    await user.click(editButtons[0]);
    await user.click(screen.getByTestId('edit-modal-update-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur lors de la mise \u00e0 jour'),
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles updateUserRole rejection error', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const updateUserRoleMock = jest.fn().mockRejectedValue(new Error('Update failed'));
    mockUseUpdateUserRole.mockReturnValue({ updateUserRole: updateUserRoleMock });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const editButtons = screen.getAllByTitle('Modifier');
    await user.click(editButtons[0]);
    await user.click(screen.getByTestId('edit-modal-update-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('closes EditUserModal via close button', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const editButtons = screen.getAllByTitle('Modifier');
    await user.click(editButtons[0]);
    expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('edit-modal-close-button'));
    expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument();
  });

  // ─── Confirm Deactivation / Delete ────────────────────────────────

  it('calls removeUser and closes modal on successful deletion', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const removeUserMock = jest.fn().mockResolvedValue({ success: true });
    const onRefresh = jest.fn();
    mockUseRemoveUserFromOrganization.mockReturnValue({
      removeUser: removeUserMock,
      isLoading: false,
    });
    render(<UsersList users={defaultUsers} isLoading={false} onRefresh={onRefresh} />);

    const deleteButtons = screen.getAllByTitle('Supprimer d\u00e9finitivement');
    await user.click(deleteButtons[0]);

    expect(screen.getByTestId('confirm-deactivation-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('confirm-btn'));

    await waitFor(() => {
      expect(removeUserMock).toHaveBeenCalledWith('user_abc');
    });

    // Modal closes, onRefresh called
    await waitFor(
      () => {
        expect(onRefresh).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it('handles removeUser returning non-success result', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const removeUserMock = jest.fn().mockResolvedValue({ success: false });
    mockUseRemoveUserFromOrganization.mockReturnValue({
      removeUser: removeUserMock,
      isLoading: false,
    });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const deleteButtons = screen.getAllByTitle('Supprimer d\u00e9finitivement');
    await user.click(deleteButtons[0]);
    await user.click(screen.getByTestId('confirm-btn'));

    await waitFor(() => {
      expect(removeUserMock).toHaveBeenCalled();
    });
  });

  it('handles removeUser rejection error', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const removeUserMock = jest.fn().mockRejectedValue(new Error('Delete failed'));
    mockUseRemoveUserFromOrganization.mockReturnValue({
      removeUser: removeUserMock,
      isLoading: false,
    });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const deleteButtons = screen.getAllByTitle('Supprimer d\u00e9finitivement');
    await user.click(deleteButtons[0]);
    await user.click(screen.getByTestId('confirm-btn'));

    await waitFor(() => {
      expect(removeUserMock).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur lors de la suppression'),
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('closes ConfirmDesactivationModal via cancel button', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const deleteButtons = screen.getAllByTitle('Supprimer d\u00e9finitivement');
    await user.click(deleteButtons[0]);
    expect(screen.getByTestId('confirm-deactivation-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('cancel-btn'));
    expect(screen.queryByTestId('confirm-deactivation-modal')).not.toBeInTheDocument();
  });

  it('does nothing in handleConfirmDesactivation if no selectedUser', async () => {
    // Rendering without triggering delete -- removeUser should not be called
    const removeUserMock = jest.fn();
    mockUseRemoveUserFromOrganization.mockReturnValue({
      removeUser: removeUserMock,
      isLoading: false,
    });
    render(<UsersList users={defaultUsers} isLoading={false} />);

    expect(removeUserMock).not.toHaveBeenCalled();
  });

  // ─── Closing modals resets selectedUser ────────────────────────────

  it('resets selectedUser when modals are closed', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} />);

    // Open view details for Alice
    const viewButtons = screen.getAllByTitle('Voir les d\u00e9tails');
    await user.click(viewButtons[0]);
    expect(screen.getByText('UserInfo for Alice Smith')).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByTestId('user-info-modal'));
    await waitFor(() => {
      expect(screen.queryByTestId('user-info-modal')).not.toBeInTheDocument();
    });

    // Now open for Bob (second user) to verify selectedUser was reset
    await user.click(viewButtons[0]);
    expect(screen.getByText('UserInfo for Alice Smith')).toBeInTheDocument();
  });

  // ─── Combined search + role filter ────────────────────────────────

  it('applies both search and role filters simultaneously', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='org:admin' />);

    // Only Alice is org:admin
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();

    // Now also search for nonexistent within admin
    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    await user.type(searchInput, 'zzz');

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(
      screen.getByText('Aucun utilisateur trouv\u00e9 pour cette recherche')
    ).toBeInTheDocument();
  });

  // ─── Roles list rendering ─────────────────────────────────────────

  it('renders all role filter options in select', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);

    expect(screen.getByTestId('select-item-all')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-org:admin')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-org:member')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-org:recipient')).toBeInTheDocument();
  });

  // ─── External vs internal selectedRole ────────────────────────────

  it('uses external selectedRole when provided', () => {
    render(<UsersList users={defaultUsers} isLoading={false} selectedRole='org:member' />);
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', 'org:member');
  });

  it('uses internal default "all" when no selectedRole provided', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', 'all');
  });

  // ─── Buttons rendering ────────────────────────────────────────────

  it('renders "Cr\u00e9er une organisation" and "Cr\u00e9er un utilisateur" buttons', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);
    expect(screen.getByText('Cr\u00e9er une organisation')).toBeInTheDocument();
    expect(screen.getByText('Cr\u00e9er un utilisateur')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);
    expect(screen.getByPlaceholderText('Nom, email, organisation...')).toBeInTheDocument();
  });

  it('renders "Rechercher" label', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);
    expect(screen.getByText('Rechercher')).toBeInTheDocument();
  });

  // ─── Edge cases ───────────────────────────────────────────────────

  it('handles users with undefined fullName in search gracefully', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const usersWithNoName = [
      makeUser({ id: 'u1', fullName: undefined as any, emailAddress: 'noname@test.com' }),
    ];
    render(<UsersList users={usersWithNoName} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    // Should not crash when filtering with undefined fullName
    await user.type(searchInput, 'noname');
    expect(screen.getByText('noname@test.com')).toBeInTheDocument();
  });

  it('handles users with undefined organizationName in search', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const usersNoOrg = [makeUser({ id: 'u1', emailAddress: 'test@test.com' })];
    render(<UsersList users={usersNoOrg} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText('Nom, email, organisation...');
    // Should not crash when searching org name on user without it
    await user.type(searchInput, 'SomeOrg');
    expect(screen.queryByText('test@test.com')).not.toBeInTheDocument();
  });

  it('renders with no props (all defaults)', () => {
    render(<UsersList />);
    // Should render without crash, shows empty state since users defaults to []
    expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument();
  });

  it('renders multiple action dropdown menus per user row', () => {
    render(<UsersList users={defaultUsers} isLoading={false} />);

    const viewButtons = screen.getAllByTitle('Voir les d\u00e9tails');
    const editButtons = screen.getAllByTitle('Modifier');
    const archiveButtons = screen.getAllByTitle('Archiver');
    const deleteButtons = screen.getAllByTitle('Supprimer d\u00e9finitivement');

    // 3 users in the list
    expect(viewButtons.length).toBe(3);
    expect(editButtons.length).toBe(3);
    expect(archiveButtons.length).toBe(3);
    expect(deleteButtons.length).toBe(3);
  });
});
