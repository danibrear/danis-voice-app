import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

export type PreferencesState = {
  darkModeEnabled?: boolean;
  speechRate: number;
  speechPitch: number;
  preferredVoice?: string;
  colors?: string;
  chatReturnKeySendsMessage?: boolean;
};

const initialState: PreferencesState = {
  darkModeEnabled: undefined,
  speechRate: 1.0,
  speechPitch: 1.0,
  preferredVoice: undefined,
  chatReturnKeySendsMessage: false,
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
    setChatReturnKeySendsMessage: (state, action: PayloadAction<boolean>) => {
      state.chatReturnKeySendsMessage = action.payload;
    },

    setPitch: (state, action: PayloadAction<number>) => {
      state.speechPitch = Math.min(2.0, Math.max(0.2, action.payload));
    },
    setRate: (state, action: PayloadAction<number>) => {
      state.speechRate = Math.min(2.0, Math.max(0.2, action.payload));
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
  setChatReturnKeySendsMessage,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;

export const getPreferencesState = (state: RootState) => state.preferences;
