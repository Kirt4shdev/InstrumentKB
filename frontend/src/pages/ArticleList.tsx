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
  useMantineColorScheme,
  Divider,
} from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconSearch, IconFilter } from '@tabler/icons-react';
import { getArticles, getArticleTypes, deleteArticle } from '../api';
import { Article, ArticleTypeOption } from '../types';

function ArticleList() {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
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
      setSuccess(`Article "${articleToDelete.article_id}" deleted successfully`);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
      loadArticles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting article:', error);
      setError(`Error: ${error.response?.data?.error || error.message}`);
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
    <Container size="xl" py="sm" className="fade-in">
      <Stack gap="sm">
        {/* Header corporativo */}
        <Group justify="space-between" align="center" mb="xs">
          <Box>
            <Title order={2} style={{ fontWeight: 600, fontSize: '1.5rem' }}>
              SAP Article Catalog
            </Title>
            <Text size="sm" c="dimmed">
              Manage your inventory database
            </Text>
          </Box>
          <Group gap="xs">
            <Badge variant="light" color="blue" size="md">
              {articles.length} Articles
            </Badge>
          </Group>
        </Group>

        <Divider className="corporate-divider" />

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
            title="Success"
            onClose={() => setSuccess(null)}
            withCloseButton
          >
            {success}
          </Notification>
        )}

        {/* Barra de búsqueda corporativa */}
        <Paper p="sm" className="corporate-card">
          <Group gap="xs">
            <TextInput
              placeholder="Search by ID, description, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              leftSection={<IconSearch size={14} />}
              size="xs"
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by type"
              data={[
                { value: '', label: 'All types' },
                ...articleTypes.map(t => ({ value: t.value, label: t.label }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              clearable
              size="xs"
              style={{ width: 180 }}
            />
            <Button 
              onClick={handleSearch}
              variant="filled"
              color="blue"
              size="xs"
              leftSection={<IconFilter size={14} />}
            >
              Search
            </Button>
          </Group>
        </Paper>

        {loading ? (
          <Box py="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Loader size="md" />
            <Text c="dimmed" size="xs">Loading articles...</Text>
          </Box>
        ) : articles.length === 0 ? (
          <Paper p="lg" className="corporate-card" style={{ textAlign: 'center' }}>
            <Text c="dimmed" size="sm">
              No articles found
            </Text>
          </Paper>
        ) : (
          <Paper className="corporate-card" p={0}>
            <Table highlightOnHover className="corporate-table" style={{ fontSize: '13px' }}>
              <Table.Thead>
                <Table.Tr style={{ background: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Article ID</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Type</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Description</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Category</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Manufacturer</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Model</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px' }}>Status</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px', width: 100 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr 
                    key={article.article_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/article/${article.article_id}`)}
                  >
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Text fw={600} size="xs">{article.article_id}</Text>
                      {article.sap_itemcode && (
                        <Text size="10px" c="dimmed">{article.sap_itemcode}</Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Badge color={getTypeColor(article.article_type)} variant="light" size="xs">
                        {article.article_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Text lineClamp={1} size="xs">
                        {article.sap_description}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      {article.category ? (
                        <Badge variant="dot" size="xs">
                          {article.category}
                        </Badge>
                      ) : (
                        <Text c="dimmed" size="xs">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Text size="xs">{article.manufacturer?.name || '-'}</Text>
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Text size="xs">{article.model || '-'}</Text>
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Badge 
                        color={article.active ? 'green' : 'red'} 
                        variant="dot"
                        size="xs"
                      >
                        {article.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ padding: '8px 12px' }}>
                      <Group gap={4}>
                        <Tooltip label="View">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/article/${article.article_id}`);
                            }}
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={(e) => handleEditClick(article.article_id, e)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={(e) => handleDeleteClick(article, e)}
                          >
                            <IconTrash size={14} />
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

        {/* Footer corporativo */}
        <Group justify="space-between" align="center" mt="xs">
          <Text size="xs" c="dimmed">
            Showing {articles.length} of {articles.length} articles
          </Text>
          <Text size="xs" c="dimmed">
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </Group>
      </Stack>

      {/* Modal de confirmación */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Confirm Deletion"
        centered
        size="sm"
      >
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to delete this article?
          </Text>
          {articleToDelete && (
            <Paper p="xs" style={{ background: 'rgba(255, 0, 0, 0.05)', border: '1px solid rgba(255, 0, 0, 0.1)' }}>
              <Text size="xs" fw={600}>{articleToDelete.article_id}</Text>
              <Text size="xs">{articleToDelete.sap_description}</Text>
            </Paper>
          )}
          <Text size="xs" c="red">
            This action cannot be undone.
          </Text>
          
          <Group justify="flex-end" mt="xs">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              size="xs"
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={deleting}
              size="xs"
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default ArticleList;
