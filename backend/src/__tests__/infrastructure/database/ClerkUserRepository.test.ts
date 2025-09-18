// src/__tests__/ClerkUserRepository.test.ts
import { clerkClient } from '@clerk/express';
import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';
import { ClerkUserRepository } from '@/infrastructure/database/ClerkUserRepository';

jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

describe('ClerkUserRepository', () => {
  let repo: ClerkUserRepository;
  const mockUsers = [
    {
      id: 'u1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      publicMetadata: { organisation_id: 1, role: 'admin' },
      lastSignInAt: Date.now(),
      lastActiveAt: Date.now(),
    },
    {
      id: 'u2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      username: 'jane_smith',
      firstName: 'Jane',
      lastName: 'Smith',
      emailAddresses: [{ emailAddress: 'jane@example.com' }],
      publicMetadata: { organisation_id: 1, role: 'user' },
      lastSignInAt: null,
      lastActiveAt: null,
    },
  ];

  beforeEach(() => {
    repo = new ClerkUserRepository();
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({ data: mockUsers });
    (clerkClient.users.getUser as jest.Mock).mockImplementation((id: string) => {
      const user = mockUsers.find(u => u.id === id);
      return Promise.resolve(user ?? null);
    });
  });

  it('findByOrganisationId should return only users from that organisation', async () => {
    const users = await repo.findByOrganisationId(1);
    expect(users).toHaveLength(2);
    expect(users[0]).toBeInstanceOf(ClerkUser);
    expect(users[0].organisationId).toBe(1);
  });

  it('findAll should return all users', async () => {
    const users = await repo.findAll();
    expect(users).toHaveLength(2);
    expect(users[0]).toBeInstanceOf(ClerkUser);
  });

  it('findById should return a single user', async () => {
    const user = await repo.findById('u1');
    expect(user).toBeInstanceOf(ClerkUser);
    expect(user?.id).toBe('u1');

    const nullUser = await repo.findById('unknown');
    expect(nullUser).toBeNull();
  });

  it('findUsersByOrganisationAndStatus should filter by status', async () => {
    const users = await repo.findUsersByOrganisationAndStatus(1, ['ACTIF']);
    expect(users).toHaveLength(1);
    expect(users[0].status).toBe('ACTIF');
  });

  it('findUsersByOrganisationAndStatus should filter by role', async () => {
    const users = await repo.findUsersByOrganisationAndStatus(1, [], ['user']);
    expect(users).toHaveLength(1);
    expect(users[0].role).toBe('user');
  });

  it('findUsersByOrganisationAndStatus should filter by lastLogin recent', async () => {
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    mockUsers[0].lastSignInAt = recentDate.getTime();
    mockUsers[1].lastSignInAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime();

    const filter: LastLoginFilter = { type: 'recent' };
    const users = await repo.findUsersByOrganisationAndStatus(1, [], undefined, filter);
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe('u1');
  });

  it('findUsersByOrganisationAndStatus should filter by custom date', async () => {
    const customDate = new Date(Date.now());
    const filter: LastLoginFilter = { type: 'custom_date', date: customDate };
    const users = await repo.findUsersByOrganisationAndStatus(1, [], undefined, filter);
    expect(users).toBeDefined();
  });
});
