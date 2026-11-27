/**
 * Public navigation — shared by header, mobile nav and footer.
 * Items with `children` are dropdown parents: the parent label does not navigate;
 * only child links navigate (and close the menu).
 */
export const PRIMARY_NAV = [
  { href: '/', key: 'home' },
  { href: '/properties', key: 'properties' },
  { href: '/sell-with-us', key: 'sellWithUs' },
  { href: '/legal-services', key: 'legalServices' },
  { href: '/documents', key: 'documents' },
  {
    key: 'investments',
    children: [
      { href: '/investments', key: 'investmentsOverview' },
      { href: '/investments/businesses', key: 'businesses' },
    ],
  },
  { href: '/services', key: 'services' },
  { href: '/articles', key: 'articles' },
  { href: '/team', key: 'team' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavItem = (typeof PRIMARY_NAV)[number];
export type NavChild = Extract<NavItem, { children: unknown }>['children'][number];
