import { Button, Heading, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { TEAM_MEMBER_KINDS } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveAdminTeamMember,
  createAdminTeamMember,
  fetchAdminTeam,
  teamKeys,
} from '@/api/endpoints/team';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { dangerVariant } from '@/components/ui/button-variants';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
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
      <PageHeader title={t('team.title')} lead={t('team.lead')} />

      <Panel>
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
              <Field label={t('team.slug')} required>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                  }}
                  required
                  data-testid="team-slug"
                />
              </Field>
              <Field label={t('team.kind')}>
                <AdminSelect
                  value={kind}
                  onChange={(value) => {
                    setKind(value as (typeof TEAM_MEMBER_KINDS)[number]);
                  }}
                  options={TEAM_MEMBER_KINDS.map((value) => ({ value, label: value }))}
                  data-testid="team-kind"
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('team.nameBg')} required>
                <Input
                  value={nameBg}
                  onChange={(e) => {
                    setNameBg(e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label={t('team.nameEn')} required>
                <Input
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                  }}
                  required
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('team.roleBg')} required>
                <Input
                  value={roleBg}
                  onChange={(e) => {
                    setRoleBg(e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label={t('team.roleEn')} required>
                <Input
                  value={roleEn}
                  onChange={(e) => {
                    setRoleEn(e.target.value);
                  }}
                  required
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
              data-testid="team-create-submit"
            >
              {t('team.create')}
            </Button>
          </VStack>
        </form>
      </Panel>

      <Panel overflowX="auto">
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
                      variant={dangerVariant}
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
      </Panel>
    </VStack>
  );
}
