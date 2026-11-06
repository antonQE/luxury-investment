import { randomUUID } from 'node:crypto';

import {
  type BrochureElementToggles,
  type BrochureTemplateFormat,
  buildChannelCopySnippets,
  DEFAULT_BROCHURE_TOGGLES,
  DEFAULT_SOCIAL_TOGGLES,
  type GenerateBrochureInput,
  type GenerateSocialAssetInput,
  SOCIAL_FORMAT_SIZE,
  type SocialBadgePreset,
} from '@luxury-investment/shared';
import QRCode from 'qrcode';

import { AppError } from '../../../errors/app-error.ts';
import type { StoragePort } from '../../media/storage/storage-port.ts';
import type { StudioRepo } from '../repo/studio-repo.ts';
import { buildBrochureHtml } from './brochure-html.ts';
import type { PdfRenderer } from './pdf-renderer.ts';
import { buildSocialHtml } from './social-html.ts';

function mergeToggles(
  defaults: Record<string, boolean>,
  overrides: Partial<BrochureElementToggles> | undefined,
  baseDefaults: BrochureElementToggles,
): BrochureElementToggles {
  const base: BrochureElementToggles = { ...baseDefaults, ...defaults };
  if (overrides === undefined) return base;
  return { ...base, ...overrides };
}

function isSocialFormat(format: string): format is Exclude<BrochureTemplateFormat, 'a4_pdf'> {
  return format !== 'a4_pdf' && format in SOCIAL_FORMAT_SIZE;
}

export class BrochureService {
  readonly #repo: StudioRepo;
  readonly #storage: StoragePort;
  readonly #renderer: PdfRenderer;
  readonly #publicSiteUrl: string;

  constructor(
    repo: StudioRepo,
    storage: StoragePort,
    renderer: PdfRenderer,
    publicSiteUrl: string,
  ) {
    this.#repo = repo;
    this.#storage = storage;
    this.#renderer = renderer;
    this.#publicSiteUrl = publicSiteUrl.replace(/\/$/, '');
  }

  listTemplates() {
    return this.#repo.listActiveTemplates();
  }

  listExports(propertyId: string) {
    return this.#repo.listExportsForProperty(propertyId);
  }

  async generate(input: GenerateBrochureInput, generatedByUserId: string | null) {
    const template = await this.#repo.getTemplateByKey(input.templateKey);
    if (template === undefined || !template.isActive || template.archivedAt !== null) {
      throw new AppError('NOT_FOUND', 'Brochure template not found.');
    }
    if (template.kind !== 'brochure_pdf' || template.format !== 'a4_pdf') {
      throw new AppError('VALIDATION_FAILED', 'Template is not an A4 PDF brochure.');
    }

    const property = await this.#repo.getPropertyForBrochure(input.propertyId);
    if (property === undefined) throw new AppError('NOT_FOUND', 'Property not found.');

    const toggles = mergeToggles(template.defaultToggles, input.toggles, DEFAULT_BROCHURE_TOGGLES);
    const listingUrl = `${this.#publicSiteUrl}/obiavi/${property.slug}/`;
    const qrDataUrl = toggles.qr
      ? await QRCode.toDataURL(listingUrl, { margin: 1, width: 192 })
      : null;

    const html = buildBrochureHtml({
      property: {
        ...property,
        locale: template.locale === 'en' ? 'en' : 'bg',
      },
      toggles,
      listingUrl,
      qrDataUrl,
    });

    const pdf = await this.#renderer.renderPdf(html);
    const exportId = randomUUID();
    const storageKey = `studio/brochures/${property.id}/${exportId}.pdf`;
    const fileName = `${property.referenceNumber}-brochure.pdf`;
    await this.#storage.put({
      key: storageKey,
      body: pdf,
      contentType: 'application/pdf',
    });

    const row = await this.#repo.createExport({
      id: exportId,
      propertyId: property.id,
      templateId: template.id,
      format: template.format,
      toggles,
      listingUrl,
      storageKey,
      fileName,
      contentType: 'application/pdf',
      byteSize: pdf.byteLength,
      generatedByUserId,
    });

    return row;
  }

  async generateSocial(input: GenerateSocialAssetInput, generatedByUserId: string | null) {
    const template = await this.#repo.getTemplateByKey(input.templateKey);
    if (template === undefined || !template.isActive || template.archivedAt !== null) {
      throw new AppError('NOT_FOUND', 'Social template not found.');
    }
    if (template.kind !== 'social_image' || !isSocialFormat(template.format)) {
      throw new AppError('VALIDATION_FAILED', 'Template is not a social image format.');
    }

    const property = await this.#repo.getPropertyForBrochure(input.propertyId);
    if (property === undefined) throw new AppError('NOT_FOUND', 'Property not found.');

    const toggles = mergeToggles(template.defaultToggles, input.toggles, DEFAULT_SOCIAL_TOGGLES);
    const badgePreset = (input.badgePreset ?? template.badgePreset) as SocialBadgePreset;
    const size = SOCIAL_FORMAT_SIZE[template.format];
    const listingUrl = `${this.#publicSiteUrl}/obiavi/${property.slug}/`;

    const html = buildSocialHtml({
      property: {
        ...property,
        locale: template.locale === 'en' ? 'en' : 'bg',
      },
      toggles,
      badgePreset,
      size,
    });

    const png = await this.#renderer.renderPng(html, size);
    const exportId = randomUUID();
    const storageKey = `studio/social/${property.id}/${exportId}.png`;
    const fileName = `${property.referenceNumber}-${template.format}.png`;
    await this.#storage.put({
      key: storageKey,
      body: png,
      contentType: 'image/png',
    });

    return this.#repo.createExport({
      id: exportId,
      propertyId: property.id,
      templateId: template.id,
      format: template.format,
      toggles,
      listingUrl,
      storageKey,
      fileName,
      contentType: 'image/png',
      byteSize: png.byteLength,
      generatedByUserId,
    });
  }

  async getExportFile(exportId: string): Promise<{
    body: Buffer;
    contentType: string;
    fileName: string;
  }> {
    const row = await this.#repo.getExport(exportId);
    if (row === undefined) throw new AppError('NOT_FOUND');
    const body = await this.#storage.get(row.storageKey);
    return { body, contentType: row.contentType, fileName: row.fileName };
  }

  async getChannelCopy(propertyId: string) {
    const property = await this.#repo.getPropertyForBrochure(propertyId);
    if (property === undefined) throw new AppError('NOT_FOUND', 'Property not found.');
    const listingUrl = `${this.#publicSiteUrl}/obiavi/${property.slug}/`;
    return {
      propertyId: property.id,
      listingUrl,
      requiresHumanConfirmation: true as const,
      snippets: buildChannelCopySnippets(property, listingUrl),
    };
  }
}
