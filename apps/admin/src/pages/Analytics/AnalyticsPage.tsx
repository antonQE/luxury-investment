import {
  Box,
  HStack,
  IconButton,
  Portal,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { SITE_INSIGHT_RANGES, type SiteInsightRange } from '@luxury-investment/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  analyticsKeys,
  fetchSiteAnalytics,
  fetchSiteInsightOverview,
  siteInsightRangeDays,
} from '@/api/endpoints/analytics';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

type KpiKey = 'sessions' | 'pageviews' | 'avgDuration' | 'users' | 'newUsers' | 'bounceRate';

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  if (totalSec < 60) return `${String(totalSec)}s`;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes)}m ${String(seconds)}s`;
}

function formatDelta(value: number | null): string {
  if (value === null) return '—';
  const rounded = Math.round(value);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${String(rounded)}%`;
}

function MetricInfoTip({ text, testId }: { text: string; testId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Root
      open={open}
      openDelay={150}
      closeDelay={100}
      positioning={{ placement: 'top' }}
      onOpenChange={(details) => {
        setOpen(details.open);
      }}
    >
      <Tooltip.Trigger asChild>
        <IconButton
          type="button"
          aria-label={t('analytics.kpiInfo')}
          size="2xs"
          variant="ghost"
          color="text.muted"
          minW="1.5rem"
          h="1.5rem"
          fontSize="sm"
          cursor="help"
          data-testid={testId}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen((current) => !current);
          }}
        >
          ⓘ
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            maxW="16rem"
            px={3}
            py={2}
            fontSize="sm"
            lineHeight="1.4"
            bg="background.panel"
            color="text.primary"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="l2"
            boxShadow="md"
            zIndex="tooltip"
          >
            {text}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

function KpiCard({
  label,
  tooltip,
  value,
  delta,
  days,
  invertDelta,
  testId,
}: {
  label: string;
  tooltip: string;
  value: string;
  delta: number | null;
  days: number;
  invertDelta?: boolean;
  testId: string;
}) {
  const { t } = useTranslation();
  const upIsGood = invertDelta !== true;
  const positive = delta !== null && delta > 0;
  const negative = delta !== null && delta < 0;
  const good = delta === null || delta === 0 ? null : upIsGood ? positive : negative;
  const color = good === null ? 'text.muted' : good ? 'status.ok' : 'status.down';

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      bg="background.panel"
      p={4}
      borderRadius="l3"
      data-testid={testId}
    >
      <HStack justify="space-between" align="flex-start" mb={2}>
        <Text fontSize="sm" color="text.muted" fontWeight="600">
          {label}
        </Text>
        <MetricInfoTip text={tooltip} testId={`${testId}-tip`} />
      </HStack>
      <Text fontSize="2xl" fontWeight="700" letterSpacing="-0.02em" mb={1}>
        {value}
      </Text>
      <Text fontSize="sm" color={color} data-testid={`${testId}-delta`}>
        {formatDelta(delta)}
      </Text>
      <Text fontSize="xs" color="text.muted" mt={1}>
        {t('analytics.vsPrevious', { days })}
      </Text>
    </Box>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<SiteInsightRange>('30d');
  const days = siteInsightRangeDays(range);

  const overviewQuery = useQuery({
    queryKey: analyticsKeys.overview(range),
    queryFn: () => fetchSiteInsightOverview(range),
  });
  const tablesQuery = useQuery({
    queryKey: analyticsKeys.site(days),
    queryFn: () => fetchSiteAnalytics(days),
  });

  const current = overviewQuery.data?.current;
  const deltas = overviewQuery.data?.deltas;

  const cards: {
    key: KpiKey;
    value: string;
    delta: number | null;
    invertDelta?: boolean;
  }[] = [
    {
      key: 'sessions',
      value: String(current?.sessions ?? 0),
      delta: deltas?.sessions ?? null,
    },
    {
      key: 'pageviews',
      value: String(current?.pageviews ?? 0),
      delta: deltas?.pageviews ?? null,
    },
    {
      key: 'avgDuration',
      value: formatDuration(current?.avgSessionDurationMs ?? 0),
      delta: deltas?.avgSessionDurationMs ?? null,
    },
    {
      key: 'users',
      value: String(current?.users ?? 0),
      delta: deltas?.users ?? null,
    },
    {
      key: 'bounceRate',
      value: `${((current?.bounceRate ?? 0) * 100).toFixed(1)}%`,
      delta: deltas?.bounceRate ?? null,
      invertDelta: true,
    },
    {
      key: 'newUsers',
      value: String(current?.newUsers ?? 0),
      delta: deltas?.newUsers ?? null,
    },
  ];

  return (
    <VStack align="stretch" gap={6} data-testid="analytics-page">
      <PageHeader title={t('analytics.title')} lead={t('analytics.lead')} />

      <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={3}>
        <Text fontSize="sm" fontWeight="600">
          {t('analytics.overviewTitle')}
        </Text>
        <Field label={t('analytics.range')} minW="200px">
          <AdminSelect
            value={range}
            clearable={false}
            data-testid="analytics-range"
            onChange={(value) => {
              if ((SITE_INSIGHT_RANGES as readonly string[]).includes(value)) {
                setRange(value as SiteInsightRange);
              }
            }}
            options={SITE_INSIGHT_RANGES.map((item) => ({
              value: item,
              label: t(`analytics.range_${item}`),
            }))}
          />
        </Field>
      </HStack>

      {overviewQuery.isPending ? (
        <Spinner data-testid="analytics-overview-loading" />
      ) : overviewQuery.isError ? (
        <Text color="status.down">{t('analytics.loadError')}</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3} data-testid="analytics-kpi-grid">
          {cards.map((card) => (
            <KpiCard
              key={card.key}
              testId={`analytics-kpi-${card.key}`}
              label={t(`analytics.kpi.${card.key}`)}
              tooltip={t(`analytics.kpi.${card.key}Tooltip`)}
              value={card.value}
              delta={card.delta}
              days={days}
              invertDelta={card.invertDelta}
            />
          ))}
        </SimpleGrid>
      )}

      <Panel overflowX="auto">
        <Text fontSize="sm" fontWeight="600" mb={3}>
          {t('analytics.pagesTitle')}
        </Text>
        {tablesQuery.isPending ? (
          <Spinner data-testid="analytics-pages-loading" />
        ) : tablesQuery.isError ? (
          <Text color="status.down">{t('analytics.loadError')}</Text>
        ) : tablesQuery.data.pages.length === 0 ? (
          <Text color="text.muted">{t('analytics.emptyPages')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="analytics-pages-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('analytics.path')}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">{t('analytics.events')}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">{t('analytics.unique')}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tablesQuery.data.pages.map((row) => (
                <Table.Row key={row.path}>
                  <Table.Cell fontFamily="mono" fontSize="xs">
                    {row.path}
                  </Table.Cell>
                  <Table.Cell textAlign="end">{row.events}</Table.Cell>
                  <Table.Cell textAlign="end">{row.uniqueSessions}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Panel>

      <Panel overflowX="auto">
        <Text fontSize="sm" fontWeight="600" mb={3}>
          {t('analytics.clicksTitle')}
        </Text>
        {tablesQuery.isPending ? (
          <Spinner data-testid="analytics-clicks-loading" />
        ) : tablesQuery.isError ? (
          <Text color="status.down">{t('analytics.loadError')}</Text>
        ) : tablesQuery.data.clicks.length === 0 ? (
          <Text color="text.muted">{t('analytics.emptyClicks')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="analytics-clicks-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('analytics.path')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('analytics.label')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('analytics.href')}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">{t('analytics.events')}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">{t('analytics.unique')}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tablesQuery.data.clicks.map((row) => (
                <Table.Row key={`${row.path}|${row.label}|${row.href}`}>
                  <Table.Cell fontFamily="mono" fontSize="xs">
                    {row.path}
                  </Table.Cell>
                  <Table.Cell>{row.label}</Table.Cell>
                  <Table.Cell fontFamily="mono" fontSize="xs">
                    {row.href}
                  </Table.Cell>
                  <Table.Cell textAlign="end">{row.events}</Table.Cell>
                  <Table.Cell textAlign="end">{row.uniqueSessions}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Panel>
    </VStack>
  );
}
