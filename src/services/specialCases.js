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

export const specialCasesApi = createApi({
  reducerPath: 'specialCasesApi',
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
    tagTypes: ['specialCases', 'specialCase'],
    endpoints: (builder) => ({
      getSpecialCases: builder.query({
        query: () => `special-cases/`,
        providesTags: ['specialCases'],
        transformResponse: (response) => {
          // Descifrar datos sensibles al recibir
          if (Array.isArray(response)) {
            return response.map(specialCase => {
              // Descifrar campos sensibles
              let decryptedCase = decryptField(specialCase, 'details');
              decryptedCase = decryptField(decryptedCase, 'medicalInfo');
              return decryptedCase;
            });
          }
          return response;
        },
      }),
      addSpecialCase: builder.mutation({
        query: (specialCase) => {
          // Cifrar campos sensibles antes de enviar
          let encryptedCase = encryptField(specialCase, 'details');
          encryptedCase = encryptField(encryptedCase, 'medicalInfo');
          
          return {
            url: 'special-cases/',
            method: 'POST',
            body: encryptedCase,
          };
        },
        invalidatesTags: ['specialCases'], 
      }),
      modifySpecialCase: builder.mutation({
        query: (specialCase) => {
          // Cifrar campos sensibles antes de enviar
          let encryptedCase = encryptField(specialCase, 'details');
          encryptedCase = encryptField(encryptedCase, 'medicalInfo');
          
          return {
            url: `special-cases/${specialCase.id}`,
            method: 'PATCH',
            body: encryptedCase,
          };
        },
        invalidatesTags: ['specialCases', 'specialCase'],
      }),
    })
});

export const {
    useGetSpecialCasesQuery,
    useAddSpecialCaseMutation,
    useModifySpecialCaseMutation,
} = specialCasesApi;
