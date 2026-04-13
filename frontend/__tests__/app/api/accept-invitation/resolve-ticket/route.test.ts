/**
 * @jest-environment node
 */

const mockGetOrganizationInvitationList = jest.fn();

jest.mock('@clerk/nextjs/server', () => ({
  createClerkClient: jest.fn(() => ({
    organizations: {
      getOrganizationInvitationList: mockGetOrganizationInvitationList,
    },
  })),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { POST } from '@/app/api/accept-invitation/resolve-ticket/route';

describe('/api/accept-invitation/resolve-ticket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when ticket or orgId is missing', async () => {
    const requestNoTicket = { json: jest.fn().mockResolvedValue({ orgId: 'org_123' }) } as any;
    const response1 = await POST(requestNoTicket);
    expect(response1.status).toBe(400);
    const body1 = await response1.json();
    expect(body1).toEqual({
      success: false,
      message: 'Paramètres manquants (ticket, orgId)',
    });

    const requestNoOrgId = { json: jest.fn().mockResolvedValue({ ticket: 'tk_abc' }) } as any;
    const response2 = await POST(requestNoOrgId);
    expect(response2.status).toBe(400);
    const body2 = await response2.json();
    expect(body2).toEqual({
      success: false,
      message: 'Paramètres manquants (ticket, orgId)',
    });
  });

  it('returns 404 when no pending invitations', async () => {
    mockGetOrganizationInvitationList.mockResolvedValue({ data: [] });

    const request = {
      json: jest.fn().mockResolvedValue({ ticket: 'tk_abc', orgId: 'org_123' }),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      message: 'Aucune invitation en attente trouvée',
    });
  });

  it('returns latest invitation ID on success', async () => {
    mockGetOrganizationInvitationList.mockResolvedValue({
      data: [
        { id: 'inv_old', createdAt: '2026-01-01T00:00:00Z' },
        { id: 'inv_latest', createdAt: '2026-04-10T00:00:00Z' },
        { id: 'inv_mid', createdAt: '2026-03-01T00:00:00Z' },
      ],
    });

    const request = {
      json: jest.fn().mockResolvedValue({ ticket: 'tk_abc', orgId: 'org_123' }),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      invitationId: 'inv_latest',
      orgId: 'org_123',
    });
  });

  it('returns 500 on error', async () => {
    mockGetOrganizationInvitationList.mockRejectedValue(new Error('Clerk API error'));

    const request = {
      json: jest.fn().mockResolvedValue({ ticket: 'tk_abc', orgId: 'org_123' }),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Clerk API error');
  });
});
