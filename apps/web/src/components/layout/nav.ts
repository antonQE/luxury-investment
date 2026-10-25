/** Public R1 navigation — shared by header, mobile nav and footer. */
export const PRIMARY_NAV = [
  { href: '/', key: 'home' },
  { href: '/obiavi', key: 'properties' },
  {
    href: '/investicii',
    key: 'investments',
    children: [
      { href: '/investicii', key: 'investmentsOverview' },
      { href: '/investicii/biznesi', key: 'businesses' },
      { href: '/advokatski-uslugi', key: 'legalServices' },
    ],
  },
  { href: '/za-nas', key: 'about' },
  { href: '/uslugi', key: 'services' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavItem = (typeof PRIMARY_NAV)[number];
export type NavChild = Extract<NavItem, { children: unknown }>['children'][number];
