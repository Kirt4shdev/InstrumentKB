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
  Image,
  Anchor,
  Modal,
  AspectRatio,
  UnstyledButton,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { 
  IconArrowLeft, 
  IconEdit,
  IconSparkles,
  IconFileText,
  IconDownload,
  IconExternalLink,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { getArticle } from '../api';
import { Article, ArticleVariable, ArticleProtocol, Tag } from '../types';

// Obtener la URL base del servidor desde las variables de entorno
// o usar una ruta relativa que funcione a través del proxy
const getBaseUrl = () => {
  // En producción o cuando se accede desde el servidor, usar la URL actual del navegador
  const apiUrl = (import.meta as any).env?.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace('/api', '');
  }
  // En desarrollo o cuando no hay variable de entorno, usar ruta relativa que irá a través del proxy
  return '';
};

function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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
      <Container size="responsive" py="xl" style={{ maxWidth: '92%' }}>
        <Box py="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader size="lg" color="violet" type="dots" />
          <Text c="dimmed" size="sm">Cargando detalles del artículo...</Text>
        </Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container size="responsive" py="xl" style={{ maxWidth: '92%' }}>
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
    <Container size="responsive" py="sm" className="fade-in" style={{ maxWidth: '92%' }}>
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

        {/* Grid principal: Contenido + Imágenes */}
        <Grid>
          {/* Columna principal de contenido */}
          <Grid.Col span={article.images && article.images.length > 0 ? 8 : 12}>
            <Stack gap="sm">

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
            <Group justify="space-between" mb="xs">
              <Title order={4} size="sm" style={{ fontWeight: 600 }}>
                📄 Documentos
              </Title>
              <Badge variant="light" size="xs" color="blue">
                {article.documents.length} archivo{article.documents.length > 1 ? 's' : ''}
              </Badge>
            </Group>
            <Divider mb="xs" />
            <Stack gap="xs">
              {article.documents.map((doc: any) => {
                const fileUrl = doc.url_or_path?.startsWith('http') 
                  ? doc.url_or_path 
                  : `${getBaseUrl()}/uploads/${doc.url_or_path}`;
                const isExternal = doc.url_or_path?.startsWith('http');
                
                return (
                  <Paper 
                    key={doc.document_id} 
                    p="xs" 
                    withBorder 
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.04)',
                        borderColor: 'rgba(33, 150, 243, 0.3)'
                      }
                    }}
                  >
                    <Anchor
                      href={isExternal ? doc.url_or_path : fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                          <IconFileText size={16} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs" wrap="wrap">
                              <Badge variant="light" size="xs" color="blue">
                                {doc.type}
                              </Badge>
                              <Text size="xs" fw={500} truncate>
                                {doc.title}
                              </Text>
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
                            {doc.notes && (
                              <Text size="10px" c="dimmed" mt={2} lineClamp={1}>
                                {doc.notes}
                              </Text>
                            )}
                          </Box>
                        </Group>
                        <ActionIcon 
                          variant="subtle" 
                          color="blue" 
                          size="sm"
                          style={{ flexShrink: 0 }}
                        >
                          {isExternal ? <IconExternalLink size={14} /> : <IconDownload size={14} />}
                        </ActionIcon>
                      </Group>
                    </Anchor>
                  </Paper>
                );
              })}
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
          </Grid.Col>

          {/* Columna de Imágenes (lado derecho) */}
          {article.images && article.images.length > 0 && (
            <Grid.Col span={4}>
              <Paper p="sm" className="corporate-card" style={{ position: 'sticky', top: 16 }}>
                <Group justify="space-between" mb="xs">
                  <Title order={4} size="sm" style={{ fontWeight: 600 }}>
                    🖼️ Galería
                  </Title>
                  <Badge variant="light" size="xs" color="violet">
                    {article.images.length}
                  </Badge>
                </Group>
                <Divider mb="sm" />
                
                {/* Carrusel Principal */}
                <Box mb="md">
                  <Carousel
                    withIndicators={false}
                    withControls={article.images.length > 1}
                    slideSize="100%"
                    slideGap={0}
                    align="center"
                    onSlideChange={setSelectedImageIndex}
                    controlsOffset="xs"
                    controlSize={32}
                    previousControlIcon={<IconChevronLeft size={20} />}
                    nextControlIcon={<IconChevronRight size={20} />}
                    styles={{
                      control: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e9ecef',
                        color: '#228be6',
                        '&:hover': {
                          backgroundColor: '#228be6',
                          color: 'white',
                        },
                      },
                    }}
                  >
                    {article.images.map((img: any, index: number) => {
                      const imageUrl = img.url_or_path?.startsWith('http') 
                        ? img.url_or_path 
                        : `${getBaseUrl()}/uploads/${img.url_or_path}`;
                      
                      return (
                        <Carousel.Slide key={img.image_id || index}>
                          <Box
                            style={{ 
                              cursor: 'pointer',
                              borderRadius: '8px',
                              overflow: 'hidden',
                            }}
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setImageModalOpen(true);
                            }}
                          >
                            <AspectRatio ratio={16/9}>
                              <Image
                                src={imageUrl}
                                alt={img.caption || `Imagen ${index + 1}`}
                                fit="cover"
                                fallbackSrc="https://placehold.co/800x450?text=Imagen+No+Disponible"
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                }}
                              />
                            </AspectRatio>
                            {(img.caption || img.credit) && (
                              <Box p="sm" bg="gray.0" style={{ borderTop: '1px solid #e9ecef' }}>
                                {img.caption && (
                                  <Text size="sm" fw={500} lineClamp={2} mb={img.credit ? 4 : 0}>
                                    {img.caption}
                                  </Text>
                                )}
                                {img.credit && (
                                  <Text size="xs" c="dimmed">
                                    📷 {img.credit}
                                  </Text>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Carousel.Slide>
                      );
                    })}
                  </Carousel>
                </Box>
                
                {/* Miniaturas Navegables */}
                {article.images.length > 1 && (
                  <Box>
                    <Text size="xs" c="dimmed" mb="xs" ta="center">
                      Miniaturas
                    </Text>
                    <Group gap="xs" justify="center">
                      {article.images.map((img: any, index: number) => {
                        const imageUrl = img.url_or_path?.startsWith('http') 
                          ? img.url_or_path 
                          : `${getBaseUrl()}/uploads/${img.url_or_path}`;
                        
                        return (
                          <UnstyledButton
                            key={img.image_id || index}
                            onClick={() => setSelectedImageIndex(index)}
                            style={{
                              border: selectedImageIndex === index ? '3px solid #228be6' : '2px solid #e9ecef',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              opacity: selectedImageIndex === index ? 1 : 0.6,
                              transition: 'all 0.2s ease',
                              width: '60px',
                              height: '60px',
                            }}
                          >
                            <Image
                              src={imageUrl}
                              alt={`Miniatura ${index + 1}`}
                              fit="cover"
                              width={60}
                              height={60}
                            />
                          </UnstyledButton>
                        );
                      })}
                    </Group>
                  </Box>
                )}
              </Paper>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
      
      {/* Modal para ver imagen en grande con carrusel */}
      <Modal
        opened={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        size="xl"
        padding={0}
        withCloseButton={true}
        centered
        overlayProps={{
          backgroundOpacity: 0.85,
          blur: 3,
        }}
      >
        {article && article.images && (
          <Box>
            <Carousel
              withIndicators
              withControls={article.images.length > 1}
              slideSize="100%"
              slideGap={0}
              align="center"
              initialSlide={selectedImageIndex}
              controlsOffset="md"
              controlSize={40}
              previousControlIcon={<IconChevronLeft size={24} />}
              nextControlIcon={<IconChevronRight size={24} />}
              styles={{
                control: {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  color: '#228be6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: '#228be6',
                    color: 'white',
                  },
                },
                indicator: {
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'white',
                  '&[data-active]': {
                    backgroundColor: '#228be6',
                  },
                },
              }}
            >
              {article.images.map((img: any, index: number) => {
                const imageUrl = img.url_or_path?.startsWith('http') 
                  ? img.url_or_path 
                  : `${getBaseUrl()}/uploads/${img.url_or_path}`;
                
                return (
                  <Carousel.Slide key={img.image_id || index}>
                    <Box style={{ position: 'relative' }}>
                      <Image
                        src={imageUrl}
                        alt={img.caption || `Imagen ${index + 1}`}
                        fit="contain"
                        style={{ 
                          maxHeight: '80vh',
                          width: '100%',
                        }}
                      />
                      <Box 
                        p="md" 
                        style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        }}
                      >
                        <Stack gap="xs">
                          {img.caption && (
                            <Text size="sm" fw={500} style={{ color: 'white' }}>
                              {img.caption}
                            </Text>
                          )}
                          <Anchor
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'white' }}
                          >
                            <Group gap={8}>
                              <IconExternalLink size={16} />
                              <Text size="sm" fw={500}>Abrir en nueva pestaña</Text>
                            </Group>
                          </Anchor>
                        </Stack>
                      </Box>
                    </Box>
                  </Carousel.Slide>
                );
              })}
            </Carousel>
          </Box>
        )}
      </Modal>
    </Container>
  );
}

export default ArticleDetail;

