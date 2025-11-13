import Button from "@/components/buttons";
import { useRecentWords } from "@/hooks/useRecentWords";
import { coreStyles, formStyles, spacingStyles } from "@/styles";
import * as Speech from "expo-speech";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, List, Modal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeListView } from "react-native-swipe-list-view";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");

  const {
    recentTexts,
    isLoading: isLoadingRecentWords,
    addRecentText,
    starText,
    unstarText,
    removeText,
  } = useRecentWords();

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isShowing, setIsShowing] = useState<boolean>(false);

  const calcFontSize = () => {
    if (textInput.length > 20) {
      return 50;
    }
    return 100;
  };

  const renderPlayPause = () => {
    const buttons = [];
    if (isSpeaking) {
      buttons.push(
        <Button
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
          style={{ flexGrow: 1 }}
          onPress={() => {
            setIsSpeaking(true);
            Speech.speak(textInput, {
              onDone: () => {
                console.log("Finished speaking");
                setIsSpeaking(false);
                setIsPaused(false);
              },
              onPause: () => {
                console.log("Speech paused");
                setIsSpeaking(false);
                setIsPaused(true);
              },
              onMark: () => {
                console.log("Reached a mark in the speech");
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
    <View style={coreStyles.container}>
      <SafeAreaView style={[coreStyles.container]}>
        <View
          style={[
            spacingStyles.px5,
            {
              paddingBottom: 10,
              marginBottom: 10,
              borderBottomColor: "#dbdbdb",
              borderBottomWidth: 1,
              backgroundColor: "white",
            },
          ]}>
          <TextInput
            value={textInput}
            clearButtonMode="always"
            multiline
            numberOfLines={2}
            style={formStyles.textInput}
            onChangeText={(t) => {
              setTextInput(t);
            }}
            placeholder="Enter Text"
          />

          <Button
            style={{
              marginTop: 10,
            }}
            onPress={() => {
              setIsShowing(true);
              addRecentText(textInput);
            }}>
            Show
          </Button>

          {isLoadingRecentWords && <ActivityIndicator />}
        </View>

        <SwipeListView
          data={recentTexts}
          keyExtractor={(item) => item.id}
          rightOpenValue={-75}
          renderHiddenItem={({ item }) => {
            return (
              <View style={styles.hiddenContainer}>
                <IconButton
                  icon="trash-can-outline"
                  iconColor="#c93c3c"
                  size={50}
                  onPress={() => {
                    removeText(item.id);
                  }}
                  style={[styles.iconButtonDelete]}
                />
              </View>
            );
          }}
          renderItem={({ item }) => {
            const icon = item.starred ? "star" : "star-outline";
            const color = item.starred ? "gold" : undefined;
            return (
              <List.Item
                style={styles.listItem}
                titleStyle={styles.title}
                title={item.text}
                onPress={() => {
                  setTextInput(item.text);
                  setIsShowing(true);
                  Keyboard.dismiss();
                }}
                right={() => (
                  <TouchableOpacity
                    onPress={() => {
                      if (item.starred) {
                        unstarText(item.id);
                      } else {
                        starText(item.id);
                      }
                    }}>
                    <List.Icon color={color} icon={icon} />
                  </TouchableOpacity>
                )}
              />
            );
          }}
        />
      </SafeAreaView>
      <Modal
        visible={isShowing}
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,.9)",
        }}>
        <View
          style={{
            flex: 1,
            alignSelf: "stretch",

            alignItems: "center",
            justifyContent: "center",
          }}>
          <Text
            style={{
              fontSize: calcFontSize(),
              fontWeight: "bold",
              textAlign: "center",
              color: "white",
            }}>
            {textInput}
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              display: "flex",
              flexDirection: "row",
              marginTop: 30,
            }}>
            {renderControls()}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 20,
            paddingHorizontal: 10,
          }}>
          <Button
            style={{ flexGrow: 1 }}
            onPress={() => {
              Speech.stop();
              setIsSpeaking(false);
              setIsShowing(false);
              setTextInput("");
            }}>
            Done
          </Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 75,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarText: {
    color: "#ffffff",
    fontSize: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#eee",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    height: 40,
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  listItem: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 25,
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  iconButtonDelete: {
    marginTop: 10,
    borderRadius: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  hiddenContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  button: {
    backgroundColor: "#0067ee",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 24,
    color: "#888",
  },
});
