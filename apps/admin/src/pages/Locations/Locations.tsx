import { Button, Heading, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { LOCATION_KINDS } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveLocation,
  catalogKeys,
  createLocation,
  fetchLocations,
} from '@/api/endpoints/catalog';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { dangerVariant } from '@/components/ui/button-variants';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { ApiError } from '@/types/api';

export default function Locations() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<(typeof LOCATION_KINDS)[number]>('city');
  const [slug, setSlug] = useState('');
  const [nameBg, setNameBg] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: catalogKeys.locations(false),
    queryFn: () => fetchLocations(false),
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: async () => {
      setSlug('');
      setNameBg('');
      setNameEn('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: catalogKeys.locations(false) });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('catalog.saveError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveLocation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.locations(false) });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      kind,
      slug: slug.trim(),
      name: { bg: nameBg.trim(), en: nameEn.trim() },
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="locations-page">
      <PageHeader title={t('catalog.locationsTitle')} lead={t('catalog.locationsLead')} />

      <Panel testId="location-create-form">
        <form
          onSubmit={(event) => {
            onSubmit(event);
          }}
        >
          <Heading size="md" mb={4}>
            {t('catalog.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('catalog.kind')}>
                <AdminSelect
                  value={kind}
                  onChange={(value) => {
                    setKind(value as (typeof LOCATION_KINDS)[number]);
                  }}
                  options={LOCATION_KINDS.map((value) => ({ value, label: value }))}
                  data-testid="location-kind"
                />
              </Field>
              <Field label={t('catalog.slug')} required>
                <Input
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                  }}
                  required
                  data-testid="location-slug"
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('catalog.nameBg')} required>
                <Input
                  value={nameBg}
                  onChange={(event) => {
                    setNameBg(event.target.value);
                  }}
                  required
                  data-testid="location-name-bg"
                />
              </Field>
              <Field label={t('catalog.nameEn')} required>
                <Input
                  value={nameEn}
                  onChange={(event) => {
                    setNameEn(event.target.value);
                  }}
                  required
                  data-testid="location-name-en"
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
              data-testid="location-create-submit"
            >
              {t('catalog.create')}
            </Button>
          </VStack>
        </form>
      </Panel>

      <Panel overflowX="auto">
        {listQuery.isPending ? (
          <Spinner data-testid="locations-loading" />
        ) : listQuery.isError ? (
          <Text color="status.down">{t('catalog.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="locations-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('catalog.kind')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('catalog.slug')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('catalog.nameBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('catalog.nameEn')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.kind}</Table.Cell>
                  <Table.Cell>{row.slug}</Table.Cell>
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
                      data-testid={`location-archive-${row.slug}`}
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
