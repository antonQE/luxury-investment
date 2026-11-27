import type { ReactNode } from 'react';

/**
 * Dark page-opening band for content pages: eyebrow, serif title, one line of lead,
 * brass hairline. Same language as the home hero, without the photograph.
 * Optional `media` (an <img>/<Image>) sits behind a scrim for pages that have a real photo.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  leadTestId,
  media,
  tall = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  leadTestId?: string;
  media?: ReactNode;
  tall?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero" data-testid="page-hero">
      {media !== undefined ? (
        <>
          <div className="absolute inset-0 -z-20">{media}</div>
          <div className="hero-scrim absolute inset-0 -z-10" aria-hidden />
        </>
      ) : null}
      <div
        className={`mx-auto max-w-6xl px-6 ${
          tall ? 'pt-24 pb-20 md:pt-36 md:pb-28' : 'pt-16 pb-16 md:pt-24 md:pb-20'
        }`}
      >
        {eyebrow !== undefined ? (
          <p className="text-[11px] tracking-[0.24em] uppercase text-brass">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] text-stone md:text-[3.5rem]">
          {title}
        </h1>
        {lead !== undefined ? (
          <p className="mt-5 max-w-2xl text-base text-stone/70 md:text-lg" data-testid={leadTestId}>
            {lead}
          </p>
        ) : null}
        {children !== undefined ? <div className="mt-8">{children}</div> : null}
        <span className="brass-rule mt-10 max-w-md md:mt-12" aria-hidden />
      </div>
    </section>
  );
}
