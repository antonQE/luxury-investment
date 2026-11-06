import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Spinner,
  Table,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { LANDING_SECTION_TYPES, type LandingSectionType } from '@luxury-investment/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type AdminLandingDetail,
  archiveAdminLanding,
  createAdminLanding,
  fetchAdminLanding,
  fetchAdminLandings,
  landingKeys,
  publishAdminLanding,
  updateAdminLanding,
} from '@/api/endpoints/landings';
import { ApiError } from '@/types/api';

interface DraftSection {
  type: LandingSectionType;
  payloadJson: string;
}

const DEFAULT_HERO_JSON = JSON.stringify(
  {
    headline: { bg: 'Заглавие', en: 'Headline' },
    subheadline: { bg: '', en: '' },
  },
  null,
  2,
);

function draftFromDetail(row: AdminLandingDetail): DraftSection[] {
  return row.sections.map((section) => ({
    type: section.type,
    payloadJson: JSON.stringify(section.payload, null, 2),
  }));
}

export default function LandingsAdmin() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [key, setKey] = useState('');
  const [slug, setSlug] = useState('');
  const [titleBg, setTitleBg] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [seoTitleBg, setSeoTitleBg] = useState('');
  const [seoTitleEn, setSeoTitleEn] = useState('');
  const [seoDescriptionBg, setSeoDescriptionBg] = useState('');
  const [seoDescriptionEn, setSeoDescriptionEn] = useState('');
  const [robots, setRobots] = useState('index,follow');
  const [showInNav, setShowInNav] = useState(false);
  const [campaignKey, setCampaignKey] = useState('');
  const [sections, setSections] = useState<DraftSection[]>([]);
  const [newSectionType, setNewSectionType] = useState<LandingSectionType>('hero');
  const [seededFromId, setSeededFromId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: landingKeys.list(),
    queryFn: fetchAdminLandings,
  });

  const detailQuery = useQuery({
    queryKey: landingKeys.detail(selectedId ?? ''),
    queryFn: () => {
      if (selectedId === null) {
        throw new Error('Landing id required');
      }
      return fetchAdminLanding(selectedId);
    },
    enabled: selectedId !== null,
  });

  // Adjust form state while rendering when a new landing detail is selected
  // (React-recommended alternative to syncing via useEffect).
  const detail = detailQuery.data;
  const selectedDetail = selectedId !== null && detail?.id === selectedId ? detail : undefined;
  if (selectedId === null && seededFromId !== null) {
    setSeededFromId(null);
  } else if (selectedDetail !== undefined && seededFromId !== selectedId) {
    setSeededFromId(selectedId);
    setKey(selectedDetail.key);
    setSlug(selectedDetail.slug);
    setTitleBg(selectedDetail.titleBg);
    setTitleEn(selectedDetail.titleEn);
    setSeoTitleBg(selectedDetail.seoTitleBg);
    setSeoTitleEn(selectedDetail.seoTitleEn);
    setSeoDescriptionBg(selectedDetail.seoDescriptionBg);
    setSeoDescriptionEn(selectedDetail.seoDescriptionEn);
    setRobots(selectedDetail.robots);
    setShowInNav(selectedDetail.showInNav);
    setCampaignKey(selectedDetail.campaignKey);
    setSections(draftFromDetail(selectedDetail));
  }

  function resetCreateForm() {
    setSelectedId(null);
    setSeededFromId(null);
    setKey('');
    setSlug('');
    setTitleBg('');
    setTitleEn('');
    setSeoTitleBg('');
    setSeoTitleEn('');
    setSeoDescriptionBg('');
    setSeoDescriptionEn('');
    setRobots('index,follow');
    setShowInNav(false);
    setCampaignKey('');
    setSections([{ type: 'hero', payloadJson: DEFAULT_HERO_JSON }]);
    setFormError(null);
  }

  function parseSections(): { type: LandingSectionType; payload: unknown }[] {
    return sections.map((section) => ({
      type: section.type,
      payload: JSON.parse(section.payloadJson) as unknown,
    }));
  }

  const createMutation = useMutation({
    mutationFn: createAdminLanding,
    onSuccess: async (row) => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: landingKeys.list() });
      setSelectedId(row.id);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('landings.saveError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      updateAdminLanding(id, {
        slug,
        titleBg,
        titleEn,
        seoTitleBg,
        seoTitleEn,
        seoDescriptionBg,
        seoDescriptionEn,
        robots,
        showInNav,
        campaignKey,
        sections: parseSections(),
      }),
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: landingKeys.list() });
      if (selectedId !== null) {
        await queryClient.invalidateQueries({ queryKey: landingKeys.detail(selectedId) });
      }
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('landings.saveError'));
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishAdminLanding,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: landingKeys.list() });
      if (selectedId !== null) {
        await queryClient.invalidateQueries({ queryKey: landingKeys.detail(selectedId) });
      }
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminLanding,
    onSuccess: async () => {
      resetCreateForm();
      await queryClient.invalidateQueries({ queryKey: landingKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const parsed = parseSections();
      if (selectedId === null) {
        createMutation.mutate({
          key: key.trim(),
          slug: slug.trim(),
          titleBg: titleBg.trim(),
          titleEn: titleEn.trim(),
          seoTitleBg: seoTitleBg.trim(),
          seoTitleEn: seoTitleEn.trim(),
          seoDescriptionBg: seoDescriptionBg.trim(),
          seoDescriptionEn: seoDescriptionEn.trim(),
          robots,
          showInNav,
          campaignKey: campaignKey.trim(),
          sections: parsed,
        });
      } else {
        updateMutation.mutate(selectedId);
      }
    } catch {
      setFormError(t('landings.invalidJson'));
    }
  }

  function moveSection(index: number, delta: number) {
    const next = index + delta;
    if (next < 0 || next >= sections.length) return;
    setSections((prev) => {
      const current = prev[index];
      const swap = prev[next];
      if (current === undefined || swap === undefined) return prev;
      const copy = [...prev];
      copy[index] = swap;
      copy[next] = current;
      return copy;
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="landings-admin-page">
      <Box>
        <Heading size="xl" color="text.primary">
          {t('landings.title')}
        </Heading>
        <Text color="text.muted" fontSize="sm" mt={1}>
          {t('landings.lead')}
        </Text>
      </Box>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={4}
        borderRadius="md"
      >
        <HStack justify="space-between" mb={3}>
          <Heading size="md">{t('landings.list')}</Heading>
          <Button size="sm" variant="outline" onClick={resetCreateForm} data-testid="landings-new">
            {t('landings.new')}
          </Button>
        </HStack>
        {listQuery.isPending ? (
          <Spinner />
        ) : listQuery.isError ? (
          <Text color="status.down">{t('landings.loadError')}</Text>
        ) : listQuery.data.length === 0 ? (
          <Text color="text.muted">{t('landings.empty')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="landings-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('landings.slug')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('landings.titleBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('landings.status')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('landings.showInNav')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.slug}</Table.Cell>
                  <Table.Cell>{row.titleBg}</Table.Cell>
                  <Table.Cell>{row.status}</Table.Cell>
                  <Table.Cell>{row.showInNav ? t('landings.yes') : t('landings.no')}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setSelectedId(row.id);
                        setFormError(null);
                      }}
                      data-testid={`landings-edit-${row.id}`}
                    >
                      {t('landings.edit')}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
        data-testid="landings-form"
      >
        <form onSubmit={onSubmit}>
          <Heading size="md" mb={4}>
            {selectedId === null ? t('landings.create') : t('landings.edit')}
          </Heading>

          {selectedId !== null && detailQuery.isPending ? <Spinner /> : null}

          <HStack gap={3} flexWrap="wrap" mb={3}>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('landings.key')}
              </Text>
              <Input
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                }}
                disabled={selectedId !== null}
                data-testid="landings-key"
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('landings.slug')}
              </Text>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                }}
                data-testid="landings-slug"
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('landings.robots')}
              </Text>
              <select
                value={robots}
                onChange={(e) => {
                  setRobots(e.target.value);
                }}
                data-testid="landings-robots"
              >
                <option value="index,follow">index,follow</option>
                <option value="noindex,follow">noindex,follow</option>
                <option value="noindex,nofollow">noindex,nofollow</option>
              </select>
            </Box>
            <label
              style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '1.5rem' }}
            >
              <input
                type="checkbox"
                checked={showInNav}
                onChange={() => {
                  setShowInNav((prev) => !prev);
                }}
                data-testid="landings-show-in-nav"
              />
              <Text fontSize="sm">{t('landings.showInNav')}</Text>
            </label>
          </HStack>

          <HStack gap={3} flexWrap="wrap" mb={3}>
            <Box flex="1">
              <Text fontSize="sm" mb={1}>
                {t('landings.titleBg')}
              </Text>
              <Input
                value={titleBg}
                onChange={(e) => {
                  setTitleBg(e.target.value);
                }}
                data-testid="landings-title-bg"
              />
            </Box>
            <Box flex="1">
              <Text fontSize="sm" mb={1}>
                {t('landings.titleEn')}
              </Text>
              <Input
                value={titleEn}
                onChange={(e) => {
                  setTitleEn(e.target.value);
                }}
                data-testid="landings-title-en"
              />
            </Box>
          </HStack>

          <HStack gap={3} flexWrap="wrap" mb={3}>
            <Box flex="1">
              <Text fontSize="sm" mb={1}>
                {t('landings.seoTitleBg')}
              </Text>
              <Input
                value={seoTitleBg}
                onChange={(e) => {
                  setSeoTitleBg(e.target.value);
                }}
              />
            </Box>
            <Box flex="1">
              <Text fontSize="sm" mb={1}>
                {t('landings.seoTitleEn')}
              </Text>
              <Input
                value={seoTitleEn}
                onChange={(e) => {
                  setSeoTitleEn(e.target.value);
                }}
              />
            </Box>
          </HStack>

          <HStack gap={3} flexWrap="wrap" mb={3}>
            <Box flex="1">
              <Text fontSize="sm" mb={1}>
                {t('landings.seoDescriptionBg')}
              </Text>
              <Textarea
                value={seoDescriptionBg}
                onChange={(e) => {
                  setSeoDescriptionBg(e.target.value);
                }}
                rows={2}
              />
            </Box>
            <Box flex="1">
              <Text fontSize="sm" mb={1}>
                {t('landings.seoDescriptionEn')}
              </Text>
              <Textarea
                value={seoDescriptionEn}
                onChange={(e) => {
                  setSeoDescriptionEn(e.target.value);
                }}
                rows={2}
              />
            </Box>
          </HStack>

          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              {t('landings.campaignKey')}
            </Text>
            <Input
              value={campaignKey}
              onChange={(e) => {
                setCampaignKey(e.target.value);
              }}
              data-testid="landings-campaign-key"
            />
          </Box>

          <Heading size="sm" mb={2}>
            {t('landings.sections')}
          </Heading>
          <VStack align="stretch" gap={3} mb={4}>
            {sections.map((section, index) => (
              <Box
                key={`${section.type}-${String(index)}`}
                borderWidth="1px"
                borderColor="border.default"
                p={3}
                borderRadius="md"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {section.type}
                  </Text>
                  <HStack gap={1}>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        moveSection(index, -1);
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        moveSection(index, 1);
                      }}
                    >
                      ↓
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setSections((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      {t('landings.removeSection')}
                    </Button>
                  </HStack>
                </HStack>
                <Textarea
                  value={section.payloadJson}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSections((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, payloadJson: value } : row)),
                    );
                  }}
                  rows={6}
                  fontFamily="mono"
                  fontSize="sm"
                  data-testid={`landings-section-payload-${String(index)}`}
                />
              </Box>
            ))}
          </VStack>

          <HStack gap={2} mb={4}>
            <select
              value={newSectionType}
              onChange={(e) => {
                setNewSectionType(e.target.value as LandingSectionType);
              }}
              data-testid="landings-add-type"
            >
              {LANDING_SECTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const emptyPayload =
                  newSectionType === 'hero'
                    ? DEFAULT_HERO_JSON
                    : newSectionType === 'benefits' ||
                        newSectionType === 'services' ||
                        newSectionType === 'faq' ||
                        newSectionType === 'testimonials'
                      ? JSON.stringify({ items: [] }, null, 2)
                      : newSectionType === 'process'
                        ? JSON.stringify({ steps: [] }, null, 2)
                        : newSectionType === 'related_listings'
                          ? JSON.stringify({ propertyIds: [] }, null, 2)
                          : newSectionType === 'team'
                            ? JSON.stringify({ teamMemberIds: [] }, null, 2)
                            : JSON.stringify(
                                { inquirySource: 'landing', title: { bg: '', en: '' } },
                                null,
                                2,
                              );
                setSections((prev) => [
                  ...prev,
                  { type: newSectionType, payloadJson: emptyPayload },
                ]);
              }}
              data-testid="landings-add-section"
            >
              {t('landings.addSection')}
            </Button>
          </HStack>

          {formError !== null ? (
            <Text color="status.down" mb={3} data-testid="landings-form-error">
              {formError}
            </Text>
          ) : null}

          <HStack gap={2} flexWrap="wrap">
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              data-testid="landings-save"
            >
              {t('landings.save')}
            </Button>
            {selectedId !== null ? (
              <>
                <Button
                  variant="outline"
                  loading={publishMutation.isPending}
                  onClick={() => {
                    publishMutation.mutate(selectedId);
                  }}
                  data-testid="landings-publish"
                >
                  {t('landings.publish')}
                </Button>
                <Button
                  variant="outline"
                  loading={archiveMutation.isPending}
                  onClick={() => {
                    archiveMutation.mutate(selectedId);
                  }}
                  data-testid="landings-archive"
                >
                  {t('landings.archive')}
                </Button>
              </>
            ) : null}
          </HStack>
        </form>
      </Box>
    </VStack>
  );
}
