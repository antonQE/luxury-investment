import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Contact');
  return { title: t('title'), description: t('lead') };
}

export default async function ContactPage() {
  const t = await getTranslations('Contact');
  const nav = await getTranslations('Nav');
  const footer = await getTranslations('Footer');

  return (
    <main className="mx-auto max-w-3xl px-6 py-16" data-testid="contact-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t('lead')}</p>
      <dl className="mt-10 space-y-6">
        <div>
          <dt className="text-xs tracking-[0.2em] uppercase text-gold">{t('office')}</dt>
          <dd className="mt-2">{footer('address')}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-[0.2em] uppercase text-gold">{t('phone')}</dt>
          <dd className="mt-2">
            <a href="tel:+35920000000" className="hover:text-gold-dark" data-testid="contact-phone">
              {nav('phone')}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-[0.2em] uppercase text-gold">{t('email')}</dt>
          <dd className="mt-2">
            <a
              href="mailto:hello@example.com"
              className="hover:text-gold-dark"
              data-testid="contact-email"
            >
              {footer('email')}
            </a>
          </dd>
        </div>
      </dl>
    </main>
  );
}
