import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

export type ChatState = {
  recentMessages?: {
    text: string;
    voiceId?: string;
  }[];
};

const initialState: ChatState = {
  recentMessages: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addRecentMessage: (
      state,
      action: PayloadAction<{ text: string; voiceId?: string }>,
    ) => {
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
  const messages = (state.chat.recentMessages || []) as unknown as (
    | { text: string; voiceId?: string }
    | string
  )[];
  return messages.map((m): { text: string; voiceId?: string } =>
    typeof m === "string" ? { text: m } : m,
  );
};
