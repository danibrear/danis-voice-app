import ThemedView from "@/components/themed/ThemedView";
import { allColors } from "@/constants/colorPatterns";
import { RootState } from "@/store";
import {
  setChatReturnKeySendsMessage,
  setColors,
  setPitch,
  setPreferredVoice,
  setRate,
} from "@/store/preferences";
import { coreStyles } from "@/styles";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import * as Updates from "expo-updates";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import {
  Button,
  Checkbox,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Snackbar,
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

  const [voicesOrder, setVoicesOrder] = useState<"language" | "name">("name");

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);

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

  const resetStatusMessages = useCallback(() => {
    setError(null);
    setInfo(null);
    setSuccess(null);
  }, []);

  useEffect(() => {
    if (!info && !success && !error) {
      return;
    }
    const interval = setTimeout(() => {
      resetStatusMessages();
    }, 3000);
    return () => clearTimeout(interval);
  }, [info, success, error, resetStatusMessages]);

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

  const voicesByLanguage = useMemo(() => {
    const grouped: { [language: string]: Speech.Voice[] } = {};
    sortedVoiceByName.forEach((voice) => {
      if (!grouped[voice.language]) {
        grouped[voice.language] = [];
      }
      grouped[voice.language].push(voice);
    });
    return grouped;
  }, [sortedVoiceByName]);

  const selectedVoices = useMemo(() => {
    if (voicesOrder === "name") {
      return sortedVoiceByName;
    } else {
      const groupedVoices = voicesByLanguage;
      const result: Speech.Voice[] = [];
      Object.keys(groupedVoices).forEach((language) => {
        const sorted = groupedVoices[language].sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        result.push(...sorted);
      });
      return result;
    }
  }, [voicesByLanguage, sortedVoiceByName, voicesOrder]);

  const filteredVoices = useMemo(() => {
    if (!filter || filter.trim() === "") {
      return selectedVoices;
    }
    return selectedVoices.filter((voice) => {
      return (
        voice.name.toLowerCase().includes(filter.toLowerCase()) ||
        voice.language.toLowerCase().includes(filter.toLowerCase()) ||
        voice.identifier.toLowerCase().includes(filter.toLowerCase())
      );
    });
  }, [filter, selectedVoices]);
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
            <View>
              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    setChatReturnKeySendsMessage(
                      !preferences.chatReturnKeySendsMessage,
                    ),
                  );
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
                <Checkbox.Android
                  status={
                    preferences.chatReturnKeySendsMessage
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() => {
                    dispatch(
                      setChatReturnKeySendsMessage(
                        !preferences.chatReturnKeySendsMessage,
                      ),
                    );
                  }}
                />
                <Text style={{ fontWeight: "bold" }}>
                  Return key sends message in chat
                </Text>
              </TouchableOpacity>
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
                  padding: 5,
                  borderRadius: 10,
                  marginBottom: 5,
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
                          ? "#dbdbdb"
                          : "transparent",
                        borderWidth: 1,
                        borderRadius: 2,
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
                padding: 5,
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
          <Button
            mode="outlined"
            loading={isCheckingForUpdates}
            icon={(props) => <FontAwesome name="refresh" {...props} />}
            style={{
              marginTop: 10,
              alignSelf: "center",
            }}
            onPress={() => {
              resetStatusMessages();
              setIsCheckingForUpdates(true);
              Updates.checkForUpdateAsync()
                .then(async (update) => {
                  if (update.isAvailable) {
                    setInfo("Update available. Downloading...");
                    const reloaded = await Updates.fetchUpdateAsync();
                    if (reloaded.isNew) {
                      await Updates.reloadAsync();
                    }
                  } else {
                    setInfo("The app is up to date.");
                  }
                })
                .catch((e) => {
                  setError(
                    "Error checking for updates. Please try again later.",
                  );
                })
                .finally(() => {
                  setIsCheckingForUpdates(false);
                });
            }}>
            Check for App Updates
          </Button>
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              marginBottom: 10,
            }}>
            <Button
              style={{ width: "50%" }}
              mode={voicesOrder === "name" ? "contained" : "text"}
              onPress={() => setVoicesOrder("name")}>
              By Name
            </Button>
            <Button
              style={{ width: "50%" }}
              mode={voicesOrder === "language" ? "contained" : "text"}
              onPress={() => setVoicesOrder("language")}>
              By Language
            </Button>
          </View>
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
                    Speech.speak(
                      "The quick brown fox jumps over the lazy dog.",
                      {
                        voice: voice.identifier,
                        pitch: preferences.speechPitch,
                        rate: preferences.speechRate,
                      },
                    );
                    setIsTestingVoice(voice.identifier);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: "space-between" }}>
          <Button
            icon={(props) => <FontAwesome name="refresh" {...props} />}
            onPress={() => {
              resetStatusMessages();
              Speech.getAvailableVoicesAsync()
                .then((availableVoices) => {
                  setVoices(availableVoices);
                  setSuccess("Voices refreshed successfully");
                })
                .catch((e) => {
                  setError("Error refreshing voices: " + e.message);
                });
            }}>
            Refresh Voices
          </Button>
          <Button onPress={() => setIsChoosingVoice(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar
        visible={info !== null}
        onDismiss={() => setInfo(null)}
        duration={3000}>
        {info}
      </Snackbar>
      <Snackbar
        visible={error !== null}
        onDismiss={() => setError(null)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}>
        {error}
      </Snackbar>
      <Snackbar
        visible={success !== null}
        onDismiss={() => setSuccess(null)}
        duration={3000}
        style={{ backgroundColor: theme.colors.primary }}>
        {success}
      </Snackbar>
    </ThemedView>
  );
}
