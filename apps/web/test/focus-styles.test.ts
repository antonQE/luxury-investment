import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('../src/app/globals.css', import.meta.url)), 'utf8');

/** Returns the body of the first rule whose selector list contains `needle`. */
function ruleBody(needle: string): string {
  const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? [];
  const rule = rules.find((r) => r.split('{')[0]?.includes(needle));
  if (!rule) throw new Error(`No CSS rule found for ${needle}`);
  return rule.slice(rule.indexOf('{') + 1, rule.lastIndexOf('}'));
}

describe('public site focus styles (LI-127)', () => {
  it('keeps the global brass outline for links, buttons and other non-field controls', () => {
    const body = ruleBody(':focus-visible');
    expect(body).toMatch(/outline:\s*1px solid var\(--color-brass\)/);
  });

  it('removes the rectangular outline from text fields, selects and textareas on focus', () => {
    for (const selector of [
      'select:focus',
      'select:focus-visible',
      'textarea:focus',
      'textarea:focus-visible',
    ]) {
      const body = ruleBody(selector);
      expect(body).toMatch(/outline:\s*none/);
    }
  });

  it('strengthens the bottom line with a brass border and a 1px brass underline', () => {
    const body = ruleBody('select:focus');
    expect(body).toMatch(/border-color:\s*var\(--color-brass\)/);
    // Only a downward 1px line: no horizontal offset, no blur or spread box.
    expect(body).toMatch(/box-shadow:\s*0 1px 0 0 var\(--color-brass\)/);
  });

  it('does not strip the outline from checkboxes, radios, buttons, files, ranges', () => {
    const selector = css.slice(css.indexOf('input:not('), css.indexOf('select:focus'));
    for (const type of [
      'checkbox',
      'radio',
      'button',
      'submit',
      'reset',
      'file',
      'range',
      'hidden',
    ]) {
      expect(selector).toContain(`[type='${type}']`);
    }
    // Must be a negated list, never a bare `input:focus` that would hit checkboxes.
    expect(css).not.toMatch(/(^|[\s,}])input:focus(-visible)?\s*[,{]/m);
  });
});
