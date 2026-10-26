// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values === undefined ? key : `${key}:${JSON.stringify(values)}`,
}));

vi.mock('@/components/ui/RemoteImage', () => ({
  RemoteImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import { PropertyGallery } from '@/components/property/PropertyGallery';

describe('PropertyGallery', () => {
  it('renders empty state without images', () => {
    render(<PropertyGallery images={[]} title="Empty" />);
    expect(screen.getByTestId('property-gallery-empty')).toBeInTheDocument();
  });

  it('moves next/prev and responds to arrow keys', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery images={['/a.jpg', '/b.jpg']} title="Home" />);

    expect(screen.getByAltText('Home (1/2)')).toBeInTheDocument();
    await user.click(screen.getByTestId('gallery-next'));
    expect(screen.getByAltText('Home (2/2)')).toBeInTheDocument();

    await user.click(screen.getByTestId('gallery-prev'));
    expect(screen.getByAltText('Home (1/2)')).toBeInTheDocument();

    screen.getByTestId('gallery-next').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByAltText('Home (2/2)')).toBeInTheDocument();
  });
});
