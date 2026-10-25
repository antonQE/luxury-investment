import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <VStack minH="60vh" justify="center" gap={4} data-testid="not-found-page">
      <Heading size="lg">{t('notFound.title')}</Heading>
      <Text color="text.secondary">{t('notFound.body')}</Text>
      <Link to={ROUTES.DASHBOARD} data-testid="not-found-back">
        <Button>{t('notFound.back')}</Button>
      </Link>
    </VStack>
  );
}
