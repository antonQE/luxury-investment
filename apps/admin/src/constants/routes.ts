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
  PARTNERS: '/partners',
  INQUIRIES: '/inquiries',
  ARTICLES: '/articles',
  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
