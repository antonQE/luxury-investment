/** Server-rendered JSON-LD. Content is built from our serializers, not raw HTML. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml -- structured data only
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
