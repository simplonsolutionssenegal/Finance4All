import { menuItems, getMenuItemsForRole, type MenuItem } from '@/types/utils/menu-items';

describe('menu-items', () => {
  describe('menuItems array', () => {
    it('should contain all required menu items', () => {
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each menu item', () => {
      menuItems.forEach((item: MenuItem) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('href');
        expect(typeof item.id).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.href).toBe('string');
      });
    });

    it('should include overview menu item for platform group', () => {
      const overview = menuItems.find(item => item.id === 'overview');
      expect(overview).toBeDefined();
      expect(overview?.href).toBe('/dashboard');
      expect(overview?.allowedGroups).toContain('platform');
    });

    it('should include dashboard menu item for beneficiary group', () => {
      const dashboard = menuItems.find(item => item.id === 'dashboard');
      expect(dashboard).toBeDefined();
      expect(dashboard?.href).toBe('/dashboard');
      expect(dashboard?.allowedGroups).toContain('beneficiary');
    });

    it('should include recipients menu item for organization group', () => {
      const recipients = menuItems.find(item => item.id === 'recipients');
      expect(recipients).toBeDefined();
      expect(recipients?.href).toBe('/recipients');
      expect(recipients?.allowedGroups).toContain('organization');
    });

    it('should include notifications without allowedGroups (accessible to all)', () => {
      const notifications = menuItems.find(item => item.id === 'notifications');
      expect(notifications).toBeDefined();
      expect(notifications?.allowedGroups).toBeUndefined();
    });

    it('should include settings without allowedGroups (accessible to all)', () => {
      const settings = menuItems.find(item => item.id === 'settings');
      expect(settings).toBeDefined();
      expect(settings?.allowedGroups).toBeUndefined();
    });

    it('should have badges for institutions and notifications', () => {
      const institutions = menuItems.find(item => item.id === 'institutions');
      const notifications = menuItems.find(item => item.id === 'notifications');
      expect(institutions?.badge).toBe('32');
      expect(notifications?.badge).toBe('10');
    });
  });

  describe('getMenuItemsForRole', () => {
    it('returns platform items for Admin', () => {
      const items = getMenuItemsForRole('Admin');
      const ids = items.map(i => i.id);
      expect(ids).toContain('overview');
      expect(ids).toContain('institutions');
      expect(ids).toContain('formations');
      expect(ids).toContain('users');
      expect(ids).toContain('notifications');
      expect(ids).toContain('settings');
      expect(ids).not.toContain('recipients');
      expect(ids).not.toContain('modules');
      expect(ids).not.toContain('dashboard');
    });

    it('returns same items for AdminMember as Admin', () => {
      const adminItems = getMenuItemsForRole('Admin').map(i => i.id);
      const memberItems = getMenuItemsForRole('AdminMember').map(i => i.id);
      expect(memberItems).toEqual(adminItems);
    });

    it('returns organization items for AdminOrg', () => {
      const items = getMenuItemsForRole('AdminOrg');
      const ids = items.map(i => i.id);
      expect(ids).toContain('overview');
      expect(ids).toContain('recipients');
      expect(ids).toContain('notifications');
      expect(ids).toContain('settings');
      expect(ids).not.toContain('institutions');
      expect(ids).not.toContain('users');
      expect(ids).not.toContain('modules');
    });

    it('returns Membres menu item for AdminOrg', () => {
      const items = getMenuItemsForRole('AdminOrg');
      const members = items.find(i => i.id === 'members');
      expect(members).toBeDefined();
      expect(members?.href).toBe('/members');
      expect(members?.label).toBe('Membres');
    });

    it('returns Membres menu item for MemberOrg', () => {
      const items = getMenuItemsForRole('MemberOrg');
      const members = items.find(i => i.id === 'members');
      expect(members).toBeDefined();
      expect(members?.href).toBe('/members');
      expect(members?.label).toBe('Membres');
    });

    it('does NOT return Membres menu item for Admin', () => {
      const items = getMenuItemsForRole('Admin');
      const ids = items.map(i => i.id);
      expect(ids).not.toContain('members');
    });

    it('returns same items for MemberOrg as AdminOrg', () => {
      const adminOrgItems = getMenuItemsForRole('AdminOrg').map(i => i.id);
      const memberOrgItems = getMenuItemsForRole('MemberOrg').map(i => i.id);
      expect(memberOrgItems).toEqual(adminOrgItems);
    });

    it('returns beneficiary items for Recipient', () => {
      const items = getMenuItemsForRole('Recipient');
      const ids = items.map(i => i.id);
      expect(ids).toContain('dashboard');
      expect(ids).toContain('modules');
      expect(ids).toContain('certificats');
      expect(ids).toContain('comparator');
      expect(ids).toContain('simulator');
      expect(ids).toContain('notifications');
      expect(ids).toContain('settings');
      expect(ids).not.toContain('overview');
      expect(ids).not.toContain('institutions');
      expect(ids).not.toContain('recipients');
    });

    it('returns same items for Beneficiare as Recipient', () => {
      const recipientItems = getMenuItemsForRole('Recipient').map(i => i.id);
      const beneficiareItems = getMenuItemsForRole('Beneficiare').map(i => i.id);
      expect(beneficiareItems).toEqual(recipientItems);
    });
  });
});
