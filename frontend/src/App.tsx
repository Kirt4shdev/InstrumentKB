import { Routes, Route } from 'react-router-dom';
import { AppShell, Group, Title, Button, Menu, ActionIcon, useMantineColorScheme, Box, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconDownload, IconFileTypeCsv, IconFileTypeXls, IconDatabase, IconSun, IconMoon, IconSparkles } from '@tabler/icons-react';
import { exportJSON, exportExcel, exportSQL } from './api';
import { notifications } from '@mantine/notifications';
import ArticleList from './pages/ArticleList';
import ArticleNew from './pages/ArticleNew';
import ArticleDetail from './pages/ArticleDetail';

function App() {
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleExportJSON = async () => {
    try {
      notifications.show({
        title: 'Exportando...',
        message: 'Generando archivo JSON',
        loading: true,
        autoClose: false,
        id: 'export-json'
      });

      const response = await exportJSON();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrumentkb-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      notifications.update({
        id: 'export-json',
        title: 'Exportación completada',
        message: 'Archivo JSON descargado correctamente',
        color: 'green',
        loading: false,
        autoClose: 3000
      });
    } catch (error) {
      notifications.update({
        id: 'export-json',
        title: 'Error',
        message: 'Error al exportar datos',
        color: 'red',
        loading: false,
        autoClose: 3000
      });
      console.error('Export error:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      notifications.show({
        title: 'Exportando...',
        message: 'Generando archivo Excel',
        loading: true,
        autoClose: false,
        id: 'export-excel'
      });

      const response = await exportExcel();
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrumentkb-export-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      notifications.update({
        id: 'export-excel',
        title: 'Exportación completada',
        message: 'Archivo Excel descargado correctamente',
        color: 'green',
        loading: false,
        autoClose: 3000
      });
    } catch (error) {
      notifications.update({
        id: 'export-excel',
        title: 'Error',
        message: 'Error al exportar datos',
        color: 'red',
        loading: false,
        autoClose: 3000
      });
      console.error('Export error:', error);
    }
  };

  const handleExportSQL = async () => {
    try {
      notifications.show({
        title: 'Exportando...',
        message: 'Generando archivo SQL',
        loading: true,
        autoClose: false,
        id: 'export-sql'
      });

      const response = await exportSQL();
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrumentkb-export-${Date.now()}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      notifications.update({
        id: 'export-sql',
        title: 'Exportación completada',
        message: 'Archivo SQL descargado correctamente. Puedes importarlo directamente en PostgreSQL.',
        color: 'green',
        loading: false,
        autoClose: 5000
      });
    } catch (error) {
      notifications.update({
        id: 'export-sql',
        title: 'Error',
        message: 'Error al exportar datos',
        color: 'red',
        loading: false,
        autoClose: 3000
      });
      console.error('Export error:', error);
    }
  };

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Header className="elevated-header">
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IconSparkles size={24} color="white" />
            </Box>
            <Box>
              <Title 
                order={3}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                }}
              >
                InstrumentKB
              </Title>
              <Text size="xs" c="dimmed" style={{ marginTop: -4 }}>
                Catálogo SAP Inteligente
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Menu shadow="xl" width={280} position="bottom-end">
              <Menu.Target>
                <Button 
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'indigo', deg: 135 }}
                  leftSection={<IconDownload size={18} />}
                  style={{ fontWeight: 600 }}
                >
                  Exportar
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Formatos de Exportación
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={18} />}
                  onClick={handleExportJSON}
                >
                  <div>
                    <Text fw={500} size="sm">JSON (Completo)</Text>
                    <Text size="xs" c="dimmed">
                      Cada instrumento con toda su info
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeXls size={18} />}
                  onClick={handleExportExcel}
                >
                  <div>
                    <Text fw={500} size="sm">Excel (XLSX)</Text>
                    <Text size="xs" c="dimmed">
                      Una tabla por hoja
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Para Producción
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconDatabase size={18} />}
                  onClick={handleExportSQL}
                  color="teal"
                >
                  <div>
                    <Text fw={500} size="sm">PostgreSQL (SQL)</Text>
                    <Text size="xs" c="dimmed">
                      Importación directa
                    </Text>
                  </div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Button 
              variant="light"
              color="violet"
              onClick={() => navigate('/new')}
              style={{ fontWeight: 600 }}
            >
              + Nuevo Artículo
            </Button>

            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
              style={{
                border: '1px solid rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ 
        background: colorScheme === 'dark' 
          ? 'linear-gradient(180deg, rgba(26, 27, 30, 1) 0%, rgba(37, 38, 43, 1) 100%)'
          : 'linear-gradient(180deg, rgba(248, 249, 250, 1) 0%, rgba(233, 236, 239, 1) 100%)',
        minHeight: '100vh',
      }}>
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/new" element={<ArticleNew />} />
          <Route path="/edit/:id" element={<ArticleNew />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
