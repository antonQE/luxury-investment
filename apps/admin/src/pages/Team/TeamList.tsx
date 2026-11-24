import {
  Button,
  Heading,
  HStack,
  Image,
  Input,
  Spinner,
  Table,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { MARKETS, TEAM_MEMBER_KINDS } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type AdminTeamMemberDetail,
  type AdminTeamMemberWrite,
  archiveAdminTeamMember,
  createAdminTeamMember,
  fetchAdminTeam,
  fetchAdminTeamMember,
  teamKeys,
  updateAdminTeamMember,
  uploadAdminTeamPhoto,
} from '@/api/endpoints/team';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { dangerVariant } from '@/components/ui/button-variants';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { ApiError } from '@/types/api';

interface TeamFormState {
  slug: string;
  kind: string;
  nameBg: string;
  nameEn: string;
  roleBg: string;
  roleEn: string;
  bioBg: string;
  bioEn: string;
  email: string;
  phone: string;
  photoUrl: string;
  markets: string[];
  /** Comma-separated in the form; converted to string[] on save. */
  languages: string;
  qualifications: string;
  sortOrder: number;
  isPublic: boolean;
}

const emptyForm = (): TeamFormState => ({
  slug: '',
  kind: 'agent',
  nameBg: '',
  nameEn: '',
  roleBg: '',
  roleEn: '',
  bioBg: '',
  bioEn: '',
  email: '',
  phone: '',
  photoUrl: '',
  markets: [],
  languages: 'bg, en',
  qualifications: '',
  sortOrder: 0,
  isPublic: true,
});

function detailToForm(detail: AdminTeamMemberDetail): TeamFormState {
  return {
    slug: detail.slug,
    kind: detail.kind,
    nameBg: detail.nameBg,
    nameEn: detail.nameEn,
    roleBg: detail.roleBg,
    roleEn: detail.roleEn,
    bioBg: detail.bioBg,
    bioEn: detail.bioEn,
    email: detail.email ?? '',
    phone: detail.phone ?? '',
    photoUrl: detail.photoUrl ?? '',
    markets: detail.markets,
    languages: detail.languages.join(', '),
    qualifications: detail.qualifications ?? '',
    sortOrder: detail.sortOrder,
    isPublic: detail.isPublic,
  };
}

/** Parse comma-separated languages from the team edit form into a write payload array. */
export function parseLanguagesCsv(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function toWriteBody(form: TeamFormState): AdminTeamMemberWrite {
  const languages = parseLanguagesCsv(form.languages);
  return {
    slug: form.slug.trim(),
    kind: form.kind,
    nameBg: form.nameBg.trim(),
    nameEn: form.nameEn.trim(),
    roleBg: form.roleBg.trim(),
    roleEn: form.roleEn.trim(),
    bioBg: form.bioBg,
    bioEn: form.bioEn,
    email: form.email.trim() === '' ? null : form.email.trim(),
    phone: form.phone.trim() === '' ? null : form.phone.trim(),
    photoUrl: form.photoUrl.trim() === '' ? null : form.photoUrl.trim(),
    markets: form.markets.filter((market) => (MARKETS as readonly string[]).includes(market)),
    languages,
    qualifications: form.qualifications.trim() === '' ? null : form.qualifications.trim(),
    sortOrder: Number.isFinite(form.sortOrder) ? Math.trunc(form.sortOrder) : 0,
    isPublic: form.isPublic,
  };
}

function formatApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  const body = err.response as
    { error?: { message?: string; details?: { path?: string; message?: string }[] } } | undefined;
  const details = body?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => `${item.path ?? '?'}: ${item.message ?? 'invalid'}`).join('; ');
  }
  return err.message || fallback;
}

export default function TeamList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  /** null = create mode when editor is open; uuid = edit mode. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: teamKeys.list(),
    queryFn: fetchAdminTeam,
  });

  const detailQuery = useQuery({
    queryKey: teamKeys.detail(editingId ?? ''),
    queryFn: () => {
      if (editingId === null) throw new Error('no member');
      return fetchAdminTeamMember(editingId);
    },
    enabled: editorOpen && editingId !== null,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = toWriteBody(form);
      if (!(TEAM_MEMBER_KINDS as readonly string[]).includes(body.kind)) {
        throw new Error(t('team.kindRequired'));
      }
      if (editingId === null) {
        return createAdminTeamMember(body);
      }
      return updateAdminTeamMember(editingId, body);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: teamKeys.list() });
      if (editingId === null && 'id' in result) {
        setEditingId(result.id);
        setEditorOpen(true);
        await queryClient.invalidateQueries({ queryKey: teamKeys.detail(result.id) });
      } else if (editingId !== null) {
        await queryClient.invalidateQueries({ queryKey: teamKeys.detail(editingId) });
      }
      setFormError(null);
    },
    onError: (err) => {
      setFormError(formatApiError(err, t('team.saveError')));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (editingId === null) throw new Error('save first');
      return uploadAdminTeamPhoto(editingId, file);
    },
    onSuccess: async (detail) => {
      setForm((current) => ({ ...current, photoUrl: detail.photoUrl ?? '' }));
      await queryClient.invalidateQueries({ queryKey: teamKeys.list() });
      if (editingId !== null) {
        await queryClient.invalidateQueries({ queryKey: teamKeys.detail(editingId) });
      }
      setFormError(null);
    },
    onError: () => {
      setFormError(t('team.photoUploadError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminTeamMember,
    onSuccess: async () => {
      closeEditor();
      await queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    },
  });

  function closeEditor() {
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setFormError(null);
    setEditorOpen(true);
    void fetchAdminTeamMember(id)
      .then((detail) => {
        setForm(detailToForm(detail));
        queryClient.setQueryData(teamKeys.detail(id), detail);
      })
      .catch((err: unknown) => {
        setFormError(formatApiError(err, t('team.loadError')));
      });
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    uploadMutation.mutate(file);
  }

  function toggleMarket(market: string) {
    setForm((current) => ({
      ...current,
      markets: current.markets.includes(market)
        ? current.markets.filter((value) => value !== market)
        : [...current.markets, market],
    }));
  }

  return (
    <VStack align="stretch" gap={6} data-testid="team-admin-page">
      <PageHeader
        title={t('team.title')}
        lead={t('team.lead')}
        actions={
          <Button size="sm" onClick={openCreate} data-testid="team-open-create">
            {t('team.create')}
          </Button>
        }
      />

      {editorOpen ? (
        <Panel>
          <form
            onSubmit={(event) => {
              onSubmit(event);
            }}
          >
            <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
              <Heading size="md">{editingId === null ? t('team.create') : t('team.edit')}</Heading>
              <HStack gap={2}>
                {editingId !== null ? (
                  <Button size="sm" variant="outline" onClick={openCreate} data-testid="team-new">
                    {t('team.create')}
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={closeEditor} data-testid="team-close">
                  {t('team.close')}
                </Button>
              </HStack>
            </HStack>

            {editingId !== null && detailQuery.isPending ? (
              <Spinner />
            ) : (
              <VStack align="stretch" gap={3}>
                <HStack gap={3} flexWrap="wrap">
                  <Field label={t('team.slug')} required>
                    <Input
                      value={form.slug}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, slug: e.target.value }));
                      }}
                      required
                      data-testid="team-slug"
                    />
                  </Field>
                  <Field label={t('team.kind')} required>
                    <AdminSelect
                      value={form.kind}
                      onChange={(value) => {
                        setForm((current) => ({ ...current, kind: value }));
                      }}
                      options={TEAM_MEMBER_KINDS.map((value) => ({ value, label: value }))}
                      clearable={false}
                      data-testid="team-kind"
                    />
                  </Field>
                  <Field label={t('team.sortOrder')}>
                    <Input
                      type="number"
                      value={String(form.sortOrder)}
                      onChange={(e) => {
                        setForm((current) => ({
                          ...current,
                          sortOrder: Number(e.target.value) || 0,
                        }));
                      }}
                      data-testid="team-sort-order"
                    />
                  </Field>
                </HStack>

                <HStack gap={3} flexWrap="wrap">
                  <Field label={t('team.nameBg')} required>
                    <Input
                      value={form.nameBg}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, nameBg: e.target.value }));
                      }}
                      required
                      data-testid="team-name-bg"
                    />
                  </Field>
                  <Field label={t('team.nameEn')} required>
                    <Input
                      value={form.nameEn}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, nameEn: e.target.value }));
                      }}
                      required
                      data-testid="team-name-en"
                    />
                  </Field>
                </HStack>

                <HStack gap={3} flexWrap="wrap">
                  <Field label={t('team.roleBg')} required>
                    <Input
                      value={form.roleBg}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, roleBg: e.target.value }));
                      }}
                      required
                      data-testid="team-role-bg"
                    />
                  </Field>
                  <Field label={t('team.roleEn')} required>
                    <Input
                      value={form.roleEn}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, roleEn: e.target.value }));
                      }}
                      required
                      data-testid="team-role-en"
                    />
                  </Field>
                </HStack>

                <HStack gap={3} flexWrap="wrap" align="flex-start">
                  <Field label={t('team.bioBg')}>
                    <Textarea
                      value={form.bioBg}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, bioBg: e.target.value }));
                      }}
                      rows={4}
                      data-testid="team-bio-bg"
                    />
                  </Field>
                  <Field label={t('team.bioEn')}>
                    <Textarea
                      value={form.bioEn}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, bioEn: e.target.value }));
                      }}
                      rows={4}
                      data-testid="team-bio-en"
                    />
                  </Field>
                </HStack>

                <HStack gap={3} flexWrap="wrap">
                  <Field label={t('team.email')}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, email: e.target.value }));
                      }}
                      data-testid="team-email"
                    />
                  </Field>
                  <Field label={t('team.phone')}>
                    <Input
                      value={form.phone}
                      onChange={(e) => {
                        setForm((current) => ({ ...current, phone: e.target.value }));
                      }}
                      data-testid="team-phone"
                    />
                  </Field>
                </HStack>

                <Field label={t('team.photoUrl')}>
                  <Input
                    value={form.photoUrl}
                    onChange={(e) => {
                      setForm((current) => ({ ...current, photoUrl: e.target.value }));
                    }}
                    placeholder="https://"
                    data-testid="team-photo-url"
                  />
                </Field>

                {form.photoUrl !== '' ? (
                  <Image
                    src={form.photoUrl}
                    alt=""
                    maxW="160px"
                    maxH="200px"
                    objectFit="cover"
                    data-testid="team-photo-preview"
                  />
                ) : null}

                {editingId !== null ? (
                  <Field label={t('team.photoUpload')}>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={onPhotoChange}
                      data-testid="team-photo-file"
                    />
                  </Field>
                ) : (
                  <Text fontSize="sm" color="text.muted">
                    {t('team.photoUploadAfterSave')}
                  </Text>
                )}

                <Field label={t('team.markets')}>
                  <HStack gap={3} flexWrap="wrap" data-testid="team-markets">
                    {MARKETS.map((market) => (
                      <HStack as="label" key={market} gap={2}>
                        <input
                          type="checkbox"
                          checked={form.markets.includes(market)}
                          onChange={() => {
                            toggleMarket(market);
                          }}
                          aria-label={market}
                        />
                        <Text fontSize="sm">{market}</Text>
                      </HStack>
                    ))}
                  </HStack>
                </Field>

                <Field label={t('team.languages')}>
                  <Input
                    value={form.languages}
                    onChange={(e) => {
                      setForm((current) => ({ ...current, languages: e.target.value }));
                    }}
                    placeholder="bg, en"
                    data-testid="team-languages"
                  />
                </Field>

                <Field label={t('team.qualifications')}>
                  <Textarea
                    value={form.qualifications}
                    onChange={(e) => {
                      setForm((current) => ({ ...current, qualifications: e.target.value }));
                    }}
                    rows={2}
                    data-testid="team-qualifications"
                  />
                </Field>

                <HStack as="label" gap={2}>
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => {
                      setForm((current) => ({ ...current, isPublic: e.target.checked }));
                    }}
                    data-testid="team-is-public"
                    aria-label={t('team.isPublic')}
                  />
                  <Text fontSize="sm">{t('team.isPublic')}</Text>
                </HStack>

                {formError !== null ? (
                  <Text color="status.down" fontSize="sm" data-testid="team-form-error">
                    {formError}
                  </Text>
                ) : null}

                <HStack gap={2}>
                  <Button
                    type="submit"
                    alignSelf="flex-start"
                    loading={saveMutation.isPending || uploadMutation.isPending}
                    data-testid="team-save-submit"
                  >
                    {editingId === null ? t('team.create') : t('team.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditor}
                    data-testid="team-cancel"
                  >
                    {t('team.close')}
                  </Button>
                </HStack>
              </VStack>
            )}
          </form>
        </Panel>
      ) : null}

      <Panel overflowX="auto">
        {listQuery.isPending ? (
          <Spinner />
        ) : listQuery.isError ? (
          <Text color="status.down">{t('team.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="team-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader />
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
                  <Table.Cell>
                    {row.photoUrl !== null ? (
                      <Image src={row.photoUrl} alt="" boxSize="40px" objectFit="cover" />
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>{row.slug}</Table.Cell>
                  <Table.Cell>{row.kind}</Table.Cell>
                  <Table.Cell>{row.name.bg}</Table.Cell>
                  <Table.Cell>{row.name.en}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack justify="flex-end" gap={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          openEdit(row.id);
                        }}
                        data-testid={`team-edit-${row.slug}`}
                      >
                        {t('team.edit')}
                      </Button>
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
