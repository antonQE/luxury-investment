import {
  createCalculatorRuleLineSchema,
  createCalculatorRuleSetSchema,
  listCalculatorRuleSetsQuerySchema,
  updateCalculatorRuleLineSchema,
  updateCalculatorRuleSetSchema,
  upsertCalculatorToggleSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { AuditService } from '../../audit/app/audit-service.ts';
import type {
  CalculatorRuleLineRow,
  CalculatorRuleSetRow,
  CalculatorRulesRepo,
  CalculatorToggleRow,
} from '../repo/calculator-rules-repo.ts';

const idParams = z.object({ id: z.uuid() });
const ruleSetLineParams = z.object({ id: z.uuid() });

function requireCalc(
  permission: 'calculators:read' | 'calculators:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serializeSet(row: CalculatorRuleSetRow) {
  return {
    id: row.id,
    countryCode: row.countryCode,
    propertyType: row.propertyType,
    kind: row.kind,
    name: row.name,
    currency: row.currency,
    validFrom: row.validFrom,
    validTo: row.validTo,
    source: row.source,
    warning: row.warning,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeLine(row: CalculatorRuleLineRow) {
  return {
    id: row.id,
    ruleSetId: row.ruleSetId,
    costGroup: row.costGroup,
    lineType: row.lineType,
    rateValue: row.rateValue,
    minAmount: row.minAmount,
    maxAmount: row.maxAmount,
    optional: row.optional,
    sortOrder: row.sortOrder,
    labelBg: row.labelBg,
    labelEn: row.labelEn,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeToggle(row: CalculatorToggleRow) {
  return {
    id: row.id,
    kind: row.kind,
    countryCode: row.countryCode,
    propertyType: row.propertyType,
    enabled: row.enabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function calculatorAdminRouter(repo: CalculatorRulesRepo, audit: AuditService): Router {
  const router = Router();

  router.get('/calculator-toggles', async (req, res) => {
    requireCalc('calculators:read', req.auth?.permissions);
    const rows = await repo.listToggles();
    res.json({ data: rows.map(serializeToggle) });
  });

  router.put(
    '/calculator-toggles',
    withValidation({ body: upsertCalculatorToggleSchema }, async ({ body }, req, res) => {
      requireCalc('calculators:write', req.auth?.permissions);
      const row = await repo.upsertToggle(body);
      await audit.record({
        actorUserId: req.auth?.id,
        actorEmail: req.auth?.email,
        action: 'calculator_toggle.upsert',
        resourceType: 'calculator_toggle',
        resourceId: row.id,
        metadata: { kind: row.kind, countryCode: row.countryCode, enabled: row.enabled },
      });
      res.json({ data: serializeToggle(row) });
    }),
  );

  router.get(
    '/calculator-rule-sets',
    withValidation({ query: listCalculatorRuleSetsQuerySchema }, async ({ query }, req, res) => {
      requireCalc('calculators:read', req.auth?.permissions);
      const rows = await repo.listRuleSets(query);
      res.json({ data: rows.map(serializeSet) });
    }),
  );

  router.get(
    '/calculator-rule-sets/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireCalc('calculators:read', req.auth?.permissions);
      const row = await repo.getRuleSet(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      const lines = await repo.listLines(params.id);
      res.json({ data: { ...serializeSet(row), lines: lines.map(serializeLine) } });
    }),
  );

  router.post(
    '/calculator-rule-sets',
    withValidation({ body: createCalculatorRuleSetSchema }, async ({ body }, req, res) => {
      requireCalc('calculators:write', req.auth?.permissions);
      const row = await repo.createRuleSet(body);
      await audit.record({
        actorUserId: req.auth?.id,
        actorEmail: req.auth?.email,
        action: 'calculator_rule_set.create',
        resourceType: 'calculator_rule_set',
        resourceId: row.id,
        metadata: { kind: row.kind, countryCode: row.countryCode, name: row.name },
      });
      res.status(201).json({ data: serializeSet(row) });
    }),
  );

  router.patch(
    '/calculator-rule-sets/:id',
    withValidation(
      { params: idParams, body: updateCalculatorRuleSetSchema },
      async ({ params, body }, req, res) => {
        requireCalc('calculators:write', req.auth?.permissions);
        const row = await repo.updateRuleSet(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        await audit.record({
          actorUserId: req.auth?.id,
          actorEmail: req.auth?.email,
          action: 'calculator_rule_set.update',
          resourceType: 'calculator_rule_set',
          resourceId: row.id,
          metadata: body,
        });
        res.json({ data: serializeSet(row) });
      },
    ),
  );

  router.post(
    '/calculator-rule-sets/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireCalc('calculators:write', req.auth?.permissions);
      const row = await repo.archiveRuleSet(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      await audit.record({
        actorUserId: req.auth?.id,
        actorEmail: req.auth?.email,
        action: 'calculator_rule_set.archive',
        resourceType: 'calculator_rule_set',
        resourceId: row.id,
      });
      res.json({ data: serializeSet(row) });
    }),
  );

  router.post(
    '/calculator-rule-sets/:id/lines',
    withValidation(
      { params: ruleSetLineParams, body: createCalculatorRuleLineSchema },
      async ({ params, body }, req, res) => {
        requireCalc('calculators:write', req.auth?.permissions);
        const set = await repo.getRuleSet(params.id);
        if (set === null) throw new AppError('NOT_FOUND');
        const row = await repo.createLine(params.id, body);
        await audit.record({
          actorUserId: req.auth?.id,
          actorEmail: req.auth?.email,
          action: 'calculator_rule_line.create',
          resourceType: 'calculator_rule_line',
          resourceId: row.id,
          metadata: { ruleSetId: params.id, costGroup: row.costGroup, rateValue: row.rateValue },
        });
        res.status(201).json({ data: serializeLine(row) });
      },
    ),
  );

  router.patch(
    '/calculator-rule-lines/:id',
    withValidation(
      { params: idParams, body: updateCalculatorRuleLineSchema },
      async ({ params, body }, req, res) => {
        requireCalc('calculators:write', req.auth?.permissions);
        const row = await repo.updateLine(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        await audit.record({
          actorUserId: req.auth?.id,
          actorEmail: req.auth?.email,
          action: 'calculator_rule_line.update',
          resourceType: 'calculator_rule_line',
          resourceId: row.id,
          metadata: body,
        });
        res.json({ data: serializeLine(row) });
      },
    ),
  );

  return router;
}
