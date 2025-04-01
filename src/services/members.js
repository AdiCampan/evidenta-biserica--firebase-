import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SERVER_URL } from '../constants';
import { auth } from '../firebase-config';

// Función para obtener el token actual
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

export const membersApi = createApi({
  reducerPath: 'membersApi',
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
  tagTypes: ['members', 'member'],
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: () => `members/`,
      providesTags: ['members'],
    }),
    getMember: builder.query({
      query: (id) => `members/${id}`,
      providesTags: ['member'],
    }),
    addMember: builder.mutation({
      query: (person) => {
        // Importar las funciones de validación
        const { validateMember } = require('../utils/validation');
        
        // Validar usando la función estandarizada
        const { isValid, errors } = validateMember(person);
        
        if (!isValid) {
          throw new Error(Object.values(errors)[0]);
        }
        
        return {
          url: 'members/',
          method: 'POST',
          body: person,
        };
      },
      invalidatesTags: ['members'],
    }),
    modifyMember: builder.mutation({
      query: (person) => {
        // Importar las funciones de validación
        const { validateMember } = require('../utils/validation');
        
        // Extraer datos para validación
        const { profileImage, ...personData } = person;
        
        // Validar usando la función estandarizada
        const { isValid, errors } = validateMember(personData);
        
        if (!isValid) {
          throw new Error(Object.values(errors)[0]);
        }
        
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        // send the rest of the documents as a stringified json
        // without it, it sends all items as strings
        formData.append('doc', JSON.stringify(personData));

        return {
          url: `members/${person.id}`,
          method: 'PATCH',
          body: formData
        }
      },
      invalidatesTags: ['members', 'member'],
    }),
    delMember: builder.mutation({
      query: (id) => ({
        url: `members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['members'],
    }),
    addRelation: builder.mutation({
      query: (relation) => {
        return {
          url: 'relations/',
          method: 'POST',
          body: relation
        }
      },
      invalidatesTags: ['members', 'member'],
    })
  })
});

// Export hooks for usage in functional components
export const {
  useGetMembersQuery,
  useGetMemberQuery,
  useAddMemberMutation,
  useDelMemberMutation,
  useModifyMemberMutation,
  useAddRelationMutation
} = membersApi;

