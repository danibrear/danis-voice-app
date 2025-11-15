import { coreStyles, formStyles, spacingStyles } from "@/styles";
import { useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

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
    opacity.value = withTiming(0.1, { duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={[coreStyles.container, { backgroundColor: "transparent" }]}>
      <PageTitle title="" />
      <View
        style={[
          coreStyles.container,
          {
            marginTop: safeAreaContext?.top,
            backgroundColor: "transparent",
          },
        ]}>
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
            },
            animatedStyles,
          ]}
        />
        <RecentList
          style={{ flexGrow: 1, backgroundColor: "transparent" }}
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View
          style={[
            spacingStyles.px5,
            { marginBottom: 10, position: "relative" },
          ]}>
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
              marginTop: 10,
            }}
            labelStyle={formStyles.bigButton}
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
                };
                dispatch(createStoredText(newStoredText));
                setStoredText(newStoredText);
              }
              setTextInput("");
            }}>
            Show
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
