import { coreStyles, formStyles, spacingStyles } from "@/styles";
import { useContext, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import RecentList from "@/components/RecentList";
import ShowingModal from "@/components/ShowingModal";
import { addStoredText } from "@/store/storedTexts";
import { StoredText } from "@/types/StoredText";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");

  const [showText, setShowText] = useState<string | null>(null);

  const dispatch = useDispatch();

  const safeAreaContext = useContext(SafeAreaInsetsContext);

  return (
    <View style={coreStyles.container}>
      <View
        style={[
          coreStyles.container,
          {
            marginTop: safeAreaContext?.top,
          },
        ]}>
        <RecentList
          style={{ flexGrow: 1 }}
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
            contentStyle={{ fontSize: 18, fontWeight: "bold" }}
            mode="outlined"
            onChangeText={(t) => {
              setTextInput(t);
            }}
            placeholder="Type text to show"
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
