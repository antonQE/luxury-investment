import Image from 'next/image';

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
    />
  );
}
