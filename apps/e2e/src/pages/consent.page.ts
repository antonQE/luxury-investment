import { expect, type Page } from '@playwright/test';

import { consentElements } from './consent.elements.ts';

export class ConsentPage {
  constructor(private readonly page: Page) {}

  async acceptAllIfVisible() {
    const banner = this.page.getByTestId(consentElements.banner);
    if (await banner.isVisible().catch(() => false)) {
      // Force: on narrow viewports the sticky mobile agent bar / overlays can sit over the CTA.
      await this.page.getByTestId(consentElements.acceptAll).click({ force: true });
      await expect(banner).toHaveCount(0);
    }
  }

  async acceptAll() {
    await expect(this.page.getByTestId(consentElements.banner)).toBeVisible();
    await this.page.getByTestId(consentElements.acceptAll).click({ force: true });
    await expect(this.page.getByTestId(consentElements.banner)).toHaveCount(0);
  }

  async reopenFromFooter() {
    await this.page.getByTestId(consentElements.settings).scrollIntoViewIfNeeded();
    await this.page.getByTestId(consentElements.settings).click({ force: true });
    await expect(this.page.getByTestId(consentElements.banner)).toBeVisible();
  }
}
