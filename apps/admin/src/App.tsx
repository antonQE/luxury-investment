import { Box, Spinner } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/constants/routes';

const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Locations = lazy(() => import('@/pages/Locations/Locations'));
const Login = lazy(() => import('@/pages/Login/Login'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const PropertiesList = lazy(() => import('@/pages/Properties/PropertiesList'));
const PropertyEditor = lazy(() => import('@/pages/Properties/PropertyEditor'));
const PropertyTypes = lazy(() => import('@/pages/PropertyTypes/PropertyTypes'));
const ArticlesList = lazy(() => import('@/pages/Articles/ArticlesList'));
const InquiriesInbox = lazy(() => import('@/pages/Inquiries/InquiriesInbox'));
const PartnersList = lazy(() => import('@/pages/Partners/PartnersList'));
const TeamList = lazy(() => import('@/pages/Team/TeamList'));

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
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.PROPERTIES} element={<PropertiesList />} />
            <Route path={ROUTES.PROPERTY_NEW} element={<PropertyEditor />} />
            <Route path={ROUTES.PROPERTY_EDIT} element={<PropertyEditor />} />
            <Route path={ROUTES.LOCATIONS} element={<Locations />} />
            <Route path={ROUTES.PROPERTY_TYPES} element={<PropertyTypes />} />
            <Route path={ROUTES.TEAM} element={<TeamList />} />
            <Route path={ROUTES.PARTNERS} element={<PartnersList />} />
            <Route path={ROUTES.INQUIRIES} element={<InquiriesInbox />} />
            <Route path={ROUTES.ARTICLES} element={<ArticlesList />} />
          </Route>
        </Route>
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
