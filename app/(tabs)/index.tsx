import { coreStyles, formStyles, spacingStyles } from "@/styles";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RecentList from "@/components/RecentList";
import ShowingModal from "@/components/ShowingModal";
import { useRecentContext } from "@/hooks/useRecentContext";
import { StoredText } from "@/types/StoredText";
import { Button, TextInput } from "react-native-paper";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");

  const [showText, setShowText] = useState<string | null>(null);

  const { addRecentText } = useRecentContext();

  return (
    <View style={coreStyles.container}>
      <SafeAreaView style={[coreStyles.container]}>
        <View
          style={[
            spacingStyles.px5,
            {
              paddingBottom: 10,
              marginBottom: 10,
            },
          ]}>
          <TextInput
            value={textInput}
            clearButtonMode="always"
            multiline
            mode="outlined"
            style={{ padding: 0 }}
            onChangeText={(t) => {
              setTextInput(t);
            }}
            placeholder="Enter Text"
          />

          <Button
            mode="contained"
            style={{
              marginTop: 10,
            }}
            labelStyle={formStyles.bigButton}
            onPress={() => {
              addRecentText(textInput);
              setShowText(textInput);
              setTextInput("");
            }}>
            Show
          </Button>
        </View>
        <RecentList
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
      </SafeAreaView>
    </View>
  );
}
