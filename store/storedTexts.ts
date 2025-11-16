import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { StoredText } from "@/types/StoredText";

export type StoredTextsState = {
  recentTexts: StoredText[];
};

const initialState: StoredTextsState = {
  recentTexts: [],
};

export const storedTextsSlice = createSlice({
  name: "storedTexts",
  initialState,
  reducers: {
    setStoredTextsValues: (
      state,
      action: PayloadAction<Partial<StoredTextsState>>,
    ) => {
      return { ...state, ...action.payload };
    },

    addStoredText: (state, action: PayloadAction<string>) => {
      state.recentTexts = state.recentTexts.filter(
        (t) => t.text !== action.payload,
      );
      state.recentTexts.push({
        id: Date.now().toString(),
        text: action.payload,
        starred: false,
      });
    },

    createStoredText: (state, action: PayloadAction<StoredText>) => {
      const existing = state.recentTexts.find(
        (t) => t.text === action.payload.text,
      );
      state.recentTexts = state.recentTexts.filter(
        (t) => t.text !== action.payload.text,
      );
      const mergedText = existing
        ? { ...existing, ...action.payload }
        : action.payload;

      if (
        mergedText.order === null ||
        mergedText.order === undefined ||
        mergedText.order < 0 ||
        mergedText.order > state.recentTexts.length
      ) {
        mergedText.order = state.recentTexts.length;
      }
      state.recentTexts.push(mergedText);
    },

    updateStoredText: (state, action: PayloadAction<StoredText>) => {
      const index = state.recentTexts.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (index !== -1) {
        state.recentTexts[index] = action.payload;
      }
    },

    updatedStoredTextValue: (
      state,
      action: PayloadAction<{ id: string; value: string }>,
    ) => {
      const index = state.recentTexts.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (index !== -1) {
        state.recentTexts[index].text = action.payload.value;
      }
    },

    removeText: (state, action: PayloadAction<string>) => {
      state.recentTexts = state.recentTexts.filter(
        (t) => t.id !== action.payload,
      );
    },

    starText: (state, action: PayloadAction<string>) => {
      const index = state.recentTexts.findIndex((t) => t.id === action.payload);
      if (index !== -1) {
        state.recentTexts[index].starred = true;
      }
    },

    unstarText: (state, action: PayloadAction<string>) => {
      const index = state.recentTexts.findIndex((t) => t.id === action.payload);
      if (index !== -1) {
        state.recentTexts[index].starred = false;
      }
    },

    setStoredTextFontSize: (
      state,
      action: PayloadAction<{ id: string; fontSize: number | null }>,
    ) => {
      const index = state.recentTexts.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (index !== -1) {
        if (action.payload.fontSize === null) {
          delete state.recentTexts[index]?.fontSize;
          return;
        }
        state.recentTexts[index].fontSize = action.payload.fontSize;
      }
    },

    clearValues: () => {
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setStoredTextsValues,
  clearValues,
  starText,
  unstarText,
  addStoredText,
  updateStoredText,
  removeText,
  createStoredText,
  setStoredTextFontSize,
  updatedStoredTextValue,
} = storedTextsSlice.actions;

export default storedTextsSlice.reducer;

export const getStoredTextsState = (state: RootState) => state.storedTexts;

export const getStarredTexts = (state: RootState) => {
  return state.storedTexts.recentTexts.filter((t) => t.starred);
};
