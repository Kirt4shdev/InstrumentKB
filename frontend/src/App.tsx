import { Routes, Route } from 'react-router-dom';
import { AppShell, Group, Title, Button, Menu, ActionIcon, useMantineColorScheme, Box, Text, Divider } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconDownload, IconFileTypeCsv, IconFileTypeXls, IconDatabase, IconSun, IconMoon, IconApps, IconPlus, IconChevronDown } from '@tabler/icons-react';
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
        message: 'Archivo SQL descargado correctamente',
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
      header={{ height: 56 }}
      padding="md"
    >
      <AppShell.Header className="corporate-header">
        <Group h="100%" px="md" justify="space-between">
          {/* Logo corporativo */}
          <Group gap="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              style={{
                background: '#2196F3',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconApps size={18} color="white" />
            </Box>
            <Box>
              <Title order={4} style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1 }}>
                InstrumentKB
              </Title>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1, marginTop: 2 }}>
                SAP Catalog
              </Text>
            </Box>
          </Group>

          {/* Acciones */}
          <Group gap="xs">
            <Menu 
              shadow="sm" 
              width={240} 
              position="bottom-end"
            >
              <Menu.Target>
                <Button 
                  variant="default"
                  size="xs"
                  rightSection={<IconChevronDown size={14} />}
                  leftSection={<IconDownload size={14} />}
                  style={{ fontWeight: 500 }}
                >
                  Export
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label style={{ fontSize: '11px', fontWeight: 600 }}>
                  Export Formats
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={14} />}
                  onClick={handleExportJSON}
                  style={{ fontSize: '13px' }}
                >
                  JSON (Complete)
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeXls size={14} />}
                  onClick={handleExportExcel}
                  style={{ fontSize: '13px' }}
                >
                  Excel (XLSX)
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label style={{ fontSize: '11px', fontWeight: 600 }}>
                  Production
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconDatabase size={14} />}
                  onClick={handleExportSQL}
                  style={{ fontSize: '13px' }}
                >
                  PostgreSQL (SQL)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Button 
              variant="filled"
              color="blue"
              size="xs"
              onClick={() => navigate('/new')}
              leftSection={<IconPlus size={14} />}
              style={{ fontWeight: 500 }}
            >
              New Article
            </Button>

            <Divider orientation="vertical" />

            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="subtle"
              color="gray"
              size="md"
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
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
