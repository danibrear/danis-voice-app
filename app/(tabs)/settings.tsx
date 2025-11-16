import ThemedView from "@/components/themed/ThemedView";
import { allColors } from "@/constants/colorPatterns";
import { RootState } from "@/store";
import {
  setColors,
  setPitch,
  setPreferredVoice,
  setRate,
} from "@/store/preferences";
import { coreStyles } from "@/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import {
  Button,
  Checkbox,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function Settings() {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [isChoosingVoice, setIsChoosingVoice] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);

  const [filter, setFilter] = useState("");

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((availableVoices) => {
      setVoices(availableVoices);
    });
  }, []);

  useEffect(() => {
    let interval;
    if (!isTestingVoice) {
      return;
    }
    interval = setInterval(() => {
      Speech.isSpeakingAsync().then((speaking) => {
        if (!speaking && isTestingVoice) {
          setIsTestingVoice(null);
        }
      });
    }, 25);
    return () => clearInterval(interval);
  }, [isTestingVoice]);

  const preferredVoice = useMemo(
    () =>
      voices.find((voice) => {
        return voice.identifier === preferences.preferredVoice;
      }),
    [voices, preferences.preferredVoice],
  );
  const sortedVoiceByName = useMemo(() => {
    return voices.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }, [voices]);

  const filteredVoices = useMemo(() => {
    if (!filter || filter.trim() === "") {
      return sortedVoiceByName;
    }
    return sortedVoiceByName.filter((voice) => {
      return (
        voice.name.toLowerCase().includes(filter.toLowerCase()) ||
        voice.language.toLowerCase().includes(filter.toLowerCase()) ||
        voice.identifier.toLowerCase().includes(filter.toLowerCase())
      );
    });
  }, [filter, sortedVoiceByName]);
  return (
    <ThemedView style={coreStyles.container}>
      <SafeAreaView style={coreStyles.container}>
        <ScrollView
          style={{
            flexGrow: 1,
          }}>
          <View style={{ padding: 10 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                flexGrow: 1,
                gap: 5,
              }}>
              <View style={{ flexGrow: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                    }}>
                    Pitch: {(preferences.speechPitch * 100).toFixed(0)}%
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 10,
                    }}>
                    <Button
                      labelStyle={{ fontWeight: "bold", fontSize: 20 }}
                      mode="contained"
                      onPress={() => {
                        dispatch(setPitch(preferences.speechPitch - 0.1));
                      }}>
                      <MaterialIcons
                        name="arrow-downward"
                        size={20}
                        color={theme.colors.onPrimary}
                      />
                    </Button>
                    <Button
                      labelStyle={{ fontWeight: "bold", fontSize: 20 }}
                      mode="contained"
                      onPress={() => {
                        dispatch(setPitch(preferences.speechPitch + 0.1));
                      }}>
                      <MaterialIcons
                        name="arrow-upward"
                        size={20}
                        color={theme.colors.onPrimary}
                      />
                    </Button>
                  </View>
                </View>
                <Divider style={{ marginVertical: 10 }} />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                    }}>
                    Rate: {preferences.speechRate.toFixed(1)}x
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 10,
                    }}>
                    <Button
                      labelStyle={{ fontWeight: "bold", fontSize: 20 }}
                      mode="contained"
                      onPress={() => {
                        dispatch(setRate(preferences.speechRate - 0.1));
                      }}>
                      <MaterialIcons
                        name="arrow-downward"
                        size={20}
                        color={theme.colors.onPrimary}
                      />
                    </Button>
                    <Button
                      labelStyle={{ fontWeight: "bold", fontSize: 20 }}
                      mode="contained"
                      onPress={() => {
                        dispatch(setRate(preferences.speechRate + 0.1));
                      }}>
                      <MaterialIcons
                        name="arrow-upward"
                        size={20}
                        color={theme.colors.onPrimary}
                      />
                    </Button>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexShrink: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderLeftWidth: 1,
                  borderLeftColor: theme.colors.onSurfaceDisabled,
                  paddingLeft: 10,
                  marginLeft: 10,
                }}>
                <Button
                  mode="contained"
                  labelStyle={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  style={{
                    borderRadius: 100,
                  }}
                  onPress={() => {
                    AudioModule.setAudioModeAsync({
                      playsInSilentMode: true,
                    });
                    Speech.speak("Made with love by Dani", {
                      voice: preferences.preferredVoice,
                      pitch: preferences.speechPitch,
                      rate: preferences.speechRate,
                    });
                  }}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                      justifyContent: "center",
                      flexGrow: 1,
                    }}>
                    <MaterialIcons
                      name="favorite"
                      size={20}
                      color={theme.colors.tertiary}
                    />
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: theme.colors.onPrimary,
                      }}>
                      Test
                    </Text>
                  </View>
                </Button>
              </View>
            </View>

            <View>
              <Divider style={{ marginVertical: 10 }} />
              <Text style={{ fontWeight: "bold", marginVertical: 5 }}>
                What voice would you like to use?
              </Text>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}>
                {preferredVoice && (
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      display: "flex",
                      flexShrink: 1,
                    }}>
                    {preferredVoice.name} ({preferredVoice.language})
                  </Text>
                )}
                {!preferredVoice && <Text>Using Default</Text>}
                <Button
                  onPress={() => {
                    setIsChoosingVoice(true);
                  }}>
                  Change Voice
                </Button>
              </View>
            </View>
            <Divider style={{ marginVertical: 10 }} />
            <Text style={{ fontWeight: "bold", marginVertical: 5 }}>
              What colors would you like for the highlight?
            </Text>
            {allColors.map(({ name, colors }, index) => (
              <TouchableOpacity
                key={`color-pattern-${index}`}
                onPress={() => {
                  dispatch(setColors(name));
                }}
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: theme.colors.surface,
                }}>
                <Checkbox.Android
                  status={preferences.colors === name ? "checked" : "unchecked"}
                />
                <View
                  style={{
                    width: 1,
                    height: 20,
                    marginRight: 5,
                    backgroundColor: theme.colors.onSurface,
                  }}
                />
                <View style={{ display: "flex", flexDirection: "row", gap: 2 }}>
                  {colors.map((colorPattern, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colorPattern,
                        borderColor: colorPattern.includes("#fff")
                          ? "#aaa"
                          : "transparent",
                        borderWidth: 1,
                        height: 20,
                        width: 20,
                      }}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                dispatch(setColors("default"));
              }}
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 5,
                backgroundColor: theme.colors.surface,
              }}>
              <Checkbox.Android
                status={
                  !preferences.colors || preferences.colors === "default"
                    ? "checked"
                    : "unchecked"
                }
              />
              <View
                style={{
                  width: 1,
                  height: 20,
                  marginRight: 5,
                  backgroundColor: theme.colors.onSurface,
                }}
              />
              <View
                style={{
                  backgroundColor: theme.colors.tertiary,
                  height: 20,
                  width: 20,
                }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <TouchableOpacity
              onPress={() => {
                WebBrowser.openBrowserAsync("https://db.rocks");
              }}
              style={{
                paddingHorizontal: 50,
                paddingVertical: 25,
                borderColor: theme.colors.tertiary,
                borderWidth: 1,
                borderRadius: 10,
                backgroundColor: theme.colors.surface,
              }}>
              <Text
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 16,
                }}>
                Made with{" "}
                <Icon source="heart" color={theme.colors.tertiary} size={20} />{" "}
                by DaniB
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 200 }}></View>
        </ScrollView>
      </SafeAreaView>

      <Dialog
        visible={isChoosingVoice}
        onDismiss={() => setIsChoosingVoice(false)}>
        <Dialog.Title>Choose a Voice</Dialog.Title>
        <Dialog.Content>
          <TextInput
            mode="outlined"
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
            placeholder="Filter voices..."
            value={filter}
            onChangeText={(text) => setFilter(text)}
            style={{
              marginBottom: 10,
            }}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{
              maxHeight: 400,
            }}>
            {filteredVoices.map((voice, index) => (
              <View
                key={`voice-option-dialog-${index}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: theme.colors.surface,
                  borderBottomColor: theme.colors.onSurfaceDisabled,
                  borderBottomWidth: 1,
                }}>
                <TouchableOpacity
                  style={{
                    display: "flex",
                    flexGrow: 1,
                  }}
                  onPress={() => {
                    dispatch(setPreferredVoice(voice.identifier));
                    setIsChoosingVoice(false);
                    setFilter("");
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color:
                        voice.identifier === preferences.preferredVoice
                          ? theme.colors.tertiary
                          : theme.colors.onSurface,
                    }}>
                    {voice.identifier === preferences.preferredVoice
                      ? "> "
                      : ""}
                    {voice.name} ({voice.language})
                  </Text>
                </TouchableOpacity>
                <IconButton
                  icon={
                    isTestingVoice === voice.identifier ? "stop" : "volume-high"
                  }
                  size={20}
                  onPress={() => {
                    Keyboard.dismiss();
                    AudioModule.setAudioModeAsync({
                      playsInSilentMode: true,
                    });
                    if (isTestingVoice === voice.identifier) {
                      Speech.stop();
                      setIsTestingVoice(null);
                      return;
                    }
                    if (isTestingVoice && isTestingVoice !== voice.identifier) {
                      Speech.stop();
                    }
                    Speech.speak("This is a voice test.", {
                      voice: voice.identifier,
                      pitch: preferences.speechPitch,
                      rate: preferences.speechRate,
                    });
                    setIsTestingVoice(voice.identifier);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setIsChoosingVoice(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </ThemedView>
  );
}
