import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  Group,
  Badge,
  Text,
  Button,
  Stack,
  Grid,
  Divider,
  Loader,
  Table,
  Box,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconEdit,
  IconSparkles,
} from '@tabler/icons-react';
import { getArticle } from '../api';
import { Article, ArticleVariable, ArticleProtocol, Tag } from '../types';

function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const response = await getArticle(articleId);
      setArticle(response.data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INSTRUMENTO: 'blue',
      CABLE: 'orange',
      SOPORTE: 'gray',
      APARAMENTA_AC: 'red',
      DATALOGGER: 'indigo',
      FUENTE_ALIMENTACION: 'yellow',
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Box py="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader size="lg" color="violet" type="dots" />
          <Text c="dimmed" size="sm">Cargando detalles del artículo...</Text>
        </Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container size="lg" py="xl">
        <Paper 
          p="xl" 
          radius="md"
          className="elegant-paper"
          style={{
            border: '1px solid rgba(102, 126, 234, 0.2)',
            textAlign: 'center',
          }}
        >
          <IconSparkles size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
          <Text ta="center" c="dimmed" size="lg" fw={500}>
            Artículo no encontrado
          </Text>
          <Group justify="center" mt="md">
            <Button 
              variant="gradient"
              gradient={{ from: 'cyan', to: 'indigo', deg: 135 }}
              onClick={() => navigate('/')}
              leftSection={<IconArrowLeft size={18} />}
            >
              Volver al listado
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="sm" className="fade-in">
      <Stack gap="sm">
        {/* Header corporativo */}
        <Group justify="space-between" align="center" mb="xs">
          <Group gap="xs">
            <Tooltip label="Volver al listado">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => navigate('/')}
              >
                <IconArrowLeft size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Editar artículo">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="md"
                onClick={() => navigate(`/edit/${article.article_id}`)}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Box>
              <Title order={2} style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                {article.article_id}
              </Title>
              <Group gap="xs" mt={2}>
                <Badge color={getTypeColor(article.article_type)} variant="light" size="xs">
                  {article.article_type}
                </Badge>
                {article.category && (
                  <Badge variant="dot" size="xs">
                    {article.category}
                  </Badge>
                )}
              </Group>
            </Box>
          </Group>
          <Badge 
            color={article.active ? 'green' : 'red'} 
            variant="dot"
            size="sm"
          >
            {article.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </Group>

        <Divider className="corporate-divider" />

        {/* Información SAP */}
        <Paper p="sm" className="corporate-card">
          <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
            Información SAP
          </Title>
          <Divider mb="xs" />
          <Grid>
            <Grid.Col span={6}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Código SAP</Text>
              <Text fw={500} size="xs">{article.sap_itemcode || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Descripción SAP</Text>
              <Text size="xs">{article.sap_description}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Familia</Text>
              <Badge variant="light" size="xs">{article.family || '-'}</Badge>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Subfamilia</Text>
              <Badge variant="light" size="xs">{article.subfamily || '-'}</Badge>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Categoría</Text>
              <Badge variant="light" size="xs">{article.category || '-'}</Badge>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Información Técnica */}
        <Paper p="sm" className="corporate-card">
          <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
            Información Técnica
          </Title>
          <Divider mb="xs" />
          <Grid>
            <Grid.Col span={6}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Fabricante</Text>
              <Text fw={500} size="xs">{article.manufacturer?.name || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Modelo</Text>
              <Badge variant="outline" size="xs">{article.model || '-'}</Badge>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Variante</Text>
              <Badge variant="outline" size="xs">{article.variant || '-'}</Badge>
            </Grid.Col>
            
            {/* Campos específicos para cables */}
            {article.article_type === 'CABLE' && (
              <>
                <Grid.Col span={3}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Longitud</Text>
                  <Badge variant="light" size="xs" color="blue">
                    {article.length_m ? `${article.length_m} m` : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Diámetro</Text>
                  <Badge variant="light" size="xs" color="teal">
                    {article.diameter_mm ? `${article.diameter_mm} mm` : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Material</Text>
                  <Badge variant="light" size="xs" color="grape">
                    {article.material || '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Color</Text>
                  <Badge variant="light" size="xs" color="violet">
                    {article.color || '-'}
                  </Badge>
                </Grid.Col>
              </>
            )}

            {/* Campos eléctricos */}
            {(article.power_supply_min_v || article.voltage_rating_v) && (
              <>
                <Grid.Col span={4}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Alimentación</Text>
                  <Badge variant="light" size="xs" color="yellow">
                    {article.power_supply_min_v && article.power_supply_max_v
                      ? `${article.power_supply_min_v}-${article.power_supply_max_v} VDC`
                      : article.voltage_rating_v
                      ? `${article.voltage_rating_v} V`
                      : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Corriente</Text>
                  <Badge variant="light" size="xs" color="orange">
                    {article.current_max_a ? `${article.current_max_a} A` : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Potencia</Text>
                  <Badge variant="light" size="xs" color="red">
                    {article.power_consumption_typ_w ? `${article.power_consumption_typ_w} W` : '-'}
                  </Badge>
                </Grid.Col>
              </>
            )}

            <Grid.Col span={4}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Grado IP</Text>
              <Badge variant="light" size="xs" color="cyan">
                {article.ip_rating || '-'}
              </Badge>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Dimensiones</Text>
              <Text fw={500} size="xs">{article.dimensions_mm || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Peso</Text>
              <Badge variant="light" size="xs" color="indigo">
                {article.weight_g ? `${article.weight_g} g` : '-'}
              </Badge>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Variables medidas (solo para instrumentos/sensores) */}
        {article.article_variables && article.article_variables.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Variables Medidas
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Variable</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Rango</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Unidad</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Precisión</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Resolución</Table.Th>
                </Table.Tr>
              </Table.Thead>
                <Table.Tbody>
                  {article.article_variables.map((av: ArticleVariable) => (
                    <Table.Tr key={av.art_var_id}>
                      <Table.Td>
                        <Badge variant="light" size="xs" color="violet">
                          {av.variable?.name || '-'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {av.range_min !== null && av.range_max !== null
                            ? `${av.range_min} - ${av.range_max}`
                            : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" size="xs">
                          {av.unit || '-'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {av.accuracy_abs ? `±${av.accuracy_abs}` : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {av.resolution || '-'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
          </Paper>
        )}

        {/* Protocolos de comunicación */}
        {article.article_protocols && article.article_protocols.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Protocolos de Comunicación
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Tipo</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Capa Física</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Puerto</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Configuración</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.article_protocols.map((proto: ArticleProtocol) => (
                  <Table.Tr key={proto.art_proto_id}>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="blue">
                        {proto.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">
                        {proto.physical_layer || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="xs">
                        {proto.port_label || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">
                        {proto.baudrate
                          ? `${proto.baudrate} bps, ${proto.databits}${proto.parity}${proto.stopbits}`
                          : proto.ip_address
                          ? `${proto.ip_address}:${proto.ip_port}`
                          : '-'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Tags
            </Title>
            <Divider mb="xs" />
            <Group gap="xs">
              {article.tags.map((tag: Tag) => (
                <Badge 
                  key={tag.tag_id} 
                  variant="light"
                  color="teal"
                  size="xs"
                >
                  {tag.tag}
                </Badge>
              ))}
            </Group>
          </Paper>
        )}

        {/* Gestión de stock */}
        {(article.current_stock !== null || article.min_stock !== null) && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Gestión de Stock
            </Title>
            <Divider mb="xs" />
            <Grid>
              <Grid.Col span={4}>
                <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Stock Actual</Text>
                <Badge 
                  variant="light" 
                  size="xs"
                  color={
                    article.current_stock !== null && article.current_stock !== undefined && 
                    article.min_stock !== null && article.min_stock !== undefined && 
                    article.current_stock < article.min_stock
                      ? 'red'
                      : 'teal'
                  }
                >
                  {article.current_stock ?? '-'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Stock Mínimo</Text>
                <Badge variant="light" size="xs" color="orange">
                  {article.min_stock ?? '-'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Ubicación</Text>
                <Badge variant="light" size="xs" color="violet">
                  {article.stock_location || '-'}
                </Badge>
              </Grid.Col>
            </Grid>
          </Paper>
        )}

        {/* Calefacción */}
        {article.has_heating && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Sistema de Calefacción
            </Title>
            <Divider mb="xs" />
            <Grid>
              <Grid.Col span={4}>
                <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Consumo</Text>
                <Badge variant="light" size="xs" color="red">
                  {article.heating_consumption_w ? `${article.heating_consumption_w} W` : '-'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Temp. Mínima</Text>
                <Badge variant="light" size="xs" color="blue">
                  {article.heating_temp_min_c !== null && article.heating_temp_min_c !== undefined ? `${article.heating_temp_min_c} °C` : '-'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Temp. Máxima</Text>
                <Badge variant="light" size="xs" color="orange">
                  {article.heating_temp_max_c !== null && article.heating_temp_max_c !== undefined ? `${article.heating_temp_max_c} °C` : '-'}
                </Badge>
              </Grid.Col>
            </Grid>
          </Paper>
        )}

        {/* Salidas Analógicas */}
        {article.analog_outputs && article.analog_outputs.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Salidas Analógicas
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Tipo</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Canales</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Rango</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Unidad</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Notas</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.analog_outputs.map((ao: any) => (
                  <Table.Tr key={ao.analog_out_id}>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="cyan">
                        {ao.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{ao.num_channels || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">
                        {ao.range_min !== null && ao.range_max !== null
                          ? `${ao.range_min} - ${ao.range_max}`
                          : '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="xs">
                        {ao.unit || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{ao.scaling_notes || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* I/O Digital */}
        {article.digital_io && article.digital_io.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              I/O Digital
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Dirección</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Tipo Señal</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Nivel Voltaje</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Notas</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.digital_io.map((dio: any) => (
                  <Table.Tr key={dio.dio_id}>
                    <Table.Td>
                      <Badge variant="light" size="xs" color={dio.direction === 'input' ? 'green' : 'orange'}>
                        {dio.direction}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="indigo">
                        {dio.signal_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{dio.voltage_level || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{dio.notes || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Registros Modbus */}
        {article.modbus_registers && article.modbus_registers.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Registros Modbus
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>FC</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Dirección</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Nombre</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Tipo</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>R/W</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Unidad</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.modbus_registers.map((reg: any) => (
                  <Table.Tr key={reg.modbus_id}>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="blue">
                        {reg.function_code}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>{reg.address}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{reg.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="xs">
                        {reg.datatype || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="xs" color={reg.rw === 'R' ? 'green' : reg.rw === 'W' ? 'orange' : 'purple'}>
                        {reg.rw}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{reg.unit || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Comandos SDI-12 */}
        {article.sdi12_commands && article.sdi12_commands.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Comandos SDI-12
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Comando</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Descripción</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Formato Respuesta</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.sdi12_commands.map((cmd: any) => (
                  <Table.Tr key={cmd.sdi12_id}>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="grape">
                        {cmd.command}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{cmd.description || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{cmd.response_format || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Sentencias NMEA */}
        {article.nmea_sentences && article.nmea_sentences.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Sentencias NMEA
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Sentencia</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Descripción</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Campos</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.nmea_sentences.map((nmea: any) => (
                  <Table.Tr key={nmea.nmea_id}>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="teal">
                        {nmea.sentence}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{nmea.description || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{nmea.fields || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Accesorios */}
        {article.accessories && article.accessories.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Accesorios
            </Title>
            <Divider mb="xs" />
            <Table className="corporate-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Nombre</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Part Number</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Cantidad</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Descripción</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.accessories.map((acc: any) => (
                  <Table.Tr key={acc.accessory_id}>
                    <Table.Td>
                      <Text size="xs" fw={500}>{acc.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="xs">
                        {acc.part_number || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="xs" color="blue">
                        {acc.quantity || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{acc.description || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Documentos */}
        {article.documents && article.documents.length > 0 && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Documentos
            </Title>
            <Divider mb="xs" />
            <Stack gap="xs">
              {article.documents.map((doc: any) => (
                <Box key={doc.document_id}>
                  <Group gap="xs">
                    <Badge variant="light" size="xs" color="blue">
                      {doc.type}
                    </Badge>
                    <Text size="xs" fw={500}>{doc.title}</Text>
                    {doc.language && (
                      <Badge variant="outline" size="xs">
                        {doc.language}
                      </Badge>
                    )}
                    {doc.revision && (
                      <Badge variant="dot" size="xs">
                        v{doc.revision}
                      </Badge>
                    )}
                  </Group>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Condiciones ambientales completas */}
        {(article.oper_temp_min_c !== null || article.oper_temp_max_c !== null ||
          article.storage_temp_min_c !== null || article.storage_temp_max_c !== null ||
          article.oper_humidity_min_pct !== null || article.oper_humidity_max_pct !== null ||
          article.altitude_max_m !== null) && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Condiciones Ambientales
            </Title>
            <Divider mb="xs" />
            <Grid>
              {(article.oper_temp_min_c !== null || article.oper_temp_max_c !== null) && (
                <Grid.Col span={6}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Temp. Operación</Text>
                  <Badge variant="light" size="xs" color="blue">
                    {article.oper_temp_min_c !== null && article.oper_temp_max_c !== null
                      ? `${article.oper_temp_min_c} a ${article.oper_temp_max_c} °C`
                      : article.oper_temp_min_c !== null
                      ? `Desde ${article.oper_temp_min_c} °C`
                      : `Hasta ${article.oper_temp_max_c} °C`}
                  </Badge>
                </Grid.Col>
              )}
              {(article.storage_temp_min_c !== null || article.storage_temp_max_c !== null) && (
                <Grid.Col span={6}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Temp. Almacenamiento</Text>
                  <Badge variant="light" size="xs" color="cyan">
                    {article.storage_temp_min_c !== null && article.storage_temp_max_c !== null
                      ? `${article.storage_temp_min_c} a ${article.storage_temp_max_c} °C`
                      : article.storage_temp_min_c !== null
                      ? `Desde ${article.storage_temp_min_c} °C`
                      : `Hasta ${article.storage_temp_max_c} °C`}
                  </Badge>
                </Grid.Col>
              )}
              {(article.oper_humidity_min_pct !== null || article.oper_humidity_max_pct !== null) && (
                <Grid.Col span={6}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Humedad Operación</Text>
                  <Badge variant="light" size="xs" color="teal">
                    {article.oper_humidity_min_pct !== null && article.oper_humidity_max_pct !== null
                      ? `${article.oper_humidity_min_pct} a ${article.oper_humidity_max_pct} %RH`
                      : article.oper_humidity_min_pct !== null
                      ? `Desde ${article.oper_humidity_min_pct} %RH`
                      : `Hasta ${article.oper_humidity_max_pct} %RH`}
                  </Badge>
                </Grid.Col>
              )}
              {article.altitude_max_m !== null && (
                <Grid.Col span={6}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Altitud Máxima</Text>
                  <Badge variant="light" size="xs" color="grape">
                    {article.altitude_max_m} m
                  </Badge>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* Certificaciones */}
        {(article.emc_compliance || article.certifications) && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Certificaciones y Cumplimiento
            </Title>
            <Divider mb="xs" />
            <Grid>
              {article.emc_compliance && (
                <Grid.Col span={6}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>EMC Compliance</Text>
                  <Text size="xs">{article.emc_compliance}</Text>
                </Grid.Col>
              )}
              {article.certifications && (
                <Grid.Col span={6}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Certificaciones</Text>
                  <Text size="xs">{article.certifications}</Text>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* Ciclo de vida */}
        {(article.first_release_year || article.last_revision_year || article.discontinued) && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Ciclo de Vida
            </Title>
            <Divider mb="xs" />
            <Grid>
              {article.first_release_year && (
                <Grid.Col span={4}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Primer Lanzamiento</Text>
                  <Badge variant="light" size="xs" color="green">
                    {article.first_release_year}
                  </Badge>
                </Grid.Col>
              )}
              {article.last_revision_year && (
                <Grid.Col span={4}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Última Revisión</Text>
                  <Badge variant="light" size="xs" color="blue">
                    {article.last_revision_year}
                  </Badge>
                </Grid.Col>
              )}
              {article.discontinued && (
                <Grid.Col span={4}>
                  <Text size="10px" c="dimmed" fw={500} tt="uppercase" mb={4}>Estado</Text>
                  <Badge variant="filled" size="xs" color="red">
                    Descontinuado
                  </Badge>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* Notas internas */}
        {article.internal_notes && (
          <Paper p="sm" className="corporate-card">
            <Title order={4} size="sm" mb="xs" style={{ fontWeight: 600 }}>
              Notas Internas
            </Title>
            <Divider mb="xs" />
            <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
              {article.internal_notes}
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

export default ArticleDetail;

