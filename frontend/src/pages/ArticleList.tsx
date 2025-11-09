import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Table,
  Badge,
  TextInput,
  Select,
  Group,
  Button,
  Loader,
  Text,
  Stack,
  Paper,
} from '@mantine/core';
import { getArticles, getArticleTypes } from '../api';
import { Article, ArticleTypeOption } from '../types';

function ArticleList() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [articleTypes, setArticleTypes] = useState<ArticleTypeOption[]>([]);

  useEffect(() => {
    loadArticleTypes();
    loadArticles();
  }, []);

  const loadArticleTypes = async () => {
    try {
      const response = await getArticleTypes();
      setArticleTypes(response.data);
    } catch (error) {
      console.error('Error loading article types:', error);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedType) params.article_type = selectedType;
      
      const response = await getArticles(params);
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadArticles();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INSTRUMENTO: 'blue',
      CABLE: 'orange',
      SOPORTE: 'gray',
      APARAMENTA_AC: 'red',
      APARAMENTA_DC: 'pink',
      SENSOR: 'cyan',
      ACTUADOR: 'violet',
      DATALOGGER: 'indigo',
      FUENTE_ALIMENTACION: 'yellow',
      MODULO_IO: 'teal',
      GATEWAY: 'lime',
      CONECTOR: 'grape',
      SOFTWARE: 'blue',
      LICENCIA: 'green',
    };
    return colors[type] || 'gray';
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>📦 Catálogo de Artículos SAP</Title>
          <Button onClick={() => navigate('/new')}>
            + Nuevo Artículo
          </Button>
        </Group>

        <Paper p="md" withBorder>
          <Group>
            <TextInput
              placeholder="Buscar por ID, descripción, modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Tipo de artículo"
              data={[
                { value: '', label: 'Todos los tipos' },
                ...articleTypes.map(t => ({ value: t.value, label: t.label }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              clearable
              style={{ width: 250 }}
            />
            <Button onClick={handleSearch}>Buscar</Button>
          </Group>
        </Paper>

        {loading ? (
          <Group justify="center" p="xl">
            <Loader size="lg" />
          </Group>
        ) : articles.length === 0 ? (
          <Paper p="xl" withBorder>
            <Text ta="center" c="dimmed">
              No se encontraron artículos
            </Text>
          </Paper>
        ) : (
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID Artículo</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Descripción SAP</Table.Th>
                  <Table.Th>Categoría</Table.Th>
                  <Table.Th>Fabricante</Table.Th>
                  <Table.Th>Modelo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr
                    key={article.article_id}
                    onClick={() => navigate(`/article/${article.article_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Table.Td>
                      <Text fw={500}>{article.article_id}</Text>
                      {article.sap_itemcode && (
                        <Text size="xs" c="dimmed">{article.sap_itemcode}</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getTypeColor(article.article_type)} variant="light">
                        {article.article_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text lineClamp={2}>{article.sap_description}</Text>
                    </Table.Td>
                    <Table.Td>
                      {article.category && (
                        <Badge variant="outline">{article.category}</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {article.manufacturer?.name || '-'}
                    </Table.Td>
                    <Table.Td>{article.model || '-'}</Table.Td>
                    <Table.Td>
                      <Badge color={article.active ? 'green' : 'red'}>
                        {article.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        <Text size="sm" c="dimmed" ta="center">
          Total: {articles.length} artículo(s)
        </Text>
      </Stack>
    </Container>
  );
}

export default ArticleList;

