import { describe, expect, it } from 'vitest';

import { buildUtmUrl } from './marketing.ts';

describe('buildUtmUrl', () => {
  it('appends utm params without dropping the path', () => {
    expect(
      buildUtmUrl('https://example.com/listing/abc', {
        source: 'imotbg',
        medium: 'portal',
        campaign: 'sofia-winter',
        content: 'card',
      }),
    ).toBe(
      'https://example.com/listing/abc?utm_source=imotbg&utm_medium=portal&utm_campaign=sofia-winter&utm_content=card',
    );
  });
});
