'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations('Property');
  const [index, setIndex] = useState(0);
  const current = images[index];

  if (current === undefined) {
    return <div className="aspect-[16/10] bg-cream-dark" data-testid="property-gallery-empty" />;
  }

  return (
    <div className="relative" data-testid="property-gallery">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current} alt={title} className="aspect-[16/10] w-full object-cover" />
      {images.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-ink/70 px-3 py-2 text-cream"
            aria-label={t('prevImage')}
            data-testid="gallery-prev"
            onClick={() => {
              setIndex((value) => (value === 0 ? images.length - 1 : value - 1));
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-ink/70 px-3 py-2 text-cream"
            aria-label={t('nextImage')}
            data-testid="gallery-next"
            onClick={() => {
              setIndex((value) => (value === images.length - 1 ? 0 : value + 1));
            }}
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
