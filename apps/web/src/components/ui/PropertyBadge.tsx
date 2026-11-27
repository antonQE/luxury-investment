/**
 * Quiet label over a listing photo: small caps text with a brass tick, no coloured chip.
 * Legibility comes from the soft top scrim the card draws behind the label row.
 */
const MARKER: Record<string, string> = {
  new: 'bg-brass',
  exclusive: 'bg-stone',
  investment: 'bg-stone/60',
};

export function PropertyBadge({ badge, label }: { badge: string; label: string }) {
  const marker = MARKER[badge] ?? 'bg-stone/60';

  return (
    <li
      className="flex items-center gap-2 text-[10px] leading-none tracking-[0.22em] uppercase text-stone"
      data-testid={`property-badge-${badge}`}
    >
      <span className={`h-px w-3 ${marker}`} aria-hidden />
      {label}
    </li>
  );
}
