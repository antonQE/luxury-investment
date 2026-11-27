/**
 * Animated boutique placeholder when a listing/article/portrait has no photo.
 * CSS-only motion; quiet when prefers-reduced-motion.
 */
export function MediaPlaceholder({
  label,
  className = '',
  testId = 'media-placeholder',
}: {
  label?: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`media-placeholder relative flex size-full items-center justify-center overflow-hidden bg-void ${className}`}
      data-testid={testId}
      aria-hidden={label === undefined}
      role={label !== undefined ? 'img' : undefined}
      aria-label={label}
    >
      <span className="media-placeholder__glow" />
      <span className="media-placeholder__orb media-placeholder__orb--a" />
      <span className="media-placeholder__orb media-placeholder__orb--b" />
      <span className="media-placeholder__frame" />
      <span className="media-placeholder__diamond" />
      {label !== undefined && label !== '' ? (
        <span className="relative z-10 max-w-[85%] px-4 text-center font-serif text-sm leading-snug text-stone/80 md:text-base">
          {label}
        </span>
      ) : (
        <span className="media-placeholder__mark relative z-10" aria-hidden>
          LI
        </span>
      )}
    </div>
  );
}
