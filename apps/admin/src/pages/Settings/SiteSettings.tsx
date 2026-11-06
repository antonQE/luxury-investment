import { Box, Button, Heading, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  fetchSiteSettings,
  siteSettingsKeys,
  updateSiteSettings,
} from '@/api/endpoints/site-settings';
import { ApiError } from '@/types/api';

export default function SiteSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [phoneDraft, setPhoneDraft] = useState<string | undefined>(undefined);
  const [emailDraft, setEmailDraft] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const settingsQuery = useQuery({
    queryKey: siteSettingsKeys.all(),
    queryFn: fetchSiteSettings,
  });

  const publicPhone = phoneDraft ?? settingsQuery.data?.publicPhone ?? '';
  const publicEmail = emailDraft ?? settingsQuery.data?.publicEmail ?? '';

  const saveMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: async () => {
      setFormError(null);
      setSaved(true);
      setPhoneDraft(undefined);
      setEmailDraft(undefined);
      await queryClient.invalidateQueries({ queryKey: siteSettingsKeys.all() });
    },
    onError: (err) => {
      setSaved(false);
      setFormError(err instanceof ApiError ? err.message : t('settings.saveError'));
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    saveMutation.mutate({
      publicPhone: publicPhone.trim() === '' ? null : publicPhone.trim(),
      publicEmail: publicEmail.trim() === '' ? null : publicEmail.trim(),
    });
  }

  return (
    <VStack align="stretch" gap={6} data-testid="site-settings-page">
      <Box>
        <Heading size="xl" color="text.primary">
          {t('settings.title')}
        </Heading>
        <Text color="text.muted" fontSize="sm" mt={1}>
          {t('settings.lead')}
        </Text>
      </Box>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
      >
        {settingsQuery.isPending ? (
          <Spinner />
        ) : settingsQuery.isError ? (
          <Text color="status.down">{t('settings.loadError')}</Text>
        ) : (
          <form onSubmit={onSubmit}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" mb={1}>
                  {t('settings.publicPhone')}
                </Text>
                <Text color="text.muted" fontSize="xs" mb={2}>
                  {t('settings.publicPhoneHint')}
                </Text>
                <Input
                  value={publicPhone}
                  onChange={(e) => {
                    setPhoneDraft(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="+359 2 000 00 00"
                  maxW="320px"
                  data-testid="settings-public-phone"
                />
              </Box>
              <Box>
                <Text fontSize="sm" mb={1}>
                  {t('settings.publicEmail')}
                </Text>
                <Text color="text.muted" fontSize="xs" mb={2}>
                  {t('settings.publicEmailHint')}
                </Text>
                <Input
                  type="email"
                  value={publicEmail}
                  onChange={(e) => {
                    setEmailDraft(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="hello@example.com"
                  maxW="320px"
                  data-testid="settings-public-email"
                />
              </Box>
            </VStack>
            {formError !== null ? (
              <Text color="status.down" mt={3} data-testid="settings-form-error">
                {formError}
              </Text>
            ) : null}
            {saved ? (
              <Text color="text.muted" mt={3} data-testid="settings-saved">
                {t('settings.saved')}
              </Text>
            ) : null}
            <Button
              type="submit"
              mt={4}
              loading={saveMutation.isPending}
              data-testid="settings-save"
            >
              {t('settings.save')}
            </Button>
          </form>
        )}
      </Box>
    </VStack>
  );
}
