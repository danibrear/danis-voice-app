import { useCallback, useContext, useEffect, useState } from "react";
import { Dimensions, Modal, Platform, Text, View } from "react-native";

import { formStyles } from "@/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import {
  Button,
  Dialog,
  IconButton,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import { RootState } from "@/store";
import { calculateWidthOfWord } from "@/utils/fontSize";
import { AudioModule } from "expo-audio";
import { useDispatch, useSelector } from "react-redux";

import * as colors from "@/constants/colorPatterns";
import {
  setStoredTextFontSize,
  updatedStoredTextValue,
} from "@/store/storedTexts";
import { StoredText } from "@/types/StoredText";

const WIDTH = Dimensions.get("window").width;

export default function ShowingModal({
  storedText,
  onDone,
}: {
  storedText: StoredText | null;
  onDone: () => void;
}) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [fontSize, setFontSize] = useState<number>(storedText?.fontSize || 100);
  const [defaultFontSize, setDefaultFontSize] = useState<number>(
    storedText?.fontSize || 100,
  );

  const [highlight, setHighlight] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const isWeb = Platform.OS === "web";

  const [text, setText] = useState<string>(storedText?.text || "");

  const [newText, setNewText] = useState<string>(storedText?.text || "");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [numLines, setNumLines] = useState<number>(6);

  const [isPortrait, setIsPortrait] = useState<boolean>(true);

  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();

  const safeAreaContext = useContext(SafeAreaInsetsContext);

  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  const [colorIndex, setColorIndex] = useState<number>(-1);
  const [highlightColor, setHighlightColor] = useState<string>(
    theme.colors.tertiary,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setNewText(storedText ? storedText.text || "" : "");
    setText(storedText ? storedText.text || "" : "");
  }, [storedText]);

  useEffect(() => {
    if (
      !isSpeaking ||
      !preferences.colors ||
      highlight.start === highlight.end
    ) {
      return;
    }
    setColorIndex(
      (idx) => (idx + 1) % (preferences.colors ? preferences.colors.length : 1),
    );
  }, [isSpeaking, highlight, preferences.colors]);

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

  useEffect(() => {
    if (!storedText || !storedText?.text) {
      return;
    }
    const words = storedText.text.split(/\s+/);
    const numWords = words.length;
    let longest = 0;
    let width = 0;
    words.forEach((word) => {
      const len = calculateWidthOfWord(word, 100);
      width += len;
      if (len > longest) {
        longest = len;
      }
    });
    const averageWordLength = width / 100 / numWords;
    let lines = 8;
    const len = numWords * averageWordLength;
    let webFontSizeAdjustment = isWeb ? 1 : 0;
    if (len < 10) {
      lines = 3;
      webFontSizeAdjustment *= 20;
    } else if (len < 20) {
      lines = 4;
      webFontSizeAdjustment *= 30;
    } else if (len < 30) {
      lines = 6;
      webFontSizeAdjustment *= 40;
    } else if (len < 40) {
      lines = 8;
      webFontSizeAdjustment *= 50;
    }
    setNumLines(lines);
    longest = Math.min(longest, WIDTH * 2);
    const fs =
      Math.floor(100 * (WIDTH / longest)) -
      (averageWordLength + webFontSizeAdjustment);
    const minFs = Math.min(100, fs);
    if (storedText && !storedText?.fontSize) {
      setFontSize(minFs);
    }
    setDefaultFontSize(minFs);
  }, [storedText, isWeb]);

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

  const handleSetFontSize = async (size: number | null) => {
    setFontSize(size || defaultFontSize);
    if (!storedText) {
      return;
    }
    dispatch(setStoredTextFontSize({ id: storedText?.id, fontSize: size }));
  };

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

  const renderPlayPause = () => {
    const buttons = [];
    if (!storedText || !storedText?.text) {
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
            setColorIndex(-1);
            AudioModule.setAudioModeAsync({
              playsInSilentMode: true,
            });

            Speech.speak(text || "", {
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
      visible={!!storedText}
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
      <View
        style={{
          flex: 1,
          alignSelf: "center",
          width: "100%",

          backgroundColor: isFlashing
            ? flashOn
              ? "rgba(0,0,0,.9)"
              : "transparent"
            : "rgba(0,0,0,.9)",

          paddingTop: isPortrait ? safeAreaContext?.top : 5,
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
              position: "absolute",
              top: 10,
              left: 100,
              right: 100,
              zIndex: 10000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Button
              onPress={() => {
                setIsEditing(true);
              }}
              mode="contained"
              labelStyle={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              icon={(props) => (
                <MaterialCommunityIcons name="border-color" {...props} />
              )}>
              Edit
            </Button>
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 2,
              position: "absolute",
              top: 0,
              left: isPortrait ? 5 : safeAreaContext?.top,
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
              top: 0,
              right: isPortrait ? 5 : safeAreaContext?.top,
              zIndex: 10,
            }}>
            <IconButton
              icon="magnify-plus"
              containerColor={theme.colors.tertiary}
              iconColor="white"
              size={22}
              onPress={() => handleSetFontSize(Math.min(150, fontSize + 5))}
              mode="contained"
            />
            <IconButton
              icon="magnify-minus"
              size={22}
              containerColor={theme.colors.tertiary}
              iconColor="white"
              onPress={() => handleSetFontSize(Math.max(20, fontSize - 5))}
              mode="contained"
            />
            {fontSize !== defaultFontSize && (
              <IconButton
                icon="magnify-remove-outline"
                size={22}
                containerColor={theme.dark ? "#fff" : "#333"}
                iconColor={theme.colors.tertiary}
                onPress={() => handleSetFontSize(null)}
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
            {!!text && (
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={numLines}
                minimumFontScale={0.5}
                style={{
                  fontSize: fontSize,
                  width: "98%",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: isFlashing ? (flashOn ? "white" : "black") : "white",
                }}>
                {text.slice(0, highlight.start)}
                <Text
                  style={{
                    color:
                      highlightColor === "#ffffff" ? "black" : highlightColor,
                    backgroundColor:
                      highlightColor === "#ffffff"
                        ? highlightColor
                        : "transparent",
                    borderRadius: 10,
                  }}>
                  {text.slice(highlight.start, highlight.end)}
                </Text>
                {text.slice(highlight.end)}
              </Text>
            )}
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
      </View>
      <Dialog
        visible={isEditing}
        onDismiss={() => {
          setIsEditing(false);
        }}>
        <Dialog.Content>
          <TextInput
            mode="outlined"
            value={newText}
            onChangeText={setNewText}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            mode="contained"
            style={{ paddingHorizontal: 15 }}
            onPress={() => {
              setIsEditing(false);
              setText(newText);
              if (storedText) {
                dispatch(
                  updatedStoredTextValue({
                    id: storedText?.id,
                    value: newText,
                  }),
                );
              }
            }}>
            Save
          </Button>
          <Button
            onPress={() => {
              setIsEditing(false);
              setNewText(storedText ? storedText.text || "" : "");
            }}>
            Cancel
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Modal>
  );
}
