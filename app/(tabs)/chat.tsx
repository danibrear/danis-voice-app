import CrossView from "@/components/CrossView";
import Logo from "@/components/Logo";
import ThemedView from "@/components/themed/ThemedView";
import * as colors from "@/constants/colorPatterns";
import { useSpeech } from "@/hooks/useSpeech";
import { RootState } from "@/store";
import { addRecentMessage } from "@/store/chat";
import { getDevToolsEnabled } from "@/store/preferences";
import { createStoredText } from "@/store/storedTexts";
import { coreStyles } from "@/styles";
import { darkTheme } from "@/theme";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  Text,
  TextInput,
  ThemeProvider,
  useTheme,
} from "react-native-paper";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type Message = {
  text: string;
  fontSize: number | null;
  numberOfLines?: number;
};

const WORD_COUNT_MIN_MAX_LINES = {
  5: { min: 2, max: 3 },
  15: { min: 3, max: 4 },
  20: { min: 4, max: 5 },
  25: { min: 5, max: 6 },
  35: { min: 6, max: 7 },
  60: { min: 7, max: 8 },
  80: { min: 8, max: 9 },
};

type NoticeMessage = {
  id: string;
  text: string;
  color: "info" | "error" | "success";
};

const FLIP_SCALE = 1.25;

function ChatPage() {
  const theme = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [displayMessage, setDisplayMessage] = useState<Message | null>(null);

  const preferences = useSelector((state: RootState) => state.preferences);
  const devToolsEnabled = useSelector(getDevToolsEnabled);
  const SHOW_SAVE_BUTTON = devToolsEnabled;

  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const navigator = useNavigation();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<View>(null);

  const [menuMessageIdx, setMenuMessageIdx] = useState<number | null>(null);

  const [showAllTools, setShowAllTools] = useState(true);
  const [showTapInstructions, setShowTapInstructions] = useState(true);
  const [fontSize, setFontSize] = useState<number | null>(null);

  const [numLines, setNumLines] = useState(3);

  const [angle, setAngle] = useState(0);
  const messagesEndRef = useRef<ScrollView>(null);
  const [keyboardFocused, setKeyboardFocused] = useState(false);

  const hasProcessedChange = useRef(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [highlightColor, setHighlightColor] = useState(theme.colors.tertiary);

  const [noticeMessage, setNoticeMessage] = useState<NoticeMessage | null>(
    null,
  );

  const { handleSay: _callhandleSay, boundary } = useSpeech();

  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (!displayMessage) {
      opacity.value = withTiming(0.75, { duration: 250 });

      setTimeout(() => {
        opacity.value = withTiming(0.333, { duration: 600 });
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMessage]);

  useEffect(() => {
    if (
      showTapInstructions &&
      (messages.length > 0 || input.trim().length > 0)
    ) {
      setTimeout(() => {
        setShowTapInstructions(false);
      }, 4000);
    }
    if (input.trim().length === 0 && messages.length === 0) {
      setShowTapInstructions(true);
    }
  }, [input, messages.length, showTapInstructions]);

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

  useEffect(() => {
    if (displayMessage && input.trim() !== "") {
      setDisplayMessage(null);
      setFontSize(null);
      setShowAllTools(true);
    }
  }, [input, displayMessage]);

  useEffect(() => {
    const words = input.trim().split(" ");
    for (const [wordCountStr, lineLimits] of Object.entries(
      WORD_COUNT_MIN_MAX_LINES,
    )) {
      const wordCount = parseInt(wordCountStr, 10);
      if (words.length <= wordCount && numLines > lineLimits.min) {
        setNumLines(lineLimits.min);
        return;
      }
      if (words.length > wordCount && numLines < lineLimits.max) {
        setNumLines(lineLimits.max);
        return;
      }
    }
  }, [input, numLines]);

  useEffect(() => {
    const pattern = preferences.colors;
    const allColors = colors.allColors;
    if (pattern && allColors) {
      const colorsForPattern = allColors.find(
        (c) => c.name === pattern,
      )?.colors;
      if (!colorsForPattern) {
        setHighlightColor(theme.colors.tertiary);
        return;
      }
      setHighlightColor(colorsForPattern[colorIndex % colorsForPattern.length]);
      return;
    }
    setHighlightColor(theme.colors.tertiary);
  }, [colorIndex, preferences.colors, theme.colors.tertiary]);

  const handleDone = useCallback(() => {
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const handleSetFontSize = (size: number) => {
    setFontSize(size);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") {
      return;
    }
    await handleSay(input.trim());
    const newMessages = [
      ...messages,
      { text: input.trim(), fontSize: fontSize },
    ];
    setDisplayMessage({
      text: input.trim(),
      fontSize: fontSize,
      numberOfLines: numLines,
    });
    setMessages(newMessages);
    setInput("");
    setTimeout(() => {
      messagesEndRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const handleRecentAdd = async () => {
    if (input.trim() === "" && !displayMessage) {
      return;
    }
    const textToSave =
      input.trim() !== "" ? input.trim() : displayMessage!.text;
    dispatch(
      createStoredText({
        id: new Date().getTime().toString(),
        text: textToSave,
        starred: false,
        order: -1,
      }),
    );
    setDisplayMessage(null);
    setInput("");

    setNoticeMessage({
      id: new Date().toISOString(),
      text: "Message saved to Recents",
      color: "success",
    });
    setTimeout(() => {
      setNoticeMessage(null);
    }, 3000);
  };

  const handleSay = async (
    messageText: string,
    options?: {
      isReplay?: boolean;
    },
  ) => {
    try {
      setColorIndex(-1);

      if (!options?.isReplay) {
        dispatch(addRecentMessage(messageText));
      }
      _callhandleSay(messageText, {
        onDone: () => {
          handleDone();
        },
        onError: () => {
          handleDone();
        },
        onBoundary: (e: { charIndex: number; charLength: number }) => {
          const { charLength } = e;
          if (charLength > 0) {
            setColorIndex(
              (idx) =>
                (idx + 1) %
                (preferences.colors ? preferences.colors.length : 1),
            );
          }
        },
      });
    } catch (e) {
      console.log("[ERROR] error saying", e);
    }
  };

  const renderTools = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexGrow: 1,
          justifyContent: "space-around",
        }}>
        <IconButton
          icon="magnify-plus"
          disabled={input.trim().length === 0}
          iconColor="white"
          size={30}
          onPress={() => {
            if (fontSize === null) {
              setFontSize(100);
              return;
            }
            handleSetFontSize(Math.min(200, fontSize + 10));
          }}
        />
        <IconButton
          icon="magnify-minus"
          disabled={input.trim().length === 0}
          iconColor="white"
          size={30}
          onPress={() => {
            if (fontSize === null) {
              setFontSize(100);
              return;
            }
            handleSetFontSize(Math.max(20, fontSize - 10));
          }}
        />
        <IconButton
          icon="magnify-remove-outline"
          iconColor={fontSize === null ? "white" : theme.colors.tertiary}
          style={{
            opacity: fontSize === null ? 0.333 : 1,
          }}
          size={30}
          onPress={() => {
            setFontSize(null);
          }}
        />
        <IconButton
          onPress={() => {
            if (input.trim() === "" && displayMessage === null) {
              Keyboard.dismiss();
            }
            setDisplayMessage(null);
            setInput("");
          }}
          size={30}
          disabled={input.trim() === "" && !displayMessage && !keyboardFocused}
          icon={(props) => (
            <FontAwesome
              name={
                input.trim() === "" && displayMessage === null
                  ? "chevron-down"
                  : "window-close"
              }
              {...props}
              color={
                input.trim() === "" && !displayMessage && !keyboardFocused
                  ? theme.colors.surfaceDisabled
                  : "white"
              }
            />
          )}
        />
        <IconButton
          onPress={() => setAngle(180)}
          mode={angle === 180 ? "contained" : undefined}
          icon={(props) => (
            <MaterialCommunityIcons
              name="format-font-size-increase"
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
            <MaterialCommunityIcons
              name="format-font-size-decrease"
              {...props}
              color={angle === 0 ? theme.colors.tertiary : "white"}
            />
          )}
          size={30}
        />
      </View>
    );
  };
  const renderTopTools = () => {
    return (
      <Animated.View
        entering={FadeInUp.duration(150).springify().damping(15).mass(0.5)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
          left: 0,
          right: 0,
          top: safeAreaInsets?.top!,
          zIndex: 1001,
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}>
        {displayMessage && (
          <IconButton
            mode="contained"
            containerColor={theme.colors.onPrimary}
            iconColor={theme.colors.primary}
            onPress={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSay(displayMessage.text, {
                isReplay: true,
              });
            }}
            icon={(props) => <MaterialIcons name="replay" {...props} />}
          />
        )}

        {(input.trim().length > 0 || displayMessage) && SHOW_SAVE_BUTTON && (
          <IconButton
            icon={(props) => <MaterialIcons name="save" {...props} />}
            mode="outlined"
            onPress={() => {
              handleRecentAdd();
            }}
          />
        )}
        <View
          style={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          {showAllTools && (
            <IconButton
              onPress={() => {
                // @ts-expect-error navigate type
                navigator.navigate("quick");
              }}
              icon={(props) => (
                <FontAwesome name="list" {...props} color="white" />
              )}
            />
          )}
        </View>
      </Animated.View>
    );
  };

  const menuMessage = useMemo(() => {
    return messages[menuMessageIdx ?? 0];
  }, [menuMessageIdx, messages]);

  const message = useMemo(() => {
    return input.trim() !== "" ? input.trim() : displayMessage?.text;
  }, [displayMessage, input]);

  const instructionsOffset = Platform.OS === "web" ? 50 : 20;

  return (
    <ThemedView style={[coreStyles.container, { position: "relative" }]}>
      <CrossView
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
        {(messages.length > 0 || input.trim().length > 0) && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.background,
              zIndex: 1000,
              paddingTop: safeAreaInsets?.top,
              alignItems: "center",
            }}
            onTouchStart={() => {
              if (input.trim() === "" && displayMessage === null) {
                setShowAllTools(true);
              } else {
                setShowAllTools((s) => !s);
              }
            }}>
            {showTapInstructions && (
              <Animated.Text
                entering={FadeInDown.duration(500)
                  .delay(200)
                  .springify()
                  .damping(25)
                  .mass(2)}
                exiting={FadeOutDown.duration(50)}
                style={{
                  color: theme.colors.tertiary,
                  position: "absolute",
                  bottom: (safeAreaInsets?.bottom ?? 0) + instructionsOffset,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "bold",
                  backgroundColor: "rgba(50,50,50,0.25)",
                  padding: 5,
                  borderRadius: 100,
                  zIndex: 3001,
                }}>
                Tap text to hide tools
              </Animated.Text>
            )}

            {(input.trim().length > 0 ||
              displayMessage ||
              messages.length > 0) &&
              showAllTools &&
              renderTopTools()}

            <View
              ref={containerRef}
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                flex: 1,
                paddingBottom: angle === 180 ? 75 : 0,
                paddingTop: angle === 180 ? 50 : 0,
                paddingHorizontal: 0,
              }}>
              {input.trim().length === 0 && displayMessage === null && (
                <Animated.View
                  entering={FadeInUp.duration(666)
                    .springify()
                    .damping(25)
                    .mass(2)}
                  style={{
                    display: "flex",
                    flexShrink: 1,
                  }}>
                  <Image
                    source={Logo}
                    style={[
                      {
                        maxHeight: 200,
                        height: "90%",

                        resizeMode: "contain",
                        zIndex: 1,
                      },
                    ]}
                  />
                  <Animated.Text
                    entering={FadeInDown.duration(666).delay(100)}
                    style={{
                      fontWeight: "bold",
                      color: theme.colors.onBackground,
                      fontSize: 20,
                      textAlign: "center",
                    }}>
                    Type a message below
                  </Animated.Text>
                </Animated.View>
              )}
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={displayMessage?.numberOfLines || numLines}
                allowFontScaling={true}
                style={{
                  transform: [
                    { rotate: `${angle}deg` },
                    {
                      scaleY: angle === 180 ? FLIP_SCALE : 1,
                    },
                  ],
                  color: "white",
                  textAlign: "center",
                  marginHorizontal: 10,
                  fontWeight: "bold",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  fontSize: displayMessage?.fontSize ?? fontSize ?? 60,
                }}>
                {message?.slice(0, boundary.start)}
                <Text
                  style={{
                    color: highlightColor,
                    textAlign: "center",
                    fontWeight: "bold",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    fontSize: displayMessage?.fontSize ?? fontSize ?? 60,
                  }}>
                  {message?.slice(boundary.start, boundary.end)}
                </Text>
                {message?.slice(boundary.end)}
              </Text>
            </View>

            {showAllTools && (
              <Animated.View
                entering={FadeInDown.duration(500)
                  .springify()
                  .damping(15)
                  .mass(0.5)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "space-around",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                {renderTools()}
              </Animated.View>
            )}
          </View>
        )}

        {(isPaused || isSpeaking) && (
          <View
            style={{ position: "absolute", bottom: 5, right: 5, zIndex: 3 }}>
            {isPaused && (
              <Button
                mode="outlined"
                icon={(props) => (
                  <MaterialIcons name={"play-arrow"} {...props} />
                )}
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
        )}
        <View
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: messages.length === 0 ? "center" : "flex-start",
          }}
          onTouchStart={() => {
            Keyboard.dismiss();
          }}>
          {messages.length === 0 && (
            <Card
              style={{
                marginHorizontal: 10,
                borderRadius: 10,
                alignSelf: "center",
              }}>
              <Card.Content>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                    color: theme.colors.onSurfaceVariant,
                  }}>
                  Chat lets you send messages quickly
                </Text>
                <Divider style={{ marginVertical: 10 }} />
                <Text>
                  * Use the arrows to flip your text for quick viewing by anyone
                  facing you.
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginTop: 5,
                  }}>
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
        </View>
        <View
          style={{
            position: "relative",
            backgroundColor: theme.colors.background,
          }}>
          {renderTools()}
        </View>
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
        {noticeMessage && (
          <Animated.View
            entering={FadeInDown.duration(500).springify().damping(20).mass(1)}
            exiting={FadeInDown.duration(10)}
            style={[
              {
                flexGrow: 1,
                display: noticeMessage ? "flex" : "none",
                justifyContent: "center",
                width: "100%",
                alignItems: "center",
              },
            ]}>
            <Text
              style={{
                color: theme.colors.onTertiary,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 18,
                fontFamily: "Helvetica Neue",
                backgroundColor: theme.colors.tertiary,
                paddingVertical: 10,
                borderRadius: 5,
                marginBottom: 5,
                flexGrow: 1,
                width: "100%",
                paddingHorizontal: 10,
              }}>
              {noticeMessage.text}
            </Text>
          </Animated.View>
        )}
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
                numberOfLines={2}
                onFocus={() => {
                  setKeyboardFocused(true);
                }}
                onBlur={() => {
                  setKeyboardFocused(false);
                }}
                onChangeText={(t) => {
                  hasProcessedChange.current = false;
                  setNoticeMessage(null);
                  if (t.trim().length === 0) {
                    setFontSize(null);
                    setShowAllTools(true);
                  }
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
                returnKeyType={
                  preferences.chatReturnKeySendsMessage ? "send" : "done"
                }
                outlineStyle={{ borderRadius: 8 }}
                style={{ flexGrow: 1, paddingRight: 5 }}
              />
            </View>
          </View>
          <IconButton
            mode="contained"
            containerColor={theme.colors.primary}
            iconColor="white"
            disabled={input.trim() === ""}
            icon={(props) => <MaterialIcons name="arrow-upward" {...props} />}
            style={{ marginLeft: 10 }}
            onPress={handleSendMessage}
          />
        </View>
      </KeyboardAvoidingView>
      <Dialog visible={menuMessageIdx !== null}>
        <Dialog.Content style={{ flexDirection: "column", gap: 10 }}>
          {menuMessage && (
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
              }}>{`"${menuMessage.text}"`}</Text>
          )}
          {menuMessage && (
            <Button
              mode="contained"
              style={{ flexGrow: 1 }}
              onPress={() => {
                dispatch(
                  createStoredText({
                    id: new Date().getTime().toString(),
                    text: menuMessage.text,
                    starred: false,
                    order: -1,
                  }),
                );
                setMenuMessageIdx(null);
              }}>
              Save to Recents
            </Button>
          )}
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

export default function ChatContainer() {
  return (
    <ThemeProvider theme={darkTheme}>
      <ChatPage />
    </ThemeProvider>
  );
}
