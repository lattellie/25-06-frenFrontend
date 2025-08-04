import { configureStore } from '@reduxjs/toolkit';
import vocabReducer from '../slices/vocabSlice';
import unitClassReducer from '../slices/unitClassSlice';

export const store = configureStore({
  reducer: {
    vocab: vocabReducer,
    unitClass: unitClassReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
