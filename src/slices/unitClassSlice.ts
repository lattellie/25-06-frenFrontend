import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UnitClass {
  class: string;
  units: string[];
}

interface UnitClassState {
  data: UnitClass[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitClassState = {
  data: [],
  loading: false,
  error: null,
};

// 🧠 Async Thunk: Fetch Unit-Class Data from backend
export const fetchUnitClassData = createAsyncThunk<UnitClass[]>(
  'unitClass/fetchUnitClassData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('http://localhost:3001/class-units');
      const json = await res.json();

      if (!json.success) {
        return rejectWithValue(json.message || 'Failed to fetch class-units');
      }

      return json.data as UnitClass[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const unitClassSlice = createSlice({
  name: 'unitClass',
  initialState,
  reducers: {
    // Optional: manual setter
    setUnitClassData: (state, action: PayloadAction<UnitClass[]>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnitClassData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnitClassData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchUnitClassData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUnitClassData } = unitClassSlice.actions;
export default unitClassSlice.reducer;
