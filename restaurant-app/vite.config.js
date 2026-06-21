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

export default defineConfig({
  base: '/amigos/restaurant/',
  plugins: [react()],
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
    port: 5175
  }
});
