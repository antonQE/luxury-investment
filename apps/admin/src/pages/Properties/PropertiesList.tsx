import { Box, Button, Heading, HStack, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import { ROUTES } from '@/constants/routes';

export default function PropertiesList() {
  const { t } = useTranslation();
  const listQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });

  return (
    <VStack align="stretch" gap={6} data-testid="properties-list-page">
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Heading size="xl" color="text.primary">
          {t('properties.title')}
        </Heading>
        <RouterLink to={ROUTES.PROPERTY_NEW} data-testid="property-create-link">
          <Button type="button">{t('properties.create')}</Button>
        </RouterLink>
      </HStack>
      <Text color="text.muted" fontSize="sm">
        {t('properties.lead')}
      </Text>

      <Box
        bg="background.panel"
        borderWidth="1px"
        borderColor="border.default"
        p={6}
        borderRadius="md"
        overflowX="auto"
      >
        {listQuery.isPending ? (
          <Spinner data-testid="properties-loading" />
        ) : listQuery.isError ? (
          <Text color="status.down">{t('properties.loadError')}</Text>
        ) : (
          <Table.Root size="sm" data-testid="properties-table">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('properties.reference')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('properties.titleCol')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('properties.status')}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('properties.market')}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listQuery.data.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.referenceNumber}</Table.Cell>
                  <Table.Cell>{row.titleBg}</Table.Cell>
                  <Table.Cell>{row.listingStatus}</Table.Cell>
                  <Table.Cell>{row.market}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <RouterLink
                      to={ROUTES.PROPERTY_EDIT.replace(':id', row.id)}
                      data-testid={`property-edit-${row.slug}`}
                    >
                      <Button type="button" size="xs" variant="outline">
                        {t('properties.edit')}
                      </Button>
                    </RouterLink>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </VStack>
  );
}
