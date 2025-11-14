import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storedTextsReducer from "./storedTexts";
import preferencesReducer from "./preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";

const persistPreferencesConfig = {
  key: "preferencesProfile",
  storage: AsyncStorage,
};
const persistStoredTextsConfig = {
  key: "storedTexts",
  storage: AsyncStorage,
};

const persistedPreferencesReducer = persistReducer(
  persistPreferencesConfig,
  preferencesReducer,
);
const persistedStoredTextsReducer = persistReducer(
  persistStoredTextsConfig,
  storedTextsReducer,
);

export const store = configureStore({
  reducer: {
    preferences: persistedPreferencesReducer,
    storedTexts: persistedStoredTextsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "preferences/setPreferencesValues",
          "persist/PERSIST",
          "persist/REHYDRATE",
          "register/*",
        ],
      },
    });
  },
});

export const persistedStore = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
