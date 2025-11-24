import { Routes, Route } from 'react-router-dom';
import { AppShell, Group, Title, Button, Menu, ActionIcon, useMantineColorScheme, Box, Text, Divider } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconDownload, IconFileTypeCsv, IconFileTypeXls, IconDatabase, IconSun, IconMoon, IconApps, IconPlus, IconChevronDown, IconUpload } from '@tabler/icons-react';
import { exportJSON, exportExcel, exportSQL, importJSON, importExcel, importSQL } from './api';
import { notifications } from '@mantine/notifications';
import { useRef } from 'react';
import ArticleList from './pages/ArticleList';
import ArticleNew from './pages/ArticleNew';
import ArticleDetail from './pages/ArticleDetail';

function App() {
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const sqlInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>, type: 'json' | 'excel' | 'sql') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      notifications.show({
        title: 'Importando...',
        message: `Procesando archivo ${file.name}`,
        loading: true,
        autoClose: false,
        id: `import-${type}`
      });

      const formData = new FormData();
      formData.append('file', file);

      let response;
      if (type === 'json') {
        response = await importJSON(formData);
      } else if (type === 'excel') {
        response = await importExcel(formData);
      } else {
        response = await importSQL(formData);
      }

      const result = response.data;
      
      // Show errors in console if any
      if (result.errors && result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
      
      const message = result.imported !== undefined 
        ? `${result.imported} creados, ${result.updated || 0} actualizados${result.failed ? `, ${result.failed} fallidos` : ''}`
        : 'Importación completada';

      const hasErrors = result.failed > 0 || (result.errors && result.errors.length > 0);
      const detailedMessage = hasErrors && result.errors
        ? `${message}\n\nPrimeros errores:\n${result.errors.slice(0, 3).map((e: any) => `• ${e.article_id || 'Item'}: ${e.error?.substring(0, 80) || e}`).join('\n')}`
        : message;

      notifications.update({
        id: `import-${type}`,
        title: hasErrors ? 'Importación con errores' : 'Importación exitosa',
        message: detailedMessage,
        color: hasErrors ? 'orange' : 'green',
        loading: false,
        autoClose: hasErrors ? 10000 : 5000
      });

      // Recargar la página después de 2 segundos para mostrar los datos importados
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      notifications.update({
        id: `import-${type}`,
        title: 'Error en la importación',
        message: error.response?.data?.message || error.message || 'Error al importar archivo',
        color: 'red',
        loading: false,
        autoClose: 5000
      });
      console.error('Import error:', error);
    } finally {
      // Reset input
      event.target.value = '';
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
                Instrument Knowledge Base
              </Title>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1, marginTop: 2 }}>
                Catálogo SAP
              </Text>
            </Box>
          </Group>

          {/* Acciones */}
          <Group gap="xs">
            {/* Menú de Importar */}
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
                  leftSection={<IconUpload size={14} />}
                  style={{ fontWeight: 500 }}
                >
                  Importar
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label style={{ fontSize: '11px', fontWeight: 600 }}>
                  Formatos de Importación
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={14} />}
                  onClick={() => jsonInputRef.current?.click()}
                  style={{ fontSize: '13px' }}
                >
                  JSON (Completo)
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeXls size={14} />}
                  onClick={() => excelInputRef.current?.click()}
                  style={{ fontSize: '13px' }}
                >
                  Excel (XLSX)
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label style={{ fontSize: '11px', fontWeight: 600 }}>
                  Producción
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconDatabase size={14} />}
                  onClick={() => sqlInputRef.current?.click()}
                  style={{ fontSize: '13px' }}
                >
                  PostgreSQL (SQL)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Inputs ocultos para importación */}
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => handleImportFile(e, 'json')}
            />
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => handleImportFile(e, 'excel')}
            />
            <input
              ref={sqlInputRef}
              type="file"
              accept=".sql"
              style={{ display: 'none' }}
              onChange={(e) => handleImportFile(e, 'sql')}
            />

            {/* Menú de Exportar */}
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
                  Exportar
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label style={{ fontSize: '11px', fontWeight: 600 }}>
                  Formatos de Exportación
                </Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={14} />}
                  onClick={handleExportJSON}
                  style={{ fontSize: '13px' }}
                >
                  JSON (Completo)
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
                  Producción
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
              Nuevo Artículo
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
