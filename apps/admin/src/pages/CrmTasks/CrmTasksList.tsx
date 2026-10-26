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
  completeAdminCrmTask,
  createAdminCrmTask,
  crmTaskKeys,
  fetchAdminCrmTasks,
} from '@/api/endpoints/crm-tasks';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/types/api';

import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../Viewings/calendar-range';

export default function CrmTasksList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueLocal, setDueLocal] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + 86_400_000).toISOString()),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());

  const listQuery = useQuery({
    queryKey: crmTaskKeys.list(),
    queryFn: () => fetchAdminCrmTasks(),
  });

  const createMutation = useMutation({
    mutationFn: createAdminCrmTask,
    onSuccess: async () => {
      setTitle('');
      setNotes('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'crm-tasks'] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('crmTasks.saveError'));
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeAdminCrmTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'crm-tasks'] });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (user === null) {
      setFormError(t('crmTasks.saveError'));
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      notes,
      kind: 'manual',
      assigneeId: user.id,
      dueAt: fromDatetimeLocalValue(dueLocal),
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="crm-tasks-admin-page">
      <Heading size="xl" color="text.primary">
        {t('crmTasks.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('crmTasks.lead')}
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
            {t('crmTasks.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('crmTasks.taskTitle')}
              </Text>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                required
                data-testid="crm-task-title"
              />
            </Box>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="180px">
                <Text fontSize="sm" mb={1}>
                  {t('crmTasks.dueAt')}
                </Text>
                <Input
                  type="datetime-local"
                  value={dueLocal}
                  onChange={(e) => {
                    setDueLocal(e.target.value);
                  }}
                  required
                  data-testid="crm-task-due"
                />
              </Box>
              <Box flex="2" minW="180px">
                <Text fontSize="sm" mb={1}>
                  {t('crmTasks.notes')}
                </Text>
                <Input
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                  }}
                  data-testid="crm-task-notes"
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
              data-testid="crm-task-create-submit"
            >
              {t('crmTasks.create')}
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
            {listQuery.error instanceof ApiError
              ? listQuery.error.message
              : t('crmTasks.loadError')}
          </Text>
        ) : listQuery.data.length === 0 ? (
          <Text color="text.muted">{t('crmTasks.empty')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="crm-tasks-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('crmTasks.taskTitle')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('crmTasks.kind')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('crmTasks.dueAt')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('crmTasks.status')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => {
                const overdue = row.status === 'open' && new Date(row.dueAt).getTime() < nowMs;
                return (
                  <Table.Row key={row.id} data-overdue={overdue ? 'true' : 'false'}>
                    <Table.Cell>{row.title}</Table.Cell>
                    <Table.Cell>{t(`crmTasks.kind_${row.kind}`)}</Table.Cell>
                    <Table.Cell>
                      {new Date(row.dueAt).toLocaleString()}
                      {overdue ? ` · ${t('crmTasks.overdue')}` : ''}
                    </Table.Cell>
                    <Table.Cell>{t(`crmTasks.status_${row.status}`)}</Table.Cell>
                    <Table.Cell textAlign="end">
                      {row.status === 'open' ? (
                        <Button
                          size="xs"
                          variant="outline"
                          loading={completeMutation.isPending}
                          onClick={() => {
                            completeMutation.mutate(row.id);
                          }}
                          data-testid={`crm-task-complete-${row.id}`}
                        >
                          {t('crmTasks.complete')}
                        </Button>
                      ) : null}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </VStack>
  );
}
