import { useSpeech } from "@/hooks/useSpeech";
import { RootState } from "@/store";
import { clearRecentMessages, getRecentMessages } from "@/store/chat";
import { StoredText } from "@/types/StoredText";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const Dims = Dimensions.get("window");
const HEIGHT = Dims.height;
const WIDTH = Dims.width;

export default function QuickScreen() {
  const navigator = useNavigation();
  const theme = useTheme();
  const { recentTexts } = useSelector((state: RootState) => state.storedTexts);
  const recentMessages = useSelector(getRecentMessages);
  const [tab, setTab] = useState<"phrases" | "chat">("phrases");
  const [starredOnly, setStarredOnly] = useState(false);

  const [orderedPhrases, setOrderedPhrases] = useState<StoredText[]>([]);
  const [starredTexts, setStarredTexts] = useState<StoredText[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();

  const { handleSay, isSpeakingId } = useSpeech();

  const [recentDirection, setRecentDirection] = useState<"asc" | "desc">(
    "desc",
  );

  useEffect(() => {
    try {
      if (!recentTexts || recentTexts.length === 0) {
        setOrderedPhrases([]);
        setStarredTexts([]);
        return;
      }
      let recent = [...recentTexts];
      setOrderedPhrases(recent.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setStarredTexts(recent.filter((text) => text.starred));
    } catch (e) {
      console.log("[ERROR] Failed to sort recent texts:", e);
      setOrderedPhrases(recentTexts || []);
      setStarredTexts(recentTexts.filter((text) => text.starred));
    }
  }, [recentTexts]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [tab]);

  const renderButton = (text: StoredText) => {
    return (
      <TouchableOpacity
        key={text.id}
        onPress={() => {
          handleSay(text);
        }}
        style={{
          marginVertical: 5,
          padding: 10,
          borderWidth: 1,
          borderColor:
            isSpeakingId === text.id
              ? theme.colors.tertiary
              : theme.colors.primary,
          borderRadius: 5,
          display: "flex",
          alignSelf: "stretch",
          flexDirection: "row",
          flexShrink: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.surfaceDisabled,
        }}>
        <Text
          style={{
            fontWeight: "bold",
            flexShrink: 1,
          }}>
          {text.text}
        </Text>
        <View
          style={{
            display: "flex",
            flexShrink: 1,
            opacity: isSpeakingId === text.id ? 1 : 0,
          }}>
          <MaterialIcons
            name="stop-circle"
            size={16}
            color={theme.colors.tertiary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderPhrasesTab = () => {
    if (tab !== "phrases") {
      return null;
    }
    const phrases = starredOnly ? starredTexts : orderedPhrases;
    if (phrases.length === 0) {
      const starred = starredOnly ? "starred " : "";
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}>
          <Text>No {starred}phrases available.</Text>
        </View>
      );
    }
    return phrases.map((text) => renderButton(text));
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
    const messagesOrder =
      recentDirection === "asc"
        ? recentMessages
        : [...recentMessages].reverse();
    return (
      <View>
        {messagesOrder.map((message, index) =>
          renderButton({
            id: `chat-message-${index}`,
            text: message,
            starred: false,
          }),
        )}
      </View>
    );
  };
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
            maxWidth: Math.min(HEIGHT, WIDTH),
            width: "90%",
            marginHorizontal: "auto",
            height: "90%",
            maxHeight: Math.min(HEIGHT, WIDTH),
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              gap: 10,
              marginBottom: 10,
            }}>
            <Button
              style={{ width: "50%" }}
              onPress={() => setTab("phrases")}
              mode={tab === "phrases" ? "contained" : "outlined"}>
              Phrases
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}>
                <Button
                  mode="outlined"
                  contentStyle={{
                    flexDirection: "row-reverse",
                  }}
                  icon={(props) => (
                    <MaterialIcons
                      name={
                        recentDirection === "asc"
                          ? "arrow-upward"
                          : "arrow-downward"
                      }
                      {...props}
                    />
                  )}
                  onPress={() => {
                    setRecentDirection((s) => (s === "asc" ? "desc" : "asc"));
                  }}>
                  Sort
                </Button>
                <Button
                  mode="outlined"
                  style={{ alignSelf: "flex-end" }}
                  onPress={() => {
                    dispatch(clearRecentMessages());
                  }}>
                  Clear History
                </Button>
              </View>
            )}
            {tab === "phrases" && orderedPhrases.length > 0 && (
              <Button
                mode="outlined"
                icon={(props) => (
                  <MaterialIcons
                    name={starredOnly ? "star" : "star-outline"}
                    {...props}
                    color={starredOnly ? theme.colors.tertiary : props.color}
                  />
                )}
                style={{ marginBottom: 10, alignSelf: "flex-end" }}
                onPress={() => {
                  setStarredOnly((s) => !s);
                }}>
                Starred
              </Button>
            )}
            {renderPhrasesTab()}
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
