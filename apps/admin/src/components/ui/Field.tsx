import { Box, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
  minW = '160px',
  required = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  minW?: string;
  required?: boolean;
}) {
  return (
    <Box flex="1" minW={minW}>
      <Text fontSize="sm" fontWeight="600" color="text.secondary" mb={1}>
        {label}
        {required ? (
          <Text as="span" color="status.down" aria-hidden="true">
            {' '}
            *
          </Text>
        ) : null}
      </Text>
      {hint !== undefined && hint !== '' ? (
        <Text color="text.muted" fontSize="xs" mb={2}>
          {hint}
        </Text>
      ) : null}
      {children}
    </Box>
  );
}
