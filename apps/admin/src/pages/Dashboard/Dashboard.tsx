import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useHealthQuery } from '@/hooks/common/useHealthQuery';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isPending, isError, error } = useHealthQuery();

  return (
    <VStack align="stretch" gap={6} data-testid="dashboard-page">
      <Heading size="xl" color="text.primary">
        {t('dashboard.title')}
      </Heading>
      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
        data-testid="api-health-card"
      >
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
            <Text data-testid="api-health-status">
              {t('dashboard.status')}:{' '}
              <Box as="span" color={data.status === 'ok' ? 'status.ok' : 'status.down'}>
                {data.status}
              </Box>
            </Text>
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
      </Box>
    </VStack>
  );
}
