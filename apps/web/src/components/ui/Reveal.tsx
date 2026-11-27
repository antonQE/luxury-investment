'use client';

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef } from 'react';

type RevealTag = 'div' | 'li' | 'section' | 'article' | 'p' | 'h2' | 'ul' | 'ol' | 'header';

/**
 * Soft fade + rise when the block scrolls into view. Pure CSS does the animation
 * (see `.reveal` in globals.css); only blocks that start below the fold are hidden first.
 * Reduced motion and no-JS show the content immediately via CSS.
 */
export function Reveal({
  as = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}: {
  as?: RevealTag;
  /** Stagger offset in ms. */
  delay?: number;
  className?: string;
  children: ReactNode;
  'data-testid'?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Same props for every tag; typed as 'div' so the ref type stays simple.
  const Component = as as 'div';

  // Layout effect: decide before the first paint so nothing in view ever flashes.
  useLayoutEffect(() => {
    const node = ref.current;
    if (node === null || typeof IntersectionObserver === 'undefined') return;

    // Already on screen (or above it): stay visible, no animation, no flash.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) return;

    node.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            delete node.dataset.reveal;
            observer.disconnect();
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      delete node.dataset.reveal;
    };
  }, []);

  const style: CSSProperties & Record<'--reveal-delay', string> = {
    '--reveal-delay': `${String(delay)}ms`,
  };

  return (
    <Component ref={ref} className={`reveal ${className}`} style={style} {...rest}>
      {children}
    </Component>
  );
}
