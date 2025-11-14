import { useContext, useEffect, useState } from "react";
import { Modal, Platform, Text, View } from "react-native";

import { formStyles } from "@/styles";
import * as Speech from "expo-speech";
import { Button, useTheme } from "react-native-paper";
import {
  SafeAreaInsetsContext,
  SafeAreaView,
} from "react-native-safe-area-context";

import { RootState } from "@/store";
import { calculateWidthOfWord } from "@/utils/fontSize";
import { AudioModule } from "expo-audio";
import { useSelector } from "react-redux";

export default function ShowingModal({
  text,
  onDone,
}: {
  text?: string | null;
  onDone: () => void;
}) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [highlight, setHighlight] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const isWeb = Platform.OS === "web";

  const [numLines, setNumLines] = useState<number>(6);
  const [longestWordLength, setLongestWordLength] = useState<number>(0);

  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();

  const safeAreaContext = useContext(SafeAreaInsetsContext);

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
    if (longest / 100 > 4 && lines >= 4) {
      setNumLines((n) => n - 2);
    }
    setLongestWordLength(longest / 100);
  }, [text]);

  const calcFontSize = () => {
    if (longestWordLength > 10) {
      return 35;
    }
    if (longestWordLength > 7) {
      return 50;
    }
    if (longestWordLength > 5) {
      return 65;
    }
    return 100;
  };

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
          onPress={() => {
            Speech.resume();
            setIsPaused(false);
            setIsSpeaking(true);
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
                setHighlight({
                  start: 0,
                  end: 0,
                });
                setIsSpeaking(false);
                setIsPaused(false);
              },
              onPause: () => {
                setIsSpeaking(false);
                setIsPaused(true);
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
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        backgroundColor: "transparent",
        maxWidth: 600,
        alignSelf: "center",
      }}>
      <SafeAreaView
        style={{
          flex: 1,
          maxWidth: 600,
          alignSelf: "center",
          width: "100%",
          backgroundColor: "rgba(0,0,0,.9)",
          paddingTop: safeAreaContext?.top,
          paddingBottom: safeAreaContext?.bottom,
        }}>
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
            style={{
              flexShrink: 1,
              fontSize: calcFontSize(),
              width: "98%",
              fontWeight: "bold",
              textAlign: "center",
              verticalAlign: "middle",
              color: "white",
            }}
            textBreakStrategy="balanced">
            {text?.slice(0, highlight.start)}
            <Text style={{ color: theme.colors.tertiary }}>
              {text?.slice(highlight.start, highlight.end)}
            </Text>
            {text?.slice(highlight.end)}
          </Text>
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
              paddingTop: 30,
              width: "100%",
            }}>
            <Button
              mode="contained"
              labelStyle={formStyles.bigButton}
              onPress={() => {
                Speech.stop();
                setIsSpeaking(false);
                onDone();
              }}>
              Done
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
