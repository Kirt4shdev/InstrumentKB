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
      h1: { fontSize: 'clamp(1.75rem, 1.5vw + 1.5rem, 2.5rem)' },
      h2: { fontSize: 'clamp(1.35rem, 1.2vw + 1.2rem, 2rem)' },
      h3: { fontSize: 'clamp(1.15rem, 0.8vw + 1rem, 1.5rem)' },
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
  // Contenedor responsive sin límites estrictos
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },
  // Tamaños de fuente responsive
  fontSizes: {
    xs: 'clamp(0.6875rem, 0.3vw + 0.625rem, 0.8125rem)', // 11px - 13px
    sm: 'clamp(0.75rem, 0.4vw + 0.6875rem, 0.9375rem)',  // 12px - 15px
    md: 'clamp(0.875rem, 0.5vw + 0.75rem, 1rem)',        // 14px - 16px
    lg: 'clamp(1rem, 0.6vw + 0.875rem, 1.125rem)',       // 16px - 18px
    xl: 'clamp(1.125rem, 0.8vw + 1rem, 1.375rem)',       // 18px - 22px
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

