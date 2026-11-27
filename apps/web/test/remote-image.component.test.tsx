// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, onError, ...rest }: { alt: string; onError?: () => void; src: string }) => (
    <img alt={alt} data-testid="next-image-stub" onError={onError} src={rest.src} />
  ),
}));

import { RemoteImage } from '@/components/ui/RemoteImage';

describe('RemoteImage', () => {
  it('swaps to MediaPlaceholder when the image fails to load', () => {
    render(<RemoteImage src="https://example.com/broken.jpg" alt="Listing" fill />);
    expect(screen.getByTestId('next-image-stub')).toBeInTheDocument();
    fireEvent.error(screen.getByTestId('next-image-stub'));
    expect(screen.getByTestId('remote-image-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image-stub')).not.toBeInTheDocument();
  });
});
