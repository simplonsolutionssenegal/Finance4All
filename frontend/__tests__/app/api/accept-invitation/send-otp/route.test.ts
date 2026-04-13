/**
 * @jest-environment node
 */

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

jest.mock('crypto', () => {
  const mockDigest = jest.fn().mockReturnValue('mocked-hash');
  const mockUpdate = jest.fn().mockReturnValue({ digest: mockDigest });
  const mockCreateHmac = jest.fn().mockReturnValue({ update: mockUpdate, digest: mockDigest });

  return {
    randomInt: jest.fn().mockReturnValue(123456),
    createHmac: mockCreateHmac,
  };
});

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { POST } from '@/app/api/accept-invitation/send-otp/route';

describe('/api/accept-invitation/send-otp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const request = { json: jest.fn().mockResolvedValue({}) } as any;

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ success: false, message: 'Email requis' });
  });

  it('returns success with token on valid request', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });

    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'user@example.com',
        firstName: 'John',
        organizationName: 'TestOrg',
      }),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
  });

  it('calls sendMail with correct email content', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });

    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'user@example.com',
        firstName: 'John',
        organizationName: 'TestOrg',
      }),
    } as any;

    await POST(request);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.to).toBe('user@example.com');
    expect(mailOptions.subject).toBe('Code de vérification — Finance4All');
    expect(mailOptions.html).toContain('John');
    expect(mailOptions.html).toContain('TestOrg');
    expect(mailOptions.text).toContain('123456');
  });

  it('returns 500 when sendMail throws', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP error'));

    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'user@example.com',
        firstName: 'John',
        organizationName: 'TestOrg',
      }),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      message: "Impossible d'envoyer le code de vérification",
    });
  });
});
