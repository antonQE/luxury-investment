import { Button, HStack, Text } from '@chakra-ui/react';
import { type Locale, LOCALES } from '@luxury-investment/shared';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.language as Locale;

  return (
    <HStack gap={2} data-testid="language-switcher">
      <Text fontSize="xs" color="text.muted">
        {t('header.language')}
      </Text>
      {LOCALES.map((locale) => (
        <Button
          key={locale}
          size="xs"
          variant={current === locale ? 'solid' : 'outline'}
          onClick={() => {
            void i18n.changeLanguage(locale);
            document.documentElement.lang = locale;
          }}
          data-testid={`lang-${locale}`}
        >
          {locale.toUpperCase()}
        </Button>
      ))}
    </HStack>
  );
}
