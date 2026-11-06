import { describe, expect, it } from 'vitest';

import {
  DEMO_SELLERS_LANDING_SLUG,
  LANDING_SECTION_TYPES,
  landingSectionPayloadSchema,
  parseLandingSection,
} from './landings.ts';

describe('landing section payloads', () => {
  it('lists CONTENT-003 section types', () => {
    expect(LANDING_SECTION_TYPES).toContain('hero');
    expect(LANDING_SECTION_TYPES).toContain('cta_form');
    expect(DEMO_SELLERS_LANDING_SLUG).toBe('za-prodavachi');
  });

  it('accepts a hero + benefits + cta_form demo shape', () => {
    const hero = parseLandingSection('hero', {
      headline: { bg: 'Продайте с нас', en: 'Sell with us' },
      subheadline: { bg: 'Демо', en: 'Demo' },
    });
    expect(hero.type).toBe('hero');

    const benefits = landingSectionPayloadSchema.parse({
      type: 'benefits',
      payload: {
        items: [{ title: { bg: 'Опит', en: 'Experience' } }],
      },
    });
    expect(benefits.type).toBe('benefits');
    if (benefits.type === 'benefits') {
      expect(benefits.payload.items).toHaveLength(1);
    }

    const cta = parseLandingSection('cta_form', {
      inquirySource: 'landing_sellers',
      title: { bg: 'Запитване', en: 'Inquiry' },
    });
    expect(cta.type).toBe('cta_form');
    if (cta.type === 'cta_form') {
      expect(cta.payload.inquirySource).toBe('landing_sellers');
    }
  });

  it('rejects unknown section type', () => {
    expect(() => landingSectionPayloadSchema.parse({ type: 'ai_writer', payload: {} })).toThrow();
  });
});
