import { describe, expect, it } from 'vitest';

import { stripHtml } from '../../src/modules/migration/wxr-parse.ts';

describe('stripHtml', () => {
  it('keeps paragraph breaks from block tags and br', () => {
    const html =
      '<p>Първи абзац.</p><p>Втори абзац.</p><p>Ред едно<br />Ред две</p><ul><li>А</li><li>Б</li></ul>';
    expect(stripHtml(html)).toBe('Първи абзац.\n\nВтори абзац.\n\nРед едно\nРед две\n\nА\n\nБ');
  });

  it('does not collapse all whitespace into a single line', () => {
    const html = '<p>Едно</p>\n<p>Две</p>';
    const text = stripHtml(html);
    expect(text).toContain('\n');
    expect(text).not.toBe('Едно Две');
  });

  it('decodes common entities', () => {
    expect(stripHtml('<p>цена &amp; данък&nbsp;&#8212; ок</p>')).toBe('цена & данък — ок');
  });
});
