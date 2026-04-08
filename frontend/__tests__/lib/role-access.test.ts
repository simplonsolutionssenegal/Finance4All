import {
  resolveAppRole,
  getAccessGroup,
  canAccessRoute,
  getDefaultRedirect,
  MENU_IDS_BY_GROUP,
  type AppRole,
} from '@/lib/role-access';

describe('resolveAppRole', () => {
  it('returns Admin for org:admin in admin org', () => {
    expect(resolveAppRole({ type: 'admin' }, 'org:admin', null)).toBe('Admin');
  });

  it('returns AdminMember for org:member in admin org', () => {
    expect(resolveAppRole({ type: 'admin' }, 'org:member', null)).toBe('AdminMember');
  });

  it('returns AdminOrg for org:admin in partner org', () => {
    expect(resolveAppRole({ type: 'partner' }, 'org:admin', null)).toBe('AdminOrg');
    expect(resolveAppRole({}, 'org:admin', null)).toBe('AdminOrg');
    expect(resolveAppRole(null, 'org:admin', null)).toBe('AdminOrg');
  });

  it('returns MemberOrg for org:member in partner org', () => {
    expect(resolveAppRole({ type: 'partner' }, 'org:member', null)).toBe('MemberOrg');
    expect(resolveAppRole(null, 'org:member', null)).toBe('MemberOrg');
  });

  it('returns Recipient for org:recipient', () => {
    expect(resolveAppRole({ type: 'partner' }, 'org:recipient', null)).toBe('Recipient');
    expect(resolveAppRole(null, 'org:recipient', null)).toBe('Recipient');
  });

  it('returns Beneficiare for metadata beneficiary (no org)', () => {
    expect(resolveAppRole(null, null, { unsafeMetadata: { role: 'beneficiary' } })).toBe(
      'Beneficiare'
    );
  });

  it('returns Beneficiare for metadata BENEFICIAIRE (no org)', () => {
    expect(resolveAppRole(null, null, { unsafeMetadata: { role: 'BENEFICIAIRE' } })).toBe(
      'Beneficiare'
    );
  });

  it('returns Beneficiare for publicMetadata role', () => {
    expect(resolveAppRole(null, null, { publicMetadata: { role: 'beneficiary' } })).toBe(
      'Beneficiare'
    );
  });

  it('returns Beneficiare as fallback when no role info', () => {
    expect(resolveAppRole(null, null, null)).toBe('Beneficiare');
    expect(resolveAppRole(undefined, undefined, undefined)).toBe('Beneficiare');
  });
});

describe('getAccessGroup', () => {
  const cases: [AppRole, string][] = [
    ['Admin', 'platform'],
    ['AdminMember', 'platform'],
    ['AdminOrg', 'organization'],
    ['MemberOrg', 'organization'],
    ['Recipient', 'beneficiary'],
    ['Beneficiare', 'beneficiary'],
  ];

  it.each(cases)('%s belongs to %s group', (role, group) => {
    expect(getAccessGroup(role)).toBe(group);
  });
});

describe('canAccessRoute', () => {
  // Platform routes
  it.each(['Admin', 'AdminMember'] as AppRole[])('%s can access /institutions', role => {
    expect(canAccessRoute(role, '/institutions')).toBe(true);
    expect(canAccessRoute(role, '/modules')).toBe(true);
    expect(canAccessRoute(role, '/users')).toBe(true);
    expect(canAccessRoute(role, '/dashboard')).toBe(true);
  });

  it.each(['AdminOrg', 'MemberOrg', 'Recipient', 'Beneficiare'] as AppRole[])(
    '%s cannot access /institutions',
    role => {
      expect(canAccessRoute(role, '/institutions')).toBe(false);
    }
  );

  // Organization routes
  it.each(['AdminOrg', 'MemberOrg'] as AppRole[])('%s can access /recipients', role => {
    expect(canAccessRoute(role, '/recipients')).toBe(true);
    expect(canAccessRoute(role, '/dashboard')).toBe(true);
  });

  it.each(['Admin', 'AdminMember', 'Recipient', 'Beneficiare'] as AppRole[])(
    '%s cannot access /recipients',
    role => {
      expect(canAccessRoute(role, '/recipients')).toBe(false);
    }
  );

  // Organization routes — /members
  it.each(['AdminOrg', 'MemberOrg'] as AppRole[])('%s can access /members', role => {
    expect(canAccessRoute(role, '/members')).toBe(true);
  });

  it.each(['Admin', 'Beneficiare'] as AppRole[])('%s cannot access /members', role => {
    expect(canAccessRoute(role, '/members')).toBe(false);
  });

  // Beneficiary routes
  it.each(['Recipient', 'Beneficiare'] as AppRole[])('%s can access /learning', role => {
    expect(canAccessRoute(role, '/learning')).toBe(true);
    expect(canAccessRoute(role, '/certificats')).toBe(true);
    expect(canAccessRoute(role, '/comparateur')).toBe(true);
    expect(canAccessRoute(role, '/simulateur')).toBe(true);
    expect(canAccessRoute(role, '/dashboard')).toBe(true);
  });

  it.each(['Admin', 'AdminMember', 'AdminOrg', 'MemberOrg'] as AppRole[])(
    '%s cannot access /learning',
    role => {
      expect(canAccessRoute(role, '/learning')).toBe(false);
    }
  );

  // Sub-routes
  it('matches sub-routes correctly', () => {
    expect(canAccessRoute('Beneficiare', '/learning/module-1/lesson/1')).toBe(true);
    expect(canAccessRoute('Admin', '/institutions/123')).toBe(true);
    expect(canAccessRoute('AdminOrg', '/recipients/456')).toBe(true);
  });

  // Unlisted routes are open to all
  it('allows unlisted routes for all roles', () => {
    expect(canAccessRoute('Admin', '/notifications')).toBe(true);
    expect(canAccessRoute('Beneficiare', '/settings')).toBe(true);
  });
});

describe('getDefaultRedirect', () => {
  it('always returns /dashboard', () => {
    expect(getDefaultRedirect()).toBe('/dashboard');
  });
});

describe('MENU_IDS_BY_GROUP', () => {
  it('platform group has correct menu ids', () => {
    expect(MENU_IDS_BY_GROUP.platform).toEqual(['overview', 'institutions', 'formations', 'users']);
  });

  it('organization group has correct menu ids', () => {
    expect(MENU_IDS_BY_GROUP.organization).toEqual(['overview', 'recipients', 'members']);
  });

  it('organization group includes members', () => {
    expect(MENU_IDS_BY_GROUP.organization).toContain('members');
  });

  it('platform group does not include members', () => {
    expect(MENU_IDS_BY_GROUP.platform).not.toContain('members');
  });

  it('beneficiary group has correct menu ids', () => {
    expect(MENU_IDS_BY_GROUP.beneficiary).toEqual([
      'dashboard',
      'modules',
      'certificats',
      'comparator',
      'simulator',
    ]);
  });
});
