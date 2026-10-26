import { expect, type Page } from '@playwright/test';

import { listingsElements } from './listings.elements.ts';

export class ListingsPage {
  constructor(private readonly page: Page) {}

  async goto(query = '') {
    await this.page.goto(query === '' ? '/obiavi' : `/obiavi?${query}`);
  }

  async filterByCity(city: string) {
    await this.page.getByTestId(listingsElements.filterCity).fill(city);
    await this.page.getByTestId(listingsElements.submit).click();
  }

  async expectUrlContains(fragment: string) {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }

  async openFirstCard() {
    const card = this.page.locator('[data-testid^="property-card-"]').first();
    await expect(card).toBeVisible();
    await card.click();
  }

  async expectEmptyState() {
    await expect(this.page.getByTestId(listingsElements.empty)).toBeVisible();
    await expect(this.page.getByTestId(listingsElements.searchRequestForm)).toBeVisible();
  }
}
