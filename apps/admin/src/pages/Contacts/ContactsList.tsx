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
  CONTACT_KINDS,
  CONTACT_ROLES,
  type ContactKind,
  type ContactRole,
} from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type AdminContact,
  archiveAdminContact,
  type ContactDuplicateHint,
  contactKeys,
  createAdminContact,
  fetchAdminContacts,
  fetchContactDuplicates,
  updateAdminContact,
} from '@/api/endpoints/contacts';
import { ApiError } from '@/types/api';

interface ContactFormState {
  kind: ContactKind;
  displayName: string;
  email: string;
  phone: string;
  notes: string;
  roles: ContactRole[];
}

const emptyForm: ContactFormState = {
  kind: 'person',
  displayName: '',
  email: '',
  phone: '',
  notes: '',
  roles: [],
};

export default function ContactsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateHints, setDuplicateHints] = useState<ContactDuplicateHint[]>([]);

  const listQuery = useQuery({
    queryKey: contactKeys.list(),
    queryFn: () => fetchAdminContacts(false),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        kind: form.kind,
        displayName: form.displayName.trim(),
        email: form.email.trim() === '' ? null : form.email.trim(),
        phone: form.phone.trim() === '' ? null : form.phone.trim(),
        notes: form.notes,
        roles: form.roles,
      };
      if (editingId === null) {
        return createAdminContact(body);
      }
      return updateAdminContact(editingId, body);
    },
    onSuccess: async (result) => {
      setDuplicateHints(result.duplicateHints);
      setForm(emptyForm);
      setEditingId(null);
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: contactKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('contacts.saveError'));
    },
  });

  async function checkDuplicates() {
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (email === '' && phone === '') {
      setDuplicateHints([]);
      return;
    }
    try {
      const hints = await fetchContactDuplicates({
        email: email === '' ? undefined : email,
        phone: phone === '' ? undefined : phone,
        excludeId: editingId ?? undefined,
      });
      setDuplicateHints(hints);
    } catch {
      setDuplicateHints([]);
    }
  }

  const archiveMutation = useMutation({
    mutationFn: archiveAdminContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contactKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function startEdit(row: AdminContact) {
    setEditingId(row.id);
    setForm({
      kind: row.kind,
      displayName: row.displayName,
      email: row.email ?? '',
      phone: row.phone ?? '',
      notes: row.notes,
      roles: [...row.roles],
    });
    setFormError(null);
    setDuplicateHints([]);
  }

  function toggleRole(role: ContactRole, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, role] : prev.roles.filter((r) => r !== role),
    }));
  }

  return (
    <VStack align="stretch" gap={6} data-testid="contacts-admin-page">
      <Heading size="xl" color="text.primary">
        {t('contacts.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('contacts.lead')}
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
            {editingId === null ? t('contacts.create') : t('contacts.edit')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('contacts.kind')}
                </Text>
                <select
                  value={form.kind}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setForm((prev) => ({
                      ...prev,
                      kind: e.target.value as ContactKind,
                    }));
                  }}
                  data-testid="contact-kind"
                >
                  {CONTACT_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {t(`contacts.kind_${kind}`)}
                    </option>
                  ))}
                </select>
              </Box>
              <Box flex="2" minW="180px">
                <Text fontSize="sm" mb={1}>
                  {t('contacts.displayName')}
                </Text>
                <Input
                  value={form.displayName}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, displayName: e.target.value }));
                  }}
                  required
                  data-testid="contact-display-name"
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="160px">
                <Text fontSize="sm" mb={1}>
                  {t('contacts.email')}
                </Text>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  data-testid="contact-email"
                />
              </Box>
              <Box flex="1" minW="160px">
                <Text fontSize="sm" mb={1}>
                  {t('contacts.phone')}
                </Text>
                <Input
                  value={form.phone}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, phone: e.target.value }));
                  }}
                  data-testid="contact-phone"
                />
              </Box>
            </HStack>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('contacts.notes')}
              </Text>
              <Input
                value={form.notes}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, notes: e.target.value }));
                }}
                data-testid="contact-notes"
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>
                {t('contacts.roles')}
              </Text>
              <HStack gap={3} flexWrap="wrap" data-testid="contact-roles">
                {CONTACT_ROLES.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={form.roles.includes(role)}
                      onChange={(e) => {
                        toggleRole(role, e.target.checked);
                      }}
                      data-testid={`contact-role-${role}`}
                    />{' '}
                    {t(`contacts.role_${role}`)}
                  </label>
                ))}
              </HStack>
            </Box>
            {formError !== null ? (
              <Text color="status.down" fontSize="sm">
                {formError}
              </Text>
            ) : null}
            {duplicateHints.length > 0 ? (
              <Box
                borderWidth="1px"
                borderColor="border.default"
                bg="background.page"
                p={3}
                data-testid="contact-duplicate-hints"
              >
                <Text fontSize="sm" fontWeight="600" mb={2}>
                  {t('contacts.duplicateWarning')}
                </Text>
                <VStack align="stretch" gap={1}>
                  {duplicateHints.map((hint) => (
                    <Text key={hint.id} fontSize="sm" color="text.muted">
                      {hint.displayName}
                      {hint.email !== null ? ` · ${hint.email}` : ''}
                      {hint.phone !== null ? ` · ${hint.phone}` : ''}
                    </Text>
                  ))}
                </VStack>
              </Box>
            ) : null}
            <HStack gap={3}>
              <Button
                type="submit"
                loading={saveMutation.isPending}
                data-testid="contact-save-submit"
              >
                {editingId === null ? t('contacts.create') : t('contacts.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void checkDuplicates();
                }}
                data-testid="contact-check-duplicates"
              >
                {t('contacts.checkDuplicates')}
              </Button>
              {editingId !== null ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setFormError(null);
                    setDuplicateHints([]);
                  }}
                >
                  {t('contacts.cancel')}
                </Button>
              ) : null}
            </HStack>
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
            {listQuery.error instanceof ApiError
              ? listQuery.error.message
              : t('contacts.loadError')}
          </Text>
        ) : listQuery.data.length === 0 ? (
          <Text color="text.muted">{t('contacts.empty')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="contacts-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('contacts.displayName')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('contacts.kind')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('contacts.email')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('contacts.roles')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.displayName}</Table.Cell>
                  <Table.Cell>{t(`contacts.kind_${row.kind}`)}</Table.Cell>
                  <Table.Cell>{row.email ?? '—'}</Table.Cell>
                  <Table.Cell>
                    {row.roles.map((role) => t(`contacts.role_${role}`)).join(', ')}
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap={2} justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          startEdit(row);
                        }}
                        data-testid={`contact-edit-${row.id}`}
                      >
                        {t('contacts.edit')}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          archiveMutation.mutate(row.id);
                        }}
                        data-testid={`contact-archive-${row.id}`}
                      >
                        {t('contacts.archive')}
                      </Button>
                    </HStack>
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
