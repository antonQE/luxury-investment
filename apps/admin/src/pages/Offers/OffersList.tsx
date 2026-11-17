import { Button, Heading, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import {
  OFFER_STATUSES,
  OFFER_TYPES,
  type OfferStatus,
  type OfferType,
} from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { contactKeys, fetchAdminContacts } from '@/api/endpoints/contacts';
import {
  createAdminOffer,
  fetchAdminOffers,
  offerKeys,
  updateAdminOffer,
} from '@/api/endpoints/offers';
import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApiError } from '@/types/api';

export default function OffersList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [propertyId, setPropertyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [type, setType] = useState<OfferType>('purchase');
  const [amount, setAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: offerKeys.list(),
    queryFn: fetchAdminOffers,
  });
  const propertiesQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });
  const contactsQuery = useQuery({
    queryKey: contactKeys.list(),
    queryFn: () => fetchAdminContacts(false),
  });

  const createMutation = useMutation({
    mutationFn: createAdminOffer,
    onSuccess: async () => {
      setAmount('');
      setValidUntil('');
      setTerms('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: offerKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('offers.saveError'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OfferStatus }) =>
      updateAdminOffer(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      propertyId,
      contactId,
      type,
      amount: amount.trim(),
      currency: 'EUR',
      validUntil: validUntil === '' ? null : validUntil,
      terms,
      status: 'submitted',
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
    <VStack align="stretch" gap={6} data-testid="offers-admin-page">
      <PageHeader title={t('offers.title')} lead={t('offers.lead')} />

      <Panel>
        <form
          onSubmit={(event) => {
            onSubmit(event);
          }}
        >
          <Heading size="md" mb={4}>
            {t('offers.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('offers.property')} required>
                <AdminSelect
                  value={propertyId}
                  required
                  onChange={setPropertyId}
                  data-testid="offer-property"
                  options={[
                    { value: '', label: t('offers.selectProperty') },
                    ...(propertiesQuery.data ?? []).map((property) => ({
                      value: property.id,
                      label: `${property.referenceNumber} — ${property.titleBg}`,
                    })),
                  ]}
                />
              </Field>
              <Field label={t('offers.contact')} required>
                <AdminSelect
                  value={contactId}
                  required
                  onChange={setContactId}
                  data-testid="offer-contact"
                  options={[
                    { value: '', label: t('offers.selectContact') },
                    ...(contactsQuery.data ?? []).map((contact) => ({
                      value: contact.id,
                      label: contact.displayName,
                    })),
                  ]}
                />
              </Field>
              <Field label={t('offers.type')} minW="120px">
                <AdminSelect
                  value={type}
                  onChange={(value) => {
                    setType(value as OfferType);
                  }}
                  data-testid="offer-type"
                  options={OFFER_TYPES.map((item) => ({
                    value: item,
                    label: t(`offers.type_${item}`),
                  }))}
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('offers.amount')} minW="120px" required>
                <Input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  required
                  placeholder="285000.00"
                  data-testid="offer-amount"
                />
              </Field>
              <Field label={t('offers.validUntil')} minW="140px">
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => {
                    setValidUntil(e.target.value);
                  }}
                  data-testid="offer-valid-until"
                />
              </Field>
              <Field label={t('offers.terms')} minW="160px">
                <Input
                  value={terms}
                  onChange={(e) => {
                    setTerms(e.target.value);
                  }}
                  data-testid="offer-terms"
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
              data-testid="offer-create-submit"
            >
              {t('offers.create')}
            </Button>
          </VStack>
        </form>
      </Panel>

      <Panel overflowX="auto">
        {listQuery.isPending ? (
          <Spinner />
        ) : listQuery.isError ? (
          <Text color="status.down">
            {listQuery.error instanceof ApiError ? listQuery.error.message : t('offers.loadError')}
          </Text>
        ) : listQuery.data.length === 0 ? (
          <Text color="text.muted">{t('offers.empty')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="offers-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('offers.property')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offers.contact')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offers.type')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offers.amount')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offers.status')}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{propertyLabel(row.propertyId)}</Table.Cell>
                  <Table.Cell>{contactLabel(row.contactId)}</Table.Cell>
                  <Table.Cell>{t(`offers.type_${row.type}`)}</Table.Cell>
                  <Table.Cell>
                    {row.amount} {row.currency}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <StatusBadge
                        value={row.status}
                        label={t(`offers.status_${row.status}`, { defaultValue: row.status })}
                      />
                      <AdminSelect
                        size="sm"
                        value={row.status}
                        disabled={statusMutation.isPending}
                        aria-label={t('offers.status')}
                        data-testid={`offer-status-${row.id}`}
                        options={OFFER_STATUSES.map((status) => ({
                          value: status,
                          label: t(`offers.status_${status}`),
                        }))}
                        onChange={(value) => {
                          const status = value as OfferStatus;
                          if (status === row.status) return;
                          statusMutation.mutate({ id: row.id, status });
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
