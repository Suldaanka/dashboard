// Basic unit tests for permission-checking logic
const { hasPagePermission, getPermissionsForRole } = require('./permissions');

describe('Permissions Logic', () => {
  it('should return true for ADMIN access to dashboard', async () => {
    const result = await hasPagePermission('ADMIN', '/');
    expect(result).toBe(true);
  });

  it('should return false for KITCHEN access to users page', async () => {
    const result = await hasPagePermission('KITCHEN', '/users');
    expect(result).toBe(false);
  });

  it('should return all permissions for ADMIN', async () => {
    const perms = await getPermissionsForRole('ADMIN');
    expect(perms).toContain('dashboard');
    expect(perms).toContain('users');
  });
});