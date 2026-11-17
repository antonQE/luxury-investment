import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHealthQuery } from '@/hooks/common/useHealthQuery';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isPending, isError, error } = useHealthQuery();

  return (
    <VStack align="stretch" gap={6} data-testid="dashboard-page">
      <PageHeader title={t('dashboard.title')} />
      <Panel testId="api-health-card">
        <Heading size="md" mb={4}>
          {t('dashboard.apiStatus')}
        </Heading>
        {isPending ? (
          <Box display="flex" alignItems="center" gap={3} data-testid="api-health-loading">
            <Box
              w="18px"
              h="18px"
              borderWidth="1px"
              borderColor="accent.gold"
              borderTopColor="transparent"
              borderRadius="full"
              style={{ animation: 'admin-spin 0.85s linear infinite' }}
            />
            <Text fontSize="sm" color="text.muted">
              {t('dashboard.loading')}
            </Text>
            <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
          </Box>
        ) : isError ? (
          <Text color="status.down" data-testid="api-health-error">
            {t('dashboard.error')}
            {error instanceof Error ? `: ${error.message}` : null}
          </Text>
        ) : (
          <VStack align="stretch" gap={2} fontSize="sm">
            <Box data-testid="api-health-status" display="flex" alignItems="center" gap={2}>
              <Text as="span">{t('dashboard.status')}:</Text>
              <StatusBadge
                value={data.status}
                label={data.status}
                tone={data.status === 'ok' ? 'ok' : 'down'}
              />
            </Box>
            <Text>
              {t('dashboard.version')}: {data.version}
            </Text>
            <Text>{t('dashboard.components')}:</Text>
            <Box as="ul" pl={4}>
              {Object.entries(data.components).map(([name, state]) => (
                <Box as="li" key={name}>
                  {name}: {state}
                </Box>
              ))}
            </Box>
          </VStack>
        )}
      </Panel>
    </VStack>
  );
}
