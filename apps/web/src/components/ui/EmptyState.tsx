import type { ReactNode } from 'react';

/**
 * Boutique empty / no-results block — calm serif headline, brass hairline,
 * soft supporting line. Not an error panel.
 */
export function EmptyState({
  title,
  hint,
  action,
  testId,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  testId?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center md:py-24"
      data-testid={testId}
    >
      <span className="mb-8 h-px w-12 bg-brass" aria-hidden />
      <p className="font-serif text-2xl leading-snug text-ink md:text-[1.85rem]">{title}</p>
      {hint !== undefined && hint !== '' ? (
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">{hint}</p>
      ) : null}
      {action !== undefined ? <div className="mt-8">{action}</div> : null}
      {children !== undefined ? <div className="mt-10 w-full text-left">{children}</div> : null}
    </div>
  );
}
