import RecentList from "@/components/RecentList";
import ShowingModal from "@/components/ShowingModal";
import { coreStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TabTwoScreen() {
  const [showText, setShowText] = useState<string | null>(null);
  return (
    <View style={coreStyles.container}>
      <SafeAreaView style={coreStyles.container}>
        <RecentList
          starred
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
