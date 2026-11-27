'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
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
    return (
      <div className="aspect-[16/10] overflow-hidden" data-testid="property-gallery-empty">
        <MediaPlaceholder />
      </div>
    );
  }

  const lightbox =
    lightboxOpen && portalReady
      ? createPortal(
          <div
            className="animate-fade-in fixed inset-0 z-[200] flex flex-col bg-void/96 backdrop-blur-md"
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
                          ? 'gallery-slide absolute inset-0 opacity-100'
                          : 'gallery-slide pointer-events-none absolute inset-0 opacity-0'
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
                    className="absolute top-1/2 left-2 flex size-12 -translate-y-1/2 items-center justify-center border border-stone/25 text-stone transition hover:border-stone hover:bg-stone/10 md:left-4"
                    aria-label={t('prevImage')}
                    data-testid="gallery-lightbox-prev"
                    onClick={goPrev}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="size-5"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5 7.5 12l7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 flex size-12 -translate-y-1/2 items-center justify-center border border-stone/25 text-stone transition hover:border-stone hover:bg-stone/10 md:right-4"
                    aria-label={t('nextImage')}
                    data-testid="gallery-lightbox-next"
                    onClick={goNext}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="size-5"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 5l7 7-7 7" />
                    </svg>
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
        className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-void text-left sm:aspect-[16/10] lg:aspect-[16/9]"
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
                active
                  ? 'gallery-slide absolute inset-0 translate-y-0 scale-100 opacity-100'
                  : 'gallery-slide pointer-events-none absolute inset-0 translate-y-1 scale-[1.03] opacity-0'
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
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void/55 to-transparent"
            aria-hidden
          />
          <p className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-3 text-[11px] tracking-[0.24em] text-stone">
            <span className="h-px w-6 bg-brass" aria-hidden />
            {t('galleryCounter', {
              current: String(index + 1),
              total: String(images.length),
            })}
          </p>
          <button
            type="button"
            className="absolute top-1/2 left-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-stone/30 text-stone transition duration-300 hover:border-stone hover:bg-void/40"
            aria-label={t('prevImage')}
            data-testid="gallery-prev"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            onKeyDown={onInlineKeyDown}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="size-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5 7.5 12l7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-stone/30 text-stone transition duration-300 hover:border-stone hover:bg-void/40"
            aria-label={t('nextImage')}
            data-testid="gallery-next"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            onKeyDown={onInlineKeyDown}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="size-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : null}
      {lightbox}
    </div>
  );
}
