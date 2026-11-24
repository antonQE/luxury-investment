import { Button, Heading, HStack, Input, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import { LOCATION_KINDS, TRANSACTION_TYPES } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { analyticsKeys, fetchPropertyViewStats } from '@/api/endpoints/analytics';
import {
  type AdminLocation,
  catalogKeys,
  createLocation,
  fetchLocations,
  fetchTaxonomy,
} from '@/api/endpoints/catalog';
import {
  type AdminProperty,
  archiveAdminProperty,
  createAdminProperty,
  fetchAdminProperty,
  propertyKeys,
  type PropertyWriteBody,
  publishAdminProperty,
  updateAdminProperty,
} from '@/api/endpoints/properties';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { dangerVariant } from '@/components/ui/button-variants';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyGallery } from '@/pages/Properties/PropertyGallery';
import { ApiError } from '@/types/api';

const emptyForm: PropertyWriteBody = {
  titleBg: '',
  titleEn: '',
  excerptBg: '',
  excerptEn: '',
  descriptionBg: '',
  descriptionEn: '',
  transactionType: 'sale',
  propertyType: 'apartment',
  market: 'sofia',
  country: 'България',
  city: 'София',
  district: '',
  locationId: null,
  price: '',
  currency: 'EUR',
  area: '',
  builtUpArea: '',
  primaryArea: 'built_up',
  primaryAreaLabelBg: 'Застроена площ',
  primaryAreaLabelEn: 'Built-up area',
  imageUrls: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
  ],
  agentName: 'Demo Agent',
  agentPhone: '+359 000 000 000',
};

function formFromProperty(row: AdminProperty): PropertyWriteBody {
  return {
    titleBg: row.titleBg,
    titleEn: row.titleEn,
    excerptBg: row.excerptBg,
    excerptEn: row.excerptEn,
    descriptionBg: row.descriptionBg,
    descriptionEn: row.descriptionEn,
    transactionType: row.transactionType,
    propertyType: row.propertyType,
    market: row.market,
    country: row.country,
    city: row.city,
    district: row.district ?? '',
    locationId: row.locationId,
    price: row.price,
    currency: row.currency,
    area: row.area,
    builtUpArea: row.builtUpArea ?? row.area,
    primaryArea: row.primaryArea,
    primaryAreaLabelBg: row.primaryAreaLabelBg,
    primaryAreaLabelEn: row.primaryAreaLabelEn,
    imageUrls: row.imageUrls,
    agentName: row.agentName,
    agentPhone: row.agentPhone,
    responsibleAgentUserId: row.responsibleAgentUserId,
    slug: row.slug,
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findAncestor(
  start: AdminLocation,
  kind: string,
  byId: Map<string, AdminLocation>,
): AdminLocation | undefined {
  let current: AdminLocation | undefined = start;
  while (current !== undefined) {
    if (current.kind === kind) return current;
    current = current.parentId !== null ? byId.get(current.parentId) : undefined;
  }
  return undefined;
}

function denormalizeLocation(
  location: AdminLocation,
  byId: Map<string, AdminLocation>,
): Pick<PropertyWriteBody, 'locationId' | 'country' | 'city' | 'district'> {
  const country = findAncestor(location, 'country', byId);
  const city = location.kind === 'city' ? location : findAncestor(location, 'city', byId);
  const district =
    location.kind === 'district' || location.kind === 'complex' ? location : undefined;
  return {
    locationId: location.id,
    country: country?.name.bg ?? 'България',
    city: city?.name.bg ?? location.name.bg,
    district: district?.name.bg ?? '',
  };
}

export default function PropertyEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === undefined;

  const detailQuery = useQuery({
    queryKey: propertyKeys.detail(id ?? 'new'),
    queryFn: () => {
      if (id === undefined) throw new Error('missing id');
      return fetchAdminProperty(id);
    },
    enabled: !isNew,
  });

  if (!isNew && detailQuery.isPending) {
    return <Spinner data-testid="property-editor-loading" />;
  }

  if (!isNew && detailQuery.isError) {
    return <Text color="status.down">Could not load property.</Text>;
  }

  if (!isNew && detailQuery.data !== undefined) {
    return (
      <PropertyEditorForm
        key={detailQuery.data.updatedAt}
        propertyId={detailQuery.data.id}
        initial={formFromProperty(detailQuery.data)}
        initialStatus={detailQuery.data.listingStatus}
      />
    );
  }

  return <PropertyEditorForm propertyId={null} initial={emptyForm} initialStatus="draft" />;
}

function PropertyEditorForm({
  propertyId,
  initial,
  initialStatus,
}: {
  propertyId: string | null;
  initial: PropertyWriteBody;
  initialStatus: string;
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [addingLocation, setAddingLocation] = useState(false);
  const [newLocationKind, setNewLocationKind] = useState<'city' | 'district'>('district');
  const [newLocationSlug, setNewLocationSlug] = useState('');
  const [newLocationNameBg, setNewLocationNameBg] = useState('');
  const [newLocationNameEn, setNewLocationNameEn] = useState('');
  const [newLocationParentId, setNewLocationParentId] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const isNew = propertyId === null;
  const langBg = i18n.language.startsWith('bg');

  const propertyTypesQuery = useQuery({
    queryKey: catalogKeys.taxonomy('property_types', false),
    queryFn: () => fetchTaxonomy('property_types'),
  });
  const marketsQuery = useQuery({
    queryKey: catalogKeys.taxonomy('markets', false),
    queryFn: () => fetchTaxonomy('markets'),
  });
  const locationsQuery = useQuery({
    queryKey: catalogKeys.locations(false),
    queryFn: () => fetchLocations(false),
  });

  const viewsQuery = useQuery({
    queryKey: analyticsKeys.propertyViews(propertyId === null ? [] : [propertyId]),
    queryFn: () => fetchPropertyViewStats(propertyId === null ? [] : [propertyId]),
    enabled: propertyId !== null,
  });

  const locationsById = useMemo(() => {
    const map = new Map<string, AdminLocation>();
    for (const row of locationsQuery.data ?? []) map.set(row.id, row);
    return map;
  }, [locationsQuery.data]);

  const locationOptions = useMemo(() => {
    const rows = (locationsQuery.data ?? []).filter(
      (row) => row.kind === 'city' || row.kind === 'district' || row.kind === 'complex',
    );
    return rows.map((row) => {
      const name = langBg ? row.name.bg : row.name.en;
      const parent = row.parentId !== null ? locationsById.get(row.parentId) : undefined;
      const parentName = parent !== undefined ? (langBg ? parent.name.bg : parent.name.en) : null;
      const label =
        parentName !== null && (row.kind === 'district' || row.kind === 'complex')
          ? `${name} (${parentName})`
          : `${name} · ${row.kind}`;
      return { value: row.id, label };
    });
  }, [langBg, locationsById, locationsQuery.data]);

  const cityParentOptions = useMemo(() => {
    return (locationsQuery.data ?? [])
      .filter((row) => row.kind === 'city')
      .map((row) => ({
        value: row.id,
        label: langBg ? row.name.bg : row.name.en,
      }));
  }, [langBg, locationsQuery.data]);

  const propertyTypeOptions = useMemo(() => {
    return (propertyTypesQuery.data ?? []).map((row) => ({
      value: row.key,
      label: langBg ? row.name.bg || row.key : row.name.en || row.key,
    }));
  }, [langBg, propertyTypesQuery.data]);

  const marketOptions = useMemo(() => {
    return (marketsQuery.data ?? []).map((row) => ({
      value: row.key,
      label: langBg ? row.name.bg || row.key : row.name.en || row.key,
    }));
  }, [langBg, marketsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: PropertyWriteBody = {
        ...form,
        district: form.district === '' ? null : form.district,
        locationId: form.locationId === '' ? null : (form.locationId ?? null),
        builtUpArea:
          form.builtUpArea === '' || form.builtUpArea === undefined ? form.area : form.builtUpArea,
        responsibleAgentUserId: form.responsibleAgentUserId ?? user?.id ?? null,
      };
      if (propertyId === null) return createAdminProperty(payload);
      return updateAdminProperty(propertyId, payload);
    },
    onSuccess: async (row) => {
      setError(null);
      setStatus(row.listingStatus);
      await queryClient.invalidateQueries({ queryKey: propertyKeys.list() });
      if (isNew) {
        void navigate(ROUTES.PROPERTY_EDIT.replace(':id', row.id), { replace: true });
      } else {
        await queryClient.invalidateQueries({ queryKey: propertyKeys.detail(row.id) });
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : t('properties.saveError'));
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (propertyId === null) throw new Error('save first');
      await updateAdminProperty(propertyId, {
        responsibleAgentUserId: user?.id ?? null,
      });
      return publishAdminProperty(propertyId);
    },
    onSuccess: async (row) => {
      setStatus(row.listingStatus);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: propertyKeys.list() });
      await queryClient.invalidateQueries({ queryKey: propertyKeys.detail(row.id) });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : t('properties.publishError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (propertyId === null) throw new Error('save first');
      return archiveAdminProperty(propertyId);
    },
    onSuccess: async (row) => {
      setStatus(row.listingStatus);
      await queryClient.invalidateQueries({ queryKey: propertyKeys.list() });
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: () => {
      const slug =
        newLocationSlug.trim() !== ''
          ? newLocationSlug.trim()
          : slugify(newLocationNameEn || newLocationNameBg);
      if (slug === '') throw new Error(t('properties.locationSlugRequired'));
      if (newLocationKind === 'district' && newLocationParentId === '') {
        throw new Error(t('properties.locationParentRequired'));
      }
      const bulgariaId =
        (locationsQuery.data ?? []).find((row) => row.slug === 'bulgaria')?.id ?? null;
      return createLocation({
        kind: newLocationKind,
        slug,
        parentId: newLocationKind === 'district' ? newLocationParentId : bulgariaId,
        name: {
          bg: newLocationNameBg.trim(),
          en: newLocationNameEn.trim() || newLocationNameBg.trim(),
        },
      });
    },
    onSuccess: async (created) => {
      setLocationError(null);
      await queryClient.invalidateQueries({ queryKey: catalogKeys.locations(false) });
      const nextMap = new Map(locationsById);
      nextMap.set(created.id, created);
      const denorm = denormalizeLocation(created, nextMap);
      setForm((prev) => ({ ...prev, ...denorm }));
      setAddingLocation(false);
      setNewLocationSlug('');
      setNewLocationNameBg('');
      setNewLocationNameEn('');
      setNewLocationParentId('');
    },
    onError: (err) => {
      setLocationError(err instanceof ApiError ? err.message : t('properties.locationCreateError'));
    },
  });

  function setField<K extends keyof PropertyWriteBody>(key: K, value: PropertyWriteBody[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onLocationChange(locationId: string) {
    if (locationId === '') {
      setForm((prev) => ({ ...prev, locationId: null }));
      return;
    }
    const location = locationsById.get(locationId);
    if (location === undefined) {
      setField('locationId', locationId);
      return;
    }
    setForm((prev) => ({ ...prev, ...denormalizeLocation(location, locationsById) }));
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <VStack align="stretch" gap={6} data-testid="property-editor-page">
      <PageHeader
        title={isNew ? t('properties.create') : t('properties.edit')}
        lead={
          !isNew && viewsQuery.data?.[0] !== undefined
            ? t('properties.viewsSummary', {
                total: viewsQuery.data[0].viewsTotal,
                unique: viewsQuery.data[0].viewsUnique,
              })
            : undefined
        }
        actions={
          <HStack gap={2} data-testid="property-status">
            <Text fontSize="sm" color="text.muted">
              {t('properties.status')}:
            </Text>
            <StatusBadge
              value={status}
              label={t(`properties.status_${status}`, { defaultValue: status })}
            />
          </HStack>
        }
      />

      <Panel>
        <form
          onSubmit={(event) => {
            onSubmit(event);
          }}
        >
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('properties.titleBg')} required>
                <Input
                  value={form.titleBg}
                  onChange={(e) => {
                    setField('titleBg', e.target.value);
                  }}
                  required
                  data-testid="property-title-bg"
                />
              </Field>
              <Field label={t('properties.titleEn')} required>
                <Input
                  value={form.titleEn}
                  onChange={(e) => {
                    setField('titleEn', e.target.value);
                  }}
                  required
                  data-testid="property-title-en"
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('properties.excerptBg')} required>
                <Input
                  value={form.excerptBg}
                  onChange={(e) => {
                    setField('excerptBg', e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label={t('properties.excerptEn')} required>
                <Input
                  value={form.excerptEn}
                  onChange={(e) => {
                    setField('excerptEn', e.target.value);
                  }}
                  required
                />
              </Field>
            </HStack>
            <Field label={t('properties.descriptionBg')} required>
              <Textarea
                value={form.descriptionBg}
                onChange={(e) => {
                  setField('descriptionBg', e.target.value);
                }}
                required
                rows={3}
              />
            </Field>
            <Field label={t('properties.descriptionEn')} required>
              <Textarea
                value={form.descriptionEn}
                onChange={(e) => {
                  setField('descriptionEn', e.target.value);
                }}
                required
                rows={3}
              />
            </Field>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('properties.transactionType')}>
                <AdminSelect
                  value={form.transactionType}
                  onChange={(value) => {
                    setField('transactionType', value);
                  }}
                  options={TRANSACTION_TYPES.map((value) => ({ value, label: value }))}
                  clearable={false}
                />
              </Field>
              <Field label={t('properties.propertyType')}>
                <AdminSelect
                  value={form.propertyType}
                  onChange={(value) => {
                    setField('propertyType', value);
                  }}
                  options={
                    propertyTypeOptions.length > 0
                      ? propertyTypeOptions
                      : [{ value: form.propertyType, label: form.propertyType }]
                  }
                  clearable={false}
                  data-testid="property-type"
                />
              </Field>
              <Field label={t('properties.market')}>
                <AdminSelect
                  value={form.market}
                  onChange={(value) => {
                    setField('market', value);
                  }}
                  options={
                    marketOptions.length > 0
                      ? marketOptions
                      : [{ value: form.market, label: form.market }]
                  }
                  clearable={false}
                  data-testid="property-market"
                />
              </Field>
            </HStack>

            <HStack gap={3} flexWrap="wrap" align="flex-end">
              <Field label={t('properties.location')}>
                <AdminSelect
                  value={form.locationId ?? ''}
                  onChange={onLocationChange}
                  options={locationOptions}
                  clearable
                  data-testid="property-location"
                />
              </Field>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setAddingLocation((open) => !open);
                  setLocationError(null);
                }}
                data-testid="property-location-add-toggle"
              >
                {addingLocation ? t('properties.locationCancel') : t('properties.locationAdd')}
              </Button>
            </HStack>

            {addingLocation ? (
              <Panel data-testid="property-location-create">
                <Heading size="sm" mb={3}>
                  {t('properties.locationAdd')}
                </Heading>
                <VStack align="stretch" gap={3}>
                  <HStack gap={3} flexWrap="wrap">
                    <Field label={t('catalog.kind')}>
                      <AdminSelect
                        value={newLocationKind}
                        onChange={(value) => {
                          setNewLocationKind(value === 'city' ? 'city' : 'district');
                        }}
                        options={LOCATION_KINDS.filter(
                          (kind) => kind === 'city' || kind === 'district',
                        ).map((kind) => ({ value: kind, label: kind }))}
                        clearable={false}
                        data-testid="property-location-kind"
                      />
                    </Field>
                    {newLocationKind === 'district' ? (
                      <Field label={t('properties.locationParentCity')} required>
                        <AdminSelect
                          value={newLocationParentId}
                          onChange={setNewLocationParentId}
                          options={cityParentOptions}
                          clearable={false}
                          data-testid="property-location-parent"
                        />
                      </Field>
                    ) : null}
                  </HStack>
                  <HStack gap={3} flexWrap="wrap">
                    <Field label={t('catalog.nameBg')} required>
                      <Input
                        value={newLocationNameBg}
                        onChange={(e) => {
                          setNewLocationNameBg(e.target.value);
                          if (newLocationSlug === '' && newLocationNameEn === '') {
                            setNewLocationSlug(slugify(e.target.value));
                          }
                        }}
                        required
                        data-testid="property-location-name-bg"
                      />
                    </Field>
                    <Field label={t('catalog.nameEn')} required>
                      <Input
                        value={newLocationNameEn}
                        onChange={(e) => {
                          setNewLocationNameEn(e.target.value);
                          setNewLocationSlug(slugify(e.target.value) || slugify(newLocationNameBg));
                        }}
                        required
                        data-testid="property-location-name-en"
                      />
                    </Field>
                    <Field label={t('catalog.slug')} required>
                      <Input
                        value={newLocationSlug}
                        onChange={(e) => {
                          setNewLocationSlug(e.target.value);
                        }}
                        required
                        data-testid="property-location-slug"
                      />
                    </Field>
                  </HStack>
                  {locationError !== null ? (
                    <Text color="status.down" fontSize="sm">
                      {locationError}
                    </Text>
                  ) : null}
                  <Button
                    type="button"
                    alignSelf="flex-start"
                    loading={createLocationMutation.isPending}
                    onClick={() => {
                      createLocationMutation.mutate();
                    }}
                    data-testid="property-location-create-submit"
                  >
                    {t('properties.locationCreate')}
                  </Button>
                </VStack>
              </Panel>
            ) : null}

            <HStack gap={3} flexWrap="wrap">
              <Field label={t('properties.city')} required>
                <Input
                  value={form.city}
                  onChange={(e) => {
                    setField('city', e.target.value);
                  }}
                  required
                  data-testid="property-city"
                />
              </Field>
              <Field label={t('properties.district')}>
                <Input
                  value={form.district ?? ''}
                  onChange={(e) => {
                    setField('district', e.target.value);
                  }}
                  data-testid="property-district"
                />
              </Field>
              <Field label={t('properties.price')} required>
                <Input
                  value={form.price}
                  onChange={(e) => {
                    setField('price', e.target.value);
                  }}
                  required
                  data-testid="property-price"
                />
              </Field>
              <Field label={t('properties.area')} required>
                <Input
                  value={form.area}
                  onChange={(e) => {
                    setField('area', e.target.value);
                    setField('builtUpArea', e.target.value);
                  }}
                  required
                  data-testid="property-area"
                />
              </Field>
            </HStack>
            {error !== null ? (
              <Text color="status.down" fontSize="sm" data-testid="property-editor-error">
                {error}
              </Text>
            ) : null}
            <HStack gap={3} flexWrap="wrap">
              <Button type="submit" loading={saveMutation.isPending} data-testid="property-save">
                {t('properties.save')}
              </Button>
              {!isNew ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    loading={publishMutation.isPending}
                    onClick={() => {
                      publishMutation.mutate();
                    }}
                    data-testid="property-publish"
                  >
                    {t('properties.publish')}
                  </Button>
                  <Button
                    type="button"
                    variant={dangerVariant}
                    loading={archiveMutation.isPending}
                    onClick={() => {
                      archiveMutation.mutate();
                    }}
                    data-testid="property-archive"
                  >
                    {t('properties.archive')}
                  </Button>
                </>
              ) : null}
            </HStack>
          </VStack>
        </form>
      </Panel>

      {propertyId !== null ? <PropertyGallery propertyId={propertyId} /> : null}
    </VStack>
  );
}
