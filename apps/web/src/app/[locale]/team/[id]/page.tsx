import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Link } from '@/i18n/navigation';
import { fetchProperties } from '@/lib/api/catalog';
import { ApiError } from '@/lib/api/client';
import { fetchTeamMember } from '@/lib/api/team';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  try {
    const member = await fetchTeamMember(locale, id);
    return buildPageMetadata({
      locale,
      path: `/team/${id}`,
      title: member.name,
      description: member.role,
    });
  } catch {
    const t = await getTranslations('Team');
    return buildPageMetadata({
      locale,
      path: `/team/${id}`,
      title: t('notFound'),
      description: t('lead'),
    });
  }
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('Team');
  const locale = await getLocale();

  let member;
  try {
    member = await fetchTeamMember(locale, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const listings =
    member.phone !== null && member.phone.trim() !== ''
      ? await fetchProperties(locale, { agentPhone: member.phone, limit: '24' }).then(
          (page) => page,
          () => null,
        )
      : { data: [], total: 0, offset: 0, limit: 0 };

  return (
    <main data-testid="team-member-page">
      <PageHero eyebrow={member.kind} title={member.name} lead={member.role} />
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Link
          href="/team"
          className="text-xs tracking-[0.2em] uppercase text-brass-dark transition hover:text-brass"
        >
          {t('back')}
        </Link>
        <div className="mt-10 grid gap-12 md:max-w-5xl md:grid-cols-[minmax(280px,420px)_1fr] md:gap-20">
          {member.photoUrl !== null ? (
            <Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote demo URLs */}
              <img
                src={member.photoUrl}
                alt=""
                className="aspect-[3/4] w-full object-cover object-top shadow-[0_34px_56px_-36px_rgba(20,22,28,0.5)]"
                data-testid="team-member-photo"
              />
            </Reveal>
          ) : null}
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed">{member.bio}</p>
            {member.qualifications !== null ? (
              <p className="mt-5 text-sm text-ink-soft" data-testid="team-qualifications">
                {t('qualifications')}: {member.qualifications}
              </p>
            ) : null}
            <dl className="mt-10 space-y-4 border-t border-brass pt-8 text-sm">
              {member.email !== null ? (
                <div>
                  <dt className="text-[11px] tracking-[0.2em] uppercase text-brass">
                    {t('email')}
                  </dt>
                  <dd className="mt-1 text-base">
                    <a href={`mailto:${member.email}`} className="hover:text-brass-dark">
                      {member.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {member.phone !== null ? (
                <div>
                  <dt className="text-[11px] tracking-[0.2em] uppercase text-brass">
                    {t('phone')}
                  </dt>
                  <dd className="mt-1 text-base">
                    <a
                      href={`tel:${member.phone.replace(/\s/g, '')}`}
                      className="hover:text-brass-dark"
                    >
                      {member.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>

        <section className="mt-24 border-t border-line pt-16" data-testid="team-member-listings">
          <SectionHeader eyebrow={t('listingsTitle')} title={t('listingsLead')} />
          {listings === null ? (
            <p className="text-ink-soft" data-testid="team-member-listings-error">
              {t('listingsError')}
            </p>
          ) : listings.data.length === 0 ? (
            <EmptyState title={t('listingsEmpty')} testId="team-member-listings-empty" />
          ) : (
            <PropertyGrid items={listings.data} />
          )}
        </section>
      </div>
    </main>
  );
}
