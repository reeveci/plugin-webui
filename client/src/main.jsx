import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import Auth from '@/Auth';
import Civet from '@/Civet';
import Router from '@/Router';
import Styles from '@/styles';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Styles />

    <Auth>
      <Civet>
        <Router>
          <App />
        </Router>
      </Civet>
    </Auth>
  </StrictMode>,
);
