import PageTitle from "@/components/PageTitle";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";
import { darkTheme, theme } from "@/theme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
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
    if (Platform.OS === "web") {
      return;
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ReduxProvider store={store}>
        <RNPThemeProvider theme={colorScheme === "dark" ? darkTheme : theme}>
          <View
            style={{
              display: "flex",
              flex: 1,
              backgroundColor:
                colorScheme === "dark"
                  ? darkTheme.colors.background
                  : theme.colors.surfaceDisabled,
            }}>
            <PageTitle title="" />
            <View
              style={{
                display: "flex",
                flex: 1,
                maxWidth: 600,
                width: "100%",
                alignSelf: "center",
              }}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </View>
          </View>
        </RNPThemeProvider>
      </ReduxProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
