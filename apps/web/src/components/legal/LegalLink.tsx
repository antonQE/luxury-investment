'use client';

import { createContext, type ReactNode, use } from 'react';

import { Link } from '@/i18n/navigation';

export type LegalPageKey = 'privacy' | 'terms';
export type LegalPageIds = Record<LegalPageKey, string | null>;

const LegalPageIdsContext = createContext<LegalPageIds>({ privacy: null, terms: null });

/** Supplies the CMS page ids of privacy/terms (public URLs are `/pages/{id}/`). */
export function LegalPageIdsProvider({
  ids,
  children,
}: {
  ids: LegalPageIds;
  children: ReactNode;
}) {
  return <LegalPageIdsContext value={ids}>{children}</LegalPageIdsContext>;
}

interface LegalLinkProps {
  page: LegalPageKey;
  className?: string;
  'data-testid'?: string;
  children: ReactNode;
}

/**
 * Link to a legal CMS page. When the id is not known (API down, page not published)
 * the label is rendered as plain text instead of a dead link.
 */
export function LegalLink({ page, className, children, ...rest }: LegalLinkProps) {
  const id = use(LegalPageIdsContext)[page];
  if (id === null) return <span data-testid={rest['data-testid']}>{children}</span>;
  return (
    <Link href={`/pages/${id}`} className={className} data-testid={rest['data-testid']}>
      {children}
    </Link>
  );
}
