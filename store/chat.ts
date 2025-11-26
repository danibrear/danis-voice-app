import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

export type ChatState = {
  recentMessages?: string[];
};

const initialState: ChatState = {
  recentMessages: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addRecentMessage: (state, action: PayloadAction<string>) => {
      if (!state.recentMessages) {
        state.recentMessages = [];
      }
      state.recentMessages.unshift(action.payload);
      if (state.recentMessages.length > 50) {
        state.recentMessages.pop();
      }
    },
    clearRecentMessages: (state) => {
      state.recentMessages = [];
    },
  },
});

export const { addRecentMessage, clearRecentMessages } = chatSlice.actions;

export default chatSlice.reducer;

export const getChatState = (state: RootState) => state.chat;

export const getRecentMessages = (state: RootState) => {
  return state.chat.recentMessages || [];
};
