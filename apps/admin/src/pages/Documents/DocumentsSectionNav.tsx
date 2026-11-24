import { HStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

export function DocumentsSectionNav() {
  const { t } = useTranslation();

  return (
    <HStack gap={2} flexWrap="wrap" data-testid="documents-section-nav">
      <NavLink
        to={ROUTES.DOCUMENTS}
        end
        data-testid="documents-tab-library"
        style={{ textDecoration: 'none' }}
      >
        {({ isActive }) => <TabChip active={isActive}>{t('documents.tabLibrary')}</TabChip>}
      </NavLink>
      <NavLink
        to={ROUTES.HANDBOOK}
        data-testid="documents-tab-handbook"
        style={{ textDecoration: 'none' }}
      >
        {({ isActive }) => <TabChip active={isActive}>{t('documents.tabHandbook')}</TabChip>}
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
