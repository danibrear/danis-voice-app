import RecentList from "@/components/RecentList";
import ShowingModal from "@/components/ShowingModal";
import { coreStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import ThemedView from "@/components/themed/ThemedView";
// @ts-expect-error this is a static asset
import Logo from "../../assets/images/splash-icon.png";
export default function TabTwoScreen() {
  const safeAreaContext = useContext(SafeAreaInsetsContext);

  const [storedText, setStoredText] = useState<StoredText | null>(null);
  const opacity = useSharedValue(0.5);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);
  useEffect(() => {
    opacity.value = withTiming(0.9, { duration: 600 });

    setTimeout(() => {
      opacity.value = withTiming(0.1, { duration: 600 });
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ThemedView style={coreStyles.container}>
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
