import { Button, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  fetchSiteSettings,
  siteSettingsKeys,
  updateSiteSettings,
} from '@/api/endpoints/site-settings';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
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
      <PageHeader title={t('settings.title')} lead={t('settings.lead')} />

      <Panel>
        {settingsQuery.isPending ? (
          <Spinner />
        ) : settingsQuery.isError ? (
          <Text color="status.down">{t('settings.loadError')}</Text>
        ) : (
          <form onSubmit={onSubmit}>
            <VStack align="stretch" gap={4}>
              <Field label={t('settings.publicPhone')} hint={t('settings.publicPhoneHint')}>
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
              </Field>
              <Field label={t('settings.publicEmail')} hint={t('settings.publicEmailHint')}>
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
              </Field>
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
      </Panel>
    </VStack>
  );
}
