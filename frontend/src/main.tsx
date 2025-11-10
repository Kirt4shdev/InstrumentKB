import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'sm',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 6px rgba(0, 0, 0, 0.12)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 20px rgba(0, 0, 0, 0.2)',
  },
  headings: {
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2rem' },
      h2: { fontSize: '1.5rem' },
      h3: { fontSize: '1.25rem' },
    },
  },
  colors: {
    brand: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);

