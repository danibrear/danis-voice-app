import PageTitle from "@/components/PageTitle";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";
import { darkTheme, theme } from "@/theme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as QuickActions from "expo-quick-actions";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Button,
  Dialog,
  PaperProvider,
  ThemeProvider as RNPThemeProvider,
  Text,
} from "react-native-paper";
import "react-native-reanimated";
import { Provider as ReduxProvider } from "react-redux";

import { RouterAction, useQuickActionRouting } from "expo-quick-actions/router";
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

  const [updateAvailable, setUpdateAvailable] = useState(false);

  useQuickActionRouting();

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);
  }, []);

  useEffect(() => {
    QuickActions.setItems<RouterAction>([
      {
        id: "1",
        title: "New Chat",
        subtitle: "Open a quick chat",
        icon: "message",
        params: { href: "(tabs)/chat" },
      },
    ]);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    const interval = setInterval(() => {
      Updates.checkForUpdateAsync().then(async (update) => {
        if (update.isAvailable) {
          setUpdateAvailable(true);
        }
      });
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ReduxProvider store={store}>
          <PaperProvider>
            <RNPThemeProvider
              theme={colorScheme === "dark" ? darkTheme : theme}>
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
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </View>
                <Dialog visible={updateAvailable}>
                  <Dialog.Content>
                    <Text>
                      There is an update available. Please restart the app to
                      apply the update.
                    </Text>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button
                      mode="contained"
                      labelStyle={{
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                      onPress={async () => {
                        try {
                          setUpdateAvailable(false);
                          await Updates.fetchUpdateAsync();
                          await Updates.reloadAsync();
                        } catch (e) {
                          console.log("[ERROR] Error updating app:", e);
                        }
                      }}>
                      RESTART
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </View>
            </RNPThemeProvider>
          </PaperProvider>
        </ReduxProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
