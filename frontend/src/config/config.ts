export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiVersion: 'v1',
  requestTimeout: 10000, // 10秒
};

export default config; 