import type { ReactNode } from 'react';

import { ROUTES } from '@/constants/routes';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  [ROUTES.DASHBOARD]: (
    <Icon>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </Icon>
  ),
  [ROUTES.PROPERTIES]: (
    <Icon>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </Icon>
  ),
  [ROUTES.INQUIRIES]: (
    <Icon>
      <path d="M4 5h16v14H4z" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  ),
  [ROUTES.CONTACTS]: (
    <Icon>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </Icon>
  ),
  [ROUTES.VIEWINGS]: (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </Icon>
  ),
  [ROUTES.TASKS]: (
    <Icon>
      <path d="M9 6h12" />
      <path d="M9 12h12" />
      <path d="M9 18h12" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </Icon>
  ),
  [ROUTES.OFFERS]: (
    <Icon>
      <path d="M12 3v18" />
      <path d="M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.5 4.5 3 4.5 1.4 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" />
    </Icon>
  ),
  [ROUTES.DEALS]: (
    <Icon>
      <path d="M8 7h13v10H8z" />
      <path d="M8 10H3l2 3-2 3h5" />
    </Icon>
  ),
  [ROUTES.ARTICLES]: (
    <Icon>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </Icon>
  ),
  [ROUTES.LANDINGS]: (
    <Icon>
      <path d="M4 20h16" />
      <path d="M7 20V9l5-5 5 5v11" />
    </Icon>
  ),
  [ROUTES.DOCUMENTS]: (
    <Icon>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
    </Icon>
  ),
  [ROUTES.HANDBOOK]: (
    <Icon>
      <path d="M4 5h7v15H4z" />
      <path d="M13 5h7v15h-7z" />
    </Icon>
  ),
  [ROUTES.ANALYTICS]: (
    <Icon>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </Icon>
  ),
  [ROUTES.SETTINGS]: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2" />
      <path d="M12 18.8V21" />
      <path d="m5.6 5.6 1.6 1.6" />
      <path d="m16.8 16.8 1.6 1.6" />
      <path d="M3 12h2.2" />
      <path d="M18.8 12H21" />
      <path d="m5.6 18.4 1.6-1.6" />
      <path d="m16.8 7.2 1.6-1.6" />
    </Icon>
  ),
  [ROUTES.TEAM]: (
    <Icon>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="9" r="2" />
      <path d="M3.5 19c1-3 3-4.5 5.5-4.5S13 16 14 19" />
      <path d="M14 14.5c1.2-.5 2.5-.5 3.8.2 1.5 1.6 2.2 3.2 2.7 4.3" />
    </Icon>
  ),
  [ROUTES.OFFICES]: (
    <Icon>
      <path d="M4 21V5h10v16" />
      <path d="M14 10h6v11" />
      <path d="M7 9h2" />
      <path d="M7 13h2" />
      <path d="M7 17h2" />
    </Icon>
  ),
  [ROUTES.PARTNERS]: (
    <Icon>
      <path d="M8 12h8" />
      <circle cx="7" cy="12" r="3" />
      <circle cx="17" cy="12" r="3" />
    </Icon>
  ),
  [ROUTES.LOCATIONS]: (
    <Icon>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  ),
  [ROUTES.PROPERTY_TYPES]: (
    <Icon>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <path d="M8 5v4" />
      <path d="M12 10v4" />
      <path d="M16 15v4" />
    </Icon>
  ),
};

export function navIconFor(path: string): ReactNode {
  return (
    ICONS[path] ?? (
      <Icon>
        <circle cx="12" cy="12" r="7" />
      </Icon>
    )
  );
}
