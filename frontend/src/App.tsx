import { Routes, Route } from 'react-router-dom';
import { AppShell, Group, Title, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import ArticleList from './pages/ArticleList';
import ArticleNew from './pages/ArticleNew';
import ArticleDetail from './pages/ArticleDetail';

function App() {
  const navigate = useNavigate();

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
