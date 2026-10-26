'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { RemoteImage } from '@/components/ui/RemoteImage';

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations('Property');
  const [index, setIndex] = useState(0);
  const current = images[index];

  const goPrev = useCallback(() => {
    setIndex((value) => (value === 0 ? images.length - 1 : value - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((value) => (value === images.length - 1 ? 0 : value + 1));
  }, [images.length]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  }

  if (current === undefined) {
    return <div className="aspect-[16/10] bg-line" data-testid="property-gallery-empty" />;
  }

  return (
    <div
      className="relative"
      data-testid="property-gallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('gallery')}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-line">
        <RemoteImage
          src={current}
          alt={`${title} (${String(index + 1)}/${String(images.length)})`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority={index === 0}
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <>
          <p className="absolute bottom-3 left-3 bg-void/75 px-2 py-1 text-xs tracking-wide text-stone">
            {t('galleryCounter', { current: index + 1, total: images.length })}
          </p>
          <button
            type="button"
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-void/70 px-3 py-2 text-stone transition hover:bg-void"
            aria-label={t('prevImage')}
            data-testid="gallery-prev"
            onClick={goPrev}
            onKeyDown={onKeyDown}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-void/70 px-3 py-2 text-stone transition hover:bg-void"
            aria-label={t('nextImage')}
            data-testid="gallery-next"
            onClick={goNext}
            onKeyDown={onKeyDown}
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
