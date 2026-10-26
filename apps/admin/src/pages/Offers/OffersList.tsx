import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  OFFER_STATUSES,
  OFFER_TYPES,
  type OfferStatus,
  type OfferType,
} from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { contactKeys, fetchAdminContacts } from '@/api/endpoints/contacts';
import {
  createAdminOffer,
  fetchAdminOffers,
  offerKeys,
  updateAdminOffer,
} from '@/api/endpoints/offers';
import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
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
      <Heading size="xl" color="text.primary">
        {t('offers.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('offers.lead')}
      </Text>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
      >
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
              <Box flex="1" minW="160px">
                <Text fontSize="sm" mb={1}>
                  {t('offers.property')}
                </Text>
                <select
                  value={propertyId}
                  required
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                  }}
                  data-testid="offer-property"
                >
                  <option value="">{t('offers.selectProperty')}</option>
                  {(propertiesQuery.data ?? []).map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.referenceNumber} — {property.titleBg}
                    </option>
                  ))}
                </select>
              </Box>
              <Box flex="1" minW="160px">
                <Text fontSize="sm" mb={1}>
                  {t('offers.contact')}
                </Text>
                <select
                  value={contactId}
                  required
                  onChange={(e) => {
                    setContactId(e.target.value);
                  }}
                  data-testid="offer-contact"
                >
                  <option value="">{t('offers.selectContact')}</option>
                  {(contactsQuery.data ?? []).map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.displayName}
                    </option>
                  ))}
                </select>
              </Box>
              <Box minW="120px">
                <Text fontSize="sm" mb={1}>
                  {t('offers.type')}
                </Text>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as OfferType);
                  }}
                  data-testid="offer-type"
                >
                  {OFFER_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {t(`offers.type_${item}`)}
                    </option>
                  ))}
                </select>
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="120px">
                <Text fontSize="sm" mb={1}>
                  {t('offers.amount')}
                </Text>
                <Input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  required
                  placeholder="285000.00"
                  data-testid="offer-amount"
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offers.validUntil')}
                </Text>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => {
                    setValidUntil(e.target.value);
                  }}
                  data-testid="offer-valid-until"
                />
              </Box>
              <Box flex="2" minW="160px">
                <Text fontSize="sm" mb={1}>
                  {t('offers.terms')}
                </Text>
                <Input
                  value={terms}
                  onChange={(e) => {
                    setTerms(e.target.value);
                  }}
                  data-testid="offer-terms"
                />
              </Box>
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
      </Box>

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
                    <select
                      value={row.status}
                      disabled={statusMutation.isPending}
                      aria-label={t('offers.status')}
                      data-testid={`offer-status-${row.id}`}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        const status = event.target.value as OfferStatus;
                        if (status === row.status) return;
                        statusMutation.mutate({ id: row.id, status });
                      }}
                    >
                      {OFFER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(`offers.status_${status}`)}
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
