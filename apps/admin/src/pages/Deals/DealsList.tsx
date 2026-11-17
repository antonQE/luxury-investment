import { Button, Heading, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { DEAL_STAGES, type DealStage } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { contactKeys, fetchAdminContacts } from '@/api/endpoints/contacts';
import { createAdminDeal, dealKeys, fetchAdminDeals, updateAdminDeal } from '@/api/endpoints/deals';
import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/types/api';

export default function DealsList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canFinance = user?.permissions.includes('finance:read') === true;

  const [propertyId, setPropertyId] = useState('');
  const [buyerContactId, setBuyerContactId] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({ queryKey: dealKeys.list(), queryFn: fetchAdminDeals });
  const propertiesQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });
  const contactsQuery = useQuery({
    queryKey: contactKeys.list(),
    queryFn: () => fetchAdminContacts(false),
  });

  const createMutation = useMutation({
    mutationFn: createAdminDeal,
    onSuccess: async () => {
      setAgreedPrice('');
      setCommissionAmount('');
      setNotes('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: dealKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('deals.saveError'));
    },
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) => updateAdminDeal(id, { stage }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dealKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      propertyId,
      buyerContactId,
      stage: 'negotiation',
      agreedPrice: agreedPrice.trim() === '' ? null : agreedPrice.trim(),
      currency: 'EUR',
      commissionAmount:
        canFinance && commissionAmount.trim() !== '' ? commissionAmount.trim() : null,
      notes,
    });
  }

  const propertyLabel = (id: string) => {
    const property = propertiesQuery.data?.find((row) => row.id === id);
    return property !== undefined ? property.referenceNumber : id.slice(0, 8);
  };

  const contactLabel = (id: string) => {
    const contact = contactsQuery.data?.find((row) => row.id === id);
    return contact !== undefined ? contact.displayName : id.slice(0, 8);
  };

  return (
    <VStack align="stretch" gap={6} data-testid="deals-admin-page">
      <PageHeader title={t('deals.title')} lead={t('deals.lead')} />

      <Panel>
        <form
          onSubmit={(event) => {
            onSubmit(event);
          }}
        >
          <Heading size="md" mb={4}>
            {t('deals.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('deals.property')} required>
                <AdminSelect
                  value={propertyId}
                  required
                  onChange={setPropertyId}
                  data-testid="deal-property"
                  options={[
                    { value: '', label: t('deals.selectProperty') },
                    ...(propertiesQuery.data ?? []).map((property) => ({
                      value: property.id,
                      label: `${property.referenceNumber} — ${property.titleBg}`,
                    })),
                  ]}
                />
              </Field>
              <Field label={t('deals.buyer')} required>
                <AdminSelect
                  value={buyerContactId}
                  required
                  onChange={setBuyerContactId}
                  data-testid="deal-buyer"
                  options={[
                    { value: '', label: t('deals.selectContact') },
                    ...(contactsQuery.data ?? []).map((contact) => ({
                      value: contact.id,
                      label: contact.displayName,
                    })),
                  ]}
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('deals.agreedPrice')} minW="120px">
                <Input
                  value={agreedPrice}
                  onChange={(e) => {
                    setAgreedPrice(e.target.value);
                  }}
                  placeholder="285000.00"
                  data-testid="deal-agreed-price"
                />
              </Field>
              {canFinance ? (
                <Field label={t('deals.commission')} minW="120px">
                  <Input
                    value={commissionAmount}
                    onChange={(e) => {
                      setCommissionAmount(e.target.value);
                    }}
                    placeholder="8550.00"
                    data-testid="deal-commission"
                  />
                </Field>
              ) : null}
              <Field label={t('deals.notes')} minW="160px">
                <Input
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                  }}
                  data-testid="deal-notes"
                />
              </Field>
            </HStack>
            {formError !== null ? (
              <Text color="status.down" fontSize="sm">
                {formError}
              </Text>
            ) : null}
            <Button
              type="submit"
              alignSelf="flex-start"
              loading={createMutation.isPending}
              data-testid="deal-create-submit"
            >
              {t('deals.create')}
            </Button>
          </VStack>
        </form>
      </Panel>

      <Panel overflowX="auto">
        {listQuery.isPending ? (
          <Spinner />
        ) : listQuery.isError ? (
          <Text color="status.down">
            {listQuery.error instanceof ApiError ? listQuery.error.message : t('deals.loadError')}
          </Text>
        ) : listQuery.data.length === 0 ? (
          <Text color="text.muted">{t('deals.empty')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="deals-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('deals.property')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('deals.buyer')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('deals.agreedPrice')}</Table.ColumnHeader>
                {canFinance ? (
                  <Table.ColumnHeader>{t('deals.commission')}</Table.ColumnHeader>
                ) : null}
                <Table.ColumnHeader>{t('deals.stage')}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{propertyLabel(row.propertyId)}</Table.Cell>
                  <Table.Cell>{contactLabel(row.buyerContactId)}</Table.Cell>
                  <Table.Cell>
                    {row.agreedPrice !== null ? `${row.agreedPrice} ${row.currency}` : '—'}
                  </Table.Cell>
                  {canFinance ? (
                    <Table.Cell>
                      {row.commissionAmount !== null
                        ? `${row.commissionAmount} ${row.currency}`
                        : '—'}
                    </Table.Cell>
                  ) : null}
                  <Table.Cell>
                    <HStack gap={2}>
                      <StatusBadge
                        value={row.stage}
                        label={t(`deals.stage_${row.stage}`, { defaultValue: row.stage })}
                      />
                      <AdminSelect
                        size="sm"
                        value={row.stage}
                        disabled={stageMutation.isPending}
                        aria-label={t('deals.stage')}
                        data-testid={`deal-stage-${row.id}`}
                        options={DEAL_STAGES.map((stage) => ({
                          value: stage,
                          label: t(`deals.stage_${stage}`),
                        }))}
                        onChange={(value) => {
                          const stage = value as DealStage;
                          if (stage === row.stage) return;
                          stageMutation.mutate({ id: row.id, stage });
                        }}
                      />
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Panel>
    </VStack>
  );
}
