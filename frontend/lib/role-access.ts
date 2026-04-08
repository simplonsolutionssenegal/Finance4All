/**
 * Configuration centralisee des roles et acces — source de verite unique.
 *
 * Tous les consommateurs (middleware, sidebar, redirect, auth-utils)
 * importent depuis ce fichier.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppRole =
  | 'Admin'
  | 'AdminMember'
  | 'AdminOrg'
  | 'MemberOrg'
  | 'Recipient'
  | 'Beneficiare';

export type AccessGroup = 'platform' | 'organization' | 'beneficiary';

// ---------------------------------------------------------------------------
// Mappings
// ---------------------------------------------------------------------------

const ROLE_GROUP: Record<AppRole, AccessGroup> = {
  Admin: 'platform',
  AdminMember: 'platform',
  AdminOrg: 'organization',
  MemberOrg: 'organization',
  Recipient: 'beneficiary',
  Beneficiare: 'beneficiary',
};

const ROUTE_ACCESS: Record<string, AccessGroup[]> = {
  '/dashboard': ['platform', 'organization', 'beneficiary'],
  '/institutions': ['platform'],
  '/modules': ['platform'],
  '/users': ['platform'],
  '/recipients': ['organization'],
  '/members': ['organization'],
  '/learning': ['beneficiary'],
  '/certificats': ['beneficiary'],
  '/comparateur': ['beneficiary'],
  '/simulateur': ['beneficiary'],
};

export const ROLE_LABELS: Record<AppRole, string> = {
  Admin: 'Admin Systeme',
  AdminMember: 'Membre Admin',
  AdminOrg: 'Admin Organisation',
  MemberOrg: 'Membre Organisation',
  Recipient: 'Beneficiaire (org)',
  Beneficiare: 'Beneficiaire',
};

// ---------------------------------------------------------------------------
// Resolution du role applicatif
// ---------------------------------------------------------------------------

export function resolveAppRole(
  orgMetadata: Record<string, unknown> | null | undefined,
  orgRole: string | null | undefined,
  userMetadata:
    | {
        unsafeMetadata?: Record<string, unknown>;
        publicMetadata?: Record<string, unknown>;
      }
    | null
    | undefined
): AppRole {
  // 1. Org admin (metadata type === 'admin')
  if (orgMetadata?.type === 'admin') {
    if (orgRole === 'org:admin') return 'Admin';
    if (orgRole === 'org:member') return 'AdminMember';
  }

  // 2. Org partenaire (org existe mais pas admin)
  if (orgRole) {
    if (orgRole === 'org:admin') return 'AdminOrg';
    if (orgRole === 'org:member') return 'MemberOrg';
    if (orgRole === 'org:recipient') return 'Recipient';
  }

  // 3. Pas d'org — verifier metadata beneficiary
  const role =
    (userMetadata?.unsafeMetadata?.role as string) ??
    (userMetadata?.publicMetadata?.role as string);
  if (role === 'beneficiary' || role === 'BENEFICIAIRE') {
    return 'Beneficiare';
  }

  // 4. Fallback — role le plus restrictif
  return 'Beneficiare';
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

export function getAccessGroup(role: AppRole): AccessGroup {
  return ROLE_GROUP[role];
}

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  const group = ROLE_GROUP[role];

  // Trouver la route correspondante (prefixe le plus long)
  const matchingRoute = Object.keys(ROUTE_ACCESS)
    .filter(route => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  // Routes non listees dans ROUTE_ACCESS → accessibles a tous les authentifies
  if (!matchingRoute) return true;

  return ROUTE_ACCESS[matchingRoute].includes(group);
}

export function getDefaultRedirect(): string {
  return '/dashboard';
}

/**
 * IDs des items de menu par groupe d'acces.
 * Consomme par menu-items.ts pour filtrer les menuItems.
 */
export const MENU_IDS_BY_GROUP: Record<AccessGroup, string[]> = {
  platform: ['overview', 'institutions', 'formations', 'users'],
  organization: ['overview', 'recipients', 'members'],
  beneficiary: ['dashboard', 'modules', 'certificats', 'comparator', 'simulator'],
};
