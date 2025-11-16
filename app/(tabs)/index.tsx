import { coreStyles, formStyles, spacingStyles } from "@/styles";
import { useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";

import RecentList from "@/components/RecentList";
import { createStoredText } from "@/store/storedTexts";
import { StoredText } from "@/types/StoredText";
import { Button, Icon, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
// @ts-expect-error this is a static asset
import Logo from "../../assets/images/splash-icon.png";

import PageTitle from "@/components/PageTitle";
import ShowingModal from "@/components/ShowingModal";
import ThemedView from "@/components/themed/ThemedView";
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");

  const dispatch = useDispatch();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [storedText, setStoredText] = useState<StoredText | null>(null);

  const storedTexts = useSelector((state: any) => state.storedTexts);

  const safeAreaContext = useContext(SafeAreaInsetsContext);
  const opacity = useSharedValue(0.5);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setError(null);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    opacity.value = withTiming(0.9, { duration: 600 });

    setTimeout(() => {
      opacity.value = withTiming(0.1, { duration: 600 });
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView
      style={[
        coreStyles.container,
        {
          flex: 1,
          height: 300,
        },
      ]}>
      <PageTitle title="" />

      <View
        style={[
          coreStyles.container,
          {
            marginTop: safeAreaContext?.top,
            backgroundColor: "transparent",
            flex: 1,
            zIndex: 2,
          },
        ]}>
        <RecentList
          style={{
            flexGrow: 1,
            display: "flex",
          }}
          onPress={(item: StoredText) => {
            setStoredText(item);
          }}
        />
        <ShowingModal
          storedText={storedText}
          onDone={() => {
            setStoredText(null);
          }}
        />
      </View>
      <KeyboardAvoidingView
        style={{
          flexShrink: 1,
          zIndex: 2,
          backgroundColor: theme.colors.surface,
        }}
        behavior="padding">
        <View style={[spacingStyles.px5, { marginBottom: 10 }]}>
          {error && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              exiting={FadeOutDown.duration(200)}
              style={{
                position: "absolute",
                top: -50,
                left: 5,
                right: 5,
                padding: 10,
                borderRadius: 5,
                borderColor: theme.colors.error,
                borderWidth: 1,
                backgroundColor: theme.colors.errorContainer,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}>
              <Icon
                source="alert-circle"
                color={theme.colors.error}
                size={20}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: theme.colors.error,
                }}>
                {error}
              </Text>
            </Animated.View>
          )}
          <TextInput
            value={textInput}
            clearButtonMode="always"
            outlineStyle={{ borderRadius: 5 }}
            contentStyle={{ fontSize: 18, fontWeight: "bold" }}
            mode="outlined"
            placeholderTextColor={
              theme.dark ? theme.colors.onSurface : theme.colors.backdrop
            }
            onChangeText={(t) => {
              setTextInput(t);
            }}
            placeholder="Type text to show..."
          />

          <Button
            mode="contained"
            style={{
              marginTop: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            contentStyle={{
              flexDirection: "row",
              width: "100%",
              alignItems: "center",
            }}
            labelStyle={[formStyles.bigButton]}
            onPress={() => {
              if (textInput.trim().length === 0) {
                setError("Please enter some text to show.");
                return;
              }
              const existing = storedTexts.recentTexts.find(
                (t: StoredText) => t.text === textInput,
              );
              if (existing) {
                setStoredText(existing);
              } else {
                const newStoredText: StoredText = {
                  id: Date.now().toString(),
                  text: textInput,
                  starred: false,
                  order: storedTexts.recentTexts.length,
                };
                dispatch(createStoredText(newStoredText));
                setStoredText(newStoredText);
              }
              setTextInput("");
            }}>
            <Text
              style={{
                color: theme.colors.onPrimary,
                fontSize: 18,
                fontWeight: "bold",
                flexGrow: 1,
                width: "100%",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
              Show
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
      <Animated.Image
        source={Logo}
        style={[
          {
            position: "absolute",
            width: "80%",
            height: "80%",
            left: "10%",
            top: "10%",
            resizeMode: "contain",
            opacity: 0.1,
            zIndex: 1,
          },
          animatedStyles,
        ]}
      />
    </ThemedView>
  );
}
