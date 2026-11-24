'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { RemoteImage } from '@/components/ui/RemoteImage';

/** Widths that match typical gallery / lightbox `sizes` → `/_next/image` variants. */
const PRELOAD_WIDTHS = [1080, 1920] as const;

function nextImageUrl(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${String(width)}&q=75`;
}

function preloadUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => {
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = url;
  });
}

/** Warm the browser cache for gallery images as soon as the listing page mounts. */
function usePreloadGalleryImages(images: string[]) {
  useEffect(() => {
    if (images.length === 0) return;
    let cancelled = false;

    async function run() {
      // Neighbours of the first slide first (instant next/prev), then the rest.
      const ordered = [
        images[0],
        images[1],
        images[images.length - 1],
        ...images.slice(2, -1),
      ].filter(
        (src, index, list): src is string => src !== undefined && list.indexOf(src) === index,
      );

      for (const src of ordered) {
        if (cancelled) return;
        await Promise.all(PRELOAD_WIDTHS.map((width) => preloadUrl(nextImageUrl(src, width))));
      }
    }

    const scheduleIdle = (cb: () => void): number => {
      if (typeof window.requestIdleCallback === 'function') {
        return window.requestIdleCallback(cb);
      }
      return window.setTimeout(cb, 1);
    };
    const idleId = scheduleIdle(() => {
      void run();
    });

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [images]);
}

function subscribeNoop() {
  return () => undefined;
}

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations('Property');
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const portalReady = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const current = images[index];

  usePreloadGalleryImages(images);

  const mountedIndexes = useMemo(() => {
    if (images.length === 0) return new Set<number>();
    const set = new Set<number>([index]);
    if (images.length > 1) {
      set.add((index - 1 + images.length) % images.length);
      set.add((index + 1) % images.length);
    }
    return set;
  }, [index, images.length]);

  const goPrev = useCallback(() => {
    setIndex((value) => (value === 0 ? images.length - 1 : value - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((value) => (value === images.length - 1 ? 0 : value + 1));
  }, [images.length]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  function onInlineKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
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

  const lightbox =
    lightboxOpen && portalReady
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex flex-col bg-void/95"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid="gallery-lightbox"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-stone md:px-6">
              <p id={titleId} className="truncate text-sm tracking-wide">
                {title}
                <span className="ml-3 text-stone/60">
                  {t('galleryCounter', {
                    current: String(index + 1),
                    total: String(images.length),
                  })}
                </span>
              </p>
              <button
                type="button"
                className="shrink-0 border border-stone/30 px-3 py-1.5 text-xs tracking-[0.18em] uppercase transition hover:border-brass hover:text-brass"
                onClick={closeLightbox}
                data-testid="gallery-lightbox-close"
              >
                {t('closeFullscreen')}
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-16">
              <div className="relative mx-auto h-[min(85vh,56rem)] w-full max-w-6xl">
                {[...mountedIndexes].map((imageIndex) => {
                  const src = images[imageIndex];
                  if (src === undefined) return null;
                  const active = imageIndex === index;
                  return (
                    <div
                      key={`lightbox-${src}`}
                      className={
                        active
                          ? 'absolute inset-0'
                          : 'pointer-events-none absolute inset-0 opacity-0'
                      }
                      aria-hidden={!active}
                    >
                      <RemoteImage
                        src={src}
                        alt={
                          active
                            ? `${title} (${String(imageIndex + 1)}/${String(images.length)})`
                            : ''
                        }
                        fill
                        sizes="100vw"
                        className="object-contain"
                      />
                    </div>
                  );
                })}
              </div>
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-stone/10 px-3 py-2 text-2xl text-stone transition hover:bg-stone/20 md:left-4"
                    aria-label={t('prevImage')}
                    data-testid="gallery-lightbox-prev"
                    onClick={goPrev}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-stone/10 px-3 py-2 text-2xl text-stone transition hover:bg-stone/20 md:right-4"
                    aria-label={t('nextImage')}
                    data-testid="gallery-lightbox-next"
                    onClick={goNext}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className="relative"
      data-testid="property-gallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('gallery')}
    >
      <button
        type="button"
        className="relative aspect-[16/10] w-full overflow-hidden bg-line text-left"
        onClick={() => {
          setLightboxOpen(true);
        }}
        aria-label={t('openFullscreen')}
        data-testid="gallery-open-fullscreen"
      >
        {[...mountedIndexes].map((imageIndex) => {
          const src = images[imageIndex];
          if (src === undefined) return null;
          const active = imageIndex === index;
          return (
            <div
              key={src}
              className={
                active ? 'absolute inset-0' : 'pointer-events-none absolute inset-0 opacity-0'
              }
              aria-hidden={!active}
            >
              <RemoteImage
                src={src}
                alt={active ? `${title} (${String(imageIndex + 1)}/${String(images.length)})` : ''}
                fill
                sizes="(max-width: 1024px) 100vw, 100vw"
                priority={imageIndex === 0}
                className="object-cover"
              />
            </div>
          );
        })}
      </button>
      {images.length > 1 ? (
        <>
          <p className="pointer-events-none absolute bottom-3 left-3 bg-void/75 px-2 py-1 text-xs tracking-wide text-stone">
            {t('galleryCounter', {
              current: String(index + 1),
              total: String(images.length),
            })}
          </p>
          <button
            type="button"
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 bg-void/70 px-3 py-2 text-stone transition hover:bg-void"
            aria-label={t('prevImage')}
            data-testid="gallery-prev"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            onKeyDown={onInlineKeyDown}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 bg-void/70 px-3 py-2 text-stone transition hover:bg-void"
            aria-label={t('nextImage')}
            data-testid="gallery-next"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            onKeyDown={onInlineKeyDown}
          >
            ›
          </button>
        </>
      ) : null}
      {lightbox}
    </div>
  );
}
