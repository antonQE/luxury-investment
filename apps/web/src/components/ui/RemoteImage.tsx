'use client';

import Image from 'next/image';
import { useState } from 'react';

import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';

interface RemoteImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * next/image wrapper for remote listing/media URLs (Unsplash, WP host, local API media).
 * On load failure, shows the boutique MediaPlaceholder instead of a broken image.
 */
export function RemoteImage({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
  fill = false,
  width,
  height,
}: RemoteImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (fill) {
      return <MediaPlaceholder className={className} testId="remote-image-fallback" />;
    }
    return (
      <div
        className={className}
        style={{ width: width ?? 1600, height: height ?? 1200, maxWidth: '100%' }}
        data-testid="remote-image-fallback"
      >
        <MediaPlaceholder />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        quality={75}
        onError={() => {
          setFailed(true);
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1600}
      height={height ?? 1200}
      sizes={sizes}
      priority={priority}
      className={className}
      quality={75}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
