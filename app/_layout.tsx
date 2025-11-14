import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";
import { darkTheme, theme } from "@/theme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ThemeProvider as RNPThemeProvider } from "react-native-paper";
import "react-native-reanimated";
import { Provider as ReduxProvider } from "react-redux";
export const unstable_settings = {
  anchor: "(tabs)",
};

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ReduxProvider store={store}>
        <RNPThemeProvider theme={colorScheme === "dark" ? darkTheme : theme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RNPThemeProvider>
      </ReduxProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
