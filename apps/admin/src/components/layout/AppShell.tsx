import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    void navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <Flex minH="100dvh" bg="background.page" data-testid="app-shell">
      <Box
        as="aside"
        w="240px"
        bg="background.sidebar"
        color="text.inverse"
        p={6}
        display="flex"
        flexDirection="column"
        gap={8}
        data-testid="admin-sidebar"
      >
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            {t('app.title')}
          </Text>
          <Text fontSize="sm" opacity={0.7} mt={1}>
            {t('app.tagline')}
          </Text>
        </Box>
        <Box as="nav" display="flex" flexDirection="column" gap={2}>
          {(
            [
              { to: ROUTES.DASHBOARD, label: t('nav.dashboard'), testId: 'nav-dashboard' },
              { to: ROUTES.PROPERTIES, label: t('nav.properties'), testId: 'nav-properties' },
              { to: ROUTES.INQUIRIES, label: t('nav.inquiries'), testId: 'nav-inquiries' },
              { to: ROUTES.ARTICLES, label: t('nav.articles'), testId: 'nav-articles' },
              { to: ROUTES.TEAM, label: t('nav.team'), testId: 'nav-team' },
              { to: ROUTES.PARTNERS, label: t('nav.partners'), testId: 'nav-partners' },
              { to: ROUTES.LOCATIONS, label: t('nav.locations'), testId: 'nav-locations' },
              {
                to: ROUTES.PROPERTY_TYPES,
                label: t('nav.propertyTypes'),
                testId: 'nav-property-types',
              },
            ] as const
          ).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <Text
                  color={isActive ? 'accent.gold' : 'text.inverse'}
                  fontSize="sm"
                  opacity={isActive ? 1 : 0.8}
                >
                  {item.label}
                </Text>
              )}
            </NavLink>
          ))}
        </Box>
      </Box>
      <Flex flex={1} direction="column" minW={0}>
        <HStack
          as="header"
          justify="space-between"
          px={8}
          py={4}
          borderBottomWidth="1px"
          borderColor="border.default"
          bg="background.panel"
          data-testid="admin-header"
        >
          <Text fontSize="sm" color="text.muted" data-testid="header-user">
            {user?.displayName ?? t('header.userPlaceholder')}
          </Text>
          <HStack gap={3}>
            <LanguageSwitcher />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void onLogout()}
              data-testid="logout"
            >
              {t('header.logout')}
            </Button>
          </HStack>
        </HStack>
        <Box as="main" flex={1} p={8} overflow="auto">
          {children ?? <Outlet />}
        </Box>
      </Flex>
    </Flex>
  );
}
