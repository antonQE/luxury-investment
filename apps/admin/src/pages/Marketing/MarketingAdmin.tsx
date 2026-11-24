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
  MARKETING_ACTIVITY_STATUSES,
  type MarketingActivityStatus,
  PORTAL_LISTING_STATUSES,
  type PortalListingStatus,
} from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  appendPortalMeasurement,
  createMarketingActivity,
  createPortalListing,
  fetchMarketingActivities,
  fetchPortalListings,
  fetchPortalMeasurements,
  marketingKeys,
} from '@/api/endpoints/marketing';
import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TasksSectionNav } from '@/pages/Tasks/TasksSectionNav';
import { ApiError } from '@/types/api';

export default function MarketingAdmin() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [propertyId, setPropertyId] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [activityType, setActivityType] = useState('social');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityStatus, setActivityStatus] = useState<MarketingActivityStatus>('planned');

  const [portalName, setPortalName] = useState('');
  const [listingUrl, setListingUrl] = useState('');
  const [portalStatus, setPortalStatus] = useState<PortalListingStatus>('draft');

  const [measuredOn, setMeasuredOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [views, setViews] = useState('0');
  const [saves, setSaves] = useState('0');

  const propertiesQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });

  const activitiesQuery = useQuery({
    queryKey: marketingKeys.activities(propertyId),
    queryFn: () => fetchMarketingActivities(propertyId),
    enabled: propertyId !== '',
  });

  const portalsQuery = useQuery({
    queryKey: marketingKeys.portals(propertyId),
    queryFn: () => fetchPortalListings(propertyId),
    enabled: propertyId !== '',
  });

  const measurementsQuery = useQuery({
    queryKey: marketingKeys.measurements(selectedListingId ?? ''),
    queryFn: () => {
      if (selectedListingId === null) throw new Error('no listing');
      return fetchPortalMeasurements(selectedListingId);
    },
    enabled: selectedListingId !== null,
  });

  const createActivityMutation = useMutation({
    mutationFn: createMarketingActivity,
    onSuccess: async () => {
      setActivityTitle('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: marketingKeys.activities(propertyId) });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('marketing.saveError'));
    },
  });

  const createPortalMutation = useMutation({
    mutationFn: createPortalListing,
    onSuccess: async () => {
      setPortalName('');
      setListingUrl('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: marketingKeys.portals(propertyId) });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('marketing.saveError'));
    },
  });

  const appendMeasurementMutation = useMutation({
    mutationFn: (body: { listingId: string; measuredOn: string; views: number; saves: number }) =>
      appendPortalMeasurement(body.listingId, {
        measuredOn: body.measuredOn,
        periodLabel: '',
        views: body.views,
        saves: body.saves,
        metricDefinition: '',
        notes: '',
      }),
    onSuccess: async () => {
      setFormError(null);
      if (selectedListingId !== null) {
        await queryClient.invalidateQueries({
          queryKey: marketingKeys.measurements(selectedListingId),
        });
      }
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('marketing.saveError'));
    },
  });

  function onCreateActivity(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (propertyId === '') return;
    createActivityMutation.mutate({
      propertyId,
      activityType: activityType.trim(),
      title: activityTitle.trim(),
      status: activityStatus,
      costCurrency: 'EUR',
      resultNotes: '',
      recurrence: '',
    });
  }

  function onCreatePortal(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (propertyId === '') return;
    createPortalMutation.mutate({
      propertyId,
      portalName: portalName.trim(),
      listingUrl: listingUrl.trim(),
      status: portalStatus,
      notes: '',
    });
  }

  function onAppendMeasurement(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedListingId === null) return;
    appendMeasurementMutation.mutate({
      listingId: selectedListingId,
      measuredOn,
      views: Number.parseInt(views, 10) || 0,
      saves: Number.parseInt(saves, 10) || 0,
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="marketing-admin-page">
      <PageHeader title={t('marketing.title')} lead={t('marketing.lead')} />
      <TasksSectionNav />

      <Panel>
        <Field label={t('marketing.property')}>
          <AdminSelect
            value={propertyId}
            onChange={(value) => {
              setPropertyId(value);
              setSelectedListingId(null);
              setFormError(null);
            }}
            data-testid="marketing-property"
            options={[
              { value: '', label: t('marketing.selectProperty') },
              ...(propertiesQuery.data ?? []).map((property) => ({
                value: property.id,
                label: `${property.referenceNumber} — ${property.titleBg}`,
              })),
            ]}
          />
        </Field>
      </Panel>

      {formError !== null ? (
        <Text color="status.down" data-testid="marketing-form-error">
          {formError}
        </Text>
      ) : null}

      {propertyId === '' ? (
        <Text color="text.muted">{t('marketing.pickProperty')}</Text>
      ) : (
        <>
          <Panel>
            <Heading size="md" mb={4}>
              {t('marketing.activities')}
            </Heading>
            <form
              onSubmit={(event) => {
                onCreateActivity(event);
              }}
            >
              <HStack gap={3} flexWrap="wrap" mb={4}>
                <Field label={t('marketing.activityType')} minW="120px" required>
                  <Input
                    value={activityType}
                    onChange={(e) => {
                      setActivityType(e.target.value);
                    }}
                    required
                    data-testid="marketing-activity-type"
                  />
                </Field>
                <Field label={t('marketing.activityTitle')} minW="160px" required>
                  <Input
                    value={activityTitle}
                    onChange={(e) => {
                      setActivityTitle(e.target.value);
                    }}
                    required
                    data-testid="marketing-activity-title"
                  />
                </Field>
                <Field label={t('marketing.status')} minW="120px">
                  <AdminSelect
                    value={activityStatus}
                    onChange={(value) => {
                      setActivityStatus(value as MarketingActivityStatus);
                    }}
                    data-testid="marketing-activity-status"
                    options={MARKETING_ACTIVITY_STATUSES.map((status) => ({
                      value: status,
                      label: t(`marketing.activityStatus_${status}`),
                    }))}
                  />
                </Field>
                <Button
                  type="submit"
                  mt={5}
                  loading={createActivityMutation.isPending}
                  data-testid="marketing-activity-submit"
                >
                  {t('marketing.createActivity')}
                </Button>
              </HStack>
            </form>

            {activitiesQuery.isPending ? (
              <Spinner />
            ) : activitiesQuery.isError ? (
              <Text color="status.down">{t('marketing.loadError')}</Text>
            ) : activitiesQuery.data.length === 0 ? (
              <Text color="text.muted">{t('marketing.emptyActivities')}</Text>
            ) : (
              <Table.Root size="sm" data-testid="marketing-activities-table">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t('marketing.activityTitle')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('marketing.activityType')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('marketing.status')}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {activitiesQuery.data.map((row) => (
                    <Table.Row key={row.id}>
                      <Table.Cell>{row.title}</Table.Cell>
                      <Table.Cell>{row.activityType}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge
                          value={row.status}
                          label={t(`marketing.activityStatus_${row.status}`, {
                            defaultValue: row.status,
                          })}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Panel>

          <Panel>
            <Heading size="md" mb={4}>
              {t('marketing.portals')}
            </Heading>
            <form
              onSubmit={(event) => {
                onCreatePortal(event);
              }}
            >
              <HStack gap={3} flexWrap="wrap" mb={4}>
                <Field label={t('marketing.portalName')} minW="140px" required>
                  <Input
                    value={portalName}
                    onChange={(e) => {
                      setPortalName(e.target.value);
                    }}
                    required
                    data-testid="marketing-portal-name"
                  />
                </Field>
                <Field label={t('marketing.listingUrl')} minW="180px">
                  <Input
                    value={listingUrl}
                    onChange={(e) => {
                      setListingUrl(e.target.value);
                    }}
                    data-testid="marketing-listing-url"
                  />
                </Field>
                <Field label={t('marketing.status')} minW="120px">
                  <AdminSelect
                    value={portalStatus}
                    onChange={(value) => {
                      setPortalStatus(value as PortalListingStatus);
                    }}
                    data-testid="marketing-portal-status"
                    options={PORTAL_LISTING_STATUSES.map((status) => ({
                      value: status,
                      label: t(`marketing.portalStatus_${status}`),
                    }))}
                  />
                </Field>
                <Button
                  type="submit"
                  mt={5}
                  loading={createPortalMutation.isPending}
                  data-testid="marketing-portal-submit"
                >
                  {t('marketing.createPortal')}
                </Button>
              </HStack>
            </form>

            {portalsQuery.isPending ? (
              <Spinner />
            ) : portalsQuery.isError ? (
              <Text color="status.down">{t('marketing.loadError')}</Text>
            ) : portalsQuery.data.length === 0 ? (
              <Text color="text.muted">{t('marketing.emptyPortals')}</Text>
            ) : (
              <Table.Root size="sm" data-testid="marketing-portals-table">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t('marketing.portalName')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('marketing.status')}</Table.ColumnHeader>
                    <Table.ColumnHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {portalsQuery.data.map((row) => (
                    <Table.Row key={row.id}>
                      <Table.Cell>{row.portalName}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge
                          value={row.status}
                          label={t(`marketing.portalStatus_${row.status}`, {
                            defaultValue: row.status,
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        <Button
                          size="xs"
                          variant={selectedListingId === row.id ? 'solid' : 'outline'}
                          onClick={() => {
                            setSelectedListingId(row.id);
                          }}
                          data-testid={`marketing-select-portal-${row.portalName}`}
                        >
                          {t('marketing.measurements')}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}

            {selectedListingId !== null ? (
              <Box mt={6}>
                <Heading size="sm" mb={3}>
                  {t('marketing.appendMeasurement')}
                </Heading>
                <form
                  onSubmit={(event) => {
                    onAppendMeasurement(event);
                  }}
                >
                  <HStack gap={3} flexWrap="wrap" mb={4}>
                    <Field label={t('marketing.measuredOn')} minW="140px" required>
                      <Input
                        type="date"
                        value={measuredOn}
                        onChange={(e) => {
                          setMeasuredOn(e.target.value);
                        }}
                        required
                        data-testid="marketing-measured-on"
                      />
                    </Field>
                    <Field label={t('marketing.views')} minW="100px">
                      <Input
                        value={views}
                        onChange={(e) => {
                          setViews(e.target.value);
                        }}
                        data-testid="marketing-views"
                      />
                    </Field>
                    <Field label={t('marketing.saves')} minW="100px">
                      <Input
                        value={saves}
                        onChange={(e) => {
                          setSaves(e.target.value);
                        }}
                        data-testid="marketing-saves"
                      />
                    </Field>
                    <Button
                      type="submit"
                      mt={5}
                      loading={appendMeasurementMutation.isPending}
                      data-testid="marketing-measurement-submit"
                    >
                      {t('marketing.append')}
                    </Button>
                  </HStack>
                </form>

                {measurementsQuery.isPending ? (
                  <Spinner />
                ) : measurementsQuery.isError ? (
                  <Text color="status.down">{t('marketing.loadError')}</Text>
                ) : measurementsQuery.data.length === 0 ? (
                  <Text color="text.muted">{t('marketing.emptyMeasurements')}</Text>
                ) : (
                  <Table.Root size="sm" data-testid="marketing-measurements-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>{t('marketing.measuredOn')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('marketing.views')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('marketing.saves')}</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {measurementsQuery.data.map((row) => (
                        <Table.Row key={row.id}>
                          <Table.Cell>{row.measuredOn}</Table.Cell>
                          <Table.Cell>{row.views}</Table.Cell>
                          <Table.Cell>{row.saves}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                )}
              </Box>
            ) : null}
          </Panel>
        </>
      )}
    </VStack>
  );
}
