import { Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { analyticsKeys, fetchSiteAnalytics } from '@/api/endpoints/analytics';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

const DAYS = 30;

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: analyticsKeys.site(DAYS),
    queryFn: () => fetchSiteAnalytics(DAYS),
  });

  return (
    <VStack align="stretch" gap={6} data-testid="analytics-page">
      <PageHeader title={t('analytics.title')} lead={t('analytics.lead', { days: DAYS })} />

      <Panel overflowX="auto">
        <Text fontSize="sm" fontWeight="600" mb={3}>
          {t('analytics.pagesTitle')}
        </Text>
        {query.isPending ? (
          <Spinner data-testid="analytics-pages-loading" />
        ) : query.isError ? (
          <Text color="status.down">{t('analytics.loadError')}</Text>
        ) : query.data.pages.length === 0 ? (
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
              {query.data.pages.map((row) => (
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
        {query.isPending ? (
          <Spinner data-testid="analytics-clicks-loading" />
        ) : query.isError ? (
          <Text color="status.down">{t('analytics.loadError')}</Text>
        ) : query.data.clicks.length === 0 ? (
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
              {query.data.clicks.map((row) => (
                <Table.Row key={`${row.path}|${row.label}|${row.href}`}>
                  <Table.Cell fontFamily="mono" fontSize="xs">
                    {row.path}
                  </Table.Cell>
                  <Table.Cell>{row.label || '—'}</Table.Cell>
                  <Table.Cell fontFamily="mono" fontSize="xs" maxW="240px" truncate>
                    {row.href || '—'}
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
