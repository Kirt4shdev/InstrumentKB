import { Routes, Route } from 'react-router-dom';
import { AppShell, Group, Title, Button, Menu } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconDownload, IconFileTypeCsv, IconFileTypeXls, IconDatabase } from '@tabler/icons-react';
import { exportJSON, exportExcel, exportSQL } from './api';
import { notifications } from '@mantine/notifications';
import ArticleList from './pages/ArticleList';
import ArticleNew from './pages/ArticleNew';
import ArticleDetail from './pages/ArticleDetail';

function App() {
  const navigate = useNavigate();

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
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title 
            order={3} 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            📦 InstrumentKB - Catálogo SAP
          </Title>
          <Group>
            <Menu shadow="md" width={250}>
              <Menu.Target>
                <Button 
                  variant="light" 
                  leftSection={<IconDownload size={16} />}
                  color="blue"
                >
                  Exportar Datos
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Formatos de Exportación</Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={16} />}
                  onClick={handleExportJSON}
                >
                  JSON (Arrays)
                  <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                    Para análisis de datos
                  </div>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeXls size={16} />}
                  onClick={handleExportExcel}
                >
                  Excel (XLSX)
                  <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                    Una tabla por hoja
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>Para Producción</Menu.Label>
                <Menu.Item
                  leftSection={<IconDatabase size={16} />}
                  onClick={handleExportSQL}
                  color="green"
                >
                  PostgreSQL (SQL)
                  <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                    Importación directa
                  </div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Button 
              variant="light" 
              onClick={() => navigate('/new')}
            >
              Nuevo Artículo
            </Button>
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
