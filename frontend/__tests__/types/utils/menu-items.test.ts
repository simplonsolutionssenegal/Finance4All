import { menuItems, getAllowedRolesForPath, type MenuItem } from '@/types/utils/menu-items';

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

    it('should have unique ids for all menu items', () => {
      const ids = menuItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique hrefs for all menu items', () => {
      const hrefs = menuItems.map(item => item.href);
      const uniqueHrefs = new Set(hrefs);
      expect(uniqueHrefs.size).toBe(hrefs.length);
    });

    it('should include overview menu item for admin', () => {
      const overview = menuItems.find(item => item.id === 'overview');
      expect(overview).toBeDefined();
      expect(overview?.href).toBe('/dashboard');
      expect(overview?.allowedRoles).toContain('admin');
    });

    it('should include dashboard menu item for beneficiary', () => {
      const dashboard = menuItems.find(item => item.id === 'dashboard');
      expect(dashboard).toBeDefined();
      expect(dashboard?.href).toBe('/beneficiaire-dashboard');
      expect(dashboard?.allowedRoles).toContain('org:recipient');
    });

    it('should include comparator menu item', () => {
      const comparator = menuItems.find(item => item.id === 'comparator');
      expect(comparator).toBeDefined();
      expect(comparator?.href).toBe('/comparateur');
      expect(comparator?.allowedRoles).toContain('beneficiary');
    });

    it('should include simulator menu item', () => {
      const simulator = menuItems.find(item => item.id === 'simulator');
      expect(simulator).toBeDefined();
      expect(simulator?.href).toBe('/simulateur');
      expect(simulator?.allowedRoles).toContain('beneficiary');
    });

    it('should include notifications without allowedRoles (accessible to all)', () => {
      const notifications = menuItems.find(item => item.id === 'notifications');
      expect(notifications).toBeDefined();
      expect(notifications?.allowedRoles).toBeUndefined();
    });

    it('should include settings without allowedRoles (accessible to all)', () => {
      const settings = menuItems.find(item => item.id === 'settings');
      expect(settings).toBeDefined();
      expect(settings?.allowedRoles).toBeUndefined();
    });

    it('should have badges for institutions and notifications', () => {
      const institutions = menuItems.find(item => item.id === 'institutions');
      const notifications = menuItems.find(item => item.id === 'notifications');
      expect(institutions?.badge).toBe('32');
      expect(notifications?.badge).toBe('10');
    });
  });

  describe('getAllowedRolesForPath', () => {
    it('should return allowed roles for exact path match', () => {
      const roles = getAllowedRolesForPath('/dashboard');
      expect(roles).toContain('admin');
      expect(roles).toContain('org:admin');
      expect(roles).toContain('org:member');
    });

    it('should return allowed roles for nested path', () => {
      const roles = getAllowedRolesForPath('/dashboard/settings');
      expect(roles).toContain('admin');
    });

    it('should return undefined for paths without role restrictions', () => {
      const roles = getAllowedRolesForPath('/notifications');
      expect(roles).toBeUndefined();
    });

    it('should return undefined for unknown paths', () => {
      const roles = getAllowedRolesForPath('/unknown-path');
      expect(roles).toBeUndefined();
    });

    it('should return beneficiary roles for learning path', () => {
      const roles = getAllowedRolesForPath('/learning');
      expect(roles).toContain('org:recipient');
      expect(roles).toContain('beneficiary');
    });

    it('should return beneficiary roles for comparateur path', () => {
      const roles = getAllowedRolesForPath('/comparateur');
      expect(roles).toContain('org:recipient');
      expect(roles).toContain('beneficiary');
    });

    it('should return beneficiary roles for simulateur path', () => {
      const roles = getAllowedRolesForPath('/simulateur');
      expect(roles).toContain('org:recipient');
      expect(roles).toContain('beneficiary');
    });

    it('should return admin roles for users path', () => {
      const roles = getAllowedRolesForPath('/users');
      expect(roles).toContain('admin');
      expect(roles).toContain('org:admin');
      expect(roles).not.toContain('org:member');
    });

    it('should return admin roles for institutions path', () => {
      const roles = getAllowedRolesForPath('/institutions');
      expect(roles).toContain('admin');
      expect(roles).toContain('org:admin');
      expect(roles).toContain('org:member');
    });

    it('should return admin roles for modules path', () => {
      const roles = getAllowedRolesForPath('/modules');
      expect(roles).toContain('admin');
      expect(roles).toContain('org:admin');
      expect(roles).toContain('org:member');
    });

    it('should work with nested institution paths', () => {
      const roles = getAllowedRolesForPath('/institutions/123');
      expect(roles).toContain('admin');
    });

    it('should work with deeply nested paths', () => {
      const roles = getAllowedRolesForPath('/institutions/123/edit/details');
      expect(roles).toContain('admin');
    });
  });
});
