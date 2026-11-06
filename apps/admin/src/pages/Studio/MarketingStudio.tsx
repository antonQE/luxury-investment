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
      <Box>
        <Heading size="xl" color="text.primary">
          {t('studio.title')}
        </Heading>
        <Text color="text.muted" fontSize="sm" mt={1}>
          {t('studio.lead')}
        </Text>
      </Box>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={4}
        borderRadius="md"
      >
        <Text fontSize="sm" mb={1}>
          {t('studio.property')}
        </Text>
        <select
          value={propertyId}
          onChange={(e) => {
            setPropertyId(e.target.value);
            setFormError(null);
          }}
          data-testid="studio-property"
        >
          <option value="">{t('studio.selectProperty')}</option>
          {(propertiesQuery.data ?? []).map((property) => (
            <option key={property.id} value={property.id}>
              {property.referenceNumber} — {property.titleBg}
            </option>
          ))}
        </select>
      </Box>

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
          <Box
            bg="background.panel"
            borderWidth="1px"
            borderColor="border.default"
            p={6}
            borderRadius="md"
          >
            <Heading size="md" mb={4}>
              {t('studio.generate')}
            </Heading>
            <Text fontSize="sm" mb={1}>
              {t('studio.template')}
            </Text>
            <select
              value={templateKey}
              onChange={(e) => {
                const next = e.target.value;
                setTemplateOverride(next);
                const found = pdfTemplates.find((row) => row.key === next);
                if (found !== undefined) {
                  setTogglesOverride({ ...DEFAULT_BROCHURE_TOGGLES, ...found.defaultToggles });
                }
              }}
              data-testid="studio-template"
            >
              {pdfTemplates.map((row) => (
                <option key={row.id} value={row.key}>
                  {templateLabel(row)}
                </option>
              ))}
            </select>

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
          </Box>

          <Box
            bg="background.panel"
            borderWidth="1px"
            borderColor="border.default"
            p={6}
            borderRadius="md"
          >
            <Heading size="md" mb={4}>
              {t('studio.social')}
            </Heading>
            <Text fontSize="sm" mb={1}>
              {t('studio.template')}
            </Text>
            <select
              value={socialTemplateKey}
              onChange={(e) => {
                const next = e.target.value;
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
            >
              {socialTemplates.map((row) => (
                <option key={row.id} value={row.key}>
                  {templateLabel(row)} ({row.format})
                </option>
              ))}
            </select>

            <Text fontSize="sm" mt={4} mb={1}>
              {t('studio.badge')}
            </Text>
            <select
              value={badgePreset}
              onChange={(e) => {
                setBadgeOverride(e.target.value as SocialBadgePreset);
              }}
              data-testid="studio-badge"
            >
              {SOCIAL_BADGE_PRESETS.map((preset) => (
                <option key={preset || 'none'} value={preset}>
                  {preset === '' ? t('studio.badgeNone') : t(`studio.badge_${preset}`)}
                </option>
              ))}
            </select>

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
          </Box>

          <Box
            bg="background.panel"
            borderWidth="1px"
            borderColor="border.default"
            p={6}
            borderRadius="md"
            data-testid="studio-channel-copy"
          >
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
                  <Box>
                    <Text fontSize="sm" mb={1}>
                      {t('studio.channel')}
                    </Text>
                    <select
                      value={copyChannel}
                      onChange={(e) => {
                        setCopyChannel(e.target.value as (typeof CHANNEL_COPY_CHANNELS)[number]);
                      }}
                      data-testid="studio-channel"
                    >
                      {CHANNEL_COPY_CHANNELS.map((channel) => (
                        <option key={channel} value={channel}>
                          {t(`studio.channel_${channel}`)}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <Text fontSize="sm" mb={1}>
                      {t('studio.copyLocale')}
                    </Text>
                    <select
                      value={copyLocale}
                      onChange={(e) => {
                        setCopyLocale(e.target.value as 'bg' | 'en');
                      }}
                      data-testid="studio-copy-locale"
                    >
                      <option value="bg">BG</option>
                      <option value="en">EN</option>
                    </select>
                  </Box>
                  <Box>
                    <Text fontSize="sm" mb={1}>
                      {t('studio.copyLength')}
                    </Text>
                    <select
                      value={copyLength}
                      onChange={(e) => {
                        setCopyLength(e.target.value as (typeof CHANNEL_COPY_LENGTHS)[number]);
                      }}
                      data-testid="studio-copy-length"
                    >
                      {CHANNEL_COPY_LENGTHS.map((length) => (
                        <option key={length} value={length}>
                          {t(`studio.length_${length}`)}
                        </option>
                      ))}
                    </select>
                  </Box>
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
          </Box>

          <Box
            bg="background.panel"
            borderWidth="1px"
            borderColor="border.default"
            p={6}
            borderRadius="md"
          >
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
          </Box>
        </>
      )}
    </VStack>
  );
}
