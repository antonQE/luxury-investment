import { type Browser, chromium } from 'playwright';

/**
 * HTML → PDF / PNG via Playwright Chromium (ADR-0013).
 * Lazy-launches a shared browser for the process lifetime.
 */
export class PdfRenderer {
  #browser: Browser | null = null;

  async renderPdf(html: string): Promise<Buffer> {
    const browser = await this.#getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  async renderPng(html: string, size: { width: number; height: number }): Promise<Buffer> {
    const browser = await this.#getBrowser();
    const page = await browser.newPage({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 1,
    });
    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      const png = await page.screenshot({ type: 'png', fullPage: false });
      return Buffer.from(png);
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.#browser !== null) {
      await this.#browser.close();
      this.#browser = null;
    }
  }

  async #getBrowser(): Promise<Browser> {
    if (this.#browser !== null) return this.#browser;

    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    if (executablePath !== undefined && executablePath !== '') {
      this.#browser = await chromium.launch({ headless: true, executablePath });
      return this.#browser;
    }

    try {
      this.#browser = await chromium.launch({ headless: true });
    } catch (bundledError) {
      try {
        this.#browser = await chromium.launch({ headless: true, channel: 'chrome' });
      } catch {
        throw bundledError;
      }
    }
    return this.#browser;
  }
}
