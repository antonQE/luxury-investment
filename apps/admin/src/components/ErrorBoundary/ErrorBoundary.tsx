import { Box, Button, Heading, Text } from '@chakra-ui/react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { env } from '@/config/env';
import i18n from '@/config/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (env().isDev) {
      console.error('ErrorBoundary', error, errorInfo);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100dvh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={4}
          p={8}
          bg="background.page"
          data-testid="error-boundary"
        >
          <Heading size="lg" color="text.primary">
            {i18n.t('error.title')}
          </Heading>
          <Text color="text.secondary">{i18n.t('error.body')}</Text>
          {env().isDev && this.state.error !== null ? (
            <Box as="pre" fontSize="xs" maxW="lg" overflow="auto" color="status.down">
              {this.state.error.message}
            </Box>
          ) : null}
          <Button
            onClick={() => {
              window.location.reload();
            }}
            data-testid="error-refresh"
          >
            {i18n.t('error.refresh')}
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
