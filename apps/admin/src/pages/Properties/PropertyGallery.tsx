import { Box, Button, Heading, HStack, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveMedia,
  fetchPropertyMedia,
  mediaKeys,
  updatePropertyMedia,
  uploadPropertyMedia,
} from '@/api/endpoints/media';

interface PropertyGalleryProps {
  propertyId: string;
}

export function PropertyGallery({ propertyId }: PropertyGalleryProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: mediaKeys.forProperty(propertyId),
    queryFn: () => fetchPropertyMedia(propertyId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPropertyMedia(propertyId, file),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: mediaKeys.forProperty(propertyId) });
    },
    onError: () => {
      setError(t('media.uploadError'));
    },
  });

  const patchMutation = useMutation({
    mutationFn: (input: {
      assetId: string;
      patch: { altBg?: string; altEn?: string; isPrimary?: boolean };
    }) => updatePropertyMedia(propertyId, input.assetId, input.patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.forProperty(propertyId) });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (assetId: string) => archiveMedia(assetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.forProperty(propertyId) });
    },
  });

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file === undefined) return;
    uploadMutation.mutate(file);
    event.target.value = '';
  }

  return (
    <Box
      bg="background.panel"
      borderWidth="1px"
      borderColor="border.default"
      p={6}
      borderRadius="md"
      data-testid="property-gallery"
    >
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
        <Heading size="md">{t('media.title')}</Heading>
        <Box>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            data-testid="media-upload-input"
          />
        </Box>
      </HStack>
      <Text fontSize="sm" color="text.muted" mb={4}>
        {t('media.lead')}
      </Text>
      {error !== null ? (
        <Text color="status.down" fontSize="sm" mb={3}>
          {error}
        </Text>
      ) : null}
      {uploadMutation.isPending ? <Spinner mb={3} data-testid="media-uploading" /> : null}
      {listQuery.isPending ? (
        <Spinner data-testid="media-loading" />
      ) : listQuery.isError ? (
        <Text color="status.down">{t('media.loadError')}</Text>
      ) : (
        <VStack align="stretch" gap={4}>
          {listQuery.data.map((asset) => (
            <HStack
              key={asset.id}
              align="start"
              gap={4}
              flexWrap="wrap"
              data-testid={`media-item-${asset.id}`}
            >
              <img
                src={asset.urls.thumb}
                alt={asset.altEn || asset.altBg}
                width={96}
                height={96}
                style={{ objectFit: 'cover', borderRadius: '0.375rem' }}
              />
              <VStack align="stretch" flex="1" minW="200px" gap={2}>
                <HStack gap={2} flexWrap="wrap">
                  <Input
                    size="sm"
                    placeholder={t('media.altBg')}
                    defaultValue={asset.altBg}
                    onBlur={(event) => {
                      if (event.target.value === asset.altBg) return;
                      patchMutation.mutate({
                        assetId: asset.id,
                        patch: { altBg: event.target.value },
                      });
                    }}
                    data-testid={`media-alt-bg-${asset.id}`}
                  />
                  <Input
                    size="sm"
                    placeholder={t('media.altEn')}
                    defaultValue={asset.altEn}
                    onBlur={(event) => {
                      if (event.target.value === asset.altEn) return;
                      patchMutation.mutate({
                        assetId: asset.id,
                        patch: { altEn: event.target.value },
                      });
                    }}
                    data-testid={`media-alt-en-${asset.id}`}
                  />
                </HStack>
                <HStack gap={2}>
                  <Button
                    size="xs"
                    variant={asset.isPrimary ? 'solid' : 'outline'}
                    onClick={() => {
                      patchMutation.mutate({ assetId: asset.id, patch: { isPrimary: true } });
                    }}
                    data-testid={`media-primary-${asset.id}`}
                  >
                    {asset.isPrimary ? t('media.primary') : t('media.setPrimary')}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      archiveMutation.mutate(asset.id);
                    }}
                    data-testid={`media-archive-${asset.id}`}
                  >
                    {t('media.archive')}
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          ))}
          {listQuery.data.length === 0 ? (
            <Text fontSize="sm" color="text.muted">
              {t('media.empty')}
            </Text>
          ) : null}
        </VStack>
      )}
    </Box>
  );
}
