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
  ARTICLES: '/articles',
  HANDBOOK: '/handbook',
  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
