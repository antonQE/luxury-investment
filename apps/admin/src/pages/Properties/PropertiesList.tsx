import { Button, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { fetchAdminProperties, propertyKeys } from '@/api/endpoints/properties';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROUTES } from '@/constants/routes';

export default function PropertiesList() {
  const { t } = useTranslation();
  const listQuery = useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchAdminProperties,
  });

  return (
    <VStack align="stretch" gap={6} data-testid="properties-list-page">
      <PageHeader
        title={t('properties.title')}
        lead={t('properties.lead')}
        actions={
          <RouterLink to={ROUTES.PROPERTY_NEW} data-testid="property-create-link">
            <Button type="button">{t('properties.create')}</Button>
          </RouterLink>
        }
      />

      <Panel overflowX="auto">
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
                  <Table.Cell>
                    <StatusBadge
                      value={row.listingStatus}
                      label={t(`properties.status_${row.listingStatus}`, {
                        defaultValue: row.listingStatus,
                      })}
                    />
                  </Table.Cell>
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
      </Panel>
    </VStack>
  );
}
