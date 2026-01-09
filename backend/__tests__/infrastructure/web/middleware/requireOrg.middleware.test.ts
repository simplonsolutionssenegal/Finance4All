import type { NextFunction, Request, Response } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { requireSameActiveOrg } from '../../../../src/infrastructure/web/middleware/requireOrg.middleware';

// Mock @clerk/express
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getOrganizationMembershipList: jest.fn(),
    },
  },
  getAuth: jest.fn(),
}));

describe('requireSameActiveOrg middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
      query: {},
      params: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  describe('Authentication checks', () => {
    it('should return 401 when userId is not present', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: null, orgId: null });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthenticated',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when userId is undefined', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: undefined, orgId: undefined });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthenticated',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('OrganizationId validation', () => {
    beforeEach(() => {
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('should return 400 when organizationId is missing from all sources', async () => {
      // Arrange
      mockRequest.body = {};
      mockRequest.query = {};
      mockRequest.params = {};

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'organizationId manquant',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when organizationId is empty string in body', async () => {
      // Arrange
      mockRequest.body = { organizationId: '' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'organizationId manquant',
      });
    });

    it('should return 400 when organizationId is whitespace only', async () => {
      // Arrange
      mockRequest.body = { organizationId: '   ' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'organizationId manquant',
      });
    });

    it('should accept organizationId from body', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_456' });
      mockRequest.body = { organizationId: 'org_456' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should accept organizationId from query', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_456' });
      mockRequest.query = { organizationId: 'org_456' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should accept organizationId from params', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_456' });
      mockRequest.params = { organizationId: 'org_456' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should prioritize body over query and params', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_body' });
      mockRequest.body = { organizationId: 'org_body' };
      mockRequest.query = { organizationId: 'org_query' };
      mockRequest.params = { organizationId: 'org_params' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should trim whitespace from organizationId', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_456' });
      mockRequest.body = { organizationId: '  org_456  ' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Active organization match', () => {
    it('should proceed when orgId matches requestedOrgId', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_456' });
      mockRequest.body = { organizationId: 'org_456' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(clerkClient.users.getOrganizationMembershipList).not.toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should proceed when orgId matches after trimming whitespace', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_456' });
      mockRequest.body = { organizationId: '  org_456  ' };

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(clerkClient.users.getOrganizationMembershipList).not.toHaveBeenCalled();
    });
  });

  describe('Organization membership checks', () => {
    beforeEach(() => {
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('should check membership when orgId does not match', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: 'org_active' });
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [
        { organization: { id: 'org_requested' } },
        { organization: { id: 'org_other' } },
      ];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(clerkClient.users.getOrganizationMembershipList).toHaveBeenCalledWith({
        userId: 'user_123',
        limit: 200,
      });
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should check membership when orgId is null', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [{ organization: { id: 'org_requested' } }];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(clerkClient.users.getOrganizationMembershipList).toHaveBeenCalledWith({
        userId: 'user_123',
        limit: 200,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should proceed when user is member of requested organization', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [
        { organization: { id: 'org_other1' } },
        { organization: { id: 'org_requested' } },
        { organization: { id: 'org_other2' } },
      ];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not member of requested organization', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [
        { organization: { id: 'org_other1' } },
        { organization: { id: 'org_other2' } },
      ];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden (organization)',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when membership list is empty', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: [],
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden (organization)',
      });
    });

    it('should handle membership with organizationId property', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [
        { organizationId: 'org_requested' }, // Alternative format
      ];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle membership with nested organization object', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [{ organization: { id: 'org_requested' } }];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle mixed membership formats', async () => {
      // Arrange
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [
        { organization: { id: 'org_other1' } },
        { organizationId: 'org_requested' }, // Found in alternative format
        { organization: { id: 'org_other2' } },
      ];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: null });
      mockRequest.body = { organizationId: 'org_requested' };
    });

    it('should pass error to next when getAuth throws', async () => {
      // Arrange
      const error = new Error('Auth error');
      (getAuth as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass error to next when Clerk API fails', async () => {
      // Arrange
      const error = new Error('Clerk API error');
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockRejectedValue(error);

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass error to next when unexpected error occurs', async () => {
      // Arrange
      const error = new Error('Unexpected error');
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle numeric organizationId', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: '12345' });
      mockRequest.body = { organizationId: 12345 }; // Numeric value

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle membership with null organization', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: null });
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [{ organization: null }, { organization: { id: 'org_requested' } }];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle membership with undefined organization', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: null });
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [{ organizationId: undefined }, { organizationId: 'org_requested' }];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle membership with null organization.id', async () => {
      // Arrange
      (getAuth as jest.Mock).mockReturnValue({ userId: 'user_123', orgId: null });
      mockRequest.body = { organizationId: 'org_requested' };

      const mockMemberships = [
        { organization: { id: null } },
        { organization: { id: 'org_requested' } },
      ];
      (clerkClient.users.getOrganizationMembershipList as jest.Mock).mockResolvedValue({
        data: mockMemberships,
      });

      // Act
      await requireSameActiveOrg(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
