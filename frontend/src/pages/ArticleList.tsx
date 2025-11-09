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
  ActionIcon,
  Modal,
  Notification,
} from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { getArticles, getArticleTypes, deleteArticle } from '../api';
import { Article, ArticleTypeOption } from '../types';

function ArticleList() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [articleTypes, setArticleTypes] = useState<ArticleTypeOption[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleDeleteClick = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);
      await deleteArticle(articleToDelete.article_id);
      setSuccess(`Artículo "${articleToDelete.article_id}" eliminado correctamente`);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
      loadArticles(); // Recargar la lista
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting article:', error);
      setError(`Error al eliminar: ${error.response?.data?.error || error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit/${articleId}`);
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
{/*           <Button onClick={() => navigate('/new')}>
            + Nuevo Artículo
          </Button> */}
        </Group>

        {error && (
          <Notification
            color="red"
            title="Error"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Notification>
        )}

        {success && (
          <Notification
            color="green"
            title="Éxito"
            onClose={() => setSuccess(null)}
            withCloseButton
          >
            {success}
          </Notification>
        )}

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
                  <Table.Th style={{ width: 120 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr key={article.article_id}>
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
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => navigate(`/article/${article.article_id}`)}
                          title="Ver detalles"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="orange"
                          onClick={(e) => handleEditClick(article.article_id, e)}
                          title="Editar"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={(e) => handleDeleteClick(article, e)}
                          title="Eliminar"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="⚠️ Confirmar eliminación"
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de que deseas eliminar el artículo?
          </Text>
          {articleToDelete && (
            <Paper p="sm" withBorder bg="gray.0">
              <Text size="sm" fw={600}>{articleToDelete.article_id}</Text>
              <Text size="sm">{articleToDelete.sap_description}</Text>
              {articleToDelete.sap_itemcode && (
                <Text size="xs" c="dimmed">SAP: {articleToDelete.sap_itemcode}</Text>
              )}
            </Paper>
          )}
          <Text size="sm" c="red">
            ⚠️ Esta acción no se puede deshacer. Se eliminarán también todos los datos relacionados (variables, protocolos, registros Modbus, etc.).
          </Text>
          
          {error && (
            <Text size="sm" c="red">
              {error}
            </Text>
          )}
          
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={deleting}
            >
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default ArticleList;

