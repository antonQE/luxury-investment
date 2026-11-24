import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { navIconFor } from '@/components/layout/nav-icons';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children?: ReactNode;
}

const SIDEBAR_COLLAPSED = '4rem';
const SIDEBAR_EXPANDED = '15.5rem';

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
    { to: ROUTES.TASKS, label: t('nav.tasks'), testId: 'nav-tasks' },
    { to: ROUTES.OFFERS, label: t('nav.offers'), testId: 'nav-offers' },
    { to: ROUTES.DEALS, label: t('nav.deals'), testId: 'nav-deals' },
    { to: ROUTES.ARTICLES, label: t('nav.articles'), testId: 'nav-articles' },
    { to: ROUTES.LANDINGS, label: t('nav.landings'), testId: 'nav-landings' },
    { to: ROUTES.DOCUMENTS, label: t('nav.documents'), testId: 'nav-documents' },
    { to: ROUTES.ANALYTICS, label: t('nav.analytics'), testId: 'nav-analytics' },
    { to: ROUTES.SETTINGS, label: t('nav.settings'), testId: 'nav-settings' },
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
        role="navigation"
        aria-label={t('app.title')}
        w={SIDEBAR_COLLAPSED}
        minH="100dvh"
        flexShrink={0}
        position="sticky"
        top={0}
        alignSelf="flex-start"
        zIndex={20}
        bg="background.sidebar"
        color="text.inverse"
        overflow="hidden"
        transition="width 0.2s ease"
        _hover={{ w: SIDEBAR_EXPANDED }}
        css={{
          '&:hover [data-sidebar-label]': { opacity: 1, width: 'auto' },
        }}
        data-testid="admin-sidebar"
      >
        <Box
          w={SIDEBAR_EXPANDED}
          h="100dvh"
          px={3}
          py={6}
          display="flex"
          flexDirection="column"
          gap={8}
        >
          <HStack px={3} minH="2.5rem" gap={3} align="center">
            <Text
              flexShrink={0}
              w="18px"
              textAlign="center"
              fontFamily="heading"
              fontSize="sm"
              letterSpacing="0.06em"
              color="accent.gold"
            >
              LI
            </Text>
            <Box
              data-sidebar-label=""
              opacity={0}
              width={0}
              overflow="hidden"
              whiteSpace="nowrap"
              transition="opacity 0.15s ease"
            >
              <Text fontFamily="heading" fontSize="md" letterSpacing="0.02em" lineHeight="1.2">
                Luxury Investment
              </Text>
              <Text
                fontSize="xs"
                mt={1}
                opacity={0.55}
                letterSpacing="0.12em"
                textTransform="uppercase"
              >
                {t('app.tagline')}
              </Text>
            </Box>
          </HStack>

          <Box as="nav" display="flex" flexDirection="column" gap={0.5} overflowY="auto" flex="1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={item.testId}
                title={item.label}
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <HStack
                    gap={3}
                    px={3}
                    py={2.5}
                    borderRadius="l2"
                    borderLeftWidth="2px"
                    borderLeftColor={isActive ? 'accent.gold' : 'transparent'}
                    bg={isActive ? 'accent.goldMuted' : 'transparent'}
                    transition="background 0.15s ease, border-color 0.15s ease"
                    _hover={{ bg: 'accent.goldMuted' }}
                    color={isActive ? 'accent.gold' : 'text.inverse'}
                    opacity={isActive ? 1 : 0.78}
                  >
                    <Box flexShrink={0} display="inline-flex" w="18px" justifyContent="center">
                      {navIconFor(item.to)}
                    </Box>
                    <Text
                      data-sidebar-label=""
                      fontSize="sm"
                      letterSpacing="0.02em"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      opacity={0}
                      width={0}
                      transition="opacity 0.15s ease"
                    >
                      {item.label}
                    </Text>
                  </HStack>
                )}
              </NavLink>
            ))}
          </Box>
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
