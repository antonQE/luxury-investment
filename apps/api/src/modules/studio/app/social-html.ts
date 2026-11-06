import type { BrochureElementToggles, SocialBadgePreset } from '@luxury-investment/shared';

import type { BrochurePropertySnapshot } from './brochure-html.ts';

const BADGE_LABEL: Record<Exclude<SocialBadgePreset, ''>, { bg: string; en: string }> = {
  new: { bg: 'Нова оферта', en: 'New listing' },
  exclusive: { bg: 'Ексклузив', en: 'Exclusive' },
  price_reduced: { bg: 'Намалена цена', en: 'Price reduced' },
  sold: { bg: 'Продаден', en: 'Sold' },
  investment: { bg: 'Инвестиция', en: 'Investment' },
};

function esc(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Fixed-size social card HTML (MEDIA-006). Catalog fields only. */
export function buildSocialHtml(input: {
  property: BrochurePropertySnapshot;
  toggles: BrochureElementToggles;
  badgePreset: SocialBadgePreset;
  size: { width: number; height: number };
  brandName?: string;
}): string {
  const { property, toggles, badgePreset, size } = input;
  const brand = input.brandName ?? 'Luxury Investment';
  const title = property.locale === 'en' ? property.titleEn : property.titleBg;
  const location = [property.city, property.district].filter(Boolean).join(', ');
  const cover = property.imageUrls[0] ?? '';
  const priceLabel = `${property.price} ${property.currency}`;
  const badge =
    badgePreset === ''
      ? null
      : property.locale === 'en'
        ? BADGE_LABEL[badgePreset].en
        : BADGE_LABEL[badgePreset].bg;

  return `<!DOCTYPE html>
<html lang="${property.locale}">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: ${String(size.width)}px; height: ${String(size.height)}px; overflow: hidden; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #f7f4ec;
      background: #1a1814;
      position: relative;
    }
    .bg {
      position: absolute; inset: 0;
      background: ${cover !== '' ? `center/cover no-repeat url("${esc(cover)}")` : '#2a261f'};
      filter: brightness(0.55);
    }
    .panel {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 48px;
      background: linear-gradient(180deg, transparent 35%, rgba(12,10,8,0.92) 78%);
    }
    .brand { font-size: 18px; letter-spacing: 0.22em; text-transform: uppercase; color: #d4c48a; margin-bottom: 18px; }
    .badge {
      align-self: flex-start; margin-bottom: 16px;
      border: 1px solid #d4c48a; padding: 6px 14px; font-size: 16px; letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 { font-size: 42px; line-height: 1.15; margin: 0 0 14px; font-weight: 500; }
    .meta { font-size: 22px; opacity: 0.9; margin: 4px 0; }
    .price { font-size: 34px; margin-top: 18px; color: #f0e6c8; }
    .contact { margin-top: 22px; font-size: 20px; opacity: 0.85; }
  </style>
</head>
<body>
  <div class="bg"></div>
  <div class="panel">
    ${toggles.logo ? `<div class="brand">${esc(brand)}</div>` : ''}
    ${badge !== null && toggles.badges ? `<div class="badge">${esc(badge)}</div>` : ''}
    <h1>${esc(title)}</h1>
    ${toggles.location && location !== '' ? `<p class="meta">${esc(location)}</p>` : ''}
    ${toggles.area ? `<p class="meta">${esc(property.area)} m²</p>` : ''}
    ${toggles.referenceNumber ? `<p class="meta">Ref. ${esc(property.referenceNumber)}</p>` : ''}
    ${toggles.price ? `<p class="price">${esc(priceLabel)}</p>` : ''}
    ${
      toggles.contact
        ? `<p class="contact">${esc(property.agentName)} · ${esc(property.agentPhone)}</p>`
        : ''
    }
  </div>
</body>
</html>`;
}
