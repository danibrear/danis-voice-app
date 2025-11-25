import { RootState } from "@/store";
import { StoredText } from "@/types/StoredText";
import { MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function QuickScreen() {
  const navigator = useNavigation();
  const theme = useTheme();
  const { recentTexts } = useSelector((state: RootState) => state.storedTexts);
  const preferences = useSelector((state: RootState) => state.preferences);

  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSpeakingId) {
      setIsSpeakingId(null);
      return;
    }
    const interval = setInterval(async () => {
      if (!(await Speech.isSpeakingAsync())) {
        setIsSpeakingId(null);
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isSpeakingId]);

  const handleSay = async (text: StoredText) => {
    await AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
    });
    if (isSpeakingId !== null) {
      Speech.stop();
    }
    if (isSpeakingId === text.id) {
      setIsSpeakingId(null);
      return;
    }

    setIsSpeakingId(text.id);

    Speech.speak(text.text || "", {
      voice: preferences.preferredVoice,
      rate: preferences.speechRate,
      pitch: preferences.speechPitch,
      onDone: () => {
        if (isSpeakingId === text.id) {
          setIsSpeakingId(null);
        }
      },
      onError: () => {
        if (isSpeakingId === text.id) {
          setIsSpeakingId(null);
        }
      },
    });
  };

  const starredTexts = recentTexts.filter((text) => text.starred);
  const orderedStarredTexts = starredTexts.sort(
    (a, b) => (b.order || 0) - (a.order || 0),
  );
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.75)",
        }}
        onTouchStart={(e) => {
          if (navigator.canGoBack()) {
            navigator.goBack();
          }
        }}>
        <View
          style={{
            padding: 20,
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "stretch",
            maxWidth: 400,
            width: "100%",
            marginHorizontal: "auto",
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          {orderedStarredTexts.length === 0 && (
            <Text>No starred texts available.</Text>
          )}
          <ScrollView
            style={{
              display: "flex",
              flexGrow: 1,
              maxHeight: 400,
              alignSelf: "stretch",
            }}>
            {orderedStarredTexts.map((text) => (
              <TouchableOpacity
                key={text.id}
                onPress={() => {
                  handleSay(text);
                }}
                style={{
                  marginVertical: 5,
                  padding: 10,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor:
                    isSpeakingId === text.id
                      ? theme.colors.tertiary
                      : theme.colors.primary,
                  borderRadius: 50,
                  display: "flex",
                  alignSelf: "stretch",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: theme.colors.surfaceDisabled,
                }}>
                <Text
                  style={{
                    fontWeight: "bold",
                  }}>
                  {text.text}
                </Text>
                {isSpeakingId === text.id && (
                  <MaterialIcons
                    name="volume-up"
                    size={16}
                    color={theme.colors.tertiary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <View style={{ height: 60 }} />
          </ScrollView>
          <Button
            style={{ marginTop: 20 }}
            mode="contained"
            onPress={() => {
              if (navigator.canGoBack()) {
                navigator.goBack();
              }
            }}>
            Close
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}
