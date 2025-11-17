import CrossView from "@/components/CrossView";
import ThemedView from "@/components/themed/ThemedView";
import { RootState } from "@/store";
import { createStoredText } from "@/store/storedTexts";
import { coreStyles } from "@/styles";
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
// @ts-expect-error this is a static asset
import Logo from "../../assets/images/splash-icon.png";
export default function ChatPage() {
  const theme = useTheme();

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const preferences = useSelector((state: RootState) => state.preferences);

  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const parentRef = useRef(null);

  const [menuMessageIdx, setMenuMessageIdx] = useState<number | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isShowMode, setIsShowMode] = useState(false);
  const [keyboardActive, setKeyboardActive] = useState(false);

  const [angle, setAngle] = useState(0);
  const messagesEndRef = useRef<ScrollView>(null);

  const handleSendMessage = async () => {
    if (input.trim() === "") {
      return;
    }
    await handleSay(input.trim());
    const newMessages = [...messages, input.trim()];
    setMessages(newMessages);
    setInput("");
    setTimeout(() => {
      messagesEndRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  useEffect(() => {
    setKeyboardActive(Keyboard.isVisible());
  }, []);

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
        {isShowMode && (messages.length > 0 || input.trim().length > 0) && (
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
                    { scaleY: angle === 180 ? 3 : 1 },
                  ],
                  lineHeight: angle === 180 ? 55 : 100,
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
          {isPaused && (
            <Button
              mode="outlined"
              icon={(props) => <MaterialIcons name={"play-arrow"} {...props} />}
              onPress={() => {
                if (isPaused) {
                  Speech.resume();
                  setIsSpeaking(true);
                  setIsPaused(false);
                }
              }}>
              Resume
            </Button>
          )}
          {isSpeaking && (
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Button
                mode="outlined"
                contentStyle={{ backgroundColor: theme.colors.surface }}
                icon={(props) => <MaterialIcons name={"pause"} {...props} />}
                onPress={() => {
                  if (isSpeaking) {
                    Speech.pause();
                    setIsSpeaking(false);
                    setIsPaused(true);
                  }
                }}>
                Pause
              </Button>
              <Button
                mode="outlined"
                contentStyle={{ backgroundColor: theme.colors.surface }}
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
            </View>
          )}
        </View>
        <View
          style={{
            flexGrow: 1,

            justifyContent: messages.length === 0 ? "center" : "flex-start",
          }}>
          {messages.length === 0 && (
            <Card
              style={{
                marginHorizontal: 10,
                borderRadius: 10,
                alignSelf: "center",
              }}
              contentStyle={{
                padding: 0,
              }}>
              <Card.Content>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                    color: theme.colors.onSurfaceVariant,
                  }}>
                  Chat lets you {`"speak"`} messages quickly without saving them
                  to your recent list.
                </Text>
                {keyboardActive && (
                  <Button
                    onPress={() => {
                      Keyboard.dismiss();
                      setKeyboardActive(false);
                    }}>
                    Read More
                  </Button>
                )}
                {!keyboardActive && (
                  <View>
                    <Divider style={{ marginVertical: 5 }} />
                    <Text style={{ fontWeight: "bold" }}>Normal mode:</Text>
                    <Text>You see a list of your messages in order.</Text>
                    <Divider style={{ marginVertical: 5 }} />
                    <Text style={{ fontWeight: "bold" }}>Show mode:</Text>
                    <Text>
                      Displays the current message in a large font for others to
                      read.
                    </Text>
                    <Text
                      style={{
                        marginTop: 3,
                      }}>
                      * Rotate buttons change the orientation of the text to
                      reduce the need to turn your device.
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 5,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsShowMode((s) => !s);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}>
                    <Checkbox.Android
                      status={isShowMode ? "checked" : "unchecked"}
                    />
                    <Text>Show mode?</Text>
                  </TouchableOpacity>

                  <View>
                    <Text
                      style={{
                        textAlign: "right",
                      }}>{`Thank you for using my app!`}</Text>
                    <View
                      style={{
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
                          fontFamily: "Helvetica Neue",
                          fontStyle: "italic",
                          fontWeight: "300",
                        }}>
                        DaniB
                      </Text>
                    </View>
                  </View>
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
                  paddingHorizontal: 10,
                  zIndex: 2,
                }}>
                <Button
                  onPress={() => {
                    setMessages([]);
                  }}>
                  Clear Chat
                </Button>
                <Button
                  icon={(props) => (
                    <FontAwesome6 name="display" {...props} size={20} />
                  )}
                  mode="outlined"
                  onPress={() => {
                    setIsShowMode(true);
                  }}>
                  Show Mode
                </Button>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                ref={messagesEndRef}
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
                        size={12}
                        icon={(props) => (
                          <FontAwesome6 name="display" {...props} size={20} />
                        )}
                        onPress={() => {
                          setLastMessage(message);
                          Keyboard.dismiss();
                          setIsShowMode(true);
                        }}
                      />
                      <IconButton
                        size={10}
                        icon={(props) => (
                          <MaterialIcons name="replay" {...props} size={25} />
                        )}
                        onPress={() => {
                          handleSay(message);
                        }}
                      />
                      <View
                        style={{
                          zIndex: 100,
                          backgroundColor: theme.colors.background,
                          borderWidth: 1,
                          borderColor: theme.colors.outline,
                          paddingHorizontal: 15,
                          paddingVertical: 10,
                          marginVertical: 5,
                          borderRadius: 50,
                          padding: 0,
                          flexShrink: 1,
                          boxShadow: `0 2px 2px ${theme.colors.surfaceDisabled}`,
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
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View style={{ height: 150 }} />
              </ScrollView>
            </View>
          )}
        </View>
        <Animated.Image
          source={Logo}
          style={[
            {
              display: messages.length === 0 ? "none" : "flex",
              position: "absolute",
              width: "80%",
              height: "80%",
              left: "10%",
              top: "10%",
              resizeMode: "contain",
              opacity: 0.05,
              zIndex: 1,
            },
          ]}
        />
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
            <View
              style={{
                position: "relative",
                flexDirection: "row",
                alignItems: "center",
                flexGrow: 1,
              }}>
              <TextInput
                mode="outlined"
                clearButtonMode="always"
                placeholder="Message..."
                value={input}
                onFocus={() => {
                  console.log("focus");
                  setKeyboardActive(true);
                }}
                onBlur={() => {
                  console.log("blur");
                  setKeyboardActive(false);
                }}
                onChangeText={(t) => {
                  if (t === "\n") {
                    setInput("");
                    Keyboard.dismiss();
                    return;
                  }
                  if (
                    preferences.chatReturnKeySendsMessage &&
                    t.endsWith("\n")
                  ) {
                    handleSendMessage();
                    return;
                  }
                  setInput(t);
                }}
                multiline
                returnKeyType="send"
                outlineStyle={{ borderRadius: 8 }}
                style={{ flexGrow: 1, paddingRight: 5 }}
              />
              <IconButton
                disabled={input.trim().length === 0}
                style={{ position: "absolute", right: -10, top: -10 }}
                icon={(props) => (
                  <FontAwesome name="close" {...props} size={20} />
                )}
                onPress={() => setInput("")}
              />
            </View>
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
      <Dialog visible={menuMessageIdx !== null}>
        <Dialog.Content style={{ flexDirection: "column", gap: 10 }}>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
            }}>{`"${messages[menuMessageIdx ?? 0]}"`}</Text>
          <Button
            mode="contained"
            style={{ flexGrow: 1 }}
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
            }}>
            Save to Recents
          </Button>
          <Button
            mode="contained"
            style={{ flexGrow: 1 }}
            onPress={() => {
              const newMessages = messages.filter(
                (_, i) => i !== menuMessageIdx,
              );
              setMessages(newMessages);
              setMenuMessageIdx(null);
            }}>
            Delete
          </Button>
          <Button onPress={() => setMenuMessageIdx(null)}>Cancel</Button>
        </Dialog.Content>
      </Dialog>
    </ThemedView>
  );
}
