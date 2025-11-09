import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App';

function Main() {
  return (
    <MantineProvider>
      <Router>
        <App />
      </Router>
    </MantineProvider>
  );
}

export default Main;

