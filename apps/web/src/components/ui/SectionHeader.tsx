import type { ReactNode } from 'react';

import { Reveal } from './Reveal';

/** One-job section opener: brass eyebrow, serif title, optional action on the right. */
export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal className="mb-12 md:mb-14">
      <div className="flex items-end justify-between gap-6 pb-6">
        <div>
          <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-brass">
            <span className="h-px w-8 bg-brass" aria-hidden />
            {eyebrow}
          </p>
          {title !== undefined ? (
            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-[2.5rem]">{title}</h2>
          ) : null}
        </div>
        {action}
      </div>
      <span className="brass-rule bg-line" aria-hidden />
    </Reveal>
  );
}
