// @vitest-environment jsdom

import type { PublicPropertyListItem } from '@luxury-investment/shared';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { LegalLink, LegalPageIdsProvider } from '@/components/legal/LegalLink';
import { MobileAgentBar } from '@/components/property/MobileAgentBar';
import { PropertyCard, type PropertyCardLabels } from '@/components/property/PropertyCard';

const PROPERTY_ID = '11111111-1111-4111-8111-111111111111';
const AGENT_ID = '22222222-2222-4222-8222-222222222222';
const PRIVACY_ID = '33333333-3333-4333-8333-333333333333';

const labels: PropertyCardLabels = {
  bedrooms: (count) => `${String(count)} bed`,
  perMonth: '/mo',
  badge: (key) => key,
  transaction: (key) => key,
  propertyType: (key) => key,
};

describe('LegalLink (LI-126)', () => {
  it('links privacy/terms to /pages/{id}', () => {
    render(
      <LegalPageIdsProvider ids={{ privacy: PRIVACY_ID, terms: null }}>
        <LegalLink page="privacy" data-testid="legal-privacy">
          Privacy
        </LegalLink>
      </LegalPageIdsProvider>,
    );
    expect(screen.getByTestId('legal-privacy')).toHaveAttribute('href', `/pages/${PRIVACY_ID}`);
  });

  it('renders plain text, not a dead link, when the page id is unknown', () => {
    render(
      <LegalPageIdsProvider ids={{ privacy: null, terms: null }}>
        <LegalLink page="terms" data-testid="legal-terms">
          Terms
        </LegalLink>
      </LegalPageIdsProvider>,
    );
    const node = screen.getByTestId('legal-terms');
    expect(node).toHaveTextContent('Terms');
    expect(node.tagName).not.toBe('A');
    expect(node).not.toHaveAttribute('href');
  });

  it('renders plain text without a provider', () => {
    render(<LegalLink page="privacy">Privacy</LegalLink>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('PropertyCard (LI-126)', () => {
  it('links to /properties/{id}, never to the slug', () => {
    const property = {
      id: PROPERTY_ID,
      slug: 'demo-flat',
      title: 'Demo flat',
      coverUrl: null,
      price: 100000,
      currency: 'EUR',
      areaSqm: 80,
      bedrooms: 2,
      transactionType: 'sale',
      propertyType: 'apartment',
      badges: [],
    } as unknown as PublicPropertyListItem;

    render(<PropertyCard property={property} locale="bg" labels={labels} />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe(`/properties/${PROPERTY_ID}`);
    expect(hrefs.join()).not.toContain('demo-flat');
  });
});

describe('MobileAgentBar (LI-126)', () => {
  it('links the agent to /team/{id}', () => {
    render(<MobileAgentBar phoneDigits="359888000111" agentName="Agent" agentId={AGENT_ID} />);
    expect(screen.getByTestId('mobile-agent-profile-link')).toHaveAttribute(
      'href',
      `/team/${AGENT_ID}`,
    );
  });

  it('shows no profile link (and never /team/undefined) without an agent id', () => {
    render(<MobileAgentBar phoneDigits="359888000111" agentName="Agent" agentId={null} />);
    expect(screen.queryByTestId('mobile-agent-profile-link')).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain('undefined');
    }
  });
});
