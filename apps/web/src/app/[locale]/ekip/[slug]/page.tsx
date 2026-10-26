import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { ApiError } from '@/lib/api/client';
import { fetchTeamMember } from '@/lib/api/team';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  try {
    const member = await fetchTeamMember(locale, slug);
    return buildPageMetadata({
      locale,
      path: `/ekip/${slug}`,
      title: member.name,
      description: member.role,
    });
  } catch {
    const t = await getTranslations('Team');
    return buildPageMetadata({
      locale,
      path: `/ekip/${slug}`,
      title: t('notFound'),
      description: t('lead'),
    });
  }
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations('Team');
  const locale = await getLocale();

  let member;
  try {
    member = await fetchTeamMember(locale, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16" data-testid="team-member-page">
      <Link
        href="/ekip"
        className="text-sm tracking-wide uppercase text-brass-dark transition hover:text-brass"
      >
        {t('back')}
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[280px_1fr]">
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
    </main>
  );
}
