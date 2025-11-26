import { RootState } from "@/store";
import { clearRecentMessages, getRecentMessages } from "@/store/chat";
import { StoredText } from "@/types/StoredText";
import { MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const HEIGHT = Dimensions.get("window").height;

export default function QuickScreen() {
  const navigator = useNavigation();
  const theme = useTheme();
  const { recentTexts } = useSelector((state: RootState) => state.storedTexts);
  const preferences = useSelector((state: RootState) => state.preferences);
  const recentMessages = useSelector(getRecentMessages);
  const [tab, setTab] = useState<"starred" | "chat">("starred");

  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();

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

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [tab]);

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

  const renderStarredTab = () => {
    if (tab !== "starred") {
      return null;
    }
    if (orderedStarredTexts.length === 0) {
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}>
          <Text>No starred texts available.</Text>
        </View>
      );
    }
    return orderedStarredTexts.map((text) => (
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
            name="stop-circle"
            size={16}
            color={theme.colors.tertiary}
          />
        )}
      </TouchableOpacity>
    ));
  };
  const renderChatHistoryTab = () => {
    if (tab !== "chat") {
      return null;
    }
    if (recentMessages.length === 0) {
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}>
          <Text>No recent chat messages available.</Text>
        </View>
      );
    }
    return (
      <View>
        {recentMessages.map((message, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              handleSay({ id: `chat-${index}`, text: message, starred: false });
            }}
            style={{
              marginVertical: 5,
              padding: 10,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor:
                isSpeakingId === `chat-${index}`
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
              {message}
            </Text>
            {isSpeakingId === `chat-${index}` && (
              <MaterialIcons
                name="stop-circle"
                size={16}
                color={theme.colors.tertiary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
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
            paddingVertical: 5,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "stretch",
            maxWidth: 400,
            width: "100%",
            marginHorizontal: "auto",
            maxHeight: HEIGHT * 0.5,
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <Button
              style={{ width: "50%" }}
              onPress={() => setTab("starred")}
              mode={tab === "starred" ? "contained" : "outlined"}>
              Starred
            </Button>
            <Button
              style={{ width: "50%" }}
              onPress={() => setTab("chat")}
              mode={tab === "chat" ? "contained" : "outlined"}>
              Chat history
            </Button>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{
              display: "flex",
              flexGrow: 1,
              height: "100%",
              alignSelf: "stretch",
            }}>
            {tab === "chat" && recentMessages.length > 0 && (
              <Button
                mode="outlined"
                style={{ marginBottom: 10, alignSelf: "flex-end" }}
                onPress={() => {
                  dispatch(clearRecentMessages());
                }}>
                Clear History
              </Button>
            )}
            {renderStarredTab()}
            {renderChatHistoryTab()}
            <View style={{ height: 60 }} />
          </ScrollView>
          <Button
            style={{ marginTop: 20, alignSelf: "stretch" }}
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
