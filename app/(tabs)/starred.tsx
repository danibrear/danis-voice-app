import RecentList from "@/components/RecentList";
import ShowingModal from "@/components/ShowingModal";
import { coreStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { useContext, useState } from "react";
import { View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
export default function TabTwoScreen() {
  const [showText, setShowText] = useState<string | null>(null);
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
          starred
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
    </View>
  );
}
