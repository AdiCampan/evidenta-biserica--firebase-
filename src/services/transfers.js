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

export const transfersApi = createApi({
  reducerPath: 'transfersApi',
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
    tagTypes: ['transfers', 'tranfer'],
    endpoints: (builder) => ({
      getTransfers: builder.query({
        query: () => `transfers/`,
        providesTags: ['transfers'],
        transformResponse: (response) => {
          // Descifrar datos sensibles al recibir
          if (Array.isArray(response)) {
            return response.map(transfer => {
              // Descifrar campos sensibles
              let decryptedTransfer = decryptField(transfer, 'details');
              decryptedTransfer = decryptField(decryptedTransfer, 'docNumber');
              return decryptedTransfer;
            });
          }
          return response;
        },
      }),
      addTransfer: builder.mutation({
        query: (transfer) => {
          // Cifrar campos sensibles antes de enviar
          let encryptedTransfer = encryptField(transfer, 'details');
          encryptedTransfer = encryptField(encryptedTransfer, 'docNumber');
          
          return {
            url: 'transfers/',
            method: 'POST',
            body: encryptedTransfer,
          };
        },
        invalidatesTags: ['transfers'], 
      }),
      delTransfer: builder.mutation({
        query: (id) => ({
          url: `transfers/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['transfers'],
      }),
    })
});

export const {
    useGetTransfersQuery,
    useAddTransferMutation,
    useDelTransferMutation,
} = transfersApi;
