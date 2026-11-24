export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LOCATIONS: '/locations',
  PROPERTY_TYPES: '/property-types',
  PROPERTIES: '/properties',
  PROPERTY_NEW: '/properties/new',
  PROPERTY_EDIT: '/properties/:id',
  TEAM: '/team',
  OFFICES: '/offices',
  PARTNERS: '/partners',
  INQUIRIES: '/inquiries',
  CONTACTS: '/contacts',
  VIEWINGS: '/viewings',
  /** Tasks section root — redirects to Marketing tab. */
  TASKS: '/tasks',
  MARKETING: '/tasks/marketing',
  STUDIO: '/tasks/studio',
  CRM_TASKS: '/tasks/crm',
  /** Old top-level paths — redirect into Tasks. */
  MARKETING_LEGACY: '/marketing',
  STUDIO_LEGACY: '/studio',
  CRM_TASKS_LEGACY: '/crm-tasks',
  OFFERS: '/offers',
  DEALS: '/deals',
  ARTICLES: '/articles',
  LANDINGS: '/landings',
  DOCUMENTS: '/documents',
  /** Seller handbook lives under Documents. */
  HANDBOOK: '/documents/handbook',
  /** Old top-level path — redirects to HANDBOOK. */
  HANDBOOK_LEGACY: '/handbook',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
