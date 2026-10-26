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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveAdminArticle,
  articleKeys,
  createAdminArticle,
  fetchAdminArticles,
  publishAdminArticle,
} from '@/api/endpoints/articles';
import { ApiError } from '@/types/api';

export default function ArticlesList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState('');
  const [titleBg, setTitleBg] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [excerptBg, setExcerptBg] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [bodyBg, setBodyBg] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: articleKeys.list(),
    queryFn: fetchAdminArticles,
  });

  const createMutation = useMutation({
    mutationFn: createAdminArticle,
    onSuccess: async () => {
      setSlug('');
      setTitleBg('');
      setTitleEn('');
      setExcerptBg('');
      setExcerptEn('');
      setBodyBg('');
      setBodyEn('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: articleKeys.list() });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : t('articles.saveError'));
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishAdminArticle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: articleKeys.list() });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminArticle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: articleKeys.list() });
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      slug: slug.trim(),
      titleBg: titleBg.trim(),
      titleEn: titleEn.trim(),
      excerptBg: excerptBg.trim(),
      excerptEn: excerptEn.trim(),
      bodyBg: bodyBg.trim(),
      bodyEn: bodyEn.trim(),
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="articles-admin-page">
      <Heading size="xl" color="text.primary">
        {t('articles.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('articles.lead')}
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
            {t('articles.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <Box>
              <Text fontSize="sm" mb={1}>
                {t('articles.slug')}
              </Text>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                }}
                required
                data-testid="article-slug"
              />
            </Box>
            <HStack gap={3} flexWrap="wrap">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('articles.titleBg')}
                </Text>
                <Input
                  value={titleBg}
                  onChange={(e) => {
                    setTitleBg(e.target.value);
                  }}
                  required
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('articles.titleEn')}
                </Text>
                <Input
                  value={titleEn}
                  onChange={(e) => {
                    setTitleEn(e.target.value);
                  }}
                  required
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap" align="flex-start">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('articles.excerptBg')}
                </Text>
                <Textarea
                  value={excerptBg}
                  onChange={(e) => {
                    setExcerptBg(e.target.value);
                  }}
                  required
                  rows={2}
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('articles.excerptEn')}
                </Text>
                <Textarea
                  value={excerptEn}
                  onChange={(e) => {
                    setExcerptEn(e.target.value);
                  }}
                  required
                  rows={2}
                />
              </Box>
            </HStack>
            <HStack gap={3} flexWrap="wrap" align="flex-start">
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('articles.bodyBg')}
                </Text>
                <Textarea
                  value={bodyBg}
                  onChange={(e) => {
                    setBodyBg(e.target.value);
                  }}
                  required
                  rows={4}
                />
              </Box>
              <Box flex="1" minW="140px">
                <Text fontSize="sm" mb={1}>
                  {t('articles.bodyEn')}
                </Text>
                <Textarea
                  value={bodyEn}
                  onChange={(e) => {
                    setBodyEn(e.target.value);
                  }}
                  required
                  rows={4}
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
              data-testid="article-create-submit"
            >
              {t('articles.create')}
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
          <Text color="status.down">{t('articles.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="articles-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('articles.slug')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('articles.titleBg')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('articles.status')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.slug}</Table.Cell>
                  <Table.Cell>{row.title.bg}</Table.Cell>
                  <Table.Cell>{row.status}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap={2} justify="flex-end">
                      {row.status !== 'published' ? (
                        <Button
                          size="xs"
                          onClick={() => {
                            publishMutation.mutate(row.id);
                          }}
                          data-testid={`article-publish-${row.slug}`}
                        >
                          {t('articles.publish')}
                        </Button>
                      ) : null}
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          archiveMutation.mutate(row.id);
                        }}
                        data-testid={`article-archive-${row.slug}`}
                      >
                        {t('articles.archive')}
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
