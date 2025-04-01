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
    }),
    addChurch: builder.mutation({
      query: (body) => ({
        url: 'churches/',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['churches'],
    }),
    delChurch: builder.mutation({
      query: (id) => ({
        url: `churches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['churches'],
    })
  
}),
});

// Export hooks for usage in functional components
export const { useGetChurchesQuery, useAddChurchMutation, useDelChurchMutation } = churchesApi;

