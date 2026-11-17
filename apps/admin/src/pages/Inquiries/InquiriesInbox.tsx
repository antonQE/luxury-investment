import { HStack, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { INQUIRY_STATUSES, type InquiryStatus } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  fetchAdminInquiries,
  inquiryKeys,
  updateAdminInquiryStatus,
} from '@/api/endpoints/inquiries';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
      <PageHeader title={t('inquiries.title')} lead={t('inquiries.lead')} />

      {statusMutation.isError ? (
        <Text color="status.down" fontSize="sm">
          {statusMutation.error instanceof ApiError
            ? statusMutation.error.message
            : t('inquiries.saveError')}
        </Text>
      ) : null}

      <Panel overflowX="auto">
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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.type}</Table.Cell>
                  <Table.Cell>{row.propertySlug}</Table.Cell>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <StatusBadge
                        value={row.status}
                        label={t(`inquiries.status_${row.status}`, { defaultValue: row.status })}
                      />
                      <AdminSelect
                        size="sm"
                        value={row.status}
                        disabled={statusMutation.isPending}
                        aria-label={t('inquiries.status')}
                        data-testid={`inquiry-status-${row.id}`}
                        options={INQUIRY_STATUSES.map((status) => ({
                          value: status,
                          label: t(`inquiries.status_${status}`),
                        }))}
                        onChange={(value) => {
                          const status = value as InquiryStatus;
                          if (status === row.status) return;
                          statusMutation.mutate({ id: row.id, status });
                        }}
                      />
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{formatWhen(row.createdAt)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Panel>
    </VStack>
  );
}
