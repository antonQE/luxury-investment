import { HStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

export function TasksSectionNav() {
  const { t } = useTranslation();

  return (
    <HStack gap={2} flexWrap="wrap" data-testid="tasks-section-nav">
      <NavLink
        to={ROUTES.MARKETING}
        data-testid="tasks-tab-marketing"
        style={{ textDecoration: 'none' }}
      >
        {({ isActive }) => <TabChip active={isActive}>{t('tasks.tabMarketing')}</TabChip>}
      </NavLink>
      <NavLink to={ROUTES.STUDIO} data-testid="tasks-tab-studio" style={{ textDecoration: 'none' }}>
        {({ isActive }) => <TabChip active={isActive}>{t('tasks.tabStudio')}</TabChip>}
      </NavLink>
      <NavLink to={ROUTES.CRM_TASKS} data-testid="tasks-tab-crm" style={{ textDecoration: 'none' }}>
        {({ isActive }) => <TabChip active={isActive}>{t('tasks.tabCrm')}</TabChip>}
      </NavLink>
    </HStack>
  );
}

function TabChip({ active, children }: { active: boolean; children: string }) {
  return (
    <HStack
      as="span"
      px={3}
      py={1.5}
      borderWidth="1px"
      borderColor={active ? 'accent.gold' : 'border.default'}
      bg={active ? 'accent.goldMuted' : 'transparent'}
      color={active ? 'accent.gold' : 'text.muted'}
      fontSize="sm"
      letterSpacing="0.04em"
      textTransform="uppercase"
      transition="background 0.15s ease, border-color 0.15s ease, color 0.15s ease"
      _hover={{ borderColor: 'accent.gold', color: 'accent.gold' }}
    >
      {children}
    </HStack>
  );
}
