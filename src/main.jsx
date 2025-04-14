import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { store } from "./store";
import { Provider } from "react-redux";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import "./i18n"; // Importación crítica para i18n

// Validar variables de entorno críticas al inicio
const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Faltan variables de entorno requeridas:', missingEnvVars.join(', '));
  // En producción, podríamos mostrar un mensaje de error amigable en lugar de la aplicación
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<div>Cargando...</div>}>
        <App />
      </Suspense>
    </Provider>
  </React.StrictMode>
);