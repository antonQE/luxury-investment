import { Box, Text, VStack } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { RouteProgress } from '@/components/layout/RouteProgress';
import { ROUTES } from '@/constants/routes';

const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Locations = lazy(() => import('@/pages/Locations/Locations'));
const Login = lazy(() => import('@/pages/Login/Login'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const PropertiesList = lazy(() => import('@/pages/Properties/PropertiesList'));
const PropertyEditor = lazy(() => import('@/pages/Properties/PropertyEditor'));
const PropertyTypes = lazy(() => import('@/pages/PropertyTypes/PropertyTypes'));
const ArticlesList = lazy(() => import('@/pages/Articles/ArticlesList'));
const HandbookAdmin = lazy(() => import('@/pages/Documents/HandbookAdmin'));
const InquiriesInbox = lazy(() => import('@/pages/Inquiries/InquiriesInbox'));
const ContactsList = lazy(() => import('@/pages/Contacts/ContactsList'));
const ViewingsCalendar = lazy(() => import('@/pages/Viewings/ViewingsCalendar'));
const CrmTasksList = lazy(() => import('@/pages/CrmTasks/CrmTasksList'));
const OfficesList = lazy(() => import('@/pages/Offices/OfficesList'));
const PartnersList = lazy(() => import('@/pages/Partners/PartnersList'));
const TeamList = lazy(() => import('@/pages/Team/TeamList'));

function PageFallback() {
  return (
    <VStack minH="50vh" justify="center" gap={4} data-testid="page-loading">
      <Box
        w="36px"
        h="36px"
        borderWidth="1px"
        borderColor="accent.gold"
        borderTopColor="transparent"
        borderRadius="full"
        style={{ animation: 'admin-spin 0.85s linear infinite' }}
      />
      <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="text.muted">
        Loading
      </Text>
      <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
    </VStack>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <RouteProgress />
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
            <Route path={ROUTES.OFFICES} element={<OfficesList />} />
            <Route path={ROUTES.PARTNERS} element={<PartnersList />} />
            <Route path={ROUTES.INQUIRIES} element={<InquiriesInbox />} />
            <Route path={ROUTES.CONTACTS} element={<ContactsList />} />
            <Route path={ROUTES.VIEWINGS} element={<ViewingsCalendar />} />
            <Route path={ROUTES.CRM_TASKS} element={<CrmTasksList />} />
            <Route path={ROUTES.ARTICLES} element={<ArticlesList />} />
            <Route path={ROUTES.HANDBOOK} element={<HandbookAdmin />} />
          </Route>
        </Route>
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
