import { useCallback, useContext, useEffect, useState } from "react";
import { Modal, Platform, Text, View } from "react-native";

import { formStyles } from "@/styles";
import * as Speech from "expo-speech";
import { Button, IconButton, useTheme } from "react-native-paper";
import {
  SafeAreaInsetsContext,
  SafeAreaView,
} from "react-native-safe-area-context";

import * as ScreenOrientation from "expo-screen-orientation";

import { RootState } from "@/store";
import { calculateWidthOfWord } from "@/utils/fontSize";
import { AudioModule } from "expo-audio";
import { useSelector } from "react-redux";

const colors = [
  "#EF4444",
  "#F59E0B",
  "#EAB308",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

export default function ShowingModal({
  text,
  onDone,
}: {
  text?: string | null;
  onDone: () => void;
}) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [fontSize, setFontSize] = useState<number>(100);
  const [defaultFontSize, setDefaultFontSize] = useState<number>(100);

  const [highlight, setHighlight] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const isWeb = Platform.OS === "web";

  const [numLines, setNumLines] = useState<number>(6);

  const [isPortrait, setIsPortrait] = useState<boolean>(true);

  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();

  const safeAreaContext = useContext(SafeAreaInsetsContext);

  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  const calcFontSize = useCallback(
    (len: number) => {
      if (isWeb) {
        if (!text) {
          return 100;
        }
        if (text.length > 100) {
          return 40;
        } else if (text.length > 75) {
          return 50;
        } else if (text.length > 20) {
          return 60;
        } else if (text.length > 10) {
          return 75;
        } else if (text.length > 5) {
          return 90;
        }
        return 100;
      }
      if (len > 10) {
        return 35;
      }
      if (len > 7) {
        return 50;
      }
      if (len > 5) {
        return 65;
      }
      return 100;
    },
    [isWeb, text],
  );

  useEffect(() => {
    const words = text ? text.split(/\s+/) : [];
    const numWords = words.length;
    const lines = Math.min(numWords, 8);
    setNumLines(lines);
    let longest = 0;
    words.forEach((word) => {
      const len = calculateWidthOfWord(word, 100);
      if (len > longest) {
        longest = len;
      }
    });
    setFontSize(calcFontSize(longest / 100));
    setDefaultFontSize(calcFontSize(longest / 100));
  }, [calcFontSize, text]);

  useEffect(() => {
    if (!isWeb) {
      return;
    }
    window.addEventListener("orientationchange", (e) => {
      if (window.innerHeight <= window.innerWidth) {
        setIsPortrait(false);
      } else {
        setIsPortrait(true);
      }
    });
    return () => {
      window.removeEventListener("orientationchange", () => {});
    };
  }, [isWeb]);

  useEffect(() => {
    ScreenOrientation.addOrientationChangeListener((e) => {
      setIsPortrait(
        e.orientationInfo.orientation ===
          ScreenOrientation.Orientation.PORTRAIT_UP ||
          e.orientationInfo.orientation ===
            ScreenOrientation.Orientation.PORTRAIT_DOWN,
      );
    });
    return () => {
      ScreenOrientation.removeOrientationChangeListeners();
    };
  }, []);

  useEffect(() => {
    let flashInterval = undefined;
    if (isFlashing) {
      flashInterval = setInterval(() => {
        setFlashOn((prev) => !prev);
      }, 555.55);
    } else {
      setFlashOn(false);
    }
    return () => {
      if (flashInterval) {
        clearInterval(flashInterval);
      }
    };
  }, [isFlashing]);

  const getFloatingButtonPosition = () => {
    if (isPortrait) {
      return {
        top: safeAreaContext?.top || 40,
        right: safeAreaContext?.right || 20,
        left: safeAreaContext?.left || 20,
      };
    }

    return {
      top: safeAreaContext?.left || 20,
      right: safeAreaContext?.bottom || 20,
      left: safeAreaContext?.top || 40,
    };
  };

  const { top, right } = getFloatingButtonPosition();

  const [colorIndex, setColorIndex] = useState<number>(0);

  const handleDone = useCallback(() => {
    setHighlight({
      start: 0,
      end: 0,
    });
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isSpeaking) {
      return;
    }

    const checkSpeaking = setInterval(async () => {
      const speaking = await Speech.isSpeakingAsync();
      if (!speaking) {
        handleDone();
        Speech.stop();
      }
    }, 50);
    return () => clearInterval(checkSpeaking);
  }, [isSpeaking, handleDone]);

  useEffect(() => {
    if (!isSpeaking) {
      return;
    }
    setColorIndex((prev) => (prev + 1) % colors.length);
  }, [highlight, isSpeaking]);

  const renderPlayPause = () => {
    const buttons = [];
    if (!text) {
      return;
    }
    if (isSpeaking) {
      buttons.push(
        <Button
          mode="contained"
          labelStyle={formStyles.bigButton}
          style={{ flexGrow: 1 }}
          onPress={() => {
            setIsSpeaking(false);
            Speech.stop();
          }}>
          Stop
        </Button>,
      );
    }
    if (isSpeaking && !isPaused) {
      buttons.push(
        <Button
          mode="contained"
          labelStyle={formStyles.bigButton}
          onPress={() => {
            Speech.pause();
            setIsPaused(true);
          }}>
          Pause
        </Button>,
      );
    }
    if (isPaused) {
      buttons.push(
        <Button
          mode="contained"
          labelStyle={formStyles.bigButton}
          onPress={async () => {
            setIsPaused(false);
            setIsSpeaking(true);
            Speech.resume();
          }}>
          Resume
        </Button>,
      );
    }
    if (!isSpeaking && !isPaused) {
      buttons.push(
        <Button
          mode="contained"
          style={{ flexGrow: 1 }}
          labelStyle={formStyles.bigButton}
          onPress={() => {
            setIsSpeaking(true);
            AudioModule.setAudioModeAsync({
              playsInSilentMode: true,
            });

            Speech.speak(text, {
              rate: preferences.speechRate,
              pitch: preferences.speechPitch,
              onDone: () => {
                handleDone();
              },
              onError: () => {
                handleDone();
              },
              onBoundary: (e: { charIndex: number; charLength: number }) => {
                const { charIndex, charLength } = e;
                setHighlight({
                  start: charIndex,
                  end: charIndex + charLength,
                });
              },
            });
          }}>
          Read
        </Button>,
      );
    }
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          flexGrow: 1,
        }}>
        {buttons.map((btn, idx) => {
          return (
            <View key={`btn-${idx}`} style={{ flexGrow: 1, display: "flex" }}>
              {btn}
            </View>
          );
        })}
      </View>
    );
  };
  const renderControls = () => {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          flexGrow: 1,
        }}>
        {renderPlayPause()}
      </View>
    );
  };

  return (
    <Modal
      visible={!!text}
      supportedOrientations={[
        "landscape",
        "landscape-left",
        "landscape-right",
        "portrait",
        "portrait-upside-down",
      ]}
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        backgroundColor: "transparent",
        alignSelf: "center",
      }}>
      <SafeAreaView
        style={{
          flex: 1,
          alignSelf: "center",
          width: "100%",
          backgroundColor: isFlashing
            ? flashOn
              ? "rgba(0,0,0,.9)"
              : "transparent"
            : "rgba(0,0,0,.9)",
          paddingTop: safeAreaContext?.top,
          paddingBottom: safeAreaContext?.bottom,
          position: "relative",
        }}>
        <View
          style={{
            maxWidth: isWeb ? 600 : "100%",
            width: "100%",
            flex: 1,
            marginHorizontal: isWeb ? "auto" : 0,
          }}>
          <View
            style={{
              flexDirection: "column",
              gap: 2,
              position: "absolute",
              top,
              left: right,
              zIndex: 10,
            }}>
            <IconButton
              icon="flash"
              size={20}
              iconColor="white"
              containerColor={
                isFlashing ? theme.colors.tertiary : "transparent"
              }
              onPress={() => {
                setIsFlashing(!isFlashing);
              }}
              mode={isFlashing ? "contained" : "outlined"}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 2,
              position: "absolute",
              top,
              right,
              zIndex: 10,
            }}>
            <IconButton
              icon="magnify-plus"
              containerColor={theme.colors.tertiary}
              iconColor="white"
              size={22}
              onPress={() => setFontSize((size) => Math.min(150, size + 5))}
              mode="contained"
            />
            <IconButton
              icon="magnify-minus"
              size={22}
              containerColor={theme.colors.tertiary}
              iconColor="white"
              onPress={() => setFontSize((size) => Math.max(20, size - 5))}
              mode="contained"
            />
            {fontSize !== defaultFontSize && (
              <IconButton
                icon="magnify-remove-outline"
                size={22}
                containerColor={theme.dark ? "#fff" : "#333"}
                iconColor={theme.colors.tertiary}
                onPress={() => setFontSize(defaultFontSize)}
                mode="contained"
              />
            )}
          </View>
          <View
            style={{
              flex: 1,
              alignSelf: "stretch",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "center",
              flexGrow: 1,
            }}>
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={numLines}
              minimumFontScale={0.5}
              style={{
                flexShrink: 1,
                fontSize: fontSize,
                width: "98%",
                fontWeight: "bold",
                textAlign: "center",
                verticalAlign: "middle",
                color: isFlashing ? (flashOn ? "white" : "black") : "white",
              }}
              textBreakStrategy="balanced">
              {text?.slice(0, highlight.start)}
              <Text
                style={{
                  color: colors[colorIndex],
                  textShadowColor: colors[colorIndex],
                  textShadowRadius: 2,
                  textShadowOffset: { width: 1, height: 1 },
                }}>
                {text?.slice(highlight.start, highlight.end)}
              </Text>
              {text?.slice(highlight.end)}
            </Text>
          </View>
          {isPortrait && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
                display: "flex",
                paddingBottom: isWeb ? 40 : 20,
              }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  width: "100%",
                }}>
                {renderControls()}
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingTop: 30,
                  width: "100%",
                }}>
                <Button
                  mode="contained"
                  labelStyle={formStyles.bigButton}
                  onPress={() => {
                    Speech.stop();
                    setIsSpeaking(false);
                    setIsFlashing(false);
                    setIsPaused(false);
                    setFlashOn(false);
                    if (!isWeb) {
                      ScreenOrientation.lockAsync(
                        ScreenOrientation.OrientationLock.PORTRAIT_UP,
                      );
                    }
                    onDone();
                  }}>
                  Done
                </Button>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
