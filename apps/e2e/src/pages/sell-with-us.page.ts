import { expect, type Page } from '@playwright/test';

import { sellWithUsElements } from './sell-with-us.elements.ts';

export class SellWithUsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/prodai-s-nas');
  }

  async submitConsultation(input: { name: string; email: string; phone: string; message: string }) {
    await expect(this.page.getByTestId(sellWithUsElements.page)).toBeVisible();
    await this.page.getByTestId(sellWithUsElements.name).fill(input.name);
    await this.page.getByTestId(sellWithUsElements.email).fill(input.email);
    await this.page.getByTestId(sellWithUsElements.phone).fill(input.phone);
    await this.page.getByTestId(sellWithUsElements.message).fill(input.message);
    await this.page.getByTestId(sellWithUsElements.form).locator('input[name="consent"]').check();
    await this.page.getByTestId(sellWithUsElements.submit).click();
    await expect(this.page.getByTestId(sellWithUsElements.success)).toBeVisible();
  }
}
