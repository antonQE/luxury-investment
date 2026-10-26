const STYLES: Record<string, string> = {
  new: 'bg-brass/95 text-void',
  exclusive: 'bg-void/80 text-stone ring-1 ring-brass/50',
  investment: 'bg-stone/90 text-ink ring-1 ring-brass/35',
};

export function PropertyBadge({ badge, label }: { badge: string; label: string }) {
  const style = STYLES[badge] ?? 'bg-void/75 text-stone backdrop-blur-sm';

  return (
    <li
      className={`px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase transition duration-300 ${style}`}
      data-testid={`property-badge-${badge}`}
    >
      {label}
    </li>
  );
}
