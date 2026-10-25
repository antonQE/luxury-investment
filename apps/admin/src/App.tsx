import { Box, Spinner } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/constants/routes';

const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));

function PageFallback() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="40vh">
      <Spinner data-testid="page-loading" />
    </Box>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        </Route>
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
