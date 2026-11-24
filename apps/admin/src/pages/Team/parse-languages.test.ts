import { describe, expect, it } from 'vitest';

import { parseLanguagesCsv } from './TeamList';

describe('parseLanguagesCsv', () => {
  it('splits, trims and drops empty segments', () => {
    expect(parseLanguagesCsv('bg, en, de')).toEqual(['bg', 'en', 'de']);
    expect(parseLanguagesCsv('  bg , , en  ')).toEqual(['bg', 'en']);
    expect(parseLanguagesCsv('')).toEqual([]);
    expect(parseLanguagesCsv('   ')).toEqual([]);
  });
});
