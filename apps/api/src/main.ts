import process from 'node:process';

import { createApp } from './app.ts';
import { parseEnv } from './config/env.ts';
import { connectDatabase } from './infrastructure/db/client.ts';
import { LoggingMailer } from './infrastructure/mailer/logging-mailer.ts';
import { AuditService } from './modules/audit/app/audit-service.ts';
import { auditAdminRouter } from './modules/audit/handlers/audit-admin-handlers.ts';
import { calculatorAdminRouter } from './modules/calculators/handlers/calculator-admin-handlers.ts';
import { CalculatorRulesRepo } from './modules/calculators/repo/calculator-rules-repo.ts';
import { catalogAdminRouter } from './modules/catalog/handlers/catalog-admin-handlers.ts';
import { CatalogRepo } from './modules/catalog/repo/catalog-repo.ts';
import { ContentAdminService } from './modules/content/app/content-admin-service.ts';
import { ContentPublicService } from './modules/content/app/content-public-service.ts';
import { contentAdminRouter } from './modules/content/handlers/content-admin-handlers.ts';
import { contentPublicRouter } from './modules/content/handlers/content-public-handlers.ts';
import { PropertyOwnershipService } from './modules/crm/app/property-ownership-service.ts';
import { contactAdminRouter } from './modules/crm/handlers/contact-admin-handlers.ts';
import { crmTaskAdminRouter } from './modules/crm/handlers/crm-task-admin-handlers.ts';
import { dealAdminRouter } from './modules/crm/handlers/deal-admin-handlers.ts';
import { offerAdminRouter } from './modules/crm/handlers/offer-admin-handlers.ts';
import { propertyOwnershipAdminRouter } from './modules/crm/handlers/property-ownership-admin-handlers.ts';
import { viewingAdminRouter } from './modules/crm/handlers/viewing-admin-handlers.ts';
import { ContactRepo } from './modules/crm/repo/contact-repo.ts';
import { CrmTaskRepo } from './modules/crm/repo/crm-task-repo.ts';
import { DealRepo } from './modules/crm/repo/deal-repo.ts';
import { OfferRepo } from './modules/crm/repo/offer-repo.ts';
import { ViewingRepo } from './modules/crm/repo/viewing-repo.ts';
import { DocumentAdminService } from './modules/documents/app/document-admin-service.ts';
import { DocumentPublicService } from './modules/documents/app/document-public-service.ts';
import { documentAdminRouter } from './modules/documents/handlers/document-admin-handlers.ts';
import { documentPublicRouter } from './modules/documents/handlers/document-public-handlers.ts';
import { inquiryAdminRouter } from './modules/inquiries/handlers/inquiry-admin-handlers.ts';
import { inquiryPublicRouter } from './modules/inquiries/handlers/inquiry-public-handlers.ts';
import { InquiryRepo } from './modules/inquiries/repo/inquiry-repo.ts';
import { MediaService } from './modules/media/app/media-service.ts';
import { mediaAdminRouter } from './modules/media/handlers/media-admin-handlers.ts';
import { mediaPublicRouter } from './modules/media/handlers/media-public-handlers.ts';
import { LocalStorage } from './modules/media/storage/local-storage.ts';
import { PropertyAdminService } from './modules/properties/app/property-admin-service.ts';
import { PropertyHistoryService } from './modules/properties/app/property-history-service.ts';
import { propertyAdminRouter } from './modules/properties/handlers/property-admin-handlers.ts';
import { propertyPublicRouter } from './modules/properties/handlers/property-public-handlers.ts';
import { PropertyRepo } from './modules/properties/repo/property-repo.ts';
import { TeamAdminService } from './modules/team/app/team-admin-service.ts';
import { TeamPublicService } from './modules/team/app/team-public-service.ts';
import { teamAdminRouter } from './modules/team/handlers/team-admin-handlers.ts';
import { teamPublicRouter } from './modules/team/handlers/team-public-handlers.ts';
import { AuthService } from './modules/users/app/auth-service.ts';
import { mountAdminAuth } from './modules/users/handlers/auth-handlers.ts';
import { UserRepo } from './modules/users/repo/user-repo.ts';
import { createLogger } from './utils/logger.ts';

const env = parseEnv(process.env);
const logger = createLogger(env);
const database = connectDatabase(env.DATABASE_URL);
const storage = new LocalStorage(env.MEDIA_LOCAL_ROOT, env.MEDIA_PUBLIC_BASE_URL);
const mediaService = new MediaService(database.db, storage, env.MEDIA_PUBLIC_BASE_URL);
const propertyRepo = new PropertyRepo(database.db);
const propertyHistory = new PropertyHistoryService(database.db);
const propertyAdmin = new PropertyAdminService(database.db, propertyHistory);
const inquiryRepo = new InquiryRepo(database.db);
const mailer = new LoggingMailer(logger);
const catalogRepo = new CatalogRepo(database.db);
const teamPublic = new TeamPublicService(database.db);
const teamAdmin = new TeamAdminService(database.db);
const contentPublic = new ContentPublicService(database.db);
const contentAdmin = new ContentAdminService(database.db);
const documentPublic = new DocumentPublicService(database.db, storage);
const documentAdmin = new DocumentAdminService(database.db, storage);
const userRepo = new UserRepo(database.db);
const auditService = new AuditService(database.db);
const authService = new AuthService(userRepo, env.AUTH_SESSION_TTL_HOURS, env.AUTH_SESSION_SECRET);
const adminAuth = mountAdminAuth(authService, env, auditService);
const propertyOwnership = new PropertyOwnershipService(database.db);
const contactRepo = new ContactRepo(database.db);
const viewingRepo = new ViewingRepo(database.db);
const crmTaskRepo = new CrmTaskRepo(database.db);
const offerRepo = new OfferRepo(database.db);
const dealRepo = new DealRepo(database.db);
const calculatorRulesRepo = new CalculatorRulesRepo(database.db);

const app = createApp({
  env,
  logger,
  healthChecks: [{ name: 'database', check: database.ping }],
  publicRouters: [
    propertyPublicRouter(propertyRepo, mediaService),
    inquiryPublicRouter(inquiryRepo, mailer, env.INQUIRY_NOTIFY_TO, logger),
    mediaPublicRouter(mediaService),
    teamPublicRouter(teamPublic),
    contentPublicRouter(contentPublic),
    documentPublicRouter(documentPublic),
  ],
  adminPublicRouters: [adminAuth.publicRouter],
  adminAuthGate: adminAuth.gate,
  adminRouters: [
    adminAuth.protectedRouter,
    auditAdminRouter(auditService),
    catalogAdminRouter(catalogRepo),
    propertyAdminRouter(propertyAdmin),
    propertyOwnershipAdminRouter(propertyOwnership),
    contactAdminRouter(contactRepo),
    viewingAdminRouter(viewingRepo),
    crmTaskAdminRouter(crmTaskRepo),
    offerAdminRouter(offerRepo),
    dealAdminRouter(dealRepo),
    calculatorAdminRouter(calculatorRulesRepo, auditService),
    mediaAdminRouter(mediaService),
    teamAdminRouter(teamAdmin),
    inquiryAdminRouter(inquiryRepo),
    contentAdminRouter(contentAdmin),
    documentAdminRouter(documentAdmin),
  ],
});

const server = app.listen(env.API_PORT, () => {
  logger.info(`API listening on http://localhost:${String(env.API_PORT)}`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    void database.close().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});
