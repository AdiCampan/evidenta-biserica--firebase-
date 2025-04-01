import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../firebase-config';
import { SERVER_URL } from '../constants';

// Función para obtener el token actual
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

export const churchesApi = createApi({
  reducerPath: 'churchesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: SERVER_URL,
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['churches'],
  endpoints: (builder) => ({
    getChurches: builder.query({
      query: () => `churches/`,
      providesTags: ['churches'],
      // Manejo de errores mejorado
      transformErrorResponse: (response, meta, arg) => {
        console.error('Error en la solicitud API:', response);
        return {
          status: response.status,
          message: 'Error al obtener datos. Por favor, inténtelo de nuevo más tarde.'
        };
      },
    }),
    addChurch: builder.mutation({
      query: (body) => {
        // Importar las funciones de validación
        const { validateChurch } = require('../utils/validation');
        
        // Validar usando la función estandarizada
        const { isValid, errors } = validateChurch(body);
        
        if (!isValid) {
          throw new Error(Object.values(errors)[0]);
        }
        
        return {
          url: 'churches/',
          method: 'POST',
          body: body,
        };
      },
      invalidatesTags: ['churches'],
      // Manejo de errores mejorado
      transformErrorResponse: (response, meta, arg) => {
        console.error('Error al añadir iglesia:', response);
        return {
          status: response.status,
          message: response.data?.message || 'Error al añadir iglesia. Por favor, inténtelo de nuevo.'
        };
      },
    }),
    delChurch: builder.mutation({
      query: (id) => {
        // Validar que el ID sea válido
        if (!id || typeof id !== 'string' && typeof id !== 'number') {
          throw new Error('ID de iglesia no válido');
        }
        
        return {
          url: `churches/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['churches'],
      // Manejo de errores mejorado
      transformErrorResponse: (response, meta, arg) => {
        console.error('Error al eliminar iglesia:', response);
        return {
          status: response.status,
          message: 'Error al eliminar iglesia. Por favor, inténtelo de nuevo.'
        };
      },
    })
  
}),
});

// Export hooks for usage in functional components
export const { useGetChurchesQuery, useAddChurchMutation, useDelChurchMutation } = churchesApi;

