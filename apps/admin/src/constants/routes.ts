export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
