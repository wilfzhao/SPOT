
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React 挂载失败:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #f87171; background: #111827; height: 100vh; font-family: sans-serif;">
        <h1 style="font-size: 20px;">应用启动异常 (JS Error)</h1>
        <p style="font-size: 14px; color: #9ca3af;">请检查浏览器控制台或 Import Map 映射。</p>
        <pre style="background: #1f2937; padding: 15px; border-radius: 8px; overflow: auto; margin-top: 20px;">${error instanceof Error ? error.stack : '未知错误'}</pre>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
