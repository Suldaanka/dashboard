// /utils/permissions.js
// Database-backed permission logic using Prisma
import prisma from '@/lib/prisma';

const pagePathMap = {
  '/': 'dashboard',
  '/rooms': 'rooms',
  '/reservation': 'reservation',
  '/menu': 'menu',
  '/tables': 'tables',
  '/orders': 'orders',
  '/expenses': 'expenses',
  '/users': 'users',
  '/employees': 'employees',
  '/settings': 'settings',
  '/profile': 'profile',
};

/**
 * Check if role has access to the given page path
 * @param {string} roleName - Name of the role
 * @param {string} pathname - Page path to check
 * @returns {Promise<boolean>} Whether role has permission
 */
async function hasPagePermission(roleName, pathname) {
  try {
    if (!roleName) {
      console.warn('No role name provided for permission check');
      return false;
    }
    
    const permissionName = pagePathMap[pathname];
    if (!permissionName) {
      console.warn(`No permission mapping found for path: ${pathname}`);
      return false;
    }

    const role = await prisma.roleModel.findUnique({
      where: { name: roleName },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role) {
      console.warn(`Role not found: ${roleName}`);
      return false;
    }

    const hasPermission = role.permissions.some((rp) => rp.permission.name === permissionName);
    console.log(`Permission check - Role: ${roleName}, Path: ${pathname}, Permission: ${permissionName}, Allowed: ${hasPermission}`);
    
    return hasPermission;
  } catch (error) {
    console.error('Error checking page permission:', error);
    return false;
  }
}

/**
 * Get permissions for a role
 * @param {string} roleName - Name of the role
 * @returns {Promise<Array>} Array of permission names
 */
async function getPermissionsForRole(roleName) {
  try {
    if (!roleName) {
      console.warn('No role name provided for getting permissions');
      return [];
    }

    const role = await prisma.roleModel.findUnique({
      where: { name: roleName },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role) {
      console.warn(`Role not found: ${roleName}`);
      return [];
    }

    const permissions = role.permissions.map((rp) => rp.permission.name);
    console.log(`Permissions for role ${roleName}:`, permissions);

    return permissions;
  } catch (error) {
    console.error('Error getting permissions for role:', error);
    return [];
  }
}

/**
 * Filter navigation items based on role permissions from database
 * @param {Array} navItems - Array of navigation items
 * @param {string} roleName - Name of the role
 * @returns {Promise<Array>} Filtered navigation items
 */
async function filterNavigationItems(navItems, roleName) {
  try {
    if (!roleName || !navItems || !Array.isArray(navItems)) {
      console.warn('Invalid parameters for filterNavigationItems:', { roleName, navItemsLength: navItems?.length });
      return [];
    }

    console.log(`Filtering navigation items for role: ${roleName}`);
    
    const permissions = await getPermissionsForRole(roleName);
    
    if (permissions.length === 0) {
      console.warn(`No permissions found for role: ${roleName}`);
      return [];
    }

    const filteredNavItems = [];

    for (const item of navItems) {
      // Handle items with dropdown
      if (item.hasDropdown && Array.isArray(item.items)) {
        const filteredSubItems = [];
        
        for (const subItem of item.items) {
          const pageKey = pagePathMap[subItem.url];
          if (pageKey && permissions.includes(pageKey)) {
            filteredSubItems.push(subItem);
          }
        }
        
        // Only include parent item if it has accessible sub-items
        if (filteredSubItems.length > 0) {
          filteredNavItems.push({
            ...item,
            items: filteredSubItems
          });
        }
      } else {
        // Handle regular navigation items
        const pageKey = pagePathMap[item.url];
        if (pageKey && permissions.includes(pageKey)) {
          filteredNavItems.push(item);
        }
      }
    }

    console.log("filterNavigationItems - Input navItems:", navItems);
    console.log("filterNavigationItems - Input permissions:", permissions);
    console.log("filterNavigationItems - Filtered items:", filteredNavItems);

    console.log("filterNavigationItems - Input navItems:", navItems);
    console.log("filterNavigationItems - Input permissions:", permissions);
    console.log("filterNavigationItems - Filtered items:", filteredNavItems);

    return filteredNavItems;

  } catch (error) {
    console.error('Error filtering navigation items:', error);
    return [];
  }
}

/**
 * Update role permissions
 * @param {string} roleName - Name of the role
 * @param {Array} newPermissions - Array of new permission names
 * @returns {Promise<Object>} Result object with success status
 */
async function updateRolePermissions(roleName, newPermissions) {
  try {
    if (!roleName || !Array.isArray(newPermissions)) {
      return { success: false, error: "Invalid parameters" };
    }

    const role = await prisma.roleModel.findUnique({ 
      where: { name: roleName } 
    });
    
    if (!role) {
      return { success: false, error: "Role not found" };
    }

    // Remove all current permissions
    await prisma.rolePermission.deleteMany({ 
      where: { roleId: role.id } 
    });

    // Upsert permissions and connect
    for (const permName of newPermissions) {
      let perm = await prisma.permission.findUnique({ 
        where: { name: permName } 
      });
      
      if (!perm) {
        perm = await prisma.permission.create({ 
          data: { name: permName } 
        });
      }
      
      await prisma.rolePermission.create({
        data: { 
          roleId: role.id, 
          permissionId: perm.id 
        },
      });
    }

    console.log(`Updated permissions for role ${roleName}:`, newPermissions);
    return { 
      success: true, 
      role: roleName, 
      updatedPermissions: newPermissions 
    };

  } catch (error) {
    console.error('Error updating role permissions:', error);
    return { 
      success: false, 
      error: `Database error: ${error.message}` 
    };
  }
}

/**
 * Get all available roles from database
 * @returns {Promise<Array>} Array of role objects
 */
async function getAllRoles() {
  try {
    const roles = await prisma.roleModel.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(rp => rp.permission.name)
    }));
  } catch (error) {
    console.error('Error getting all roles:', error);
    return [];
  }
}

/**
 * Create a new role with permissions
 * @param {string} roleName - Name of the new role
 * @param {Array} permissions - Array of permission names
 * @returns {Promise<Object>} Result object
 */
async function createRole(roleName, permissions = []) {
  try {
    if (!roleName) {
      return { success: false, error: "Role name is required" };
    }

    // Check if role already exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { name: roleName }
    });

    if (existingRole) {
      return { success: false, error: "Role already exists" };
    }

    // Create the role
    const role = await prisma.roleModel.create({
      data: { name: roleName }
    });

    // Add permissions if provided
    if (permissions.length > 0) {
      const result = await updateRolePermissions(roleName, permissions);
      if (!result.success) {
        return result;
      }
    }

    return { 
      success: true, 
      role: { id: role.id, name: role.name },
      permissions 
    };

  } catch (error) {
    console.error('Error creating role:', error);
    return { 
      success: false, 
      error: `Database error: ${error.message}` 
    };
  }
}

// Export all needed functions
export {
  pagePathMap,
  hasPagePermission,
  getPermissionsForRole,
  filterNavigationItems,
  updateRolePermissions,
  getAllRoles,
  createRole,
};