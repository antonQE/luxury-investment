/**
 * Public navigation — shared by header, mobile nav and footer.
 * Items with `children` are dropdown parents: the parent label does not navigate;
 * only child links navigate (and close the menu).
 */
export const PRIMARY_NAV = [
  { href: '/', key: 'home' },
  { href: '/obiavi', key: 'properties' },
  { href: '/prodai-s-nas', key: 'sellWithUs' },
  { href: '/advokatski-uslugi', key: 'legalServices' },
  { href: '/dokumenti', key: 'documents' },
  {
    key: 'investments',
    children: [
      { href: '/investicii', key: 'investmentsOverview' },
      { href: '/investicii/biznesi', key: 'businesses' },
    ],
  },
  { href: '/uslugi', key: 'services' },
  { href: '/stati', key: 'articles' },
  { href: '/ekip', key: 'team' },
  { href: '/za-nas', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavItem = (typeof PRIMARY_NAV)[number];
export type NavChild = Extract<NavItem, { children: unknown }>['children'][number];
