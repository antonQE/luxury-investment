import { Box, Button, Heading, Input, Text, VStack } from '@chakra-ui/react';
import { type SubmitEvent, useState } from 'react';
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

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      bg="background.sidebar"
      px={4}
      position="relative"
      overflow="hidden"
      data-testid="login-page"
    >
      <Box
        position="absolute"
        inset={0}
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(166,132,69,0.2), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(242,239,233,0.07), transparent 45%)',
        }}
        pointerEvents="none"
      />
      <Box
        position="relative"
        w="full"
        maxW="420px"
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        px={10}
        py={12}
      >
        <form
          onSubmit={(event) => {
            void onSubmit(event);
          }}
        >
          <VStack align="stretch" gap={5}>
            <Box>
              <Text fontFamily="heading" fontSize="2xl" color="text.primary" letterSpacing="0.02em">
                Luxury Investment
              </Text>
              <Heading as="h1" size="md" mt={4} fontWeight="500" color="text.primary">
                {t('login.title')}
              </Heading>
              <Text fontSize="sm" color="text.muted" mt={2} lineHeight="1.6">
                {t('login.lead')}
              </Text>
            </Box>
            <Box as="label" display="block">
              <Text
                fontSize="xs"
                mb={2}
                letterSpacing="0.14em"
                textTransform="uppercase"
                color="text.muted"
              >
                {t('login.email')}
              </Text>
              <Input
                type="email"
                autoComplete="username"
                value={email}
                borderRadius="0"
                borderColor="border.default"
                _focusVisible={{ borderColor: 'accent.gold', boxShadow: 'none' }}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                data-testid="login-email"
                required
              />
            </Box>
            <Box as="label" display="block">
              <Text
                fontSize="xs"
                mb={2}
                letterSpacing="0.14em"
                textTransform="uppercase"
                color="text.muted"
              >
                {t('login.password')}
              </Text>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                borderRadius="0"
                borderColor="border.default"
                _focusVisible={{ borderColor: 'accent.gold', boxShadow: 'none' }}
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
            <Button
              type="submit"
              loading={submitting}
              bg="accent.gold"
              color="background.sidebar"
              borderRadius="0"
              fontWeight="600"
              letterSpacing="0.12em"
              textTransform="uppercase"
              fontSize="xs"
              h="44px"
              _hover={{ bg: '#8a6c38' }}
              data-testid="login-submit"
            >
              {t('login.submit')}
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
