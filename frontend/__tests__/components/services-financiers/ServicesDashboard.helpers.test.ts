import { mapInstitutionsToServices } from '@/components/services-financiers/ServicesDashboard.helpers';

describe('ServicesDashboard.helpers', () => {
  describe('mapInstitutionsToServices', () => {
    it('should return empty array when institutions is null', () => {
      const result = mapInstitutionsToServices(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array when institutions is undefined', () => {
      const result = mapInstitutionsToServices(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array when institutions is not an array', () => {
      const result = mapInstitutionsToServices('not an array' as any);
      expect(result).toEqual([]);
    });

    it('should return empty array when institutions is empty', () => {
      const result = mapInstitutionsToServices([]);
      expect(result).toEqual([]);
    });

    it('should map institutions with services correctly', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          logoUrl: 'https://test.com/logo.png',
          status: 'ACTIVE',
          website: 'https://test.com',
          description: 'Test bank description',
          geographicZones: ['Zone A', 'Zone B'],
          createdAt: '2024-01-01',
          services: [
            {
              id: 'svc-1',
              name: 'service-name',
              longName: 'Service Long Name',
              type: 'EPARGNE',
              frais: { fee: 100 },
              conditionAccess: ['condition1'],
              plafonds: ['plafond1'],
              infrastructureAccess: ['infra1'],
              maxAmount: 100000,
              interestRate: 5.5,
              reimbursement: 'Mensuel',
              minAmount: 1000,
            },
            {
              id: 'svc-2',
              name: 'service-name-2',
              longName: 'Service Long Name 2',
              type: 'CREDIT',
              frais: { fee: 200 },
              conditionAccess: ['condition2'],
              plafonds: ['plafond2'],
              infrastructureAccess: ['infra2'],
              maxAmount: 500000,
              interestRate: 7.2,
              reimbursement: 'Trimestriel',
              minAmount: 5000,
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'svc-1',
        designation: 'Service Long Name',
        name: 'service-name',
        longName: 'Service Long Name',
        frais: { fee: 100 },
        conditionAccess: ['condition1'],
        plafonds: ['plafond1'],
        infrastructureAccess: ['infra1'],
        type: 'EPARGNE',
        institution: {
          id: 'inst-1',
          name: 'Test Bank',
          longName: 'Test Bank',
          logoUrl: 'https://test.com/logo.png',
          status: 'ACTIVE',
          website: 'https://test.com',
          description: 'Test bank description',
          geographicZones: ['Zone A', 'Zone B'],
        },
        maxAmount: 100000,
        interestRate: 5.5,
        reimbursement: 'Mensuel',
        status: 'ACTIVE',
        geographicZones: ['Zone A', 'Zone B'],
        createdAt: '2024-01-01',
        description: 'Service Long Name',
        minAmount: 1000,
      });
    });

    it('should handle institutions without services', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          services: null,
        },
        {
          id: 'inst-2',
          name: 'Test Bank 2',
          services: [],
        },
        {
          id: 'inst-3',
          name: 'Test Bank 3',
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result).toEqual([]);
    });

    it('should handle services without id', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          services: [
            {
              name: 'service-name',
              type: 'EPARGNE',
            },
            {
              id: 'svc-1',
              name: 'service-name-2',
              type: 'CREDIT',
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('svc-1');
    });

    it('should provide default values for missing properties', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          services: [
            {
              id: 'svc-1',
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0]).toEqual({
        id: 'svc-1',
        designation: '',
        name: '',
        longName: undefined,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        type: 'AUTRES',
        institution: {
          id: 'inst-1',
          name: 'Test Bank',
          longName: 'Test Bank',
          logoUrl: undefined,
          status: 'INACTIVE',
          website: '',
          description: '',
          geographicZones: [],
        },
        maxAmount: 0,
        interestRate: 0,
        reimbursement: '',
        status: 'INACTIVE',
        geographicZones: [],
        createdAt: '',
        description: '',
        minAmount: 0,
      });
    });

    it('should handle multiple institutions with multiple services', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Bank A',
          status: 'ACTIVE',
          services: [
            { id: 'svc-1', name: 'service-1', type: 'EPARGNE' },
            { id: 'svc-2', name: 'service-2', type: 'CREDIT' },
          ],
        },
        {
          id: 'inst-2',
          name: 'Bank B',
          status: 'INACTIVE',
          services: [{ id: 'svc-3', name: 'service-3', type: 'ASSURANCE' }],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result).toHaveLength(3);
      expect(result[0].institution.name).toBe('Bank A');
      expect(result[1].institution.name).toBe('Bank A');
      expect(result[2].institution.name).toBe('Bank B');
    });

    it('should handle services with null/undefined values gracefully', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          services: [
            {
              id: 'svc-1',
              name: null,
              longName: undefined,
              type: null,
              frais: null,
              conditionAccess: null,
              plafonds: undefined,
              infrastructureAccess: null,
              maxAmount: null,
              interestRate: undefined,
              reimbursement: null,
              minAmount: null,
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0]).toEqual({
        id: 'svc-1',
        designation: '',
        name: '',
        longName: undefined,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        type: 'AUTRES',
        institution: expect.any(Object),
        maxAmount: 0,
        interestRate: 0,
        reimbursement: '',
        status: 'INACTIVE',
        geographicZones: [],
        createdAt: '',
        description: '',
        minAmount: 0,
      });
    });

    it('should handle institutions with missing properties', () => {
      const institutions = [
        {
          name: 'Test Bank',
          services: [
            {
              id: 'svc-1',
              name: 'test-service',
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0]).toEqual({
        id: 'svc-1',
        designation: 'test-service',
        name: 'test-service',
        longName: undefined,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        type: 'AUTRES',
        institution: {
          id: '',
          name: 'Test Bank',
          longName: 'Test Bank',
          logoUrl: undefined,
          status: 'INACTIVE',
          website: '',
          description: '',
          geographicZones: [],
        },
        maxAmount: 0,
        interestRate: 0,
        reimbursement: '',
        status: 'INACTIVE',
        geographicZones: [],
        createdAt: '',
        description: 'test-service',
        minAmount: 0,
      });
    });

    it('should handle services with all properties set', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          logoUrl: 'https://test.com/logo.png',
          status: 'ACTIVE',
          website: 'https://test.com',
          description: 'Test bank description',
          geographicZones: ['Zone A', 'Zone B'],
          createdAt: '2024-01-01',
          services: [
            {
              id: 'svc-1',
              name: 'service-name',
              longName: 'Service Long Name',
              type: 'EPARGNE',
              frais: { fee: 100 },
              conditionAccess: ['condition1'],
              plafonds: ['plafond1'],
              infrastructureAccess: ['infra1'],
              maxAmount: 100000,
              interestRate: 5.5,
              reimbursement: 'Mensuel',
              minAmount: 1000,
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0]).toEqual({
        id: 'svc-1',
        designation: 'Service Long Name',
        name: 'service-name',
        longName: 'Service Long Name',
        frais: { fee: 100 },
        conditionAccess: ['condition1'],
        plafonds: ['plafond1'],
        infrastructureAccess: ['infra1'],
        type: 'EPARGNE',
        institution: {
          id: 'inst-1',
          name: 'Test Bank',
          longName: 'Test Bank',
          logoUrl: 'https://test.com/logo.png',
          status: 'ACTIVE',
          website: 'https://test.com',
          description: 'Test bank description',
          geographicZones: ['Zone A', 'Zone B'],
        },
        maxAmount: 100000,
        interestRate: 5.5,
        reimbursement: 'Mensuel',
        status: 'ACTIVE',
        geographicZones: ['Zone A', 'Zone B'],
        createdAt: '2024-01-01',
        description: 'Service Long Name',
        minAmount: 1000,
      });
    });

    it('should handle services with longName but no name', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          services: [
            {
              id: 'svc-1',
              longName: 'Service Long Name Only',
              type: 'CREDIT',
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0].designation).toBe('Service Long Name Only');
      expect(result[0].name).toBe('');
      expect(result[0].description).toBe('Service Long Name Only');
    });

    it('should handle services with name but no longName', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          services: [
            {
              id: 'svc-1',
              name: 'service-name-only',
              type: 'ASSURANCE',
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0].designation).toBe('service-name-only');
      expect(result[0].longName).toBeUndefined();
      expect(result[0].description).toBe('service-name-only');
    });

    it('should handle services with neither name nor longName', () => {
      const institutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          description: 'Bank description',
          services: [
            {
              id: 'svc-1',
              type: 'AUTRES',
            },
          ],
        },
      ];

      const result = mapInstitutionsToServices(institutions);
      expect(result[0].designation).toBe('');
      expect(result[0].name).toBe('');
      expect(result[0].description).toBe('Bank description');
    });
  });
});
