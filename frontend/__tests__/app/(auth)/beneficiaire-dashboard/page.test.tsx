/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';

import BeneficiaireDashboardPage from '@/app/(auth)/beneficiaire-dashboard/page';
import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

// getAuthStatus utilise auth() en interne - on mock auth pour contrôler le comportement
const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('@/components/beneficiaire/BeneficiaireDashboard', () => {
  return jest.fn(() => (
    <div data-testid='beneficiaire-dashboard'>Beneficiaire Dashboard Component</div>
  ));
});

describe('BeneficiaireDashboardPage (Server Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication checks', () => {
    it('should redirect to login when userId is null', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');

      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should redirect to login when userId is undefined', async () => {
      mockAuth.mockResolvedValue({ userId: undefined });

      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');

      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });
  });

  describe('Authenticated user', () => {
    it('should render BeneficiaireDashboard when userId is present', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123456' });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(redirect).not.toHaveBeenCalled();
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user_123456' })
      );
    });

    it('should pass userId to BeneficiaireDashboard component', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_clerk_789' });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user_clerk_789' })
      );
    });

    it('should handle different userId formats', async () => {
      mockAuth.mockResolvedValue({
        userId: 'clerk_user_with_special_chars_123-456',
      });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'clerk_user_with_special_chars_123-456' })
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle user with additional auth data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user_123' })
      );
    });

    it('should handle very long userId strings', async () => {
      const longUserId = `user_${'a'.repeat(100)}`;
      mockAuth.mockResolvedValue({ userId: longUserId });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: longUserId })
      );
    });

    it('should handle special characters in userId', async () => {
      const specialUserId = 'user_123-456_789';
      mockAuth.mockResolvedValue({ userId: specialUserId });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: specialUserId })
      );
    });
  });

  describe('Security', () => {
    it('should redirect unauthenticated users', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should only pass userId from auth to dashboard', async () => {
      mockAuth.mockResolvedValue({ userId: 'valid_user_123' });

      const result = await BeneficiaireDashboardPage();
      render(result);

      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'valid_user_123' })
      );
    });
  });
});
