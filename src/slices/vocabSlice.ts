import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { VocabBackend } from '../type/vocabDD';


interface VocabState {
  data: VocabBackend[];
  filteredData: VocabBackend[];
  loading: boolean;
  error: string | null;
}

const initialState: VocabState = {
  data: [],
  filteredData: [],
  loading: false,
  error: null,
};

export const fetchVocabData = createAsyncThunk<
  VocabBackend[],
  { className: string; unitName: string },
  { rejectValue: string }
>(
  'vocab/fetchVocabData',
  async ({ className, unitName }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND}/vocab-by-class-unit?class=${encodeURIComponent(className)}&unit=${encodeURIComponent(unitName)}`
      );
      const json = await res.json();

      if (!json.success) {
        return rejectWithValue(json.message || 'Failed to fetch vocab');
      }
      return json.data as VocabBackend[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const vocabSlice = createSlice({
  name: 'vocab',
  initialState,
  reducers: {
    // Optional manual setter
    setVocabData: (state, action: PayloadAction<VocabBackend[]>) => {
      state.data = action.payload;
    },
    updateFilteredData: (state, action: PayloadAction<VocabBackend[]>) => {
      state.filteredData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVocabData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVocabData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchVocabData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { setVocabData, updateFilteredData } = vocabSlice.actions;
export default vocabSlice.reducer;
