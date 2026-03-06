import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

export type TranslationPersonality = {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  voiceId?: string;
};

export type PreferencesState = {
  darkModeEnabled?: boolean;
  speechRate: number;
  speechPitch: number;
  preferredVoice?: string;
  colors?: string;
  chatReturnKeySendsMessage?: boolean;
  devToolsEnabled?: boolean;
  favoriteVoiceIds?: string[];
  translateSourceLang?: string;
  translateTargetLang?: string;
  translateVoice?: string;
  translationPersonalities?: TranslationPersonality[];
  translationEnabled?: boolean;
};

const initialState: PreferencesState = {
  darkModeEnabled: undefined,
  speechRate: 1.0,
  speechPitch: 1.0,
  preferredVoice: undefined,
  chatReturnKeySendsMessage: false,
  devToolsEnabled: false,
  favoriteVoiceIds: [],
  translateVoice: undefined,
  translateSourceLang: "en",
  translateTargetLang: "es",
  translationPersonalities: [],
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

    setDevtoolsEnabled: (state, action: PayloadAction<boolean>) => {
      state.devToolsEnabled = action.payload;
    },

    addFavoriteVoiceId: (state, action: PayloadAction<string>) => {
      if (!state.favoriteVoiceIds) {
        state.favoriteVoiceIds = [];
      }
      if (!state.favoriteVoiceIds.includes(action.payload)) {
        state.favoriteVoiceIds.push(action.payload);
      }
    },
    removeFavoriteVoiceId: (state, action: PayloadAction<string>) => {
      if (!state.favoriteVoiceIds) {
        return;
      }
      state.favoriteVoiceIds = state.favoriteVoiceIds.filter(
        (id) => id !== action.payload,
      );
    },

    setTranslateLanguages: (
      state,
      action: PayloadAction<{
        sourceLang: string;
        targetLang: string;
        voiceId?: string;
      }>,
    ) => {
      state.translateSourceLang = action.payload.sourceLang;
      state.translateTargetLang = action.payload.targetLang;
      state.translateVoice = action.payload.voiceId;
    },

    addTranslationPersonality: (
      state,
      action: PayloadAction<TranslationPersonality>,
    ) => {
      if (!state.translationPersonalities) state.translationPersonalities = [];
      state.translationPersonalities.push(action.payload);
    },

    updateTranslationPersonality: (
      state,
      action: PayloadAction<TranslationPersonality>,
    ) => {
      if (!state.translationPersonalities) return;
      const idx = state.translationPersonalities.findIndex(
        (p) => p.id === action.payload.id,
      );
      if (idx !== -1) state.translationPersonalities[idx] = action.payload;
    },

    deleteTranslationPersonality: (state, action: PayloadAction<string>) => {
      if (!state.translationPersonalities) return;
      state.translationPersonalities = state.translationPersonalities.filter(
        (p) => p.id !== action.payload,
      );
    },

    setTranslationEnabled: (state, action: PayloadAction<boolean>) => {
      state.translationEnabled = action.payload;
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
  setDevtoolsEnabled,
  addFavoriteVoiceId,
  removeFavoriteVoiceId,
  setTranslateLanguages,
  addTranslationPersonality,
  updateTranslationPersonality,
  deleteTranslationPersonality,
  setTranslationEnabled,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;

export const getPreferencesState = (state: RootState) => state.preferences;
export const getDevToolsEnabled = (state: RootState) =>
  !!state.preferences.devToolsEnabled;
export const getFavoriteVoiceIds = (state: RootState) =>
  state.preferences.favoriteVoiceIds || [];
export const getTranslationPersonalities = (state: RootState) =>
  state.preferences.translationPersonalities || [];
