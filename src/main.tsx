import React from 'react';
import './public-path'; // For proper Qiankun integration
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Use HashRouter for micro-frontends
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

// Store the root instance for proper unmounting
let root = null;

function render(props) {
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement) {
    console.log('[App] Rendering in container:', rootElement);
    if (!root) {
      root = createRoot(rootElement);
    }
    root.render(
      <StrictMode>
        <Provider store={store}>
          <HashRouter>
            <App />
            <ToastContainer />
          </HashRouter>
        </Provider>
      </StrictMode>
    );
  } else {
    console.warn('[App] Root element not found!');
  }
}

export async function bootstrap() {
  console.time('[App] bootstrap');
  console.log('[App] Bootstrapping...');
  return Promise.resolve();
}

export async function mount(props) {
  console.log('[App] Mounting...', props);
  render(props);
  return Promise.resolve();
}

export async function unmount(props) {
  console.log('[App] Unmounting...', props);
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement && root) {
    console.log('[App] Unmounting from container:', rootElement);
    root.unmount();
    root = null;
  } else {
    console.warn('[App] Root element not found for unmounting!');
  }
  return Promise.resolve();
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[App] Running in standalone mode');
  render({});
} else {
  console.log('[App] Running inside Qiankun');
  render({});
}
