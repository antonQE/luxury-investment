import { expect, type Page } from '@playwright/test';

import { homeElements } from './home.elements.ts';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(localePath = '/') {
    await this.page.goto(localePath);
  }

  async expectBrandShell() {
    await expect(this.page.getByTestId(homeElements.logo)).toBeVisible();
    await expect(this.page.getByTestId(homeElements.hero)).toBeVisible();
    await expect(this.page.getByTestId(homeElements.markets)).toBeVisible();
    await expect(this.page.getByTestId(homeElements.searchForm)).toBeVisible();
  }
}
