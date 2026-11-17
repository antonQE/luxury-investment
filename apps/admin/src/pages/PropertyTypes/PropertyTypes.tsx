import { Button, Heading, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveTaxonomy,
  catalogKeys,
  createTaxonomy,
  fetchTaxonomy,
} from '@/api/endpoints/catalog';
import { dangerVariant } from '@/components/ui/button-variants';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { ApiError } from '@/types/api';

const KIND = 'property_types';

export default function PropertyTypes() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [nameBg, setNameBg] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: catalogKeys.taxonomy(KIND, false),
    queryFn: () => fetchTaxonomy(KIND, false),
  });

  const createMutation = useMutation({
    mutationFn: (body: { key: string; name: { bg: string; en: string } }) =>
      createTaxonomy(KIND, body),
    onSuccess: async () => {
      setKey('');
      setNameBg('');
      setNameEn('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: catalogKeys.taxonomy(KIND, false) });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('catalog.saveError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveTaxonomy(KIND, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.taxonomy(KIND, false) });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      key: key.trim(),
      name: { bg: nameBg.trim(), en: nameEn.trim() },
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="property-types-page">
      <PageHeader title={t('catalog.propertyTypesTitle')} lead={t('catalog.propertyTypesLead')} />

      <Panel testId="property-type-create-form">
        <form
          onSubmit={(event) => {
            onSubmit(event);
          }}
        >
          <Heading size="md" mb={4}>
            {t('catalog.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <Field label={t('catalog.key')} required>
              <Input
                value={key}
                onChange={(event) => {
                  setKey(event.target.value);
                }}
                required
                data-testid="property-type-key"
              />
            </Field>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('catalog.nameBg')} required>
                <Input
                  value={nameBg}
                  onChange={(event) => {
                    setNameBg(event.target.value);
                  }}
                  required
                  data-testid="property-type-name-bg"
                />
              </Field>
              <Field label={t('catalog.nameEn')} required>
                <Input
                  value={nameEn}
                  onChange={(event) => {
                    setNameEn(event.target.value);
                  }}
                  required
                  data-testid="property-type-name-en"
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
              data-testid="property-type-create-submit"
            >
              {t('catalog.create')}
            </Button>
          </VStack>
        </form>
      </Panel>

      <Panel overflowX="auto">
        {listQuery.isPending ? (
          <Spinner data-testid="property-types-loading" />
        ) : listQuery.isError ? (
          <Text color="status.down">{t('catalog.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="property-types-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('catalog.key')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('catalog.nameBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('catalog.nameEn')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.key}</Table.Cell>
                  <Table.Cell>{row.name.bg}</Table.Cell>
                  <Table.Cell>{row.name.en}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <Button
                      size="xs"
                      variant={dangerVariant}
                      loading={archiveMutation.isPending}
                      onClick={() => {
                        archiveMutation.mutate(row.id);
                      }}
                      data-testid={`property-type-archive-${row.key}`}
                    >
                      {t('catalog.archive')}
                    </Button>
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
