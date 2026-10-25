import '@/config/i18n';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { queryClient } from '@/api/clients';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { theme } from '@/config/theme';
import { AuthProvider } from '@/contexts/AuthContext';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ChakraProvider value={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </ErrorBoundary>
  </StrictMode>,
);
