import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  Button,
  Tabs,
  Table,
  Badge,
  Image,
  Text,
  Grid,
  Loader,
  Center,
  Anchor
} from '@mantine/core';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { getInstrument, exportInstrumentJSON } from '../api';
import type { Instrument } from '../types';
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export default function InstrumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInstrument(parseInt(id));
    }
  }, [id]);

  const loadInstrument = async (instrumentId: number) => {
    try {
      const response = await getInstrument(instrumentId);
      setInstrument(response.data);
    } catch (error) {
      console.error('Error loading instrument:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const response = await exportInstrumentJSON(parseInt(id));
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrument-${id}-${Date.now()}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  if (loading) {
    return (
      <Container size="xl">
        <Center py="xl">
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!instrument) {
    return (
      <Container size="xl">
        <Text>Instrumento no encontrado</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/')}>
              Volver
            </Button>
            <div>
              <Title order={2}>{instrument.model}</Title>
              <Text c="dimmed">{instrument.manufacturer?.name}</Text>
            </div>
          </Group>
          <Button leftSection={<IconDownload size={16} />} onClick={handleExport}>
            Exportar JSON
          </Button>
        </Group>

        {/* Bloque Artículo SAP */}
        {instrument.article && (
          <Paper p="md" withBorder style={{ backgroundColor: '#e7f5ff', borderColor: '#339af0' }}>
            <Group justify="space-between">
              <div>
                <Group gap="xs" mb="xs">
                  <Badge size="lg" color="blue">Artículo SAP</Badge>
                  <Badge size="lg" variant="light">{instrument.article.article_id}</Badge>
                  {instrument.article.sap_itemcode && (
                    <Badge size="lg" variant="outline">ItemCode: {instrument.article.sap_itemcode}</Badge>
                  )}
                </Group>
                <Title order={4}>{instrument.article.sap_description}</Title>
                <Group gap="md" mt="xs">
                  {instrument.article.family && (
                    <Text size="sm" c="dimmed">
                      <strong>Familia:</strong> {instrument.article.family}
                    </Text>
                  )}
                  {instrument.article.subfamily && (
                    <Text size="sm" c="dimmed">
                      <strong>Subfamilia:</strong> {instrument.article.subfamily}
                    </Text>
                  )}
                </Group>
              </div>
              <Badge size="lg" color={instrument.article.active ? 'green' : 'red'}>
                {instrument.article.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </Group>
            {instrument.article.internal_notes && (
              <Text size="sm" mt="md" style={{ fontStyle: 'italic' }}>
                📝 {instrument.article.internal_notes}
              </Text>
            )}
          </Paper>
        )}

        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">Datos Básicos</Tabs.Tab>
            <Tabs.Tab value="variables">Variables</Tabs.Tab>
            <Tabs.Tab value="protocols">Protocolos</Tabs.Tab>
            <Tabs.Tab value="io">Entradas/Salidas</Tabs.Tab>
            <Tabs.Tab value="modbus">Registros Modbus</Tabs.Tab>
            <Tabs.Tab value="documents">Documentos</Tabs.Tab>
            <Tabs.Tab value="images">Imágenes</Tabs.Tab>
            <Tabs.Tab value="json">JSON</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Paper p="md" withBorder>
              <Grid>
                <Grid.Col span={6}>
                  <Text fw={500}>Modelo:</Text>
                  <Text>{instrument.model}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Variante:</Text>
                  <Text>{instrument.variant || '-'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Categoría:</Text>
                  <Text>{instrument.category || '-'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>IP Rating:</Text>
                  <Text>{instrument.ip_rating || '-'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Alimentación:</Text>
                  <Text>
                    {instrument.power_supply_min_v && instrument.power_supply_max_v
                      ? `${instrument.power_supply_min_v} - ${instrument.power_supply_max_v} V`
                      : '-'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Consumo típico:</Text>
                  <Text>{instrument.power_consumption_typ_w ? `${instrument.power_consumption_typ_w} W` : '-'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Temperatura operación:</Text>
                  <Text>
                    {instrument.oper_temp_min_c && instrument.oper_temp_max_c
                      ? `${instrument.oper_temp_min_c}°C - ${instrument.oper_temp_max_c}°C`
                      : '-'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Dimensiones:</Text>
                  <Text>{instrument.dimensions_mm || '-'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Peso:</Text>
                  <Text>{instrument.weight_g ? `${instrument.weight_g} g` : '-'}</Text>
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="variables" pt="md">
            <Paper withBorder>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Variable</Table.Th>
                    <Table.Th>Rango</Table.Th>
                    <Table.Th>Unidad</Table.Th>
                    <Table.Th>Precisión</Table.Th>
                    <Table.Th>Resolución</Table.Th>
                    <Table.Th>Tasa actualización</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {instrument.instrument_variables?.map((iv) => (
                    <Table.Tr key={iv.inst_var_id}>
                      <Table.Td>{iv.variable?.name}</Table.Td>
                      <Table.Td>
                        {iv.range_min !== undefined && iv.range_max !== undefined
                          ? `${iv.range_min} - ${iv.range_max}`
                          : '-'}
                      </Table.Td>
                      <Table.Td>{iv.unit || '-'}</Table.Td>
                      <Table.Td>
                        {iv.accuracy_abs !== undefined
                          ? `±${iv.accuracy_abs}`
                          : iv.accuracy_rel_pct !== undefined
                          ? `±${iv.accuracy_rel_pct}%`
                          : '-'}
                      </Table.Td>
                      <Table.Td>{iv.resolution || '-'}</Table.Td>
                      <Table.Td>{iv.update_rate_hz ? `${iv.update_rate_hz} Hz` : '-'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="protocols" pt="md">
            <Stack gap="md">
              {instrument.instrument_protocols?.map((protocol) => (
                <Paper key={protocol.inst_proto_id} p="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Badge size="lg">{protocol.type}</Badge>
                  </Group>
                  <Grid>
                    {protocol.physical_layer && (
                      <Grid.Col span={6}>
                        <Text fw={500}>Capa física:</Text>
                        <Text>{protocol.physical_layer}</Text>
                      </Grid.Col>
                    )}
                    {protocol.port_label && (
                      <Grid.Col span={6}>
                        <Text fw={500}>Puerto:</Text>
                        <Text>{protocol.port_label}</Text>
                      </Grid.Col>
                    )}
                    {protocol.baudrate && (
                      <Grid.Col span={6}>
                        <Text fw={500}>Baudrate:</Text>
                        <Text>{protocol.baudrate}</Text>
                      </Grid.Col>
                    )}
                    {protocol.databits && (
                      <Grid.Col span={6}>
                        <Text fw={500}>Databits:</Text>
                        <Text>{protocol.databits}</Text>
                      </Grid.Col>
                    )}
                    {protocol.parity && (
                      <Grid.Col span={6}>
                        <Text fw={500}>Parity:</Text>
                        <Text>{protocol.parity}</Text>
                      </Grid.Col>
                    )}
                    {protocol.ip_address && (
                      <Grid.Col span={6}>
                        <Text fw={500}>IP Address:</Text>
                        <Text>{protocol.ip_address}:{protocol.ip_port}</Text>
                      </Grid.Col>
                    )}
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="io" pt="md">
            <Stack gap="md">
              {instrument.analog_outputs && instrument.analog_outputs.length > 0 && (
                <div>
                  <Title order={4} mb="md">Salidas Analógicas</Title>
                  <Paper withBorder>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Tipo</Table.Th>
                          <Table.Th>Canales</Table.Th>
                          <Table.Th>Rango</Table.Th>
                          <Table.Th>Carga</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {instrument.analog_outputs.map((ao) => (
                          <Table.Tr key={ao.analog_out_id}>
                            <Table.Td>{ao.type}</Table.Td>
                            <Table.Td>{ao.num_channels || '-'}</Table.Td>
                            <Table.Td>
                              {ao.range_min && ao.range_max
                                ? `${ao.range_min} - ${ao.range_max} ${ao.unit || ''}`
                                : '-'}
                            </Table.Td>
                            <Table.Td>
                              {ao.load_min_ohm && ao.load_max_ohm
                                ? `${ao.load_min_ohm} - ${ao.load_max_ohm} Ω`
                                : '-'}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </div>
              )}

              {instrument.digital_io && instrument.digital_io.length > 0 && (
                <div>
                  <Title order={4} mb="md">Entradas/Salidas Digitales</Title>
                  <Paper withBorder>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Dirección</Table.Th>
                          <Table.Th>Tipo de señal</Table.Th>
                          <Table.Th>Nivel de voltaje</Table.Th>
                          <Table.Th>Corriente máx.</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {instrument.digital_io.map((dio) => (
                          <Table.Tr key={dio.dio_id}>
                            <Table.Td>
                              <Badge>{dio.direction}</Badge>
                            </Table.Td>
                            <Table.Td>{dio.signal_type}</Table.Td>
                            <Table.Td>{dio.voltage_level || '-'}</Table.Td>
                            <Table.Td>{dio.current_max_ma ? `${dio.current_max_ma} mA` : '-'}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </div>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="modbus" pt="md">
            <Paper withBorder>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>FC</Table.Th>
                    <Table.Th>Dirección</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Unidad</Table.Th>
                    <Table.Th>Escala</Table.Th>
                    <Table.Th>R/W</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {instrument.modbus_registers?.map((reg) => (
                    <Table.Tr key={reg.modbus_id}>
                      <Table.Td>{reg.function_code}</Table.Td>
                      <Table.Td>{reg.address}</Table.Td>
                      <Table.Td>{reg.name}</Table.Td>
                      <Table.Td>{reg.datatype || '-'}</Table.Td>
                      <Table.Td>{reg.unit || '-'}</Table.Td>
                      <Table.Td>{reg.scale || '-'}</Table.Td>
                      <Table.Td>
                        <Badge size="sm">{reg.rw}</Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="documents" pt="md">
            <Stack gap="md">
              {instrument.documents?.map((doc) => (
                <Paper key={doc.document_id} p="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group>
                        <Badge>{doc.type}</Badge>
                        <Text fw={500}>{doc.title}</Text>
                      </Group>
                      {doc.revision && <Text size="sm" c="dimmed">Revisión: {doc.revision}</Text>}
                    </div>
                    {doc.url_or_path && (
                      <Anchor href={doc.url_or_path} target="_blank">
                        Descargar
                      </Anchor>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="images" pt="md">
            <Grid>
              {instrument.images?.map((img) => (
                <Grid.Col key={img.image_id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Paper p="md" withBorder>
                    <Image
                      src={img.url_or_path}
                      alt={img.caption || 'Imagen del instrumento'}
                      height={200}
                      fit="contain"
                    />
                    {img.caption && (
                      <Text size="sm" mt="xs" ta="center">
                        {img.caption}
                      </Text>
                    )}
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="json" pt="md">
            <Paper p="md" withBorder style={{ maxHeight: '600px', overflow: 'auto' }}>
              <JsonView data={instrument} shouldExpandNode={allExpanded} style={defaultStyles} />
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

