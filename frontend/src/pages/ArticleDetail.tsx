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
} from '@mantine/core';
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
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container size="lg" py="xl">
        <Paper p="xl" withBorder>
          <Text ta="center">Artículo no encontrado</Text>
          <Group justify="center" mt="md">
            <Button onClick={() => navigate('/')}>Volver al listado</Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" onClick={() => navigate('/')}>
              ← Volver
            </Button>
            <Title order={2}>{article.article_id}</Title>
            <Badge color={getTypeColor(article.article_type)} size="lg">
              {article.article_type}
            </Badge>
          </Group>
          <Badge color={article.active ? 'green' : 'red'} size="lg">
            {article.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </Group>

        {/* Información SAP */}
        <Paper p="md" withBorder>
          <Title order={4} mb="sm">📋 Información SAP</Title>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">SAP ItemCode</Text>
              <Text fw={500}>{article.sap_itemcode || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text size="sm" c="dimmed">Descripción SAP</Text>
              <Text>{article.sap_description}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Familia</Text>
              <Text>{article.family || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Subfamilia</Text>
              <Text>{article.subfamily || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Categoría</Text>
              <Text>{article.category || '-'}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Información Técnica */}
        <Paper p="md" withBorder>
          <Title order={4} mb="sm">🔧 Información Técnica</Title>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Fabricante</Text>
              <Text>{article.manufacturer?.name || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="sm" c="dimmed">Modelo</Text>
              <Text>{article.model || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="sm" c="dimmed">Variante</Text>
              <Text>{article.variant || '-'}</Text>
            </Grid.Col>
            
            {/* Campos específicos para cables */}
            {article.article_type === 'CABLE' && (
              <>
                <Grid.Col span={3}>
                  <Text size="sm" c="dimmed">Longitud</Text>
                  <Text>{article.length_m ? `${article.length_m} m` : '-'}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="sm" c="dimmed">Diámetro</Text>
                  <Text>{article.diameter_mm ? `${article.diameter_mm} mm` : '-'}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="sm" c="dimmed">Material</Text>
                  <Text>{article.material || '-'}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="sm" c="dimmed">Color</Text>
                  <Text>{article.color || '-'}</Text>
                </Grid.Col>
              </>
            )}

            {/* Campos eléctricos */}
            {(article.power_supply_min_v || article.voltage_rating_v) && (
              <>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Alimentación</Text>
                  <Text>
                    {article.power_supply_min_v && article.power_supply_max_v
                      ? `${article.power_supply_min_v}-${article.power_supply_max_v} VDC`
                      : article.voltage_rating_v
                      ? `${article.voltage_rating_v} V`
                      : '-'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Corriente</Text>
                  <Text>{article.current_max_a ? `${article.current_max_a} A` : '-'}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Potencia</Text>
                  <Text>{article.power_consumption_typ_w ? `${article.power_consumption_typ_w} W` : '-'}</Text>
                </Grid.Col>
              </>
            )}

            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">IP Rating</Text>
              <Text>{article.ip_rating || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Dimensiones</Text>
              <Text>{article.dimensions_mm || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Peso</Text>
              <Text>{article.weight_g ? `${article.weight_g} g` : '-'}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Variables medidas (solo para instrumentos/sensores) */}
        {article.article_variables && article.article_variables.length > 0 && (
          <Paper p="md" withBorder>
            <Title order={4} mb="sm">📊 Variables Medidas</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Variable</Table.Th>
                  <Table.Th>Rango</Table.Th>
                  <Table.Th>Unidad</Table.Th>
                  <Table.Th>Precisión</Table.Th>
                  <Table.Th>Resolución</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.article_variables.map((av) => (
                  <Table.Tr key={av.art_var_id}>
                    <Table.Td>{av.variable?.name || '-'}</Table.Td>
                    <Table.Td>
                      {av.range_min !== null && av.range_max !== null
                        ? `${av.range_min} - ${av.range_max}`
                        : '-'}
                    </Table.Td>
                    <Table.Td>{av.unit || '-'}</Table.Td>
                    <Table.Td>{av.accuracy_abs ? `±${av.accuracy_abs}` : '-'}</Table.Td>
                    <Table.Td>{av.resolution || '-'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Protocolos de comunicación */}
        {article.article_protocols && article.article_protocols.length > 0 && (
          <Paper p="md" withBorder>
            <Title order={4} mb="sm">🔌 Protocolos de Comunicación</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Capa Física</Table.Th>
                  <Table.Th>Puerto</Table.Th>
                  <Table.Th>Configuración</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {article.article_protocols.map((proto) => (
                  <Table.Tr key={proto.art_proto_id}>
                    <Table.Td>
                      <Badge>{proto.type}</Badge>
                    </Table.Td>
                    <Table.Td>{proto.physical_layer || '-'}</Table.Td>
                    <Table.Td>{proto.port_label || '-'}</Table.Td>
                    <Table.Td>
                      {proto.baudrate
                        ? `${proto.baudrate} bps, ${proto.databits}${proto.parity}${proto.stopbits}`
                        : proto.ip_address
                        ? `${proto.ip_address}:${proto.ip_port}`
                        : '-'}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Paper p="md" withBorder>
            <Title order={4} mb="sm">🏷️ Tags</Title>
            <Group gap="xs">
              {article.tags.map((tag) => (
                <Badge key={tag.tag_id} variant="dot">
                  {tag.tag}
                </Badge>
              ))}
            </Group>
          </Paper>
        )}

        {/* Gestión de stock */}
        {(article.current_stock !== null || article.min_stock !== null) && (
          <Paper p="md" withBorder>
            <Title order={4} mb="sm">📦 Gestión de Stock</Title>
            <Grid>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Stock Actual</Text>
                <Text fw={500}>{article.current_stock ?? '-'}</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Stock Mínimo</Text>
                <Text>{article.min_stock ?? '-'}</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Ubicación</Text>
                <Text>{article.stock_location || '-'}</Text>
              </Grid.Col>
            </Grid>
          </Paper>
        )}

        {/* Notas internas */}
        {article.internal_notes && (
          <Paper p="md" withBorder>
            <Title order={4} mb="sm">📝 Notas Internas</Title>
            <Text>{article.internal_notes}</Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

export default ArticleDetail;

