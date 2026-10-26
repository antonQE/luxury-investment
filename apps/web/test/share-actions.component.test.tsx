// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import { ShareActions } from '@/components/property/ShareActions';

describe('ShareActions', () => {
  it('copies the link and shows feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ShareActions url="https://example.com/p" title="Demo" />);
    fireEvent.click(screen.getByTestId('share-copy'));

    await waitFor(() => {
      expect(screen.getByTestId('share-copy')).toHaveTextContent('copied');
    });
    expect(writeText).toHaveBeenCalledWith('https://example.com/p');
  });
});
