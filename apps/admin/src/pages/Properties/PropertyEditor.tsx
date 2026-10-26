import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { MARKETS, PROPERTY_TYPES, TRANSACTION_TYPES } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type CSSProperties, type ReactNode, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const isNew = propertyId === null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: PropertyWriteBody = {
        ...form,
        district: form.district === '' ? null : form.district,
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

  function setField<K extends keyof PropertyWriteBody>(key: K, value: PropertyWriteBody[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <VStack align="stretch" gap={6} data-testid="property-editor-page">
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Heading size="xl" color="text.primary">
          {isNew ? t('properties.create') : t('properties.edit')}
        </Heading>
        <Text fontSize="sm" color="text.muted" data-testid="property-status">
          {t('properties.status')}: {status}
        </Text>
      </HStack>

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
          <VStack align="stretch" gap={3}>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('properties.titleBg')}>
                <Input
                  value={form.titleBg}
                  onChange={(e) => {
                    setField('titleBg', e.target.value);
                  }}
                  required
                  data-testid="property-title-bg"
                />
              </Field>
              <Field label={t('properties.titleEn')}>
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
              <Field label={t('properties.excerptBg')}>
                <Input
                  value={form.excerptBg}
                  onChange={(e) => {
                    setField('excerptBg', e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label={t('properties.excerptEn')}>
                <Input
                  value={form.excerptEn}
                  onChange={(e) => {
                    setField('excerptEn', e.target.value);
                  }}
                  required
                />
              </Field>
            </HStack>
            <Field label={t('properties.descriptionBg')}>
              <Textarea
                value={form.descriptionBg}
                onChange={(e) => {
                  setField('descriptionBg', e.target.value);
                }}
                required
                rows={3}
              />
            </Field>
            <Field label={t('properties.descriptionEn')}>
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
                <select
                  style={selectStyle}
                  value={form.transactionType}
                  onChange={(e) => {
                    setField('transactionType', e.target.value);
                  }}
                >
                  {TRANSACTION_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('properties.propertyType')}>
                <select
                  style={selectStyle}
                  value={form.propertyType}
                  onChange={(e) => {
                    setField('propertyType', e.target.value);
                  }}
                >
                  {PROPERTY_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('properties.market')}>
                <select
                  style={selectStyle}
                  value={form.market}
                  onChange={(e) => {
                    setField('market', e.target.value);
                  }}
                >
                  {MARKETS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('properties.city')}>
                <Input
                  value={form.city}
                  onChange={(e) => {
                    setField('city', e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label={t('properties.district')}>
                <Input
                  value={form.district ?? ''}
                  onChange={(e) => {
                    setField('district', e.target.value);
                  }}
                />
              </Field>
              <Field label={t('properties.price')}>
                <Input
                  value={form.price}
                  onChange={(e) => {
                    setField('price', e.target.value);
                  }}
                  required
                  data-testid="property-price"
                />
              </Field>
              <Field label={t('properties.area')}>
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
                    variant="outline"
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
      </Box>

      {propertyId !== null ? <PropertyGallery propertyId={propertyId} /> : null}
    </VStack>
  );
}

const selectStyle: CSSProperties = {
  width: '100%',
  height: '2.5rem',
  padding: '0 0.75rem',
  borderWidth: '1px',
  borderRadius: '0.375rem',
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box flex="1" minW="160px">
      <Text fontSize="sm" mb={1}>
        {label}
      </Text>
      {children}
    </Box>
  );
}
