import type { PublicTeamMember } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { PageHero } from '@/components/ui/PageHero';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/navigation';
import { fetchTeam } from '@/lib/api/team';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Team');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/team',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function TeamPage() {
  const t = await getTranslations('Team');
  const meta = await getTranslations('Meta');
  const locale = await getLocale();

  let members: PublicTeamMember[] = [];
  let loadError = false;
  try {
    members = await fetchTeam(locale);
  } catch {
    loadError = true;
  }

  return (
    <main data-testid="team-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        {loadError ? (
          <p className="text-ink-soft" data-testid="team-error">
            {t('error')}
          </p>
        ) : (
          <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:gap-x-14 lg:gap-y-20 xl:grid-cols-2">
            {members.map((member, index) => (
              <Reveal as="li" key={member.id} delay={(index % 2) * 120}>
                <Link
                  href={`/team/${member.id}`}
                  className="group flex flex-col"
                  data-testid={`team-card-${member.slug}`}
                >
                  {member.photoUrl !== null ? (
                    <div className="relative aspect-[3/4] overflow-hidden bg-void/5 shadow-[0_28px_48px_-36px_rgba(20,22,28,0.45)]">
                      <RemoteImage
                        src={member.photoUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover object-top transition duration-[1600ms] ease-out group-hover:scale-[1.025]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/25 via-transparent to-transparent opacity-80 transition duration-700 group-hover:opacity-100" />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] w-full overflow-hidden">
                      <MediaPlaceholder />
                    </div>
                  )}
                  <div className="pt-7">
                    <span
                      className="mb-4 block h-px w-8 bg-brass transition-[width] duration-500 group-hover:w-12"
                      aria-hidden
                    />
                    <h2 className="font-serif text-2xl leading-snug md:text-[1.85rem]">
                      {member.name}
                    </h2>
                    <p className="mt-2 text-sm tracking-wide text-ink-soft">{member.role}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
