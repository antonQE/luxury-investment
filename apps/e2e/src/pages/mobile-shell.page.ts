import { expect, type Page } from '@playwright/test';

import { mobileShellElements } from './mobile-shell.elements.ts';

export class MobileShellPage {
  constructor(private readonly page: Page) {}

  async openNav() {
    const toggle = this.page.getByTestId(mobileShellElements.navToggle);
    await expect(toggle).toBeVisible();
    // Force: language switcher / phone icon can overlap the toggle hit-box on narrow phones.
    await toggle.click({ force: true });
    await expect(this.page.getByTestId(mobileShellElements.nav)).toBeVisible();
  }

  async goViaNav(testIdSuffix: string) {
    await this.openNav();
    await this.page.getByTestId(`mobile-nav-${testIdSuffix}`).click();
  }

  async expectAgentBarVisible() {
    const bar = this.page.getByTestId(mobileShellElements.agentBar);
    await expect(bar).toBeVisible();
    await expect(this.page.getByTestId(mobileShellElements.agentCall)).toBeVisible();
    await expect(this.page.getByTestId(mobileShellElements.agentViber)).toBeVisible();
    await expect(this.page.getByTestId(mobileShellElements.agentWhatsapp)).toBeVisible();
  }
}
