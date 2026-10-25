import { Box, Button, Heading, Input, Text, VStack } from '@chakra-ui/react';
import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/types/api';

interface LoginLocationState {
  from?: string;
}

export default function Login() {
  const { t } = useTranslation();
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user !== null) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const state =
        location.state !== null && typeof location.state === 'object'
          ? (location.state as LoginLocationState)
          : undefined;
      const from = typeof state?.from === 'string' ? state.from : ROUTES.DASHBOARD;
      void navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? t('login.invalid') : t('login.error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      minH="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="background.page"
      px={4}
      data-testid="login-page"
    >
      <Box
        as="form"
        onSubmit={(event: SyntheticEvent<HTMLFormElement>) => {
          void onSubmit(event);
        }}
        w="full"
        maxW="md"
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={8}
      >
        <VStack align="stretch" gap={4}>
          <Heading size="lg">{t('login.title')}</Heading>
          <Text fontSize="sm" color="text.muted">
            {t('login.lead')}
          </Text>
          <Box as="label" display="block">
            <Text fontSize="sm" mb={1}>
              {t('login.email')}
            </Text>
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              data-testid="login-email"
              required
            />
          </Box>
          <Box as="label" display="block">
            <Text fontSize="sm" mb={1}>
              {t('login.password')}
            </Text>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              data-testid="login-password"
              required
            />
          </Box>
          {error !== null ? (
            <Text color="status.down" fontSize="sm" data-testid="login-error">
              {error}
            </Text>
          ) : null}
          <Button type="submit" loading={submitting} data-testid="login-submit">
            {t('login.submit')}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
