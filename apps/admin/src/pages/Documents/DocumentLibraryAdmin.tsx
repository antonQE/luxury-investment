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
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  archiveDocument,
  documentKeys,
  fetchDocument,
  fetchDocuments,
  uploadDocumentVersion,
} from '@/api/endpoints/documents';
import { ROUTES } from '@/constants/routes';

export default function DocumentLibraryAdmin() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: documentKeys.list(),
    queryFn: fetchDocuments,
  });

  const detailQuery = useQuery({
    queryKey: documentKeys.detail(selectedId ?? ''),
    queryFn: () => {
      if (selectedId === null) throw new Error('no document selected');
      return fetchDocument(selectedId);
    },
    enabled: selectedId !== null,
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (selectedId === null || file === null) throw new Error('missing');
      return uploadDocumentVersion(selectedId, file, {
        versionLabel: versionLabel.trim() || `v-${new Date().toISOString().slice(0, 10)}`,
        publish: true,
      });
    },
    onSuccess: async () => {
      setFile(null);
      setVersionLabel('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: documentKeys.list() });
      if (selectedId !== null) {
        await queryClient.invalidateQueries({ queryKey: documentKeys.detail(selectedId) });
      }
    },
    onError: () => {
      setFormError(t('documents.uploadError'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveDocument,
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: documentKeys.list() });
    },
  });

  const titleOf = (row: { titleBg: string; titleEn: string; slug: string }) =>
    i18n.language.startsWith('bg') ? row.titleBg || row.slug : row.titleEn || row.slug;

  return (
    <VStack align="stretch" gap={6} data-testid="document-library-admin-page">
      <HStack justify="space-between" align="start">
        <Box>
          <Heading size="xl" color="text.primary">
            {t('documents.title')}
          </Heading>
          <Text color="text.muted" fontSize="sm" mt={1}>
            {t('documents.lead')}
          </Text>
        </Box>
        <Link to={ROUTES.HANDBOOK} data-testid="documents-open-handbook">
          {t('documents.openHandbook')}
        </Link>
      </HStack>

      {listQuery.isPending ? (
        <Spinner />
      ) : listQuery.isError ? (
        <Text color="status.down">{t('documents.loadError')}</Text>
      ) : (
        <Box
          bg="background.panel"
          borderWidth="1px"
          borderColor="border.default"
          p={4}
          borderRadius="md"
          overflowX="auto"
        >
          <Table.Root size="sm" data-testid="document-library-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('documents.colTitle')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('documents.colKind')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('documents.colAccess')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('documents.colLegal')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{titleOf(row)}</Table.Cell>
                  <Table.Cell>{row.kind}</Table.Cell>
                  <Table.Cell>{row.accessLevel}</Table.Cell>
                  <Table.Cell>
                    {row.legalSample ? t('documents.yes') : t('documents.no')}
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack justify="flex-end" gap={2}>
                      <Button
                        size="xs"
                        variant={selectedId === row.id ? 'solid' : 'outline'}
                        onClick={() => {
                          setSelectedId(row.id);
                        }}
                        data-testid={`document-select-${row.slug}`}
                      >
                        {t('documents.manage')}
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          archiveMutation.mutate(row.id);
                        }}
                        data-testid={`document-archive-${row.slug}`}
                      >
                        {t('documents.archive')}
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {selectedId !== null ? (
        <Box
          bg="background.panel"
          borderWidth="1px"
          borderColor="border.default"
          p={6}
          borderRadius="md"
          data-testid="document-library-detail"
        >
          {detailQuery.isPending ? (
            <Spinner />
          ) : detailQuery.data ? (
            <VStack align="stretch" gap={4}>
              <Heading size="md">{titleOf(detailQuery.data)}</Heading>
              <Text fontSize="sm" color="text.muted">
                {t('documents.downloadTotal')}: {detailQuery.data.downloadTotal}
              </Text>

              <Heading size="sm">{t('documents.upload')}</Heading>
              <VStack align="stretch" gap={3}>
                <Input
                  value={versionLabel}
                  onChange={(e) => {
                    setVersionLabel(e.target.value);
                  }}
                  placeholder={t('documents.versionLabel')}
                  data-testid="document-version-label"
                />
                <input
                  type="file"
                  accept="application/pdf"
                  data-testid="document-file"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setFile(event.target.files?.[0] ?? null);
                  }}
                />
                {formError !== null ? (
                  <Text color="status.down" fontSize="sm">
                    {formError}
                  </Text>
                ) : null}
                <Button
                  alignSelf="flex-start"
                  loading={uploadMutation.isPending}
                  disabled={file === null}
                  onClick={() => {
                    uploadMutation.mutate();
                  }}
                  data-testid="document-upload-submit"
                >
                  {t('documents.upload')}
                </Button>
              </VStack>

              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t('documents.versionLabel')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('documents.file')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('documents.downloads')}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t('documents.status')}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {detailQuery.data.versions.map((version) => (
                    <Table.Row key={version.id}>
                      <Table.Cell>{version.versionLabel}</Table.Cell>
                      <Table.Cell>{version.fileName}</Table.Cell>
                      <Table.Cell>{version.downloadCount}</Table.Cell>
                      <Table.Cell>
                        {version.isCurrent ? t('documents.current') : t('documents.notCurrent')}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </VStack>
          ) : (
            <Text color="status.down">{t('documents.loadError')}</Text>
          )}
        </Box>
      ) : null}
    </VStack>
  );
}
