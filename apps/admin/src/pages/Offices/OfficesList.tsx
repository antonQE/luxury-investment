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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveAdminOffice,
  createAdminOffice,
  fetchAdminOffices,
  officeKeys,
} from '@/api/endpoints/offices';
import { ApiError } from '@/types/api';

export default function OfficesList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState('');
  const [nameBg, setNameBg] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [addressBg, setAddressBg] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [mapQuery, setMapQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: officeKeys.list(),
    queryFn: fetchAdminOffices,
  });

  const createMutation = useMutation({
    mutationFn: createAdminOffice,
    onSuccess: async () => {
      setSlug('');
      setNameBg('');
      setNameEn('');
      setAddressBg('');
      setAddressEn('');
      setMapQuery('');
      setPhone('');
      setEmail('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: officeKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('offices.saveError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminOffice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: officeKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      slug: slug.trim(),
      nameBg: nameBg.trim(),
      nameEn: nameEn.trim(),
      addressBg: addressBg.trim(),
      addressEn: addressEn.trim(),
      mapQuery: mapQuery.trim(),
      phone: phone.trim() === '' ? null : phone.trim(),
      email: email.trim() === '' ? null : email.trim(),
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="offices-admin-page">
      <Heading size="xl" color="text.primary">
        {t('offices.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('offices.lead')}
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
            {t('offices.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.slug')}
                </Text>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                  }}
                  required
                  data-testid="office-slug"
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.mapQuery')}
                </Text>
                <Input
                  value={mapQuery}
                  onChange={(e) => {
                    setMapQuery(e.target.value);
                  }}
                  required
                  data-testid="office-map-query"
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.nameBg')}
                </Text>
                <Input
                  value={nameBg}
                  onChange={(e) => {
                    setNameBg(e.target.value);
                  }}
                  required
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.nameEn')}
                </Text>
                <Input
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                  }}
                  required
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.addressBg')}
                </Text>
                <Input
                  value={addressBg}
                  onChange={(e) => {
                    setAddressBg(e.target.value);
                  }}
                  required
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.addressEn')}
                </Text>
                <Input
                  value={addressEn}
                  onChange={(e) => {
                    setAddressEn(e.target.value);
                  }}
                  required
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.phone')}
                </Text>
                <Input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('offices.email')}
                </Text>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  type="email"
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
              data-testid="office-create-submit"
            >
              {t('offices.create')}
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
          <Text color="status.down">{t('offices.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="offices-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('offices.slug')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offices.nameBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offices.mapQuery')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('offices.phone')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.slug}</Table.Cell>
                  <Table.Cell>{row.name.bg}</Table.Cell>
                  <Table.Cell>
                    <Text truncate maxW="220px">
                      {row.mapQuery}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{row.phone ?? '—'}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        archiveMutation.mutate(row.id);
                      }}
                      data-testid={`office-archive-${row.slug}`}
                    >
                      {t('offices.archive')}
                    </Button>
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
