import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Panel({
  children,
  testId,
  overflowX,
}: {
  children: ReactNode;
  testId?: string;
  overflowX?: 'auto' | 'hidden' | 'visible';
}) {
  return (
    <Box
      bg="background.panel"
      borderWidth="1px"
      borderColor="border.default"
      p={6}
      borderRadius="l3"
      overflowX={overflowX}
      data-testid={testId}
    >
      {children}
    </Box>
  );
}
