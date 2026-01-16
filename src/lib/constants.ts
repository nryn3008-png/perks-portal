/**
 * Application constants
 */

/**
 * Navigation items for the sidebar
 */
export const NAVIGATION = {
  main: [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'All Perks', href: '/perks', icon: 'Gift' },
  ],
  admin: [
    { name: 'Manage Perks', href: '/admin/perks', icon: 'Settings' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
    { name: 'Users', href: '/admin/users', icon: 'Users' },
  ],
} as const;

/**
 * Perk status display configuration
 */
export const PERK_STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'green',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
  },
  expired: {
    label: 'Expired',
    color: 'red',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
  },
  coming_soon: {
    label: 'Coming Soon',
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  archived: {
    label: 'Archived',
    color: 'gray',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
  },
} as const;

/**
 * Default pagination settings
 */
export const PAGINATION = {
  defaultPageSize: 12,
  pageSizeOptions: [12, 24, 48],
} as const;

/**
 * Category icons mapping
 */
export const CATEGORY_ICONS: Record<string, string> = {
  'cloud-infrastructure': 'Cloud',
  'developer-tools': 'Code',
  'sales-marketing': 'Megaphone',
  'finance-legal': 'Briefcase',
  'hr-operations': 'Users',
  'design-creative': 'Palette',
  default: 'Package',
} as const;
