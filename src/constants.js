// Usar variable de entorno con fallback a la URL de producción
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://evidenta-biserica-api.vercel.app";
