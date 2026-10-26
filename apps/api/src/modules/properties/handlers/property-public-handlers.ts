import {
  DEFAULT_LOCALE,
  type Locale,
  localeSchema,
  propertyListQuerySchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import { convertPrice, type FxRateQuote } from '../../exchange-rates/app/convert-price.ts';
import type { ExchangeRatesRepo } from '../../exchange-rates/repo/exchange-rates-repo.ts';
import type { MediaService } from '../../media/app/media-service.ts';
import type { PropertyRepo } from '../repo/property-repo.ts';
import type { PropertyRow } from '../repo/property-repo.ts';
import {
  serializeProperty,
  serializePropertyListItem,
} from '../serializers/property-public-serializer.ts';

const localeQuery = z.object({
  lang: localeSchema.optional(),
  displayCurrency: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim().toUpperCase() : undefined,
    z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
  ),
});
const slugParams = z.object({ slug: z.string().min(1) });

function localeFrom(lang: Locale | undefined): Locale {
  return lang ?? DEFAULT_LOCALE;
}

async function loadQuotes(repo: ExchangeRatesRepo | undefined): Promise<FxRateQuote[]> {
  if (repo === undefined) return [];
  const rows = await repo.listLatest();
  return rows.map((row) => ({
    baseCurrency: row.baseCurrency,
    quoteCurrency: row.quoteCurrency,
    rate: Number(row.rate),
    asOf: row.asOf,
    source: row.source,
  }));
}

function equivalentFor(
  row: PropertyRow,
  displayCurrency: string | undefined,
  quotes: FxRateQuote[],
) {
  if (displayCurrency === undefined) return null;
  return convertPrice(Number(row.price), row.currency, displayCurrency, quotes);
}

async function imageUrlsFor(
  media: MediaService | undefined,
  row: PropertyRow,
): Promise<string[] | undefined> {
  if (media === undefined) return undefined;
  const assets = await media.listPublicForProperty(row.id);
  if (assets.length === 0) return undefined;
  const ordered = [
    ...assets.filter((asset) => asset.isPrimary),
    ...assets.filter((asset) => !asset.isPrimary),
  ];
  return ordered.map((asset) => media.urlFor(asset.id, 'web'));
}

export function propertyPublicRouter(
  repo: PropertyRepo,
  media?: MediaService,
  exchangeRates?: ExchangeRatesRepo,
): Router {
  const router = Router();

  router.get(
    '/properties',
    withValidation(
      { query: propertyListQuerySchema.and(localeQuery) },
      async ({ query }, _req, res) => {
        const quotes = await loadQuotes(exchangeRates);
        const { items, total } = await repo.getPage(query);
        const locale = localeFrom(query.lang);
        const data = items.map((row) =>
          serializePropertyListItem(row, locale, {
            priceEquivalent: equivalentFor(row, query.displayCurrency, quotes),
          }),
        );
        res.json({
          data,
          total,
          offset: query.offset,
          limit: query.limit,
        });
      },
    ),
  );

  router.get(
    '/properties/:slug',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const row = await repo.getBySlug(params.slug);
        if (row === undefined) throw new AppError('NOT_FOUND');
        const quotes = await loadQuotes(exchangeRates);
        res.json({
          data: serializeProperty(row, localeFrom(query.lang), {
            imageUrls: await imageUrlsFor(media, row),
            priceEquivalent: equivalentFor(row, query.displayCurrency, quotes),
          }),
        });
      },
    ),
  );

  router.get(
    '/properties/:slug/similar',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const row = await repo.getBySlug(params.slug);
        if (row === undefined) throw new AppError('NOT_FOUND');
        const similar = await repo.findSimilar(row);
        const locale = localeFrom(query.lang);
        const quotes = await loadQuotes(exchangeRates);
        res.json({
          data: similar.map((item) =>
            serializePropertyListItem(item, locale, {
              priceEquivalent: equivalentFor(item, query.displayCurrency, quotes),
            }),
          ),
        });
      },
    ),
  );

  return router;
}
