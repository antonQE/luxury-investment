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

  const navItems = [
    { to: ROUTES.DASHBOARD, label: t('nav.dashboard'), testId: 'nav-dashboard' },
    { to: ROUTES.PROPERTIES, label: t('nav.properties'), testId: 'nav-properties' },
    { to: ROUTES.INQUIRIES, label: t('nav.inquiries'), testId: 'nav-inquiries' },
    { to: ROUTES.CONTACTS, label: t('nav.contacts'), testId: 'nav-contacts' },
    { to: ROUTES.VIEWINGS, label: t('nav.viewings'), testId: 'nav-viewings' },
    { to: ROUTES.CRM_TASKS, label: t('nav.crmTasks'), testId: 'nav-crm-tasks' },
    { to: ROUTES.OFFERS, label: t('nav.offers'), testId: 'nav-offers' },
    { to: ROUTES.DEALS, label: t('nav.deals'), testId: 'nav-deals' },
    { to: ROUTES.ARTICLES, label: t('nav.articles'), testId: 'nav-articles' },
    { to: ROUTES.DOCUMENTS, label: t('nav.documents'), testId: 'nav-documents' },
    { to: ROUTES.HANDBOOK, label: t('nav.handbook'), testId: 'nav-handbook' },
    { to: ROUTES.TEAM, label: t('nav.team'), testId: 'nav-team' },
    { to: ROUTES.OFFICES, label: t('nav.offices'), testId: 'nav-offices' },
    { to: ROUTES.PARTNERS, label: t('nav.partners'), testId: 'nav-partners' },
    { to: ROUTES.LOCATIONS, label: t('nav.locations'), testId: 'nav-locations' },
    {
      to: ROUTES.PROPERTY_TYPES,
      label: t('nav.propertyTypes'),
      testId: 'nav-property-types',
    },
  ] as const;

  return (
    <Flex minH="100dvh" bg="background.page" data-testid="app-shell">
      <Box
        as="aside"
        w="248px"
        bg="background.sidebar"
        color="text.inverse"
        px={5}
        py={7}
        display="flex"
        flexDirection="column"
        gap={10}
        data-testid="admin-sidebar"
      >
        <Box px={2}>
          <Text fontFamily="heading" fontSize="xl" letterSpacing="0.02em" lineHeight="1.2">
            Luxury Investment
          </Text>
          <Text
            fontSize="xs"
            mt={2}
            opacity={0.55}
            letterSpacing="0.14em"
            textTransform="uppercase"
          >
            {t('app.tagline')}
          </Text>
        </Box>
        <Box as="nav" display="flex" flexDirection="column" gap={0.5}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <Box
                  px={3}
                  py={2.5}
                  borderLeftWidth="2px"
                  borderLeftColor={isActive ? 'accent.gold' : 'transparent'}
                  bg={isActive ? 'accent.goldMuted' : 'transparent'}
                  transition="background 0.15s ease, border-color 0.15s ease"
                  _hover={{ bg: 'accent.goldMuted' }}
                >
                  <Text
                    color={isActive ? 'accent.gold' : 'text.inverse'}
                    fontSize="sm"
                    opacity={isActive ? 1 : 0.72}
                    letterSpacing="0.02em"
                  >
                    {item.label}
                  </Text>
                </Box>
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
              borderColor="border.default"
              color="text.secondary"
              borderRadius="0"
              fontWeight="500"
              letterSpacing="0.06em"
              textTransform="uppercase"
              fontSize="xs"
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
