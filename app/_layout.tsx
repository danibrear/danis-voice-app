import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider as ReduxProvider } from "react-redux";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";
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
      <ReduxProvider store={store}>
        <RNPThemeProvider
          theme={colorScheme === "dark" ? MD2DarkTheme : MD2LightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RNPThemeProvider>
      </ReduxProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
