import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../firebase-config';
import { SERVER_URL } from '../constants';
import { isBlocked, recordFailedAttempt, resetFailedAttempts, getRemainingBlockTime } from '../utils/bruteForceProtection';
import { addCSRFToken } from '../utils/csrf';

// Función para obtener el token actual
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

export const authApi = createApi({
  reducerPath: 'authApi',
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
  tagTypes: ['user'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        // Verificar si el usuario está bloqueado por intentos fallidos
        if (isBlocked(credentials.email)) {
          const remainingTime = getRemainingBlockTime(credentials.email);
          throw new Error(`Cuenta bloqueada temporalmente. Intente nuevamente en ${Math.ceil(remainingTime / 60)} minutos.`);
        }
        
        // Agregar token CSRF a las credenciales
        const credentialsWithCSRF = addCSRFToken(credentials);
        
        return {
          url: 'auth/login',
          method: 'POST',
          body: credentialsWithCSRF,
        };
      },
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Resetear intentos fallidos después de inicio de sesión exitoso
          resetFailedAttempts(credentials.email);
        } catch (error) {
          // Registrar intento fallido
          recordFailedAttempt(credentials.email);
        }
      },
      invalidatesTags: ['user'],
    }),
    signup: builder.mutation({
      query: (newUser) => {
        // Agregar token CSRF a los datos de registro
        const newUserWithCSRF = addCSRFToken(newUser);
        
        return {
          url: `auth/register`,
          method: 'POST',
          body: newUserWithCSRF
        };
      },
      invalidatesTags: ['user'],
    }),
  }),
});

  // Export hooks for usage in functional components
  export const {
    useLoginMutation,
    useSignupMutation,
  } = authApi;

