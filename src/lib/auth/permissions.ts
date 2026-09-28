// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  BOOKING_ADMIN: 'BOOKING_ADMIN',
  LISTING_ADMIN: 'LISTING_ADMIN',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  MODERATOR: 'MODERATOR',
  SECURITY_ADMIN: 'SECURITY_ADMIN',
} as const;

export const USER_ROLES = {
  GUEST: 'GUEST',
  HOST: 'HOST',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
  MODERATOR: 'MODERATOR',
  FINANCE: 'FINANCE',
  SECURITY: 'SECURITY',
} as const;

export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_BAN: 'users.ban',
  USERS_DELETE: 'users.delete',
  HOSTS_VERIFY: 'hosts.verify',
  
  // Listings
  LISTINGS_VIEW: 'listings.view',
  LISTINGS_APPROVE: 'listings.approve',
  LISTINGS_REJECT: 'listings.reject',
  LISTINGS_SUSPEND: 'listings.suspend',
  
  // Bookings
  BOOKINGS_VIEW: 'bookings.view',
  BOOKINGS_CANCEL: 'bookings.cancel',
  BOOKINGS_MODIFY: 'bookings.modify',
  
  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_REFUND: 'payments.refund',
  PAYOUTS_VIEW: 'payouts.view',
  PAYOUTS_RELEASE: 'payouts.release',
  
  // Reviews
  REVIEWS_VIEW: 'reviews.view',
  REVIEWS_MODERATE: 'reviews.moderate',
  REVIEWS_DELETE: 'reviews.delete',
  
  // Disputes
  DISPUTES_VIEW: 'disputes.view',
  DISPUTES_RESOLVE: 'disputes.resolve',
  DISPUTES_ESCALATE: 'disputes.escalate',
  
  // Support
  SUPPORT_VIEW: 'support.view',
  SUPPORT_MANAGE: 'support.manage',
  SUPPORT_ASSIGN: 'support.assign',
  
  // Security
  SECURITY_VIEW: 'security.view',
  SECURITY_MANAGE: 'security.manage',
  SECURITY_AUDIT: 'security.audit',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // System
  COMMISSIONS_MANAGE: 'commissions.manage',
  ADS_MANAGE: 'ads.manage',
  SETTINGS_MANAGE: 'settings.manage',
  MODERATION_MANAGE: 'moderation.manage',
} as const;

// Default permission sets per admin role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // all permissions
  [ADMIN_ROLES.BOOKING_ADMIN]: [
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.BOOKINGS_MODIFY,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
  ],
  [ADMIN_ROLES.LISTING_ADMIN]: [
    PERMISSIONS.LISTINGS_VIEW,
    PERMISSIONS.LISTINGS_APPROVE,
    PERMISSIONS.LISTINGS_REJECT,
    PERMISSIONS.LISTINGS_SUSPEND,
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.REVIEWS_DELETE,
  ],
  [ADMIN_ROLES.FINANCE_ADMIN]: [
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.PAYOUTS_VIEW,
    PERMISSIONS.PAYOUTS_RELEASE,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.COMMISSIONS_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ADMIN_ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.DISPUTES_RESOLVE,
  ],
  [ADMIN_ROLES.MODERATOR]: [
    PERMISSIONS.LISTINGS_VIEW,
    PERMISSIONS.LISTINGS_APPROVE,
    PERMISSIONS.LISTINGS_REJECT,
    PERMISSIONS.LISTINGS_SUSPEND,
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.REVIEWS_DELETE,
    PERMISSIONS.MODERATION_MANAGE,
  ],
  [ADMIN_ROLES.SECURITY_ADMIN]: [
    PERMISSIONS.SECURITY_VIEW,
    PERMISSIONS.SECURITY_MANAGE,
    PERMISSIONS.SECURITY_AUDIT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_BAN,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
};

export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' && !user.adminRole) return true; // Legacy ADMIN
  if (!user.adminRole) return false;
  
  // Super admin has all permissions
  if (user.adminRole === ADMIN_ROLES.SUPER_ADMIN) return true;

  // Check role-based default permissions
  const rolePerms = ROLE_PERMISSIONS[user.adminRole];
  if (rolePerms && rolePerms.includes(permission)) return true;

  // Check user-specific permissions override
  if (!user.permissions) return false;

  try {
    const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    if (!Array.isArray(perms)) return false;
    return perms.includes(permission);
  } catch {
    return false;
  }
}

export function hasAnyPermission(user: any, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

export function hasAllPermissions(user: any, permissions: string[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

export function isAdmin(user: any): boolean {
  return user?.role === 'ADMIN' || !!user?.adminRole;
}

export function isHostOrAdmin(user: any): boolean {
  return user?.role === 'HOST' || user?.role === 'ADMIN' || user?.isHost === true;
}
