import { useEffect, useState } from "react";
import { Dimensions, Modal, Platform, Text, View } from "react-native";

import { formStyles } from "@/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, IconButton, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { RootState } from "@/store";
import { calculateWidthOfWord } from "@/utils/fontSize";
import { useDispatch, useSelector } from "react-redux";

import * as colors from "@/constants/colorPatterns";
import { useSpeech } from "@/hooks/useSpeech";
import { setStoredTextFontSize } from "@/store/storedTexts";
import { StoredText } from "@/types/StoredText";
import EditStoredTextDialog from "./EditStoredTextDialog";

const WIDTH = Dimensions.get("window").width;

export default function ShowingModal({
  storedText,
  onDone,
}: {
  storedText: StoredText | null;
  onDone: () => void;
}) {
  const [fontSize, setFontSize] = useState<number>(storedText?.fontSize || 100);
  const [defaultFontSize, setDefaultFontSize] = useState<number>(
    storedText?.fontSize || 100,
  );

  const isWeb = Platform.OS === "web";

  const [text, setText] = useState<string>(storedText?.text || "");

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [numLines, setNumLines] = useState<number>(6);

  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();

  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  const [orientation, setOrientation] = useState<string>("portrait");

  const [colorIndex, setColorIndex] = useState<number>(-1);
  const [highlightColor, setHighlightColor] = useState<string>(
    theme.colors.tertiary,
  );

  const dispatch = useDispatch();

  const safeAreaInsets = useSafeAreaInsets();

  const {
    handleSay,
    handleResume,
    handleStop,
    boundary,
    isSpeakingId,
    handlePause,
    isPaused,
  } = useSpeech();

  useEffect(() => {
    setText(storedText ? storedText.text || "" : "");
  }, [storedText]);

  useEffect(() => {
    if (
      !isSpeakingId ||
      !preferences.colors ||
      boundary.start === boundary.end
    ) {
      return;
    }
    setColorIndex(
      (idx) => (idx + 1) % (preferences.colors ? preferences.colors.length : 1),
    );
  }, [isSpeakingId, boundary, preferences.colors]);

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
    let longestWord = "";
    words.forEach((word) => {
      const len = calculateWidthOfWord(word, 100);
      width += len;
      if (len > longest) {
        longest = len;
        longestWord = word;
      }
    });
    const averageWordLength = Math.floor(width / numWords);
    let lines = 10;
    const len = numWords * averageWordLength;
    let count = 0;
    let fs = 100;
    while (longest > WIDTH && count < 10 && !storedText.fontSize) {
      longest = calculateWidthOfWord(longestWord, fs - 5);
      count += 1;
      fs -= 5;
    }

    if (numWords <= 5) {
      lines = numWords;
    } else if (len < 10) {
      lines = 3;
    } else if (len < 20) {
      lines = 4;
    } else if (len < 30) {
      lines = 6;
    } else if (len < 40) {
      lines = 10;
    }
    if (!storedText.fontSize) {
      setFontSize(fs);
      setDefaultFontSize(fs);
    }
    setNumLines(lines);
  }, [storedText, isWeb, orientation]);
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

  const renderPlayPause = () => {
    const buttons = [];
    if (!storedText || !storedText?.text) {
      return;
    }
    if (isSpeakingId) {
      buttons.push(
        <Button
          mode="contained"
          labelStyle={formStyles.bigButton}
          style={{ flexGrow: 1 }}
          onPress={() => {
            handleStop();
          }}>
          Stop
        </Button>,
      );
    }
    if (isSpeakingId && !isPaused) {
      buttons.push(
        <Button
          mode="contained"
          labelStyle={formStyles.bigButton}
          onPress={() => {
            handlePause();
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
            await handleResume();
          }}>
          Resume
        </Button>,
      );
    }
    if (!isSpeakingId && !isPaused) {
      buttons.push(
        <Button
          mode="contained"
          style={{ flexGrow: 1 }}
          labelStyle={formStyles.bigButton}
          onPress={async () => {
            setColorIndex(-1);
            if (!storedText) {
              return;
            }

            handleSay(storedText, {
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
      supportedOrientations={[
        "landscape",
        "landscape-left",
        "landscape-right",
        "portrait",
        "portrait-upside-down",
      ]}
      onOrientationChange={(e) => {
        setOrientation(e.nativeEvent.orientation);
      }}
      visible={!!storedText}
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        alignSelf: "center",
      }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          paddingTop: safeAreaInsets.top,
          backgroundColor: isFlashing
            ? flashOn
              ? "black"
              : "transparent"
            : "black",
        }}>
        <SafeAreaView
          style={{
            alignSelf: "center",
            width: "100%",
            flex: 1,
            backgroundColor: isFlashing
              ? flashOn
                ? "rgba(0,0,0,.9)"
                : "transparent"
              : "rgba(0,0,0,.9)",
          }}>
          <View
            style={{
              maxWidth: isWeb ? 600 : "100%",
              width: "100%",
              flexGrow: 1,

              marginHorizontal: isWeb ? "auto" : 0,
            }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  gap: 2,
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
                    flexShrink: 1,
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
                }}>
                <IconButton
                  icon="magnify-plus"
                  containerColor={theme.colors.tertiary}
                  iconColor="white"
                  size={22}
                  onPress={() => handleSetFontSize(Math.min(250, fontSize + 5))}
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
            </View>
            <View
              style={{
                flex: 1,
                alignSelf: "stretch",
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
                flexGrow: 1,
                flexDirection: "column",
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
                  {text.slice(0, boundary.start)}
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
                    {text.slice(boundary.start, boundary.end)}
                  </Text>
                  {text.slice(boundary.end)}
                </Text>
              )}
            </View>
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
                  paddingTop: 10,
                  width: "100%",
                }}>
                <Button
                  mode="contained"
                  labelStyle={formStyles.bigButton}
                  onPress={() => {
                    handleStop();
                    onDone();
                  }}>
                  Done
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
        <EditStoredTextDialog
          storedText={storedText}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setText={setText}
        />
      </View>
    </Modal>
  );
}
