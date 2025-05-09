import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Carga las variables de entorno según el modo (development o production)
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log(`Modo de ejecución: ${mode}`);
  console.log(`Proyecto Firebase: ${env.VITE_PROJECT_ID}`);
  
  return {
    plugins: [react()],
    server: { open: true },
    // Asegura que las variables de entorno estén disponibles
    define: {
      'process.env': env,
      // Definir explícitamente NODE_ENV para evitar problemas con jsx-runtime
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        // Asegurar que los módulos de CommonJS se transformen correctamente
        include: [/node_modules\/react\//, /node_modules\/react-dom\//]
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom']
          }
        }
      }
    },
    resolve: {
      alias: {
        // Asegura que React se resuelva correctamente
        'react': resolve(__dirname, 'node_modules/react'),
        'react-dom': resolve(__dirname, 'node_modules/react-dom'),
        // Añadir alias específico para jsx-runtime
        'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime')
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime']
    }
  };
});
