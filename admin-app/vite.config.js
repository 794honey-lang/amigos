import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getModulePath = (moduleName) => {
  const localPath = path.resolve(__dirname, `./node_modules/${moduleName}`);
  const parentPath = path.resolve(__dirname, `../node_modules/${moduleName}`);
  return fs.existsSync(localPath) ? localPath : parentPath;
};

const menuSyncPlugin = () => ({
  name: 'menu-sync-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/save-menu' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const { menuItems } = JSON.parse(body);
            const filePath = path.resolve(__dirname, '../shared/src/mocks/mockMenuItems.js');
            const fileContent = `export const mockMenuItems = ${JSON.stringify(menuItems, null, 2)};\n`;
            fs.writeFileSync(filePath, fileContent, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });
      } else if (req.url === '/api/save-banners' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const { banners } = JSON.parse(body);
            const filePath = path.resolve(__dirname, '../shared/src/mocks/mockBanners.js');
            const fileContent = `export const mockBanners = ${JSON.stringify(banners, null, 2)};\n`;
            fs.writeFileSync(filePath, fileContent, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  base: '/amigos/admin/',
  plugins: [react(), menuSyncPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
      'react': getModulePath('react'),
      'react-dom': getModulePath('react-dom'),
      'react-router-dom': getModulePath('react-router-dom'),
      'framer-motion': getModulePath('framer-motion'),
      'lucide-react': getModulePath('lucide-react'),
      'zustand': getModulePath('zustand')
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5174
  }
});
