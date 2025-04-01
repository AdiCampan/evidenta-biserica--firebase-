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
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['user'],
    }),
    signup: builder.mutation({
      query: (newUser) => ({
        url: `auth/register`,
        method: 'POST',
        body: newUser
      }),
      invalidatesTags: ['user'],
    }),
  }),
});

  // Export hooks for usage in functional components
  export const {
    useLoginMutation,
    useSignupMutation,
  } = authApi;

