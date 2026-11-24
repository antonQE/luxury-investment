/** Renders plain text with paragraph breaks (blank lines → separate `<p>`). */
export function PlainTextBody({
  text,
  className = 'mt-8 space-y-4 leading-relaxed text-ink-soft',
  testId,
}: {
  text: string;
  className?: string;
  testId?: string;
}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (paragraphs.length === 0) return null;

  const keys = uniqueKeys(paragraphs);

  return (
    <div className={className} data-testid={testId}>
      {paragraphs.map((paragraph, index) => (
        <p key={keys[index]} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/** Stable keys from content; disambiguate duplicate paragraphs. */
function uniqueKeys(parts: string[]): string[] {
  const seen = new Map<string, number>();
  return parts.map((part) => {
    const count = seen.get(part) ?? 0;
    seen.set(part, count + 1);
    return count === 0 ? part : `${part}#${String(count)}`;
  });
}
