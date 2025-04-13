import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SERVER_URL } from '../constants';
import { auth } from '../firebase-config';
import { encryptField, decryptField } from '../utils/encryption';

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
      transformResponse: (response) => {
        // Descifrar datos sensibles al recibir
        if (Array.isArray(response)) {
          return response.map(member => {
            let decryptedMember = decryptField(member, 'personalData');
            if (decryptedMember.contactInfo) {
              decryptedMember.contactInfo = decryptField(decryptedMember.contactInfo, 'email');
              decryptedMember.contactInfo = decryptField(decryptedMember.contactInfo, 'phone');
            }
            return decryptedMember;
          });
        }
        return response;
      },
    }),
    getMember: builder.query({
      query: (id) => `members/${id}`,
      providesTags: ['member'],
      transformResponse: (response) => {
        // Descifrar datos sensibles al recibir
        if (response) {
          let decryptedMember = decryptField(response, 'personalData');
          if (decryptedMember.contactInfo) {
            decryptedMember.contactInfo = decryptField(decryptedMember.contactInfo, 'email');
            decryptedMember.contactInfo = decryptField(decryptedMember.contactInfo, 'phone');
          }
          return decryptedMember;
        }
        return response;
      },
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
        
        // Cifrar campos sensibles antes de enviar
        const encryptedPerson = encryptField(person, 'personalData');
        if (encryptedPerson.contactInfo) {
          encryptedPerson.contactInfo = encryptField(encryptedPerson.contactInfo, 'email');
          encryptedPerson.contactInfo = encryptField(encryptedPerson.contactInfo, 'phone');
        }
        
        return {
          url: 'members/',
          method: 'POST',
          body: encryptedPerson,
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
        
        // Cifrar campos sensibles antes de enviar
        let encryptedPersonData = encryptField(personData, 'personalData');
        if (encryptedPersonData.contactInfo) {
          encryptedPersonData.contactInfo = encryptField(encryptedPersonData.contactInfo, 'email');
          encryptedPersonData.contactInfo = encryptField(encryptedPersonData.contactInfo, 'phone');
        }
        
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        // send the rest of the documents as a stringified json
        // without it, it sends all items as strings
        formData.append('doc', JSON.stringify(encryptedPersonData));

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

