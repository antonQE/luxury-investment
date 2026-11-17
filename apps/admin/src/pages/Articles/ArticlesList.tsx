import {
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
import { dangerVariant } from '@/components/ui/button-variants';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
      <PageHeader title={t('articles.title')} lead={t('articles.lead')} />

      <Panel>
        <form
          onSubmit={(event) => {
            onSubmit(event);
          }}
        >
          <Heading size="md" mb={4}>
            {t('articles.create')}
          </Heading>
          <VStack align="stretch" gap={3}>
            <Field label={t('articles.slug')} required>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                }}
                required
                data-testid="article-slug"
              />
            </Field>
            <HStack gap={3} flexWrap="wrap">
              <Field label={t('articles.titleBg')} required>
                <Input
                  value={titleBg}
                  onChange={(e) => {
                    setTitleBg(e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label={t('articles.titleEn')} required>
                <Input
                  value={titleEn}
                  onChange={(e) => {
                    setTitleEn(e.target.value);
                  }}
                  required
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap" align="flex-start">
              <Field label={t('articles.excerptBg')} required>
                <Textarea
                  value={excerptBg}
                  onChange={(e) => {
                    setExcerptBg(e.target.value);
                  }}
                  required
                  rows={2}
                />
              </Field>
              <Field label={t('articles.excerptEn')} required>
                <Textarea
                  value={excerptEn}
                  onChange={(e) => {
                    setExcerptEn(e.target.value);
                  }}
                  required
                  rows={2}
                />
              </Field>
            </HStack>
            <HStack gap={3} flexWrap="wrap" align="flex-start">
              <Field label={t('articles.bodyBg')} required>
                <Textarea
                  value={bodyBg}
                  onChange={(e) => {
                    setBodyBg(e.target.value);
                  }}
                  required
                  rows={4}
                />
              </Field>
              <Field label={t('articles.bodyEn')} required>
                <Textarea
                  value={bodyEn}
                  onChange={(e) => {
                    setBodyEn(e.target.value);
                  }}
                  required
                  rows={4}
                />
              </Field>
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
      </Panel>

      <Panel overflowX="auto">
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
                  <Table.Cell>
                    <StatusBadge
                      value={row.status}
                      label={t(`articles.status_${row.status}`, { defaultValue: row.status })}
                    />
                  </Table.Cell>
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
                        variant={dangerVariant}
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
      </Panel>
    </VStack>
  );
}
