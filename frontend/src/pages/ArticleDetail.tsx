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
  Card,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconSparkles,
  IconInfoCircle,
  IconTool,
  IconChartBar,
  IconPlugConnected,
  IconTag,
  IconPackage,
  IconNotes,
} from '@tabler/icons-react';
import { getArticle } from '../api';
import { Article } from '../types';

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
    <Container size="lg" py="xl" className="fade-in">
      <Stack gap="xl">
        {/* Header con diseño moderno */}
        <Card 
          padding="lg" 
          radius="md"
          style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <Tooltip label="Volver al listado" position="right">
                <ActionIcon
                  variant="light"
                  color="violet"
                  size="xl"
                  onClick={() => navigate('/')}
                  style={{ transition: 'transform 0.2s ease' }}
                >
                  <IconArrowLeft size={24} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Editar artículo" position="right">
                <ActionIcon
                  variant="light"
                  color="cyan"
                  size="xl"
                  onClick={() => navigate(`/edit/${article.article_id}`)}
                  style={{ transition: 'transform 0.2s ease' }}
                >
                  <IconEdit size={24} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Badge 
              color={article.active ? 'teal' : 'red'} 
              size="xl" 
              variant="light"
              style={{ fontWeight: 700, fontSize: '1rem', padding: '12px 20px' }}
            >
              {article.active ? '✓ Activo' : '✗ Inactivo'}
            </Badge>
          </Group>
          
          <Group gap="md" align="flex-start">
            <Box
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconSparkles size={48} color="white" />
            </Box>
            <Box style={{ flex: 1 }}>
              <Title 
                order={1}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                {article.article_id}
              </Title>
              <Group gap="sm" mt="xs">
                <Badge 
                  color={getTypeColor(article.article_type)} 
                  size="xl"
                  variant="light"
                  style={{ fontWeight: 700, fontSize: '1rem', padding: '10px 16px' }}
                >
                  {article.article_type}
                </Badge>
                {article.category && (
                  <Badge 
                    variant="dot" 
                    size="xl"
                    style={{ fontWeight: 600, fontSize: '0.95rem', padding: '10px 16px' }}
                  >
                    {article.category}
                  </Badge>
                )}
              </Group>
            </Box>
          </Group>
        </Card>

        {/* Información SAP */}
        <Card 
          padding="lg" 
          radius="md"
          className="elegant-paper hover-lift"
          style={{
            border: '1px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group gap="sm" mb="md">
            <Box
              style={{
                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconInfoCircle size={24} color="white" />
            </Box>
            <Title order={3} style={{ fontWeight: 700 }}>
              Información SAP
            </Title>
          </Group>
          <Divider mb="md" />
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>SAP ItemCode</Text>
              <Text fw={600} size="md">{article.sap_itemcode || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Descripción SAP</Text>
              <Text size="md">{article.sap_description}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Familia</Text>
              <Badge variant="light" size="lg">{article.family || '-'}</Badge>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Subfamilia</Text>
              <Badge variant="light" size="lg">{article.subfamily || '-'}</Badge>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Categoría</Text>
              <Badge variant="light" size="lg">{article.category || '-'}</Badge>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Información Técnica */}
        <Card 
          padding="lg" 
          radius="md"
          className="elegant-paper hover-lift"
          style={{
            border: '1px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group gap="sm" mb="md">
            <Box
              style={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconTool size={24} color="white" />
            </Box>
            <Title order={3} style={{ fontWeight: 700 }}>
              Información Técnica
            </Title>
          </Group>
          <Divider mb="md" />
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Fabricante</Text>
              <Text fw={600} size="md">{article.manufacturer?.name || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Modelo</Text>
              <Badge variant="outline" size="lg" style={{ fontWeight: 600 }}>{article.model || '-'}</Badge>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Variante</Text>
              <Badge variant="outline" size="lg" style={{ fontWeight: 600 }}>{article.variant || '-'}</Badge>
            </Grid.Col>
            
            {/* Campos específicos para cables */}
            {article.article_type === 'CABLE' && (
              <>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Longitud</Text>
                  <Badge variant="light" size="lg" color="blue">
                    {article.length_m ? `${article.length_m} m` : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Diámetro</Text>
                  <Badge variant="light" size="lg" color="teal">
                    {article.diameter_mm ? `${article.diameter_mm} mm` : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Material</Text>
                  <Badge variant="light" size="lg" color="grape">
                    {article.material || '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Color</Text>
                  <Badge variant="light" size="lg" color="violet">
                    {article.color || '-'}
                  </Badge>
                </Grid.Col>
              </>
            )}

            {/* Campos eléctricos */}
            {(article.power_supply_min_v || article.voltage_rating_v) && (
              <>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Alimentación</Text>
                  <Badge variant="light" size="lg" color="yellow">
                    {article.power_supply_min_v && article.power_supply_max_v
                      ? `${article.power_supply_min_v}-${article.power_supply_max_v} VDC`
                      : article.voltage_rating_v
                      ? `${article.voltage_rating_v} V`
                      : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Corriente</Text>
                  <Badge variant="light" size="lg" color="orange">
                    {article.current_max_a ? `${article.current_max_a} A` : '-'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Potencia</Text>
                  <Badge variant="light" size="lg" color="red">
                    {article.power_consumption_typ_w ? `${article.power_consumption_typ_w} W` : '-'}
                  </Badge>
                </Grid.Col>
              </>
            )}

            <Grid.Col span={4}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>IP Rating</Text>
              <Badge variant="light" size="lg" color="cyan">
                {article.ip_rating || '-'}
              </Badge>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Dimensiones</Text>
              <Text fw={600} size="sm">{article.dimensions_mm || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Peso</Text>
              <Badge variant="light" size="lg" color="indigo">
                {article.weight_g ? `${article.weight_g} g` : '-'}
              </Badge>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Variables medidas (solo para instrumentos/sensores) */}
        {article.article_variables && article.article_variables.length > 0 && (
          <Card 
            padding="lg" 
            radius="md"
            className="elegant-paper hover-lift"
            style={{
              border: '1px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Group gap="sm" mb="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconChartBar size={24} color="white" />
              </Box>
              <Title order={3} style={{ fontWeight: 700 }}>
                Variables Medidas
              </Title>
            </Group>
            <Divider mb="md" />
            <Paper 
              radius="md"
              style={{
                overflow: 'hidden',
                border: '1px solid rgba(102, 126, 234, 0.15)',
              }}
            >
              <Table highlightOnHover>
                <Table.Thead style={{ 
                  background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%)',
                }}>
                  <Table.Tr>
                    <Table.Th style={{ fontWeight: 700 }}>Variable</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Rango</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Unidad</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Precisión</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Resolución</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {article.article_variables.map((av) => (
                    <Table.Tr key={av.art_var_id}>
                      <Table.Td>
                        <Badge variant="light" size="lg" color="violet">
                          {av.variable?.name || '-'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {av.range_min !== null && av.range_max !== null
                            ? `${av.range_min} - ${av.range_max}`
                            : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" size="md">
                          {av.unit || '-'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {av.accuracy_abs ? `±${av.accuracy_abs}` : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {av.resolution || '-'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Card>
        )}

        {/* Protocolos de comunicación */}
        {article.article_protocols && article.article_protocols.length > 0 && (
          <Card 
            padding="lg" 
            radius="md"
            className="elegant-paper hover-lift"
            style={{
              border: '1px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Group gap="sm" mb="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconPlugConnected size={24} color="white" />
              </Box>
              <Title order={3} style={{ fontWeight: 700 }}>
                Protocolos de Comunicación
              </Title>
            </Group>
            <Divider mb="md" />
            <Paper 
              radius="md"
              style={{
                overflow: 'hidden',
                border: '1px solid rgba(102, 126, 234, 0.15)',
              }}
            >
              <Table highlightOnHover>
                <Table.Thead style={{ 
                  background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%)',
                }}>
                  <Table.Tr>
                    <Table.Th style={{ fontWeight: 700 }}>Tipo</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Capa Física</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Puerto</Table.Th>
                    <Table.Th style={{ fontWeight: 700 }}>Configuración</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {article.article_protocols.map((proto) => (
                    <Table.Tr key={proto.art_proto_id}>
                      <Table.Td>
                        <Badge variant="light" size="lg" color="blue">
                          {proto.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {proto.physical_layer || '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" size="md">
                          {proto.port_label || '-'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
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
          </Card>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Card 
            padding="lg" 
            radius="md"
            className="elegant-paper hover-lift"
            style={{
              border: '1px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Group gap="sm" mb="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconTag size={24} color="white" />
              </Box>
              <Title order={3} style={{ fontWeight: 700 }}>
                Tags
              </Title>
            </Group>
            <Divider mb="md" />
            <Group gap="sm">
              {article.tags.map((tag, index) => (
                <Badge 
                  key={tag.tag_id} 
                  variant="gradient"
                  gradient={{ from: 'teal', to: 'cyan', deg: 135 }}
                  size="lg"
                  style={{ 
                    fontWeight: 600,
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {tag.tag}
                </Badge>
              ))}
            </Group>
          </Card>
        )}

        {/* Gestión de stock */}
        {(article.current_stock !== null || article.min_stock !== null) && (
          <Card 
            padding="lg" 
            radius="md"
            className="elegant-paper hover-lift"
            style={{
              border: '1px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Group gap="sm" mb="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconPackage size={24} color="white" />
              </Box>
              <Title order={3} style={{ fontWeight: 700 }}>
                Gestión de Stock
              </Title>
            </Group>
            <Divider mb="md" />
            <Grid>
              <Grid.Col span={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Stock Actual</Text>
                <Badge 
                  variant="light" 
                  size="xl" 
                  color={
                    article.current_stock !== null && article.min_stock !== null && article.current_stock < article.min_stock
                      ? 'red'
                      : 'teal'
                  }
                  style={{ fontSize: '1.2rem', padding: '12px 20px' }}
                >
                  {article.current_stock ?? '-'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Stock Mínimo</Text>
                <Badge variant="light" size="xl" color="orange" style={{ fontSize: '1.2rem', padding: '12px 20px' }}>
                  {article.min_stock ?? '-'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>Ubicación</Text>
                <Badge variant="light" size="xl" color="violet" style={{ fontSize: '1rem', padding: '12px 16px' }}>
                  {article.stock_location || '-'}
                </Badge>
              </Grid.Col>
            </Grid>
          </Card>
        )}

        {/* Notas internas */}
        {article.internal_notes && (
          <Card 
            padding="lg" 
            radius="md"
            className="elegant-paper hover-lift"
            style={{
              border: '1px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Group gap="sm" mb="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconNotes size={24} color="white" />
              </Box>
              <Title order={3} style={{ fontWeight: 700 }}>
                Notas Internas
              </Title>
            </Group>
            <Divider mb="md" />
            <Paper 
              p="md" 
              radius="md"
              style={{
                background: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.15)',
              }}
            >
              <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {article.internal_notes}
              </Text>
            </Paper>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export default ArticleDetail;

