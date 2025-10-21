import {
  displayDesignation,
  displayInstitutionName,
  displayLogoUrl,
  displayGeographicZones,
  displayType,
  mapTypeToLabel,
  mapStatusToLabel,
  displayMaxAmount,
  displayMinAmount,
} from '@/components/services-financiers/normalizeService';
import type { FinancialService, Institution } from '@/types/FinancialServices';

describe('normalizeService helpers', () => {
  const mockInstitution: Institution = {
    id: 'inst-1',
    name: 'Test Bank',
    description: 'Test description',
    website: 'https://test.com',
    geographicZones: ['Zone A'],
    logoUrl: 'https://test.com/logo.png',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockService: FinancialService = {
    id: 'svc-1',
    name: 'service-name',
    longName: 'Service Long Name',
    designation: 'Service Designation',
    type: 'EPARGNE',
    frais: {},
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institutionId: 'inst-1',
    institution: mockInstitution,
    status: 'ACTIVE',
    geographicZones: ['Zone A', 'Zone B'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    description: 'Test service',
    maxAmount: 100000,
    minAmount: 1000,
    interestRate: 5.5,
  };

  describe('displayDesignation', () => {
    it('should return name when available', () => {
      const result = displayDesignation(mockService);
      expect(result).toBe('service-name');
    });

    it('should return longName when name is not available', () => {
      const service = { ...mockService, name: '' };
      const result = displayDesignation(service);
      expect(result).toBe('Service Long Name');
    });

    it('should return designation when name and longName are not available', () => {
      const service = { ...mockService, name: '', longName: '' };
      const result = displayDesignation(service);
      expect(result).toBe('Service Designation');
    });

    it('should return empty string when all fields are empty', () => {
      const service = { ...mockService, name: '', longName: '', designation: '' };
      const result = displayDesignation(service);
      expect(result).toBe('');
    });
  });

  describe('displayInstitutionName', () => {
    it('should return empty string when institution is not set', () => {
      const service = { ...mockService, institution: '' as any };
      const result = displayInstitutionName(service);
      expect(result).toBe('');
    });

    it('should return institution string when institution is a string', () => {
      const service = { ...mockService, institution: 'String Bank' as any };
      const result = displayInstitutionName(service);
      expect(result).toBe('String Bank');
    });

    it('should return institution name when institution is an object', () => {
      const result = displayInstitutionName(mockService);
      expect(result).toBe('Test Bank');
    });

    it('should handle institution with institutionName field (legacy)', () => {
      const legacyInst = { ...mockInstitution, name: '', institutionName: 'Legacy Bank' } as any;
      const service = { ...mockService, institution: legacyInst };
      const result = displayInstitutionName(service);
      expect(result).toBe('Legacy Bank');
    });

    it('should return empty string for institution object without name', () => {
      const emptyInst = { ...mockInstitution, name: '' };
      const service = { ...mockService, institution: emptyInst };
      const result = displayInstitutionName(service);
      expect(result).toBe('');
    });
  });

  describe('displayLogoUrl', () => {
    it('should return undefined when institution is not set', () => {
      const service = { ...mockService, institution: '' as any };
      const result = displayLogoUrl(service);
      expect(result).toBeUndefined();
    });

    it('should return undefined when institution is a string', () => {
      const service = { ...mockService, institution: 'String Bank' as any };
      const result = displayLogoUrl(service);
      expect(result).toBeUndefined();
    });

    it('should return logoUrl when institution is an object with logoUrl', () => {
      const result = displayLogoUrl(mockService);
      expect(result).toBe('https://test.com/logo.png');
    });

    it('should return logo when logoUrl is not available (legacy)', () => {
      const legacyInst = { ...mockInstitution, logoUrl: undefined, logo: 'legacy-logo.png' } as any;
      const service = { ...mockService, institution: legacyInst };
      const result = displayLogoUrl(service);
      expect(result).toBe('legacy-logo.png');
    });

    it('should return undefined when institution has no logo fields', () => {
      const noLogoInst = { ...mockInstitution, logoUrl: undefined };
      const service = { ...mockService, institution: noLogoInst };
      const result = displayLogoUrl(service);
      expect(result).toBeUndefined();
    });
  });

  describe('displayGeographicZones', () => {
    it('should return geographic zones array', () => {
      const result = displayGeographicZones(mockService);
      expect(result).toEqual(['Zone A', 'Zone B']);
    });

    it('should return empty array when geographicZones is not set', () => {
      const service = { ...mockService, geographicZones: undefined as any };
      const result = displayGeographicZones(service);
      expect(result).toEqual([]);
    });

    it('should return empty array when geographicZones is empty', () => {
      const service = { ...mockService, geographicZones: [] };
      const result = displayGeographicZones(service);
      expect(result).toEqual([]);
    });
  });

  describe('displayType', () => {
    it('should return service type', () => {
      const result = displayType(mockService);
      expect(result).toBe('EPARGNE');
    });

    it('should return empty string when type is not set', () => {
      const service = { ...mockService, type: '' as any };
      const result = displayType(service);
      expect(result).toBe('');
    });
  });

  describe('mapTypeToLabel', () => {
    it('should map EPARGNE to Épargne', () => {
      expect(mapTypeToLabel('EPARGNE')).toBe('Épargne');
    });

    it('should map CREDIT to Crédit', () => {
      expect(mapTypeToLabel('CREDIT')).toBe('Crédit');
    });

    it('should map ASSURANCE to Assurance', () => {
      expect(mapTypeToLabel('ASSURANCE')).toBe('Assurance');
    });

    it('should map PAIEMENT_MARCHAND to Paiement marchand', () => {
      expect(mapTypeToLabel('PAIEMENT_MARCHAND')).toBe('Paiement marchand');
    });

    it('should map ACHAT_CREDIT to Achat de crédit', () => {
      expect(mapTypeToLabel('ACHAT_CREDIT')).toBe('Achat de crédit');
    });

    it('should map PAIEMENT_FACTURES to Paiement de factures', () => {
      expect(mapTypeToLabel('PAIEMENT_FACTURES')).toBe('Paiement de factures');
    });

    it('should map DEPOT_SIMPLE to Dépôt simple', () => {
      expect(mapTypeToLabel('DEPOT_SIMPLE')).toBe('Dépôt simple');
    });

    it('should map DEPOT_RETRAIT_SIMPLE to Dépôt / Retrait', () => {
      expect(mapTypeToLabel('DEPOT_RETRAIT_SIMPLE')).toBe('Dépôt / Retrait');
    });

    it('should map RETRAIT_SIMPLE to Retrait simple', () => {
      expect(mapTypeToLabel('RETRAIT_SIMPLE')).toBe('Retrait simple');
    });

    it("should map TRANSFERT_ARGENT to Transfert d'argent", () => {
      expect(mapTypeToLabel('TRANSFERT_ARGENT')).toBe("Transfert d'argent");
    });

    it('should map BANQUE_WALLET to Bank ↔ Wallet', () => {
      expect(mapTypeToLabel('BANQUE_WALLET')).toBe('Bank ↔ Wallet');
    });

    it('should map WALLET_BANQUE to Wallet ↔ Bank', () => {
      expect(mapTypeToLabel('WALLET_BANQUE')).toBe('Wallet ↔ Bank');
    });

    it('should map AUTRES to Autres', () => {
      expect(mapTypeToLabel('AUTRES')).toBe('Autres');
    });

    it('should return empty string for undefined', () => {
      expect(mapTypeToLabel(undefined)).toBe('');
    });

    it('should return the type as-is for unmapped types', () => {
      expect(mapTypeToLabel('UNKNOWN_TYPE' as any)).toBe('UNKNOWN_TYPE');
    });
  });

  describe('mapStatusToLabel', () => {
    it('should map ACTIVE to Actif', () => {
      expect(mapStatusToLabel('ACTIVE')).toBe('Actif');
    });

    it('should map INACTIVE to Inactif', () => {
      expect(mapStatusToLabel('INACTIVE')).toBe('Inactif');
    });

    it('should map PENDING to En attente', () => {
      expect(mapStatusToLabel('PENDING')).toBe('En attente');
    });

    it('should map legacy ACTIF to Actif', () => {
      expect(mapStatusToLabel('ACTIF' as any)).toBe('Actif');
    });

    it('should map legacy INACTIF to Inactif', () => {
      expect(mapStatusToLabel('INACTIF' as any)).toBe('Inactif');
    });

    it('should return empty string for undefined', () => {
      expect(mapStatusToLabel(undefined)).toBe('');
    });

    it('should return the status as-is for unmapped statuses', () => {
      expect(mapStatusToLabel('UNKNOWN' as any)).toBe('UNKNOWN');
    });
  });

  describe('displayMaxAmount', () => {
    it('should return maxAmount when set', () => {
      const result = displayMaxAmount(mockService);
      expect(result).toBe(100000);
    });

    it('should return 0 when maxAmount is undefined', () => {
      const service = { ...mockService, maxAmount: undefined };
      const result = displayMaxAmount(service);
      expect(result).toBe(0);
    });

    it('should return 0 when maxAmount is null', () => {
      const service = { ...mockService, maxAmount: null as any };
      const result = displayMaxAmount(service);
      expect(result).toBe(0);
    });

    it('should return maxAmount when set to 0', () => {
      const service = { ...mockService, maxAmount: 0 };
      const result = displayMaxAmount(service);
      expect(result).toBe(0);
    });
  });

  describe('displayMinAmount', () => {
    it('should return minAmount when set', () => {
      const result = displayMinAmount(mockService);
      expect(result).toBe(1000);
    });

    it('should return 0 when minAmount is undefined', () => {
      const service = { ...mockService, minAmount: undefined };
      const result = displayMinAmount(service);
      expect(result).toBe(0);
    });

    it('should return 0 when minAmount is null', () => {
      const service = { ...mockService, minAmount: null as any };
      const result = displayMinAmount(service);
      expect(result).toBe(0);
    });

    it('should return minAmount when set to 0', () => {
      const service = { ...mockService, minAmount: 0 };
      const result = displayMinAmount(service);
      expect(result).toBe(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle service with all undefined values', () => {
      const emptyService = {
        id: 'test',
        name: undefined,
        longName: undefined,
        designation: undefined,
        type: undefined,
        frais: undefined,
        conditionAccess: undefined,
        plafonds: undefined,
        infrastructureAccess: undefined,
        institutionId: 'test',
        institution: undefined,
        status: undefined,
        geographicZones: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        description: undefined,
        maxAmount: undefined,
        minAmount: undefined,
        interestRate: undefined,
      } as any;

      expect(displayDesignation(emptyService)).toBe('');
      expect(displayInstitutionName(emptyService)).toBe('');
      expect(displayLogoUrl(emptyService)).toBeUndefined();
      expect(displayGeographicZones(emptyService)).toEqual([]);
      expect(displayType(emptyService)).toBe('');
      expect(displayMaxAmount(emptyService)).toBe(0);
      expect(displayMinAmount(emptyService)).toBe(0);
    });

    it('should handle service with mixed data types', () => {
      const mixedService = {
        ...mockService,
        name: 123 as any,
        longName: true as any,
        designation: null as any,
        type: 456 as any,
        maxAmount: 'not-a-number' as any,
        minAmount: 'also-not-a-number' as any,
        interestRate: 'invalid' as any,
        geographicZones: 'not-an-array' as any,
      };

      expect(displayDesignation(mixedService)).toBe(123);
      expect(displayType(mixedService)).toBe(456);
      expect(displayMaxAmount(mixedService)).toBe(0);
      expect(displayMinAmount(mixedService)).toBe(0);
      expect(displayGeographicZones(mixedService)).toEqual([]);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const serviceWithLongString = {
        ...mockService,
        name: longString,
        longName: longString,
        designation: longString,
      };

      expect(displayDesignation(serviceWithLongString)).toBe(longString);
      expect(displayInstitutionName(serviceWithLongString)).toBe('Test Bank');
    });

    it('should handle special characters in strings', () => {
      const specialService = {
        ...mockService,
        name: 'Service with émojis 🚀 and spécial çhârâctérs',
        longName: 'Service with émojis 🚀 and spécial çhârâctérs',
        designation: 'Service with émojis 🚀 and spécial çhârâctérs',
      };

      expect(displayDesignation(specialService)).toBe(
        'Service with émojis 🚀 and spécial çhârâctérs'
      );
    });

    it('should handle empty strings vs undefined', () => {
      const serviceWithEmptyStrings = {
        ...mockService,
        name: '',
        longName: '',
        designation: '',
      };

      expect(displayDesignation(serviceWithEmptyStrings)).toBe('');
    });

    it('should handle institution as object with all undefined values', () => {
      const serviceWithEmptyInstitution = {
        ...mockService,
        institution: {
          id: undefined,
          name: undefined,
          logoUrl: undefined,
          status: undefined,
          website: undefined,
          description: undefined,
          geographicZones: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        } as any,
      };

      expect(displayInstitutionName(serviceWithEmptyInstitution)).toBe('');
      expect(displayLogoUrl(serviceWithEmptyInstitution)).toBeUndefined();
    });

    it('should handle institution with legacy fields', () => {
      const serviceWithLegacyInstitution = {
        ...mockService,
        institution: {
          ...mockInstitution,
          name: '',
          institutionName: 'Legacy Bank Name',
          logoUrl: undefined,
          logo: 'legacy-logo.png',
        },
      };

      expect(displayInstitutionName(serviceWithLegacyInstitution)).toBe('Legacy Bank Name');
      expect(displayLogoUrl(serviceWithLegacyInstitution)).toBe('legacy-logo.png');
    });

    it('should handle numeric values as strings', () => {
      const serviceWithStringNumbers = {
        ...mockService,
        maxAmount: '100000' as any,
        minAmount: '5000' as any,
        interestRate: '5.5' as any,
      };

      expect(displayMaxAmount(serviceWithStringNumbers)).toBe('100000');
      expect(displayMinAmount(serviceWithStringNumbers)).toBe('5000');
    });

    it('should handle boolean values', () => {
      const serviceWithBooleans = {
        ...mockService,
        maxAmount: true as any,
        minAmount: false as any,
        interestRate: true as any,
      };

      expect(displayMaxAmount(serviceWithBooleans)).toBe(true);
      expect(displayMinAmount(serviceWithBooleans)).toBe(false);
    });

    it('should handle array values for geographic zones', () => {
      const serviceWithArrayZones = {
        ...mockService,
        geographicZones: ['Zone A', 'Zone B', 'Zone C'],
      };

      expect(displayGeographicZones(serviceWithArrayZones)).toEqual(['Zone A', 'Zone B', 'Zone C']);
    });

    it('should handle empty array for geographic zones', () => {
      const serviceWithEmptyZones = {
        ...mockService,
        geographicZones: [],
      };

      expect(displayGeographicZones(serviceWithEmptyZones)).toEqual([]);
    });

    it('should handle null values for all optional fields', () => {
      const serviceWithNulls = {
        ...mockService,
        name: null,
        longName: null,
        designation: null,
        type: null,
        maxAmount: null,
        minAmount: null,
        interestRate: null,
        geographicZones: null,
        institution: null,
      } as any;

      expect(displayDesignation(serviceWithNulls)).toBe('');
      expect(displayInstitutionName(serviceWithNulls)).toBe('');
      expect(displayLogoUrl(serviceWithNulls)).toBeUndefined();
      expect(displayGeographicZones(serviceWithNulls)).toEqual([]);
      expect(displayType(serviceWithNulls)).toBe('');
      expect(displayMaxAmount(serviceWithNulls)).toBe(0);
      expect(displayMinAmount(serviceWithNulls)).toBe(0);
    });
  });
});
