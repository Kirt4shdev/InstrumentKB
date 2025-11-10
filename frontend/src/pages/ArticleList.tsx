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
  Box,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconSearch, IconFilter, IconSparkles } from '@tabler/icons-react';
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
    <Container size="xl" py="xl" className="fade-in">
      <Stack gap="xl">
        {/* Header con estilo moderno */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Group gap="md">
              <Box
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconSparkles size={28} color="white" />
              </Box>
              <Box>
                <Title order={2} style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                }}>
                  Catálogo de Artículos SAP
                </Title>
                <Text size="sm" c="dimmed">
                  Gestiona y explora tu inventario inteligente
                </Text>
              </Box>
            </Group>
          </Group>
        </Box>

        {error && (
          <Notification
            color="red"
            title="Error"
            onClose={() => setError(null)}
            withCloseButton
            style={{
              boxShadow: '0 8px 24px rgba(255, 0, 0, 0.15)',
              border: '1px solid rgba(255, 0, 0, 0.2)',
            }}
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
            style={{
              boxShadow: '0 8px 24px rgba(0, 255, 0, 0.15)',
              border: '1px solid rgba(0, 255, 0, 0.2)',
            }}
          >
            {success}
          </Notification>
        )}

        {/* Barra de búsqueda elegante */}
        <Paper 
          p="lg" 
          radius="md"
          className="elegant-paper"
          style={{
            border: '1px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group gap="md" grow>
            <TextInput
              placeholder="Buscar por ID, descripción, modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              leftSection={<IconSearch size={18} />}
              size="md"
              radius="md"
              style={{
                flex: 1,
              }}
            />
            <Select
              placeholder="Filtrar por tipo"
              data={[
                { value: '', label: 'Todos los tipos' },
                ...articleTypes.map(t => ({ value: t.value, label: t.label }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              leftSection={<IconFilter size={18} />}
              clearable
              size="md"
              radius="md"
              style={{ minWidth: 250, maxWidth: 300 }}
            />
            <Button 
              onClick={handleSearch}
              variant="gradient"
              gradient={{ from: 'cyan', to: 'indigo', deg: 135 }}
              size="md"
              radius="md"
              style={{ fontWeight: 600, minWidth: 120 }}
            >
              Buscar
            </Button>
          </Group>
        </Paper>

        {loading ? (
          <Box py="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader size="lg" color="violet" type="dots" />
            <Text c="dimmed" size="sm">Cargando artículos...</Text>
          </Box>
        ) : articles.length === 0 ? (
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
              No se encontraron artículos
            </Text>
            <Text ta="center" c="dimmed" size="sm" mt="xs">
              Prueba con otros criterios de búsqueda
            </Text>
          </Paper>
        ) : (
          <Paper 
            radius="md"
            className="elegant-paper"
            style={{
              border: '1px solid rgba(102, 126, 234, 0.2)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Table striped highlightOnHover className="elegant-table">
              <Table.Thead style={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              }}>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 700 }}>ID Artículo</Table.Th>
                  <Table.Th style={{ fontWeight: 700 }}>Tipo</Table.Th>
                  <Table.Th style={{ fontWeight: 700 }}>Descripción SAP</Table.Th>
                  <Table.Th style={{ fontWeight: 700 }}>Categoría</Table.Th>
                  <Table.Th style={{ fontWeight: 700 }}>Fabricante</Table.Th>
                  <Table.Th style={{ fontWeight: 700 }}>Modelo</Table.Th>
                  <Table.Th style={{ fontWeight: 700 }}>Estado</Table.Th>
                  <Table.Th style={{ width: 140, fontWeight: 700 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article, index) => (
                  <Table.Tr 
                    key={article.article_id}
                    style={{
                      animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <Table.Td>
                      <Text fw={600} size="sm">{article.article_id}</Text>
                      {article.sap_itemcode && (
                        <Text size="xs" c="dimmed">{article.sap_itemcode}</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={getTypeColor(article.article_type)} 
                        variant="light"
                        size="lg"
                        style={{ fontWeight: 600 }}
                      >
                        {article.article_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text lineClamp={2} size="sm">{article.sap_description}</Text>
                    </Table.Td>
                    <Table.Td>
                      {article.category && (
                        <Badge variant="dot" size="lg">{article.category}</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {article.manufacturer?.name || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{article.model || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={article.active ? 'teal' : 'red'} 
                        variant="light"
                        size="lg"
                        style={{ fontWeight: 600 }}
                      >
                        {article.active ? '✓ Activo' : '✗ Inactivo'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <Tooltip label="Ver detalles" position="top">
                          <ActionIcon
                            variant="light"
                            color="cyan"
                            size="lg"
                            onClick={() => navigate(`/article/${article.article_id}`)}
                            style={{ transition: 'transform 0.2s ease' }}
                          >
                            <IconEye size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Editar" position="top">
                          <ActionIcon
                            variant="light"
                            color="violet"
                            size="lg"
                            onClick={(e) => handleEditClick(article.article_id, e)}
                            style={{ transition: 'transform 0.2s ease' }}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar" position="top">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="lg"
                            onClick={(e) => handleDeleteClick(article, e)}
                            style={{ transition: 'transform 0.2s ease' }}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Footer con estadísticas */}
        <Paper 
          p="md" 
          radius="md"
          className="elegant-paper"
          style={{
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Total: <Text span fw={700} c="violet">{articles.length}</Text> artículo(s)
            </Text>
            <Badge 
              variant="gradient" 
              gradient={{ from: 'cyan', to: 'indigo', deg: 135 }}
              size="lg"
            >
              Catálogo actualizado
            </Badge>
          </Group>
        </Paper>
      </Stack>

      {/* Modal de confirmación de eliminación */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title={
          <Group gap="xs">
            <Box
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconTrash size={20} color="white" />
            </Box>
            <Text fw={700} size="lg">Confirmar eliminación</Text>
          </Group>
        }
        centered
        radius="md"
        size="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            ¿Estás seguro de que deseas eliminar el artículo?
          </Text>
          {articleToDelete && (
            <Paper 
              p="md" 
              radius="md"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
              }}
            >
              <Text size="sm" fw={700}>{articleToDelete.article_id}</Text>
              <Text size="sm" mt="xs">{articleToDelete.sap_description}</Text>
              {articleToDelete.sap_itemcode && (
                <Text size="xs" c="dimmed" mt="xs">SAP: {articleToDelete.sap_itemcode}</Text>
              )}
            </Paper>
          )}
          <Paper 
            p="sm" 
            radius="md"
            style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
            }}
          >
            <Text size="sm" c="red" fw={500}>
              ⚠️ Esta acción no se puede deshacer. Se eliminarán también todos los datos relacionados (variables, protocolos, registros Modbus, etc.).
            </Text>
          </Paper>
          
          {error && (
            <Text size="sm" c="red" fw={500}>
              {error}
            </Text>
          )}
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              size="md"
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: 'red', to: 'pink', deg: 135 }}
              onClick={handleDeleteConfirm}
              loading={deleting}
              size="md"
              style={{ fontWeight: 600 }}
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

