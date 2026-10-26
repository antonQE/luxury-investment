import { expect, type Page } from '@playwright/test';

import { consentElements } from './consent.elements.ts';

export class ConsentPage {
  constructor(private readonly page: Page) {}

  async acceptAllIfVisible() {
    const banner = this.page.getByTestId(consentElements.banner);
    if (await banner.isVisible().catch(() => false)) {
      await this.page.getByTestId(consentElements.acceptAll).click();
      await expect(banner).toHaveCount(0);
    }
  }

  async acceptAll() {
    await expect(this.page.getByTestId(consentElements.banner)).toBeVisible();
    await this.page.getByTestId(consentElements.acceptAll).click();
    await expect(this.page.getByTestId(consentElements.banner)).toHaveCount(0);
  }

  async reopenFromFooter() {
    await this.page.getByTestId(consentElements.settings).click();
    await expect(this.page.getByTestId(consentElements.banner)).toBeVisible();
  }
}
