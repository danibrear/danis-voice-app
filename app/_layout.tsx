import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { StoredTextProvider } from "@/contexts/StoredTextContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { PrefContextProvider } from "@/contexts/PrefContext";
import {
  MD2DarkTheme,
  MD2LightTheme,
  ThemeProvider as RNPThemeProvider,
} from "react-native-paper";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <RNPThemeProvider
        theme={colorScheme === "dark" ? MD2DarkTheme : MD2LightTheme}>
        <PrefContextProvider>
          <StoredTextProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
          </StoredTextProvider>
        </PrefContextProvider>
      </RNPThemeProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
