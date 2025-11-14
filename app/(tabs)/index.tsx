import { coreStyles, formStyles, spacingStyles } from "@/styles";
import { useContext, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, View } from "react-native";

import RecentList from "@/components/RecentList";
import ShowingModal from "@/components/ShowingModal";
import { addStoredText } from "@/store/storedTexts";
import { StoredText } from "@/types/StoredText";
import { Button, TextInput, useTheme } from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
// @ts-expect-error this is a static asset
import Logo from "../../assets/images/splash-icon.png";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");

  const [showText, setShowText] = useState<string | null>(null);

  const dispatch = useDispatch();
  const theme = useTheme();

  const safeAreaContext = useContext(SafeAreaInsetsContext);

  return (
    <View style={[coreStyles.container, { backgroundColor: "transparent" }]}>
      <View
        style={[
          coreStyles.container,
          {
            marginTop: safeAreaContext?.top,
            backgroundColor: "transparent",
          },
        ]}>
        <Image
          source={Logo}
          style={{
            position: "absolute",
            width: "120%",
            height: "120%",
            left: "-10%",
            top: "-10%",
            resizeMode: "contain",
            opacity: 0.1,
          }}
        />
        <RecentList
          style={{ flexGrow: 1, backgroundColor: "transparent" }}
          onPress={(item: StoredText) => {
            setShowText(item.text);
          }}
        />
        <ShowingModal
          text={showText}
          onDone={() => {
            setShowText(null);
          }}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[spacingStyles.px5, { marginBottom: 10 }]}>
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
              dispatch(addStoredText(textInput));
              setShowText(textInput);
              setTextInput("");
            }}>
            Show
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
