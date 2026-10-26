import type { Database } from '../client.ts';
import { attributesSeed } from './attributes.ts';
import { calculatorsSeed } from './calculators.ts';
import { contactsSeed } from './contacts.ts';
import { contentSeed } from './content.ts';
import { crmTasksSeed } from './crm-tasks.ts';
import { dealsSeed } from './deals.ts';
import { documentsSeed } from './documents.ts';
import { exchangeRatesSeed } from './exchange-rates.ts';
import { inquiriesSeed } from './inquiries.ts';
import { locationsSeed } from './locations.ts';
import { marketingSeed } from './marketing.ts';
import { offersSeed } from './offers.ts';
import { propertiesSeed } from './properties.ts';
import { taxonomiesSeed } from './taxonomies.ts';
import { teamSeed } from './team.ts';
import { usersSeed } from './users.ts';
import { viewingsSeed } from './viewings.ts';

export interface SeedModule {
  name: string;
  /** Must be idempotent: running it twice leaves the same data. */
  run: (db: Database) => Promise<void>;
}

/** Seed modules in the order they run. Reference data first, then content that points to it. */
export const SEED_MODULES: SeedModule[] = [
  usersSeed,
  locationsSeed,
  taxonomiesSeed,
  attributesSeed,
  teamSeed,
  propertiesSeed,
  marketingSeed,
  contactsSeed,
  inquiriesSeed,
  viewingsSeed,
  crmTasksSeed,
  offersSeed,
  dealsSeed,
  calculatorsSeed,
  exchangeRatesSeed,
  contentSeed,
  documentsSeed,
];
