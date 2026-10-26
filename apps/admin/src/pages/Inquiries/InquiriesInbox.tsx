import { Box, Heading, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { INQUIRY_STATUSES, type InquiryStatus } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  fetchAdminInquiries,
  inquiryKeys,
  updateAdminInquiryStatus,
} from '@/api/endpoints/inquiries';
import { ApiError } from '@/types/api';

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function InquiriesInbox() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: inquiryKeys.list(),
    queryFn: fetchAdminInquiries,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      updateAdminInquiryStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inquiryKeys.list() });
    },
  });

  return (
    <VStack align="stretch" gap={6} data-testid="inquiries-admin-page">
      <Heading size="xl" color="text.primary">
        {t('inquiries.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('inquiries.lead')}
      </Text>

      {statusMutation.isError ? (
        <Text color="status.down" fontSize="sm">
          {statusMutation.error instanceof ApiError
            ? statusMutation.error.message
            : t('inquiries.saveError')}
        </Text>
      ) : null}

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
        overflowX="auto"
      >
        {listQuery.isPending ? (
          <Spinner />
        ) : listQuery.isError ? (
          <Text color="status.down">
            {listQuery.error instanceof ApiError
              ? listQuery.error.message
              : t('inquiries.loadError')}
          </Text>
        ) : listQuery.data.length === 0 ? (
          <Text color="text.muted">{t('inquiries.empty')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="inquiries-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('inquiries.type')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('inquiries.property')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('inquiries.name')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('inquiries.email')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('inquiries.status')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('inquiries.created')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.type}</Table.Cell>
                  <Table.Cell>{row.propertySlug}</Table.Cell>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>{t(`inquiries.status_${row.status}`)}</Table.Cell>
                  <Table.Cell>{formatWhen(row.createdAt)}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <select
                      style={{ height: '2rem', padding: '0 0.5rem' }}
                      value={row.status}
                      disabled={statusMutation.isPending}
                      aria-label={t('inquiries.status')}
                      data-testid={`inquiry-status-${row.id}`}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        const status = event.target.value as InquiryStatus;
                        if (status === row.status) return;
                        statusMutation.mutate({ id: row.id, status });
                      }}
                    >
                      {INQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(`inquiries.status_${status}`)}
                        </option>
                      ))}
                    </select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </VStack>
  );
}
