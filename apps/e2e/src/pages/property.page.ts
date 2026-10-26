import { expect, type Page } from '@playwright/test';

import { propertyElements } from './property.elements.ts';

export class PropertyPage {
  constructor(private readonly page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/obiavi/${slug}`);
  }

  async expectShell() {
    await expect(this.page.getByTestId(propertyElements.page)).toBeVisible();
    await expect(this.page.getByTestId(propertyElements.gallery)).toBeVisible();
    await expect(this.page.getByTestId(propertyElements.share)).toBeVisible();
    await expect(this.page.getByTestId(propertyElements.print)).toBeVisible();
  }

  async submitInquiry(input: { name: string; email: string; phone: string; message: string }) {
    await this.page.getByTestId(propertyElements.inquiryName).fill(input.name);
    await this.page.getByTestId(propertyElements.inquiryEmail).fill(input.email);
    await this.page.getByTestId(propertyElements.inquiryPhone).fill(input.phone);
    await this.page.getByTestId(propertyElements.inquiryMessage).fill(input.message);
    await this.page.getByTestId(propertyElements.inquiryConsent).check();
    await this.page.getByTestId(propertyElements.inquirySubmit).click();
    await expect(this.page.getByTestId(propertyElements.inquirySuccess)).toBeVisible();
  }
}
