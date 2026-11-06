import type { BrochureElementToggles } from '@luxury-investment/shared';

export interface BrochurePropertySnapshot {
  referenceNumber: string;
  slug: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string;
  descriptionEn: string;
  price: string;
  currency: string;
  city: string;
  district: string | null;
  area: string;
  agentName: string;
  agentPhone: string;
  imageUrls: string[];
  badges: string[];
  locale: 'bg' | 'en';
}

function esc(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Build a print-ready HTML brochure from catalog fields only (ADR-0013). */
export function buildBrochureHtml(input: {
  property: BrochurePropertySnapshot;
  toggles: BrochureElementToggles;
  listingUrl: string;
  qrDataUrl: string | null;
  brandName?: string;
}): string {
  const { property, toggles, listingUrl, qrDataUrl } = input;
  const brand = input.brandName ?? 'Luxury Investment';
  const title = property.locale === 'en' ? property.titleEn : property.titleBg;
  const description = property.locale === 'en' ? property.descriptionEn : property.descriptionBg;
  const location = [property.city, property.district].filter(Boolean).join(', ');
  const photos = property.imageUrls.slice(0, 4);
  const priceLabel = `${property.price} ${property.currency}`;

  return `<!DOCTYPE html>
<html lang="${property.locale}">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; margin: 0; }
    h1 { font-size: 26px; margin: 0 0 8px; letter-spacing: 0.01em; }
    .brand { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a7a4b; margin-bottom: 24px; }
    .meta { font-size: 13px; color: #555; margin: 4px 0; }
    .price { font-size: 22px; margin: 16px 0; }
    .photos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
    .photos img { width: 100%; height: 140px; object-fit: cover; }
    .desc { font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
    .badges span { display: inline-block; border: 1px solid #8a7a4b; padding: 2px 8px; margin-right: 6px; font-size: 11px; }
    .footer { margin-top: 28px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
    .qr img { width: 96px; height: 96px; }
    .url { font-size: 11px; word-break: break-all; color: #444; }
  </style>
</head>
<body>
  ${toggles.logo ? `<div class="brand">${esc(brand)}</div>` : ''}
  <h1>${esc(title)}</h1>
  ${toggles.referenceNumber ? `<p class="meta">Ref. ${esc(property.referenceNumber)}</p>` : ''}
  ${toggles.location && location !== '' ? `<p class="meta">${esc(location)}</p>` : ''}
  ${toggles.area ? `<p class="meta">${esc(property.area)} m²</p>` : ''}
  ${toggles.price ? `<p class="price">${esc(priceLabel)}</p>` : ''}
  ${
    toggles.badges && property.badges.length > 0
      ? `<p class="badges">${property.badges.map((b) => `<span>${esc(b)}</span>`).join('')}</p>`
      : ''
  }
  ${
    toggles.photos && photos.length > 0
      ? `<div class="photos">${photos.map((src) => `<img src="${esc(src)}" alt="" />`).join('')}</div>`
      : ''
  }
  ${toggles.description ? `<div class="desc">${esc(description)}</div>` : ''}
  <div class="footer">
    <div>
      ${
        toggles.contact
          ? `<p class="meta">${esc(property.agentName)} · ${esc(property.agentPhone)}</p>`
          : ''
      }
      <p class="url">${esc(listingUrl)}</p>
    </div>
    ${
      toggles.qr && qrDataUrl !== null
        ? `<div class="qr"><img src="${qrDataUrl}" alt="QR" /></div>`
        : ''
    }
  </div>
</body>
</html>`;
}
