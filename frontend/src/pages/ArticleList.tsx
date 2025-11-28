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
  Pagination,
  MultiSelect,
  Collapse,
} from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconSearch, IconFilter, IconFilterOff, IconChevronDown, IconChevronUp, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { getArticles, getArticleTypes, getManufacturers, deleteArticle } from '../api';
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sap_itemcode: '',
    category: [] as string[],
    manufacturer: [] as string[],
    model: '',
    active: null as boolean | null,
  });
  
  // Ordenamiento
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Opciones para filtros
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadArticleTypes();
    loadManufacturers();
    loadArticles();
  }, []);

  useEffect(() => {
    // Extract unique categories from articles
    const uniqueCategories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));
    setCategories(uniqueCategories as string[]);
  }, [articles]);

  const loadArticleTypes = async () => {
    try {
      const response = await getArticleTypes();
      setArticleTypes(response.data);
    } catch (error) {
      console.error('Error loading article types:', error);
    }
  };

  const loadManufacturers = async () => {
    try {
      const response = await getManufacturers();
      setManufacturers(response.data);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
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
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadArticles();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      sap_itemcode: '',
      category: [],
      manufacturer: [],
      model: '',
      active: null,
    });
    setSearchQuery('');
    setSelectedType(null);
    setSortBy(null);
    setSortOrder('asc');
  };

  // Filter and sort articles
  const getFilteredArticles = () => {
    let filtered = [...articles];

    // Apply advanced filters
    if (filters.sap_itemcode) {
      filtered = filtered.filter(a => 
        a.sap_itemcode?.toLowerCase().includes(filters.sap_itemcode.toLowerCase())
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(a => 
        a.category && filters.category.includes(a.category)
      );
    }

    if (filters.manufacturer.length > 0) {
      filtered = filtered.filter(a => 
        a.manufacturer && filters.manufacturer.includes(a.manufacturer.name)
      );
    }

    if (filters.model) {
      filtered = filtered.filter(a => 
        a.model?.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    if (filters.active !== null) {
      filtered = filtered.filter(a => a.active === filters.active);
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a: any, b: any) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        // Handle nested manufacturer
        if (sortBy === 'manufacturer') {
          aVal = a.manufacturer?.name || '';
          bVal = b.manufacturer?.name || '';
        }

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return filtered;
  };

  // Get paginated articles
  const getPaginatedArticles = () => {
    const filtered = getFilteredArticles();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const filteredArticles = getFilteredArticles();
  const paginatedArticles = getPaginatedArticles();
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

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
    <Container size="responsive" py="sm" className="fade-in" style={{ maxWidth: '95%' }}>
      <Stack gap="sm">
        {/* Header corporativo */}
        <Group justify="space-between" align="center" mb="xs">
          <Box>
            <Title order={2} style={{ fontWeight: 600 }}>
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
          <Stack gap="xs">
            <Group gap="xs">
              <TextInput
                placeholder="Buscar por código SAP, descripción, modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                leftSection={<IconSearch size={14} />}
                size="xs"
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filtrar por tipo"
                data={[
                  { value: '', label: 'Todos los tipos' },
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
                Buscar
              </Button>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="default"
                size="xs"
                leftSection={showFilters ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              >
                Filtros
              </Button>
            </Group>

            <Collapse in={showFilters}>
              <Paper p="xs" withBorder>
                <Stack gap="xs">
                  <Group gap="xs" grow>
                    <TextInput
                      label="Código SAP"
                      placeholder="Filtrar por código SAP"
                      value={filters.sap_itemcode}
                      onChange={(e) => setFilters({ ...filters, sap_itemcode: e.target.value })}
                      size="xs"
                    />
                    <TextInput
                      label="Modelo"
                      placeholder="Filtrar por modelo"
                      value={filters.model}
                      onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                      size="xs"
                    />
                  </Group>
                  <Group gap="xs" grow>
                    <MultiSelect
                      label="Categoría"
                      placeholder="Seleccionar categorías"
                      data={categories.map(c => ({ value: c, label: c }))}
                      value={filters.category}
                      onChange={(value) => setFilters({ ...filters, category: value })}
                      size="xs"
                      searchable
                      clearable
                    />
                    <MultiSelect
                      label="Fabricante"
                      placeholder="Seleccionar fabricantes"
                      data={manufacturers.map(m => ({ value: m.name, label: m.name }))}
                      value={filters.manufacturer}
                      onChange={(value) => setFilters({ ...filters, manufacturer: value })}
                      size="xs"
                      searchable
                      clearable
                    />
                  </Group>
                  <Group gap="xs" grow>
                    <Select
                      label="Estado"
                      placeholder="Filtrar por estado"
                      data={[
                        { value: 'all', label: 'Todos' },
                        { value: 'true', label: 'Activo' },
                        { value: 'false', label: 'Inactivo' }
                      ]}
                      value={filters.active === null ? 'all' : filters.active.toString()}
                      onChange={(value) => {
                        if (value === 'all') {
                          setFilters({ ...filters, active: null });
                        } else {
                          setFilters({ ...filters, active: value === 'true' });
                        }
                      }}
                      size="xs"
                      clearable
                    />
                    <Select
                      label="Mostrar por página"
                      placeholder="Items por página"
                      data={[
                        { value: '10', label: '10' },
                        { value: '25', label: '25' },
                        { value: '50', label: '50' },
                        { value: '100', label: '100' }
                      ]}
                      value={itemsPerPage.toString()}
                      onChange={(value) => {
                        setItemsPerPage(parseInt(value || '25'));
                        setCurrentPage(1);
                      }}
                      size="xs"
                    />
                  </Group>
                  <Group justify="flex-end" gap="xs">
                    <Button 
                      onClick={handleClearFilters}
                      variant="subtle"
                      color="gray"
                      size="xs"
                      leftSection={<IconFilterOff size={14} />}
                    >
                      Limpiar Filtros
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Collapse>
          </Stack>
        </Paper>

        {loading ? (
          <Box py="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Loader size="md" />
            <Text c="dimmed" size="xs">Cargando artículos...</Text>
          </Box>
        ) : filteredArticles.length === 0 ? (
          <Paper p="lg" className="corporate-card" style={{ textAlign: 'center' }}>
            <Text c="dimmed" size="sm">
              No se encontraron artículos con los filtros aplicados
            </Text>
            <Button 
              onClick={handleClearFilters}
              variant="light"
              color="blue"
              size="xs"
              mt="md"
              leftSection={<IconFilterOff size={14} />}
            >
              Limpiar Filtros
            </Button>
          </Paper>
        ) : (
          <>
            <Paper className="corporate-card" p={0}>
              <Table highlightOnHover className="corporate-table responsive-table">
                <Table.Thead>
                  <Table.Tr style={{ background: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <Table.Th 
                      className="table-header" 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('sap_itemcode')}
                    >
                      <Group gap={4}>
                        Código SAP
                        {sortBy === 'sap_itemcode' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th 
                      className="table-header"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('article_type')}
                    >
                      <Group gap={4}>
                        Tipo
                        {sortBy === 'article_type' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th 
                      className="table-header"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('sap_description')}
                    >
                      <Group gap={4}>
                        Descripción
                        {sortBy === 'sap_description' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th 
                      className="table-header"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('category')}
                    >
                      <Group gap={4}>
                        Categoría
                        {sortBy === 'category' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th 
                      className="table-header"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('manufacturer')}
                    >
                      <Group gap={4}>
                        Fabricante
                        {sortBy === 'manufacturer' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th 
                      className="table-header"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('model')}
                    >
                      <Group gap={4}>
                        Modelo
                        {sortBy === 'model' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th 
                      className="table-header"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('active')}
                    >
                      <Group gap={4}>
                        Estado
                        {sortBy === 'active' && (
                          sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th className="table-header" style={{ width: 100 }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedArticles.map((article) => (
                    <Table.Tr 
                      key={article.article_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/article/${article.article_id}`)}
                    >
                      <Table.Td className="table-cell">
                        <Text fw={600} size="xs" style={{ color: 'var(--mantine-color-blue-6)' }}>
                          {article.sap_itemcode || '-'}
                        </Text>
                        <Text size="xs" c="dimmed" className="table-subtext">ID: {article.article_id}</Text>
                      </Table.Td>
                      <Table.Td className="table-cell">
                        <Badge color={getTypeColor(article.article_type)} variant="light" size="xs">
                          {article.article_type}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="table-cell">
                        <Text lineClamp={1} size="xs">
                          {article.sap_description}
                        </Text>
                      </Table.Td>
                      <Table.Td className="table-cell">
                        {article.category ? (
                          <Badge variant="dot" size="xs">
                            {article.category}
                          </Badge>
                        ) : (
                          <Text c="dimmed" size="xs">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td className="table-cell">
                        <Text size="xs">{article.manufacturer?.name || '-'}</Text>
                      </Table.Td>
                      <Table.Td className="table-cell">
                        <Text size="xs">{article.model || '-'}</Text>
                      </Table.Td>
                      <Table.Td className="table-cell">
                        <Badge 
                          color={article.active ? 'green' : 'red'} 
                          variant="dot"
                          size="xs"
                        >
                          {article.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="table-cell">
                        <Group gap={4}>
                          <Tooltip label="Ver">
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
                          <Tooltip label="Editar">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={(e) => handleEditClick(article.article_id, e)}
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Eliminar">
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

            {/* Paginación */}
            {totalPages > 1 && (
              <Paper p="sm" className="corporate-card">
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredArticles.length)} de {filteredArticles.length} artículos
                  </Text>
                  <Pagination 
                    value={currentPage} 
                    onChange={setCurrentPage} 
                    total={totalPages}
                    size="sm"
                    withEdges
                  />
                </Group>
              </Paper>
            )}
          </>
        )}

        {/* Footer corporativo */}
        {!loading && filteredArticles.length > 0 && (
          <Group justify="space-between" align="center" mt="xs">
            <Text size="xs" c="dimmed">
              {filteredArticles.length !== articles.length 
                ? `${filteredArticles.length} artículos filtrados de ${articles.length} totales`
                : `Total: ${articles.length} artículos`
              }
            </Text>
            <Text size="xs" c="dimmed">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </Text>
          </Group>
        )}
      </Stack>

      {/* Modal de confirmación */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        centered
        size="sm"
      >
        <Stack gap="sm">
          <Text size="sm">
            ¿Estás seguro de que deseas eliminar este artículo?
          </Text>
          {articleToDelete && (
            <Paper p="xs" style={{ background: 'rgba(255, 0, 0, 0.05)', border: '1px solid rgba(255, 0, 0, 0.1)' }}>
              <Text size="xs" fw={600} c="blue">SAP: {articleToDelete.sap_itemcode || '-'}</Text>
              <Text size="xs" c="dimmed">ID: {articleToDelete.article_id}</Text>
              <Text size="xs" mt={4}>{articleToDelete.sap_description}</Text>
            </Paper>
          )}
          <Text size="xs" c="red">
            Esta acción no se puede deshacer.
          </Text>
          
          <Group justify="flex-end" mt="xs">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              size="xs"
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={deleting}
              size="xs"
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
