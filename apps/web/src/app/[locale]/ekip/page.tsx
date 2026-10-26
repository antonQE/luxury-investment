import type { PublicTeamMember } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchTeam } from '@/lib/api/team';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Team');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/ekip',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function TeamPage() {
  const t = await getTranslations('Team');
  const locale = await getLocale();

  let members: PublicTeamMember[] = [];
  let loadError = false;
  try {
    members = await fetchTeam(locale);
  } catch {
    loadError = true;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16" data-testid="team-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t('lead')}</p>

      {loadError ? (
        <p className="mt-10 text-ink-soft" data-testid="team-error">
          {t('error')}
        </p>
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.id}>
              <Link
                href={`/ekip/${member.slug}`}
                className="group block border border-line bg-paper transition hover:border-brass"
                data-testid={`team-card-${member.slug}`}
              >
                {member.photoUrl !== null ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote demo URLs
                  <img src={member.photoUrl} alt="" className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/5] w-full bg-void/5" />
                )}
                <div className="p-5">
                  <h2 className="font-serif text-2xl group-hover:text-brass-dark">{member.name}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{member.role}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
