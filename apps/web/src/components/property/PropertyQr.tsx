import 'server-only';

import { getTranslations } from 'next-intl/server';
import QRCode from 'qrcode';

export async function PropertyQr({ url }: { url: string }) {
  const t = await getTranslations('Property');
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 140,
    color: { dark: '#14161c', light: '#fffcf7' },
  });

  return (
    <figure className="mt-6 inline-block text-center" data-testid="property-qr">
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL from server QR generator */}
      <img
        src={dataUrl}
        alt={t('qrAlt')}
        width={140}
        height={140}
        className="mx-auto border border-line"
      />
      <figcaption className="mt-2 text-xs text-ink-soft">{t('qrCaption')}</figcaption>
    </figure>
  );
}
