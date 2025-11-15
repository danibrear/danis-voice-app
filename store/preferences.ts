import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

export type PreferencesState = {
  darkModeEnabled?: boolean;
  speechRate: number;
  speechPitch: number;
  preferredVoice?: string;
  colors?: string;
};

const initialState: PreferencesState = {
  darkModeEnabled: undefined,
  speechRate: 1.0,
  speechPitch: 1.0,
  preferredVoice: undefined,
};

export const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPreferencesValues: (
      state,
      action: PayloadAction<Partial<PreferencesState>>,
    ) => {
      return { ...state, ...action.payload };
    },

    setPitch: (state, action: PayloadAction<number>) => {
      state.speechPitch = action.payload;
    },
    setRate: (state, action: PayloadAction<number>) => {
      state.speechRate = action.payload;
    },

    setPreferredVoice: (state, action: PayloadAction<string>) => {
      state.preferredVoice = action.payload;
    },
    setDarkmodeEnabled: (state, action: PayloadAction<boolean>) => {
      state.darkModeEnabled = action.payload;
    },

    setColors: (state, action: PayloadAction<string>) => {
      state.colors = action.payload;
    },

    clearValues: () => {
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setPreferencesValues,
  clearValues,
  setPitch,
  setRate,
  setPreferredVoice,
  setDarkmodeEnabled,
  setColors,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;

export const getPreferencesState = (state: RootState) => state.preferences;
