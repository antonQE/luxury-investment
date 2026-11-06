/**
 * Public navigation — shared by header, mobile nav and footer.
 * Items with `children` are dropdown parents: the parent label does not navigate;
 * only child links navigate (and close the menu).
 */
export const PRIMARY_NAV = [
  { href: '/', key: 'home' },
  { href: '/obiavi', key: 'properties' },
  {
    key: 'investments',
    children: [
      { href: '/investicii', key: 'investmentsOverview' },
      { href: '/investicii/biznesi', key: 'businesses' },
      { href: '/advokatski-uslugi', key: 'legalServices' },
    ],
  },
  { href: '/za-nas', key: 'about' },
  { href: '/ekip', key: 'team' },
  { href: '/stati', key: 'articles' },
  { href: '/prodai-s-nas', key: 'sellWithUs' },
  { href: '/dokumenti', key: 'documents' },
  { href: '/uslugi', key: 'services' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavItem = (typeof PRIMARY_NAV)[number];
export type NavChild = Extract<NavItem, { children: unknown }>['children'][number];
