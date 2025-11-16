import CrossView from "@/components/CrossView";
import CustomMenu from "@/components/CustomMenu";
import ThemedView from "@/components/themed/ThemedView";
import { RootState } from "@/store";
import { createStoredText } from "@/store/storedTexts";
import { coreStyles } from "@/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
export default function ChatPage() {
  const theme = useTheme();

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const preferences = useSelector((state: RootState) => state.preferences);

  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const parentRef = useRef(null);

  const [menuMessageIdx, setMenuMessageIdx] = useState<number | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isShowMode, setIsShowMode] = useState(false);

  const [angle, setAngle] = useState(0);

  const handleSendMessage = async () => {
    if (input.trim() === "") {
      return;
    }
    await handleSay(input.trim());
    const newMessages = [...messages, input.trim()];
    setMessages(newMessages);
    setInput("");
  };

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1]);
    }
  }, [messages]);

  useEffect(() => {
    if (!isSpeaking || messages.length === 0) {
      setIsSpeaking(false);
      return;
    }
    const interval = setInterval(async () => {
      if (!(await Speech.isSpeakingAsync())) {
        setIsSpeaking(false);
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isSpeaking, messages]);

  const handleSay = async (message: string) => {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
    });
    Speech.speak(message, {
      voice: preferences.preferredVoice,
      pitch: preferences.speechPitch,
      rate: preferences.speechRate,
    });
    setLastMessage(message);
    setIsSpeaking(true);
  };

  const getFontSize = () => {
    if (angle === 180) {
      if (lastMessage) {
        if (lastMessage.length > 100) {
          return 25;
        }
        if (lastMessage.length > 50) {
          return 30;
        }
        return 40;
      }
      return 50;
    }
    if (angle === 0) {
      return 100;
    }
    return 80;
  };

  return (
    <ThemedView style={[coreStyles.container, { position: "relative" }]}>
      <CrossView
        /* @ts-expect-error */
        ref={parentRef}
        onTouchStart={(e) => {
          if (menuMessageIdx !== null) {
            e.stopPropagation();
            e.preventDefault();
            setMenuMessageIdx(null);
          }
        }}
        onClick={(e) => {
          if (menuMessageIdx !== null) {
            e.stopPropagation();
            e.preventDefault();
            setMenuMessageIdx(null);
          }
        }}
        style={[
          coreStyles.container,
          {
            paddingTop: safeAreaInsets?.top,
            marginBottom: 0,
          },
        ]}>
        {isShowMode && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "black",
              zIndex: 1000,
              paddingTop: safeAreaInsets?.top,
            }}>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                flex: 1,
              }}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={3}
                allowFontScaling={true}
                style={{
                  transform: [
                    { rotate: `${angle}deg` },
                    { scaleY: angle === 180 ? 4 : 1 },
                  ],
                  color: "white",
                  fontSize: getFontSize(),
                  textAlign: "center",
                  marginHorizontal: 10,
                  fontWeight: "bold",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}>
                {input.trim().length === 0 ? lastMessage : input.trim()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}>
              <IconButton
                onPress={() => setAngle(90)}
                mode={angle === 90 ? "contained" : undefined}
                icon={(props) => (
                  <MaterialIcons
                    name="rotate-left"
                    {...props}
                    color={angle === 90 ? theme.colors.tertiary : "white"}
                  />
                )}
                size={30}
              />
              <IconButton
                onPress={() => setAngle(180)}
                mode={angle === 180 ? "contained" : undefined}
                icon={(props) => (
                  <MaterialIcons
                    name="arrow-upward"
                    {...props}
                    color={angle === 180 ? theme.colors.tertiary : "white"}
                  />
                )}
                size={30}
              />
              <IconButton
                onPress={() => setAngle(0)}
                mode={angle === 0 ? "contained" : undefined}
                icon={(props) => (
                  <MaterialIcons
                    name="arrow-downward"
                    {...props}
                    color={angle === 0 ? theme.colors.tertiary : "white"}
                  />
                )}
                size={30}
              />
              <IconButton
                onPress={() => setAngle(-90)}
                mode={angle === -90 ? "contained" : undefined}
                icon={(props) => (
                  <MaterialIcons
                    name="rotate-right"
                    {...props}
                    color={angle === -90 ? theme.colors.tertiary : "white"}
                  />
                )}
                size={30}
              />
              <IconButton
                onPress={() => {
                  setIsShowMode(false);
                  setAngle(0);
                }}
                icon={(props) => (
                  <MaterialIcons name="close" {...props} color="white" />
                )}
              />
            </View>
          </View>
        )}
        <View style={{ position: "absolute", bottom: 5, right: 5, zIndex: 3 }}>
          {isSpeaking && (
            <Button
              mode="outlined"
              icon={(props) => (
                <MaterialIcons name={"stop-circle"} {...props} />
              )}
              onPress={() => {
                if (isSpeaking) {
                  Speech.stop();
                  setIsSpeaking(false);
                }
              }}>
              Stop
            </Button>
          )}
        </View>
        <View
          style={{
            flexGrow: 1,

            justifyContent: messages.length === 0 ? "center" : "flex-start",
          }}>
          {messages.length === 0 && (
            <Card style={{ margin: 20, borderRadius: 10, alignSelf: "center" }}>
              <Card.Content>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                    color: theme.colors.onSurfaceVariant,
                  }}>
                  Chat lets you speak messages quickly without saving them to
                  your recent list.
                </Text>
                <Divider style={{ marginVertical: 10 }} />
                <Text style={{ textAlign: "center" }}>
                  Just type your message below and hit send to hear it spoken
                  aloud.
                </Text>

                <Text
                  style={{
                    textAlign: "right",
                    marginTop: 20,
                  }}>{`Thank you for using my voice app!`}</Text>
                <View
                  style={{
                    marginTop: 5,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 3,
                  }}>
                  <MaterialIcons
                    name="favorite"
                    size={15}
                    color={theme.colors.tertiary}
                  />
                  <Text
                    style={{
                      textAlign: "right",
                      fontWeight: "200",
                    }}>
                    DaniB
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
          {messages.length > 0 && (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>
                <Button
                  onPress={() => {
                    setMessages([]);
                  }}>
                  Clear Chat
                </Button>
                <Button
                  onPress={() => {
                    setIsShowMode(true);
                  }}>
                  Show Mode
                </Button>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{
                  flexGrow: 1,
                }}>
                <View
                  style={{
                    flex: 1,
                    alignSelf: "stretch",
                    alignItems: "flex-end",
                  }}>
                  {messages.map((message, index) => (
                    <View
                      key={`chat-message${index}`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 10,
                        marginVertical: 5,
                      }}>
                      <IconButton
                        icon={(props) => (
                          <MaterialIcons name="replay" {...props} size={25} />
                        )}
                        onPress={() => {
                          handleSay(message);
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: theme.colors.background,
                          borderWidth: 1,
                          borderColor: theme.colors.outline,
                          paddingHorizontal: 10,
                          paddingVertical: 15,
                          marginVertical: 5,
                          borderRadius: 50,
                          padding: 0,
                          flexShrink: 1,
                        }}>
                        <Text>{message}</Text>
                      </View>
                      <IconButton
                        icon={(props) => (
                          <MaterialIcons
                            name="more-vert"
                            {...props}
                            size={25}
                          />
                        )}
                        onPress={(event) => {
                          setMenuMessageIdx(index);
                          setMenuAnchor({
                            x: event.nativeEvent.pageX,
                            y: event.nativeEvent.pageY,
                          });
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View style={{ height: 200 }} />
              </ScrollView>
            </View>
          )}
        </View>
        <Text>{menuMessageIdx}</Text>
        <CustomMenu
          parentRef={parentRef}
          visible={menuMessageIdx !== null}
          menuAnchor={menuAnchor}
          setIsLongPressing={function (value: boolean): void {
            return;
          }}>
          <Menu.Item
            onPress={() => {
              dispatch(
                createStoredText({
                  id: new Date().getTime().toString(),
                  text: messages[menuMessageIdx ?? 0],
                  starred: false,
                  order: -1,
                }),
              );
              setMenuMessageIdx(null);
            }}
            title="Save to Recents"
          />
          <Menu.Item
            onPress={() => {
              const newMessages = messages.filter(
                (_, i) => i !== menuMessageIdx,
              );
              setMessages(newMessages);
              setMenuMessageIdx(null);
            }}
            title="Delete"
          />
        </CustomMenu>
      </CrossView>

      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flexShrink: 1,
          zIndex: 2,
          paddingTop: 5,
          paddingHorizontal: 10,
          alignItems: "center",
          borderTopColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          width: "100%",
          flexWrap: "nowrap",
        }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flexGrow: 1,
            alignItems: "center",
            flexWrap: "nowrap",
            width: "100%",
          }}>
          <View style={{ flex: 1, marginBottom: 3 }}>
            <TextInput
              mode="outlined"
              placeholder="Message..."
              value={input}
              onChangeText={(t) => {
                if (t === "\n") {
                  setInput("");
                  Keyboard.dismiss();
                  return;
                }
                if (t.includes("\n")) {
                  handleSendMessage();
                  return;
                }
                setInput(t);
              }}
              multiline
              returnKeyType="send"
              outlineStyle={{ borderRadius: 8 }}
              style={{ flexShrink: 1 }}
            />
          </View>
          <IconButton
            mode="contained"
            containerColor={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
            disabled={input.trim() === ""}
            icon={(props) => <MaterialIcons name="arrow-upward" {...props} />}
            style={{ marginLeft: 10 }}
            onPress={handleSendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
