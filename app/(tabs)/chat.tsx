import CrossView from "@/components/CrossView";
import ThemedView from "@/components/themed/ThemedView";
import { RootState } from "@/store";
import { createStoredText } from "@/store/storedTexts";
import { coreStyles } from "@/styles";
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import * as colors from "@/constants/colorPatterns";
// @ts-expect-error this is a static asset
import Logo from "../../assets/images/splash-icon.png";

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

const FLIP_SCALE = 1.5;
export default function ChatPage() {
  const theme = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [displayMessage, setDisplayMessage] = useState<Message | null>(null);
  const [highlight, setHighlight] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const preferences = useSelector((state: RootState) => state.preferences);

  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<View>(null);

  const [menuMessageIdx, setMenuMessageIdx] = useState<number | null>(null);
  const [isShowMode, setIsShowMode] = useState(true);

  const [showRotateOptions, setShowRotateOptions] = useState(true);
  const [showTapInstructions, setShowTapInstructions] = useState(true);
  const [fontSize, setFontSize] = useState<number | null>(null);

  const [numLines, setNumLines] = useState(3);

  const [angle, setAngle] = useState(0);
  const messagesEndRef = useRef<ScrollView>(null);

  const hasProcessedChange = useRef(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [highlightColor, setHighlightColor] = useState(theme.colors.tertiary);

  const opacity = useSharedValue(0.5);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

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
      isShowMode &&
      showTapInstructions &&
      (messages.length > 0 || input.trim().length > 0)
    ) {
      setTimeout(() => {
        setShowTapInstructions(false);
      }, 4000);
    }
    if (!isShowMode || (input.trim().length === 0 && messages.length === 0)) {
      setShowTapInstructions(true);
    }
  }, [input, isShowMode, messages.length, showTapInstructions]);

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
      setShowRotateOptions(true);
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
    setHighlight({
      start: 0,
      end: 0,
    });
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

  const handleSay = async (messageText: string) => {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
    });
    setIsSpeaking(true);
    setColorIndex(-1);
    Speech.speak(messageText, {
      voice: preferences.preferredVoice,
      pitch: preferences.speechPitch,
      rate: preferences.speechRate,
      onDone: () => {
        handleDone();
      },
      onError: () => {
        handleDone();
      },
      onBoundary: (e: { charIndex: number; charLength: number }) => {
        const { charIndex, charLength } = e;
        if (charLength > 0) {
          setColorIndex(
            (idx) =>
              (idx + 1) % (preferences.colors ? preferences.colors.length : 1),
          );
        }
        setHighlight({
          start: charIndex,
          end: charIndex + charLength,
        });
      },
    });
  };

  const menuMessage = useMemo(() => {
    return messages[menuMessageIdx ?? 0];
  }, [menuMessageIdx, messages]);

  const message = useMemo(() => {
    return input.trim() !== "" ? input.trim() : displayMessage?.text;
  }, [displayMessage, input]);
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
              alignItems: "center",
            }}
            onTouchStart={() => {
              if (input.trim() === "" && displayMessage === null) {
                setShowRotateOptions(true);
              } else {
                setShowRotateOptions((s) => !s);
              }
            }}>
            {showTapInstructions && (
              <Animated.Text
                entering={FadeInDown.duration(500)
                  .delay(200)
                  .springify()
                  .damping(25)
                  .mass(2)}
                style={{
                  color: "white",
                  position: "absolute",
                  top: safeAreaInsets?.top! - 10,
                  right: 100,
                  left: 100,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  zIndex: 1001,
                }}>
                Tap text to show/hide options
              </Animated.Text>
            )}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: "absolute",
                left: 0,
                right: 0,
                top: safeAreaInsets?.top!,
                zIndex: 1001,
              }}>
              {displayMessage && (
                <IconButton
                  mode="contained"
                  containerColor={theme.colors.onPrimary}
                  iconColor={theme.colors.primary}
                  onPress={() => {
                    handleSay(displayMessage.text);
                  }}
                  icon={(props) => <MaterialIcons name="replay" {...props} />}
                />
              )}
              <View
                style={{
                  display: "flex",
                  flexGrow: 1,
                  alignItems: "flex-end",
                }}>
                {messages.length > 0 && (
                  <IconButton
                    onPress={() => {
                      setIsShowMode(false);
                    }}
                    icon={(props) => (
                      <FontAwesome name="list" {...props} color="white" />
                    )}
                  />
                )}
              </View>
            </View>
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
                {message?.slice(0, highlight.start)}
                <Text
                  style={{
                    color: highlightColor,
                    textAlign: "center",
                    marginHorizontal: 10,
                    fontWeight: "bold",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    fontSize: displayMessage?.fontSize ?? fontSize ?? 60,
                  }}>
                  {message?.slice(highlight.start, highlight.end)}
                </Text>
                {message?.slice(highlight.end)}
              </Text>
            </View>
            {showRotateOptions && (
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
                  flexDirection: "row",
                  justifyContent: "space-around",
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>
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
                  icon="magnify-plus"
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
                  iconColor={
                    fontSize === null ? "white" : theme.colors.tertiary
                  }
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
                  icon={(props) => (
                    <FontAwesome name="window-close" {...props} color="white" />
                  )}
                />
              </Animated.View>
            )}
          </View>
        )}
        {input.trim() === "" && !displayMessage && messages.length > 0 && (
          <Animated.Image
            source={Logo}
            style={[
              {
                position: "absolute",
                width: "80%",
                height: "100%",
                left: "10%",
                top: "10%",
                resizeMode: "contain",
                opacity: 0.1,
                zIndex: 1000,
              },
              animatedStyles,
            ]}
          />
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
                    setIsShowMode(true);
                    setShowRotateOptions(true);
                  }}>
                  Clear Chat
                </Button>
                <Button
                  icon={(props) => (
                    <FontAwesome6 name="display" {...props} size={20} />
                  )}
                  mode="outlined"
                  onPress={() => {
                    setShowRotateOptions(true);
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
                        mode="outlined"
                        style={{ zIndex: 9999, position: "relative" }}
                        icon={(props) => (
                          <MaterialIcons name="replay" {...props} size={25} />
                        )}
                        onPress={() => {
                          handleSay(message.text);
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
                        <Text>{message.text}</Text>
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
                numberOfLines={2}
                onChangeText={(t) => {
                  hasProcessedChange.current = false;
                  if (t.trim().length === 0) {
                    setFontSize(null);
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
