import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  lead,
  actions,
  testId,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
  testId?: string;
}) {
  return (
    <HStack align="start" justify="space-between" gap={4} flexWrap="wrap" data-testid={testId}>
      <Box minW={0} flex="1">
        <Heading size="xl" color="text.primary">
          {title}
        </Heading>
        {lead !== undefined && lead !== '' ? (
          <Text color="text.muted" fontSize="sm" mt={1}>
            {lead}
          </Text>
        ) : null}
      </Box>
      {actions !== undefined ? (
        <HStack gap={2} flexShrink={0}>
          {actions}
        </HStack>
      ) : null}
    </HStack>
  );
}
