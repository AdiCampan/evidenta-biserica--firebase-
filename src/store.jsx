import { configureStore } from '@reduxjs/toolkit';
import { churchesApi } from  './services/churches';
import { membersApi } from './services/members';
import { specialCasesApi } from './services/specialCases';
import { transfersApi } from './services/transfers';

export const store = configureStore({
  reducer: {
      // basic reducers - these should be removed

      // reducers using rtk query
      [churchesApi.reducerPath]: churchesApi.reducer,
      [membersApi.reducerPath]: membersApi.reducer,
      [specialCasesApi.reducerPath]: specialCasesApi.reducer,
      [transfersApi.reducerPath]: transfersApi.reducer,
      devTools: process.env.NODE_ENV !== 'production',
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([
    churchesApi.middleware,
    membersApi.middleware,
    specialCasesApi.middleware,
    transfersApi.middleware,
  ]),
});
