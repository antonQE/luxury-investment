import { Box, Button, Heading, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  documentKeys,
  fetchSellerHandbook,
  publishSellerHandbookVersion,
  uploadSellerHandbookVersion,
} from '@/api/endpoints/documents';

export default function HandbookAdmin() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [versionLabel, setVersionLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: documentKeys.handbook(),
    queryFn: fetchSellerHandbook,
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (file === null) throw new Error('file required');
      return uploadSellerHandbookVersion(file, {
        versionLabel: versionLabel.trim() || `v-${new Date().toISOString().slice(0, 10)}`,
        publish: true,
      });
    },
    onSuccess: async () => {
      setFile(null);
      setVersionLabel('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: documentKeys.handbook() });
    },
    onError: () => {
      setFormError(t('handbook.uploadError'));
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishSellerHandbookVersion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentKeys.handbook() });
    },
  });

  return (
    <VStack align="stretch" gap={6} data-testid="handbook-admin-page">
      <Heading size="xl" color="text.primary">
        {t('handbook.title')}
      </Heading>
      <Text color="text.muted" fontSize="sm">
        {t('handbook.lead')}
      </Text>

      {listQuery.isPending ? (
        <Spinner />
      ) : listQuery.isError ? (
        <Text color="status.down">{t('handbook.loadError')}</Text>
      ) : (
        <Text fontSize="sm" data-testid="handbook-download-total">
          {t('handbook.downloadTotal')}: {listQuery.data.downloadTotal}
        </Text>
      )}

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
      >
        <Heading size="md" mb={4}>
          {t('handbook.upload')}
        </Heading>
        <VStack align="stretch" gap={3}>
          <Box>
            <Text fontSize="sm" mb={1}>
              {t('handbook.versionLabel')}
            </Text>
            <Input
              value={versionLabel}
              onChange={(e) => {
                setVersionLabel(e.target.value);
              }}
              data-testid="handbook-version-label"
            />
          </Box>
          <Box>
            <Text fontSize="sm" mb={1}>
              {t('handbook.file')}
            </Text>
            <input
              type="file"
              accept="application/pdf"
              data-testid="handbook-file"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFile(event.target.files?.[0] ?? null);
              }}
            />
          </Box>
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
            data-testid="handbook-upload-submit"
          >
            {t('handbook.upload')}
          </Button>
        </VStack>
      </Box>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
        overflowX="auto"
      >
        {listQuery.data !== undefined ? (
          <Table.Root size="sm" data-testid="handbook-versions-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('handbook.versionLabel')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('handbook.file')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('handbook.downloads')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('handbook.status')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.versions.map((version) => (
                <Table.Row key={version.id}>
                  <Table.Cell>{version.versionLabel}</Table.Cell>
                  <Table.Cell>{version.fileName}</Table.Cell>
                  <Table.Cell>{version.downloadCount}</Table.Cell>
                  <Table.Cell>
                    {version.isCurrent ? t('handbook.current') : t('handbook.archived')}
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    {!version.isCurrent ? (
                      <Button
                        size="xs"
                        onClick={() => {
                          publishMutation.mutate(version.id);
                        }}
                        data-testid={`handbook-publish-${version.versionLabel}`}
                      >
                        {t('handbook.publish')}
                      </Button>
                    ) : null}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : null}
      </Box>
    </VStack>
  );
}
