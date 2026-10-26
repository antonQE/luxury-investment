import { Box, Button, Heading, HStack, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { VIEWING_STATUSES, type ViewingStatus } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type SubmitEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { contactKeys, fetchAdminContacts } from '@/api/endpoints/contacts';
import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import {
  type AdminViewing,
  createAdminViewing,
  fetchAdminViewings,
  updateAdminViewing,
  viewingKeys,
} from '@/api/endpoints/viewings';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/types/api';

import {
  type CalendarMode,
  fromDatetimeLocalValue,
  rangeForMode,
  sameDay,
  shiftAnchor,
  toDatetimeLocalValue,
} from './calendar-range';
import { findOverlappingViewingIds } from './viewing-overlap';

export default function ViewingsCalendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<CalendarMode>('week');
  const [anchor, setAnchor] = useState(() => new Date());
  const [agentFilter, setAgentFilter] = useState<'all' | 'me'>('all');
  const [formError, setFormError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [scheduledLocal, setScheduledLocal] = useState(() =>
    toDatetimeLocalValue(new Date().toISOString()),
  );
  const [locationNote, setLocationNote] = useState('');

  const range = useMemo(() => rangeForMode(mode, anchor), [mode, anchor]);

  const listParams = useMemo(
    () => ({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      agentId: agentFilter === 'me' && user !== null ? user.id : undefined,
    }),
    [range, agentFilter, user],
  );

  const listQuery = useQuery({
    queryKey: viewingKeys.list(listParams),
    queryFn: () => fetchAdminViewings(listParams),
  });

  const propertiesQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });

  const contactsQuery = useQuery({
    queryKey: contactKeys.list(),
    queryFn: () => fetchAdminContacts(false),
  });

  const overlapIds = useMemo(
    () => findOverlappingViewingIds(listQuery.data ?? []),
    [listQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: createAdminViewing,
    onSuccess: async () => {
      setFormError(null);
      setLocationNote('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'viewings'] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('viewings.saveError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateAdminViewing>[1] }) =>
      updateAdminViewing(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'viewings'] });
    },
  });

  function onCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (user === null) {
      setFormError(t('viewings.saveError'));
      return;
    }
    if (propertyId === '' || contactId === '') {
      setFormError(t('viewings.requiredFields'));
      return;
    }
    createMutation.mutate({
      propertyId,
      contactId,
      agentId: user.id,
      scheduledAt: fromDatetimeLocalValue(scheduledLocal),
      locationNote,
      status: 'scheduled',
    });
  }

  function viewingsForDay(day: Date): AdminViewing[] {
    return (listQuery.data ?? []).filter((row) => sameDay(new Date(row.scheduledAt), day));
  }

  const rangeLabel = `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`;

  return (
    <VStack align="stretch" gap={6} data-testid="viewings-calendar-page">
      <Heading size="xl" color="text.primary">
        {t('viewings.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('viewings.lead')}
      </Text>

      <HStack gap={3} flexWrap="wrap" data-testid="viewings-calendar-controls">
        {(['day', 'week', 'month'] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={mode === item ? 'solid' : 'outline'}
            onClick={() => {
              setMode(item);
            }}
            data-testid={`viewings-mode-${item}`}
          >
            {t(`viewings.mode_${item}`)}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAnchor(shiftAnchor(mode, anchor, -1));
          }}
          data-testid="viewings-prev"
        >
          ←
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAnchor(new Date());
          }}
          data-testid="viewings-today"
        >
          {t('viewings.today')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAnchor(shiftAnchor(mode, anchor, 1));
          }}
          data-testid="viewings-next"
        >
          →
        </Button>
        <Text fontSize="sm" color="text.muted" data-testid="viewings-range-label">
          {rangeLabel}
        </Text>
        <select
          value={agentFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setAgentFilter(e.target.value === 'me' ? 'me' : 'all');
          }}
          data-testid="viewings-agent-filter"
        >
          <option value="all">{t('viewings.agentAll')}</option>
          <option value="me">{t('viewings.agentMe')}</option>
        </select>
      </HStack>

      {overlapIds.size > 0 ? (
        <Box
          borderWidth="1px"
          borderColor="border.default"
          bg="background.page"
          p={3}
          data-testid="viewings-overlap-warning"
        >
          <Text fontSize="sm" fontWeight="600">
            {t('viewings.overlapWarning', { count: overlapIds.size })}
          </Text>
        </Box>
      ) : null}

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
      >
        <form
          onSubmit={(event) => {
            onCreate(event);
          }}
        >
          <Heading size="md" mb={4}>
            {t('viewings.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="180px">
                <Text fontSize="sm" mb={1}>
                  {t('viewings.property')}
                </Text>
                <select
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                  }}
                  required
                  data-testid="viewing-property"
                >
                  <option value="">{t('viewings.selectProperty')}</option>
                  {(propertiesQuery.data ?? []).map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.referenceNumber} — {property.titleBg}
                    </option>
                  ))}
                </select>
              </Box>
              <Box flex="1" minW="180px">
                <Text fontSize="sm" mb={1}>
                  {t('viewings.contact')}
                </Text>
                <select
                  value={contactId}
                  onChange={(e) => {
                    setContactId(e.target.value);
                  }}
                  required
                  data-testid="viewing-contact"
                >
                  <option value="">{t('viewings.selectContact')}</option>
                  {(contactsQuery.data ?? []).map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.displayName}
                    </option>
                  ))}
                </select>
              </Box>
              <Box flex="1" minW="180px">
                <Text fontSize="sm" mb={1}>
                  {t('viewings.when')}
                </Text>
                <Input
                  type="datetime-local"
                  value={scheduledLocal}
                  onChange={(e) => {
                    setScheduledLocal(e.target.value);
                  }}
                  required
                  data-testid="viewing-scheduled-at"
                />
              </Box>
            </HStack>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('viewings.location')}
              </Text>
              <Input
                value={locationNote}
                onChange={(e) => {
                  setLocationNote(e.target.value);
                }}
                data-testid="viewing-location"
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
              data-testid="viewing-create-submit"
            >
              {t('viewings.create')}
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
        data-testid="viewings-calendar-grid"
      >
        {listQuery.isPending ? (
          <Spinner />
        ) : listQuery.isError ? (
          <Text color="status.down">
            {listQuery.error instanceof ApiError
              ? listQuery.error.message
              : t('viewings.loadError')}
          </Text>
        ) : (
          <VStack align="stretch" gap={4}>
            {range.days.map((day) => {
              const dayRows = viewingsForDay(day);
              return (
                <Box
                  key={day.toISOString()}
                  data-testid={`viewings-day-${day.toISOString().slice(0, 10)}`}
                >
                  <Text fontWeight="600" mb={2}>
                    {day.toLocaleDateString(undefined, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                    {dayRows.length > 0 ? ` (${String(dayRows.length)})` : ''}
                  </Text>
                  {dayRows.length === 0 ? (
                    <Text fontSize="sm" color="text.muted">
                      {t('viewings.emptyDay')}
                    </Text>
                  ) : (
                    <VStack align="stretch" gap={2}>
                      {dayRows.map((row) => (
                        <ViewingRow
                          key={row.id}
                          viewing={row}
                          overlapping={overlapIds.has(row.id)}
                          busy={updateMutation.isPending}
                          onReschedule={(iso) => {
                            updateMutation.mutate({
                              id: row.id,
                              body: { scheduledAt: iso, status: 'rescheduled' },
                            });
                          }}
                          onStatus={(status) => {
                            updateMutation.mutate({ id: row.id, body: { status } });
                          }}
                        />
                      ))}
                    </VStack>
                  )}
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}

function ViewingRow({
  viewing,
  overlapping,
  busy,
  onReschedule,
  onStatus,
}: {
  viewing: AdminViewing;
  overlapping: boolean;
  busy: boolean;
  onReschedule: (iso: string) => void;
  onStatus: (status: ViewingStatus) => void;
}) {
  const { t } = useTranslation();
  const [localWhen, setLocalWhen] = useState(() => toDatetimeLocalValue(viewing.scheduledAt));

  return (
    <Box
      borderWidth="1px"
      borderColor={overlapping ? 'status.down' : 'border.default'}
      p={3}
      data-testid={`viewing-row-${viewing.id}`}
      data-overlapping={overlapping ? 'true' : 'false'}
    >
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <VStack align="start" gap={0}>
          <Text fontSize="sm" fontWeight="600">
            {new Date(viewing.scheduledAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {t(`viewings.status_${viewing.status}`)}
            {overlapping ? ` · ${t('viewings.overlapBadge')}` : ''}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {viewing.locationNote !== '' ? viewing.locationNote : viewing.propertyId.slice(0, 8)}
          </Text>
        </VStack>
        <HStack gap={2} flexWrap="wrap">
          <Input
            type="datetime-local"
            size="sm"
            value={localWhen}
            onChange={(e) => {
              setLocalWhen(e.target.value);
            }}
            data-testid={`viewing-reschedule-input-${viewing.id}`}
          />
          <Button
            size="xs"
            variant="outline"
            disabled={busy}
            onClick={() => {
              onReschedule(fromDatetimeLocalValue(localWhen));
            }}
            data-testid={`viewing-reschedule-${viewing.id}`}
          >
            {t('viewings.reschedule')}
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={busy || viewing.status === 'declined'}
            onClick={() => {
              onStatus('declined');
            }}
            data-testid={`viewing-decline-${viewing.id}`}
          >
            {t('viewings.decline')}
          </Button>
          <select
            value={viewing.status}
            disabled={busy}
            aria-label={t('viewings.status')}
            data-testid={`viewing-status-${viewing.id}`}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              onStatus(e.target.value as ViewingStatus);
            }}
          >
            {VIEWING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`viewings.status_${status}`)}
              </option>
            ))}
          </select>
        </HStack>
      </HStack>
    </Box>
  );
}
