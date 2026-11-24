import { Box, Button, Heading, HStack, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import {
  BROCHURE_TOGGLE_KEYS,
  type BrochureElementToggles,
  type BrochureToggleKey,
  CHANNEL_COPY_CHANNELS,
  CHANNEL_COPY_LENGTHS,
  DEFAULT_BROCHURE_TOGGLES,
  DEFAULT_SOCIAL_TOGGLES,
  DEMO_BROCHURE_A4_KEY,
  DEMO_SOCIAL_FEED_KEY,
  SOCIAL_BADGE_PRESETS,
  type SocialBadgePreset,
} from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import {
  downloadBrochureExport,
  fetchBrochureExports,
  fetchChannelCopy,
  fetchStudioTemplates,
  generateBrochure,
  generateSocialAsset,
  studioKeys,
} from '@/api/endpoints/studio';
import { AdminSelect } from '@/components/ui/AdminSelect';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { TasksSectionNav } from '@/pages/Tasks/TasksSectionNav';
import { ApiError } from '@/types/api';

export default function MarketingStudio() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [propertyId, setPropertyId] = useState('');
  const [templateOverride, setTemplateOverride] = useState<string | null>(null);
  const [socialTemplateOverride, setSocialTemplateOverride] = useState<string | null>(null);
  const [badgeOverride, setBadgeOverride] = useState<SocialBadgePreset | null>(null);
  const [togglesOverride, setTogglesOverride] = useState<BrochureElementToggles | null>(null);
  const [socialTogglesOverride, setSocialTogglesOverride] = useState<BrochureElementToggles | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [copyChannel, setCopyChannel] =
    useState<(typeof CHANNEL_COPY_CHANNELS)[number]>('facebook');
  const [copyLocale, setCopyLocale] = useState<'bg' | 'en'>('bg');
  const [copyLength, setCopyLength] = useState<(typeof CHANNEL_COPY_LENGTHS)[number]>('short');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const propertiesQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });

  const templatesQuery = useQuery({
    queryKey: studioKeys.templates(),
    queryFn: fetchStudioTemplates,
  });

  const exportsQuery = useQuery({
    queryKey: studioKeys.exports(propertyId),
    queryFn: () => fetchBrochureExports(propertyId),
    enabled: propertyId !== '',
  });

  const channelCopyQuery = useQuery({
    queryKey: studioKeys.channelCopy(propertyId),
    queryFn: () => fetchChannelCopy(propertyId),
    enabled: propertyId !== '',
  });

  const pdfTemplates = (templatesQuery.data ?? []).filter(
    (row) => row.kind === 'brochure_pdf' && row.format === 'a4_pdf',
  );
  const socialTemplates = (templatesQuery.data ?? []).filter((row) => row.kind === 'social_image');
  const brochureDefault = pdfTemplates[0];
  const socialDefault = socialTemplates[0];

  const templateKey = templateOverride ?? brochureDefault?.key ?? DEMO_BROCHURE_A4_KEY;
  const socialTemplateKey = socialTemplateOverride ?? socialDefault?.key ?? DEMO_SOCIAL_FEED_KEY;
  const toggles = togglesOverride ?? {
    ...DEFAULT_BROCHURE_TOGGLES,
    ...brochureDefault?.defaultToggles,
  };
  const socialToggles = socialTogglesOverride ?? {
    ...DEFAULT_SOCIAL_TOGGLES,
    ...socialDefault?.defaultToggles,
  };
  const badgePreset: SocialBadgePreset =
    badgeOverride ??
    (socialDefault !== undefined &&
    socialDefault.badgePreset !== '' &&
    (SOCIAL_BADGE_PRESETS as readonly string[]).includes(socialDefault.badgePreset)
      ? (socialDefault.badgePreset as SocialBadgePreset)
      : 'new');

  const generateMutation = useMutation({
    mutationFn: () =>
      generateBrochure({
        propertyId,
        templateKey,
        toggles,
      }),
    onSuccess: async (result) => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: studioKeys.exports(propertyId) });
      await downloadBrochureExport(result.id, result.fileName);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('studio.saveError'));
    },
  });

  const socialMutation = useMutation({
    mutationFn: () =>
      generateSocialAsset({
        propertyId,
        templateKey: socialTemplateKey,
        toggles: socialToggles,
        badgePreset,
      }),
    onSuccess: async (result) => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: studioKeys.exports(propertyId) });
      await downloadBrochureExport(result.id, result.fileName);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('studio.saveError'));
    },
  });

  function toggleKey(key: BrochureToggleKey) {
    setTogglesOverride((prev) => {
      const base = prev ?? toggles;
      return { ...base, [key]: !base[key] };
    });
  }

  function toggleSocialKey(key: BrochureToggleKey) {
    setSocialTogglesOverride((prev) => {
      const base = prev ?? socialToggles;
      return { ...base, [key]: !base[key] };
    });
  }

  const templateLabel = (row: { nameBg: string; nameEn: string; key: string }) =>
    i18n.language.startsWith('bg') ? row.nameBg || row.key : row.nameEn || row.key;

  const activeSnippet = channelCopyQuery.data?.snippets.find(
    (row) => row.channel === copyChannel && row.locale === copyLocale && row.length === copyLength,
  );

  async function copySnippet() {
    if (activeSnippet === undefined) return;
    try {
      await navigator.clipboard.writeText(activeSnippet.text);
      setCopiedKey(`${copyChannel}-${copyLocale}-${copyLength}`);
    } catch {
      setFormError(t('studio.copyError'));
    }
  }

  return (
    <VStack align="stretch" gap={6} data-testid="marketing-studio-page">
      <PageHeader title={t('studio.title')} lead={t('studio.lead')} />
      <TasksSectionNav />

      <Panel>
        <Field label={t('studio.property')}>
          <AdminSelect
            value={propertyId}
            onChange={(value) => {
              setPropertyId(value);
              setFormError(null);
            }}
            data-testid="studio-property"
            options={[
              { value: '', label: t('studio.selectProperty') },
              ...(propertiesQuery.data ?? []).map((property) => ({
                value: property.id,
                label: `${property.referenceNumber} — ${property.titleBg}`,
              })),
            ]}
          />
        </Field>
      </Panel>

      {formError !== null ? (
        <Text color="status.down" data-testid="studio-form-error">
          {formError}
        </Text>
      ) : null}

      {propertyId === '' ? (
        <Text color="text.muted">{t('studio.pickProperty')}</Text>
      ) : templatesQuery.isPending ? (
        <Spinner />
      ) : templatesQuery.isError ? (
        <Text color="status.down">{t('studio.loadError')}</Text>
      ) : (
        <>
          <Panel>
            <Heading size="md" mb={4}>
              {t('studio.generate')}
            </Heading>
            <Field label={t('studio.template')}>
              <AdminSelect
                value={templateKey}
                onChange={(next) => {
                  setTemplateOverride(next);
                  const found = pdfTemplates.find((row) => row.key === next);
                  if (found !== undefined) {
                    setTogglesOverride({ ...DEFAULT_BROCHURE_TOGGLES, ...found.defaultToggles });
                  }
                }}
                data-testid="studio-template"
                options={pdfTemplates.map((row) => ({
                  value: row.key,
                  label: templateLabel(row),
                }))}
              />
            </Field>

            <Text fontSize="sm" mt={4} mb={2}>
              {t('studio.toggles')}
            </Text>
            <HStack gap={3} flexWrap="wrap" mb={4}>
              {BROCHURE_TOGGLE_KEYS.map((key) => (
                <label key={key} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={toggles[key]}
                    onChange={() => {
                      toggleKey(key);
                    }}
                    data-testid={`studio-toggle-${key}`}
                  />
                  <Text fontSize="sm">{t(`studio.toggle_${key}`)}</Text>
                </label>
              ))}
            </HStack>

            <Button
              loading={generateMutation.isPending}
              onClick={() => {
                generateMutation.mutate();
              }}
              data-testid="studio-generate"
            >
              {t('studio.generateDownload')}
            </Button>
          </Panel>

          <Panel>
            <Heading size="md" mb={4}>
              {t('studio.social')}
            </Heading>
            <Field label={t('studio.template')}>
              <AdminSelect
                value={socialTemplateKey}
                onChange={(next) => {
                  setSocialTemplateOverride(next);
                  const found = socialTemplates.find((row) => row.key === next);
                  if (found !== undefined) {
                    setSocialTogglesOverride({
                      ...DEFAULT_SOCIAL_TOGGLES,
                      ...found.defaultToggles,
                    });
                    if (
                      found.badgePreset !== '' &&
                      (SOCIAL_BADGE_PRESETS as readonly string[]).includes(found.badgePreset)
                    ) {
                      setBadgeOverride(found.badgePreset as SocialBadgePreset);
                    }
                  }
                }}
                data-testid="studio-social-template"
                options={socialTemplates.map((row) => ({
                  value: row.key,
                  label: `${templateLabel(row)} (${row.format})`,
                }))}
              />
            </Field>

            <Box mt={4}>
              <Field label={t('studio.badge')}>
                <AdminSelect
                  value={badgePreset}
                  onChange={(value) => {
                    setBadgeOverride(value as SocialBadgePreset);
                  }}
                  data-testid="studio-badge"
                  options={SOCIAL_BADGE_PRESETS.map((preset) => ({
                    value: preset,
                    label: preset === '' ? t('studio.badgeNone') : t(`studio.badge_${preset}`),
                  }))}
                />
              </Field>
            </Box>

            <Text fontSize="sm" mt={4} mb={2}>
              {t('studio.toggles')}
            </Text>
            <HStack gap={3} flexWrap="wrap" mb={4}>
              {BROCHURE_TOGGLE_KEYS.filter((key) => key !== 'qr' && key !== 'description').map(
                (key) => (
                  <label key={key} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={socialToggles[key]}
                      onChange={() => {
                        toggleSocialKey(key);
                      }}
                      data-testid={`studio-social-toggle-${key}`}
                    />
                    <Text fontSize="sm">{t(`studio.toggle_${key}`)}</Text>
                  </label>
                ),
              )}
            </HStack>

            <Button
              loading={socialMutation.isPending}
              onClick={() => {
                socialMutation.mutate();
              }}
              data-testid="studio-social-generate"
            >
              {t('studio.generateSocial')}
            </Button>
          </Panel>

          <Panel testId="studio-channel-copy">
            <Heading size="md" mb={2}>
              {t('studio.channelCopy')}
            </Heading>
            <Text color="text.muted" fontSize="sm" mb={4}>
              {t('studio.channelCopyNote')}
            </Text>
            {channelCopyQuery.isPending ? (
              <Spinner />
            ) : channelCopyQuery.isError ? (
              <Text color="status.down">{t('studio.loadError')}</Text>
            ) : (
              <>
                <HStack gap={3} flexWrap="wrap" mb={3}>
                  <Field label={t('studio.channel')} minW="140px">
                    <AdminSelect
                      value={copyChannel}
                      onChange={(value) => {
                        setCopyChannel(value as (typeof CHANNEL_COPY_CHANNELS)[number]);
                      }}
                      data-testid="studio-channel"
                      options={CHANNEL_COPY_CHANNELS.map((channel) => ({
                        value: channel,
                        label: t(`studio.channel_${channel}`),
                      }))}
                    />
                  </Field>
                  <Field label={t('studio.copyLocale')} minW="100px">
                    <AdminSelect
                      value={copyLocale}
                      onChange={(value) => {
                        setCopyLocale(value as 'bg' | 'en');
                      }}
                      data-testid="studio-copy-locale"
                      options={[
                        { value: 'bg', label: 'BG' },
                        { value: 'en', label: 'EN' },
                      ]}
                    />
                  </Field>
                  <Field label={t('studio.copyLength')} minW="120px">
                    <AdminSelect
                      value={copyLength}
                      onChange={(value) => {
                        setCopyLength(value as (typeof CHANNEL_COPY_LENGTHS)[number]);
                      }}
                      data-testid="studio-copy-length"
                      options={CHANNEL_COPY_LENGTHS.map((length) => ({
                        value: length,
                        label: t(`studio.length_${length}`),
                      }))}
                    />
                  </Field>
                </HStack>
                <Text
                  as="pre"
                  whiteSpace="pre-wrap"
                  fontFamily="inherit"
                  fontSize="sm"
                  p={3}
                  borderWidth="1px"
                  borderColor="border.default"
                  borderRadius="md"
                  mb={3}
                  data-testid="studio-channel-text"
                >
                  {activeSnippet?.text ?? ''}
                </Text>
                <Button
                  size="sm"
                  onClick={() => {
                    void copySnippet();
                  }}
                  data-testid="studio-channel-copy-btn"
                >
                  {copiedKey === `${copyChannel}-${copyLocale}-${copyLength}`
                    ? t('studio.copied')
                    : t('studio.copy')}
                </Button>
              </>
            )}
          </Panel>

          <Panel>
            <Heading size="md" mb={4}>
              {t('studio.exports')}
            </Heading>
            {exportsQuery.isPending ? (
              <Spinner />
            ) : exportsQuery.isError ? (
              <Text color="status.down">{t('studio.loadError')}</Text>
            ) : exportsQuery.data.length === 0 ? (
              <Text color="text.muted">{t('studio.emptyExports')}</Text>
            ) : (
              <Table.Root size="sm" data-testid="studio-exports-table">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t('studio.fileName')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('studio.createdAt')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('studio.size')}</Table.ColumnHeader>
                    <Table.ColumnHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {exportsQuery.data.map((row) => (
                    <Table.Row key={row.id}>
                      <Table.Cell>{row.fileName}</Table.Cell>
                      <Table.Cell>{new Date(row.createdAt).toLocaleString()}</Table.Cell>
                      <Table.Cell>{row.byteSize}</Table.Cell>
                      <Table.Cell textAlign="end">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            void downloadBrochureExport(row.id, row.fileName).catch(() => {
                              setFormError(t('studio.saveError'));
                            });
                          }}
                          data-testid={`studio-download-${row.id}`}
                        >
                          {t('studio.download')}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Panel>
        </>
      )}
    </VStack>
  );
}
