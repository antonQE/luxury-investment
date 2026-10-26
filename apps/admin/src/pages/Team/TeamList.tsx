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
import { TEAM_MEMBER_KINDS } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveAdminTeamMember,
  createAdminTeamMember,
  fetchAdminTeam,
  teamKeys,
} from '@/api/endpoints/team';
import { ApiError } from '@/types/api';

export default function TeamList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState('');
  const [kind, setKind] = useState<(typeof TEAM_MEMBER_KINDS)[number]>('agent');
  const [nameBg, setNameBg] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleBg, setRoleBg] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: teamKeys.list(),
    queryFn: fetchAdminTeam,
  });

  const createMutation = useMutation({
    mutationFn: createAdminTeamMember,
    onSuccess: async () => {
      setSlug('');
      setNameBg('');
      setNameEn('');
      setRoleBg('');
      setRoleEn('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('team.saveError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminTeamMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      slug: slug.trim(),
      kind,
      nameBg: nameBg.trim(),
      nameEn: nameEn.trim(),
      roleBg: roleBg.trim(),
      roleEn: roleEn.trim(),
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="team-admin-page">
      <Heading size="xl" color="text.primary">
        {t('team.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('team.lead')}
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
            {t('team.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('team.slug')}
                </Text>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                  }}
                  required
                  data-testid="team-slug"
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('team.kind')}
                </Text>
                <select
                  style={{ width: '100%', height: '2.5rem', padding: '0 0.75rem' }}
                  value={kind}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setKind(event.target.value as (typeof TEAM_MEMBER_KINDS)[number]);
                  }}
                  data-testid="team-kind"
                >
                  {TEAM_MEMBER_KINDS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('team.nameBg')}
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
                  {t('team.nameEn')}
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
                  {t('team.roleBg')}
                </Text>
                <Input
                  value={roleBg}
                  onChange={(e) => {
                    setRoleBg(e.target.value);
                  }}
                  required
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('team.roleEn')}
                </Text>
                <Input
                  value={roleEn}
                  onChange={(e) => {
                    setRoleEn(e.target.value);
                  }}
                  required
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
              data-testid="team-create-submit"
            >
              {t('team.create')}
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
          <Text color="status.down">{t('team.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="team-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('team.slug')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('team.kind')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('team.nameBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('team.nameEn')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.slug}</Table.Cell>
                  <Table.Cell>{row.kind}</Table.Cell>
                  <Table.Cell>{row.name.bg}</Table.Cell>
                  <Table.Cell>{row.name.en}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        archiveMutation.mutate(row.id);
                      }}
                      data-testid={`team-archive-${row.slug}`}
                    >
                      {t('team.archive')}
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
