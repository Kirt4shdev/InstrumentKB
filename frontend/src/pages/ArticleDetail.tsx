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
            <Table className="corporate-table" size="xs">
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
                  {article.article_variables.map((av) => (
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
            <Table className="corporate-table" size="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Tipo</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Capa Física</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Puerto</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '0.7rem' }}>Configuración</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.article_protocols.map((proto) => (
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
              {article.tags.map((tag, index) => (
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
                    article.current_stock !== null && article.min_stock !== null && article.current_stock < article.min_stock
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

