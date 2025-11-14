import { useContext, useState } from "react";
import { Modal, Text, View } from "react-native";

import { usePrefContext } from "@/hooks/usePrefContext";
import { formStyles } from "@/styles";
import * as Speech from "expo-speech";
import { Button } from "react-native-paper";
import {
  SafeAreaInsetsContext,
  SafeAreaView,
} from "react-native-safe-area-context";

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

  const { preferences } = usePrefContext();

  const safeAreaContext = useContext(SafeAreaInsetsContext);

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
      }}>
      <SafeAreaView
        style={{
          flex: 1,
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
            flexGrow: 1,
          }}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={15}
            style={{
              fontSize: 100,
              width: "95%",
              fontWeight: "bold",
              textAlign: "center",
              color: "white",
            }}>
            {text?.slice(0, highlight.start)}
            <Text style={{ color: "blue" }}>
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
          }}>
          <View
            style={{
              paddingHorizontal: 10,
              display: "flex",
              flexDirection: "row",
            }}>
            {renderControls()}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              paddingHorizontal: 10,
              paddingTop: 30,
            }}>
            <Button
              mode="contained"
              style={{ flexGrow: 1 }}
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
