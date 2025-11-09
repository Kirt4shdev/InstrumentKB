import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  TextInput,
  Select,
  Button,
  Table,
  Group,
  Badge,
  ActionIcon,
  Paper,
  Stack,
  Grid,
  Pagination,
  Loader,
  Center,
  Text
} from '@mantine/core';
import { IconSearch, IconEye, IconDownload } from '@tabler/icons-react';
import { searchInstruments, getManufacturers, getArticles, exportJSON, exportSQL } from '../api';
import type { Instrument, Manufacturer, Article } from '../types';

export default function InstrumentList() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  useEffect(() => {
    loadManufacturers();
    loadArticles();
    loadInstruments();
  }, []);

  const loadManufacturers = async () => {
    try {
      const response = await getManufacturers();
      setManufacturers(response.data);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await getArticles({ active: true });
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadInstruments = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (searchQuery) params.q = searchQuery;
      if (selectedManufacturer) params.manufacturer_id = selectedManufacturer;
      if (selectedArticle) params.article_id = selectedArticle;
      if (selectedProtocol) params.protocol_type = selectedProtocol;

      const response = await searchInstruments(params);
      setInstruments(response.data.instruments);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading instruments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadInstruments();
  };

  const handleExportJSON = async () => {
    try {
      const response = await exportJSON();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrumentkb-export-${Date.now()}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting JSON:', error);
    }
  };

  const handleExportSQL = async () => {
    try {
      const response = await exportSQL();
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrumentkb-export-${Date.now()}.sql`;
      a.click();
    } catch (error) {
      console.error('Error exporting SQL:', error);
    }
  };

  useEffect(() => {
    loadInstruments();
  }, [page]);

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Instrumentos de Medida</Title>
          <Group>
            <Button variant="light" leftSection={<IconDownload size={16} />} onClick={handleExportJSON}>
              Exportar JSON
            </Button>
            <Button variant="light" leftSection={<IconDownload size={16} />} onClick={handleExportSQL}>
              Exportar SQL
            </Button>
          </Group>
        </Group>

        <Paper p="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput
                placeholder="Buscar por modelo, categoría, SAP..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Artículo SAP"
                data={articles.map(a => ({ 
                  value: a.article_id, 
                  label: `${a.article_id} - ${a.sap_description.substring(0, 40)}...` 
                }))}
                value={selectedArticle}
                onChange={setSelectedArticle}
                searchable
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Fabricante"
                data={manufacturers.map(m => ({ value: m.manufacturer_id.toString(), label: m.name }))}
                value={selectedManufacturer}
                onChange={setSelectedManufacturer}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Protocolo"
                data={[
                  { value: 'ModbusRTU', label: 'Modbus RTU' },
                  { value: 'ModbusTCP', label: 'Modbus TCP' },
                  { value: 'SDI12', label: 'SDI-12' },
                  { value: 'NMEA0183', label: 'NMEA 0183' },
                  { value: 'CANopen', label: 'CANopen' },
                  { value: 'Profinet', label: 'Profinet' }
                ]}
                value={selectedProtocol}
                onChange={setSelectedProtocol}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Button fullWidth onClick={handleSearch}>
                Buscar
              </Button>
            </Grid.Col>
          </Grid>
        </Paper>

        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <>
            <Paper withBorder>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Artículo SAP</Table.Th>
                    <Table.Th>Fabricante</Table.Th>
                    <Table.Th>Modelo Técnico</Table.Th>
                    <Table.Th>Categoría</Table.Th>
                    <Table.Th>Variables</Table.Th>
                    <Table.Th>Protocolos</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {instruments.map((instrument) => (
                    <Table.Tr key={instrument.instrument_id}>
                      <Table.Td>
                        {instrument.article ? (
                          <div>
                            <Text size="sm" fw={500}>{instrument.article.article_id}</Text>
                            <Text size="xs" c="dimmed">{instrument.article.sap_description.substring(0, 30)}...</Text>
                          </div>
                        ) : (
                          <Badge color="gray" size="sm">Sin artículo SAP</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>{instrument.manufacturer?.name}</Table.Td>
                      <Table.Td>
                        <strong>{instrument.model}</strong>
                        {instrument.variant && <div style={{ fontSize: '0.85em', color: '#666' }}>{instrument.variant}</div>}
                      </Table.Td>
                      <Table.Td>{instrument.category || '-'}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {instrument.instrument_variables?.slice(0, 3).map((iv, idx) => (
                            <Badge key={idx} size="sm" variant="light">
                              {iv.variable?.name}
                            </Badge>
                          ))}
                          {(instrument.instrument_variables?.length || 0) > 3 && (
                            <Badge size="sm" variant="outline">
                              +{(instrument.instrument_variables?.length || 0) - 3}
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {instrument.instrument_protocols?.slice(0, 2).map((p, idx) => (
                            <Badge key={idx} size="sm" color="blue" variant="light">
                              {p.type}
                            </Badge>
                          ))}
                          {(instrument.instrument_protocols?.length || 0) > 2 && (
                            <Badge size="sm" variant="outline">
                              +{(instrument.instrument_protocols?.length || 0) - 2}
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="light"
                          onClick={() => navigate(`/instrument/${instrument.instrument_id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>

            {totalPages > 1 && (
              <Center>
                <Pagination value={page} onChange={setPage} total={totalPages} />
              </Center>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

