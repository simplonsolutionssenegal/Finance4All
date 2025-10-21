// Helper functions and types for Services dashboard
export * from './ServicesDashboard';

// Data mapping function
export function mapInstitutionsToServices(institutions: any[] = []) {
  if (!institutions || !Array.isArray(institutions)) return [];

  const services = [];

  for (const inst of institutions) {
    if (!inst?.services || !Array.isArray(inst.services)) continue;

    const instObj = {
      id: inst.id || '',
      name: inst.name || '',
      longName: inst.name || '',
      logoUrl: inst.logoUrl,
      status: inst.status || 'INACTIVE',
      website: inst.website || '',
      description: inst.description || '',
      geographicZones: inst.geographicZones || [],
    };

    for (const s of inst.services) {
      if (!s?.id) continue;
      services.push({
        id: s.id,
        designation: s.longName || s.name || '',
        name: s.name || '',
        longName: s.longName,
        frais: s.frais || {},
        conditionAccess: s.conditionAccess || [],
        plafonds: s.plafonds || [],
        infrastructureAccess: s.infrastructureAccess || [],
        type: s.type || 'AUTRES',
        institution: instObj,
        maxAmount: s.maxAmount || 0,
        interestRate: s.interestRate || 0,
        reimbursement: s.reimbursement || '',
        status: inst.status || 'INACTIVE',
        geographicZones: inst.geographicZones || [],
        createdAt: inst.createdAt || '',
        description: s.longName || s.name || inst.description || '',
        minAmount: s.minAmount || 0,
      });
    }
  }

  return services;
}
