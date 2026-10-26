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
  archiveAdminPartner,
  createAdminPartner,
  fetchAdminPartners,
  partnerKeys,
} from '@/api/endpoints/partners';
import { ApiError } from '@/types/api';

export default function PartnersList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState('');
  const [nameBg, setNameBg] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: partnerKeys.list(),
    queryFn: fetchAdminPartners,
  });

  const createMutation = useMutation({
    mutationFn: createAdminPartner,
    onSuccess: async () => {
      setSlug('');
      setNameBg('');
      setNameEn('');
      setLogoUrl('');
      setWebsiteUrl('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: partnerKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('partners.saveError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminPartner,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partnerKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      slug: slug.trim(),
      nameBg: nameBg.trim(),
      nameEn: nameEn.trim(),
      logoUrl: logoUrl.trim(),
      websiteUrl: websiteUrl.trim() === '' ? null : websiteUrl.trim(),
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="partners-admin-page">
      <Heading size="xl" color="text.primary">
        {t('partners.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('partners.lead')}
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
            {t('partners.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('partners.slug')}
                </Text>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                  }}
                  required
                  data-testid="partner-slug"
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('partners.logoUrl')}
                </Text>
                <Input
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                  }}
                  required
                  data-testid="partner-logo-url"
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('partners.nameBg')}
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
                  {t('partners.nameEn')}
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
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('partners.websiteUrl')}
              </Text>
              <Input
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                }}
                data-testid="partner-website-url"
              />
            </Box>
            {formError !== null ? (
              <Text color="status.down" fontSize="sm">
                {formError}
              </Text>
            ) : null}
            <Button
              type="submit"
              alignSelf="flex-start"
              loading={createMutation.isPending}
              data-testid="partner-create-submit"
            >
              {t('partners.create')}
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
          <Text color="status.down">{t('partners.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="partners-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('partners.slug')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('partners.nameBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('partners.nameEn')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('partners.logoUrl')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.slug}</Table.Cell>
                  <Table.Cell>{row.name.bg}</Table.Cell>
                  <Table.Cell>{row.name.en}</Table.Cell>
                  <Table.Cell>
                    <Text truncate maxW="240px">
                      {row.logoUrl}
                    </Text>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        archiveMutation.mutate(row.id);
                      }}
                      data-testid={`partner-archive-${row.slug}`}
                    >
                      {t('partners.archive')}
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
