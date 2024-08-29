import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store, { useAppSelector } from './store';
import { App } from './app';
import '@/popup/styles/global.less';
import { I18nextProvider } from 'react-i18next';
import i18n from './locale/i18';
import '@vant/touch-emulator';
import { HashRouter as Router, useNavigate } from 'react-router-dom';
import { useEffect, Suspense } from 'react';

const rootEl = document.createElement('div');
document.body.appendChild(rootEl);
const root = createRoot(rootEl);

root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <div id="root-chill" style={{ width: '360px', height: '100vh', margin: '0 auto' }}>
        <Suspense fallback={''}>
          <Router>
            <App />
          </Router>
        </Suspense>
      </div>
    </I18nextProvider>
  </Provider>
);
