// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';

describe('MediaPlaceholder', () => {
  it('renders the animated boutique shell', () => {
    render(<MediaPlaceholder />);
    expect(screen.getByTestId('media-placeholder')).toBeInTheDocument();
    expect(screen.getByText('LI')).toBeInTheDocument();
  });

  it('can show a label instead of the mark', () => {
    render(<MediaPlaceholder label="No photo yet" testId="custom-ph" />);
    expect(screen.getByTestId('custom-ph')).toHaveAttribute('aria-label', 'No photo yet');
    expect(screen.getByText('No photo yet')).toBeInTheDocument();
  });
});
