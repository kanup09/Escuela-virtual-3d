import { defineConfig } from 'vite'
// Si usas React, mantén la importación que corresponda a tu package.json

export default defineConfig({
  // Si se compila en Vercel usa '/', si es en GitHub Pages usa '/Escuela-virtual-3d/'
  base: process.env.VERCEL ? '/' : '/Escuela-virtual-3d/',
})