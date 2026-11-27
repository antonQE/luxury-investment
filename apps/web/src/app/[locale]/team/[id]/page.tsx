import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGrid } from '@/components/property/PropertyGrid';
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
    <main className="mx-auto max-w-6xl px-6 py-16" data-testid="team-member-page">
      <Link
        href="/team"
        className="text-sm tracking-wide uppercase text-brass-dark transition hover:text-brass"
      >
        {t('back')}
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[280px_1fr] md:max-w-4xl">
        {member.photoUrl !== null ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote demo URLs
          <img
            src={member.photoUrl}
            alt=""
            className="aspect-[4/5] w-full object-cover"
            data-testid="team-member-photo"
          />
        ) : null}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-brass">{member.kind}</p>
          <h1 className="mt-2 font-serif text-4xl">{member.name}</h1>
          <p className="mt-2 text-lg text-ink-soft">{member.role}</p>
          <p className="mt-6 leading-relaxed">{member.bio}</p>
          {member.qualifications !== null ? (
            <p className="mt-4 text-sm text-ink-soft" data-testid="team-qualifications">
              {t('qualifications')}: {member.qualifications}
            </p>
          ) : null}
          <dl className="mt-8 space-y-3 text-sm">
            {member.email !== null ? (
              <div>
                <dt className="text-ink-soft">{t('email')}</dt>
                <dd>
                  <a href={`mailto:${member.email}`} className="hover:text-brass-dark">
                    {member.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {member.phone !== null ? (
              <div>
                <dt className="text-ink-soft">{t('phone')}</dt>
                <dd>
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
        </div>
      </div>

      <section className="mt-20 border-t border-line pt-14" data-testid="team-member-listings">
        <div className="mb-10 max-w-4xl">
          <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('listingsTitle')}</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">{t('listingsLead')}</h2>
        </div>
        {listings === null ? (
          <p className="text-ink-soft" data-testid="team-member-listings-error">
            {t('listingsError')}
          </p>
        ) : listings.data.length === 0 ? (
          <p className="text-ink-soft" data-testid="team-member-listings-empty">
            {t('listingsEmpty')}
          </p>
        ) : (
          <PropertyGrid items={listings.data} />
        )}
      </section>
    </main>
  );
}
