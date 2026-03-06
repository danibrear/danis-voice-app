import ThemedView from "@/components/themed/ThemedView";
import { RootState } from "@/store";
import {
  addTranslationPersonality,
  deleteTranslationPersonality,
  getFavoriteVoiceIds,
  getTranslationPersonalities,
  setTranslateLanguages,
  setTranslationEnabled,
  TranslationPersonality,
  updateTranslationPersonality,
} from "@/store/preferences";
import { coreStyles } from "@/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech";
import { onTranslateTask } from "expo-translate-text";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  Button,
  Divider,
  IconButton,
  RadioButton,
  SegmentedButtons,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "hi", label: "Hindi" },
];

type Mode = "list" | "create" | "edit";

export default function PersonalitiesScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const personalities = useSelector(getTranslationPersonalities);
  const preferences = useSelector((state: RootState) => state.preferences);
  const favoriteVoiceIds = useSelector(getFavoriteVoiceIds);

  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"languages" | "voice">("languages");
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const seen = new Set<string>();
        setAvailableVoices(
          voices.filter((v) => {
            if (seen.has(v.identifier)) return false;
            seen.add(v.identifier);
            return true;
          }),
        );
      })
      .catch(() => {});
  }, []);

  const voicesForTargetLang = useMemo(
    () => availableVoices.filter((v) => v.language.startsWith(targetLang)),
    [availableVoices, targetLang],
  );

  const favoritedVoicesForLang = useMemo(
    () =>
      voicesForTargetLang.filter((v) =>
        favoriteVoiceIds.includes(v.identifier),
      ),
    [voicesForTargetLang, favoriteVoiceIds],
  );

  const otherVoicesForLang = useMemo(
    () =>
      voicesForTargetLang.filter(
        (v) => !favoriteVoiceIds.includes(v.identifier),
      ),
    [voicesForTargetLang, favoriteVoiceIds],
  );

  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  const testVoice = async (identifier: string | undefined) => {
    const key = identifier ?? "default";
    setTestingVoiceId(key);
    try {
      const result = await onTranslateTask({
        input: "made with love by dani",
        sourceLangCode: "en",
        targetLangCode: targetLang,
      });
      const translated = Array.isArray(result.translatedTexts)
        ? (result.translatedTexts[0] as string)
        : (result.translatedTexts as string);
      Speech.speak(translated, {
        voice: identifier,
        language: targetLang,
      });
    } catch {
      // ignore
    } finally {
      setTestingVoiceId(null);
    }
  };

  const makeName = (src: string, tgt: string) => {
    const srcLabel = src.toUpperCase();
    const tgtLabel = tgt.toUpperCase();
    return `${srcLabel} → ${tgtLabel}`;
  };

  const openCreate = () => {
    setEditingId(null);
    setSourceLang(preferences.translateSourceLang ?? "en");
    setTargetLang(preferences.translateTargetLang ?? "es");
    setVoiceId(undefined);
    setTab("languages");
    setMode("create");
  };

  const openEdit = (p: TranslationPersonality) => {
    setEditingId(p.id);
    setSourceLang(p.sourceLang);
    setTargetLang(p.targetLang);
    setVoiceId(p.voiceId);
    setTab("languages");
    setMode("edit");
  };

  const handleSave = () => {
    const personality: TranslationPersonality = {
      id: mode === "edit" && editingId ? editingId : Date.now().toString(),
      name: makeName(sourceLang, targetLang),
      sourceLang,
      targetLang,
      voiceId,
    };
    if (mode === "edit") {
      dispatch(updateTranslationPersonality(personality));
    } else {
      dispatch(addTranslationPersonality(personality));
    }
    setMode("list");
  };

  const handleSelect = (p: TranslationPersonality) => {
    dispatch(
      setTranslateLanguages({
        sourceLang: p.sourceLang,
        targetLang: p.targetLang,
        voiceId: p.voiceId,
      }),
    );
    dispatch(setTranslationEnabled(true));
    navigator.goBack();
  };

  const handleTurnOff = () => {
    dispatch(setTranslationEnabled(false));
    navigator.goBack();
  };

  const title =
    mode === "list"
      ? "Personalities"
      : mode === "create"
        ? "New Personality"
        : "Edit Personality";

  return (
    <ThemedView style={coreStyles.container}>
      <SafeAreaView style={coreStyles.container}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingTop: 4,
          }}>
          <IconButton
            icon={mode === "list" ? "close" : "arrow-left"}
            onPress={() => {
              if (mode === "list") {
                navigator.goBack();
              } else {
                setMode("list");
              }
            }}
          />
          <Text style={{ fontSize: 20, fontWeight: "bold", flex: 1 }}>
            {title}
          </Text>
          {mode === "list" && (
            <Button icon="plus" onPress={openCreate}>
              New
            </Button>
          )}
        </View>

        <Divider />

        {/* LIST MODE */}
        {mode === "list" && (
          <ScrollView style={{ flex: 1 }}>
            {personalities.length === 0 && (
              <Text
                style={{
                  textAlign: "center",
                  marginVertical: 24,
                  color: theme.colors.onSurfaceVariant,
                }}>
                No personalities yet. Tap + New to create one.
              </Text>
            )}
            {personalities.map((p) => {
              const srcLabel =
                LANGUAGES.find((l) => l.code === p.sourceLang)?.label ??
                p.sourceLang;
              const tgtLabel =
                LANGUAGES.find((l) => l.code === p.targetLang)?.label ??
                p.targetLang;
              const voice = availableVoices.find(
                (v) => v.identifier === p.voiceId,
              );
              const isActive =
                preferences.translationEnabled &&
                preferences.translateSourceLang === p.sourceLang &&
                preferences.translateTargetLang === p.targetLang &&
                preferences.translateVoice === p.voiceId;
              return (
                <TouchableRipple key={p.id} onPress={() => handleSelect(p)}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surfaceVariant,
                    }}>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}>
                        {isActive && (
                          <MaterialIcons
                            name="check-circle"
                            size={16}
                            color={theme.colors.primary}
                          />
                        )}
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 16,
                            color: isActive
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                          }}>
                          {p.name}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          fontSize: 13,
                        }}>
                        {srcLabel} → {tgtLabel}
                        {voice ? `  ·  ${voice.name}` : ""}
                      </Text>
                    </View>
                    <IconButton
                      icon="pencil"
                      size={18}
                      onPress={() => openEdit(p)}
                    />
                    <IconButton
                      icon="delete"
                      size={18}
                      onPress={() => {
                        if (isActive) {
                          dispatch(setTranslationEnabled(false));
                        }
                        dispatch(deleteTranslationPersonality(p.id));
                      }}
                    />
                  </View>
                </TouchableRipple>
              );
            })}

            {preferences.translationEnabled && (
              <View style={{ padding: 16 }}>
                <Button
                  mode="outlined"
                  onPress={handleTurnOff}
                  style={{ width: "100%" }}>
                  Turn Off Translation
                </Button>
              </View>
            )}
          </ScrollView>
        )}

        {/* CREATE / EDIT MODE */}
        {(mode === "create" || mode === "edit") && (
          <View style={{ flex: 1 }}>
            <View style={{ padding: 16, gap: 12 }}>
              <SegmentedButtons
                value={tab}
                onValueChange={(v) => setTab(v as "languages" | "voice")}
                buttons={[
                  { value: "languages", label: "Languages" },
                  { value: "voice", label: "Voice" },
                ]}
              />
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
              {tab === "languages" && (
                <>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: 4,
                      marginBottom: 4,
                    }}>
                    From
                  </Text>
                  {LANGUAGES.map((lang) => (
                    <RadioButton.Item
                      key={`src-${lang.code}`}
                      label={lang.label}
                      value={lang.code}
                      status={
                        sourceLang === lang.code ? "checked" : "unchecked"
                      }
                      onPress={() => setSourceLang(lang.code)}
                    />
                  ))}
                  <Divider style={{ marginVertical: 8 }} />
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    To
                  </Text>
                  {LANGUAGES.map((lang) => (
                    <RadioButton.Item
                      key={`tgt-${lang.code}`}
                      label={lang.label}
                      value={lang.code}
                      status={
                        targetLang === lang.code ? "checked" : "unchecked"
                      }
                      onPress={() => {
                        setTargetLang(lang.code);
                        setVoiceId(undefined);
                        setTab("voice");
                      }}
                    />
                  ))}
                </>
              )}

              {tab === "voice" && (
                <>
                  {availableVoices.length === 0 && (
                    <ActivityIndicator
                      style={{ marginVertical: 20 }}
                      size="small"
                    />
                  )}
                  {favoritedVoicesForLang.length > 0 && (
                    <>
                      <Text
                        style={{
                          fontWeight: "bold",
                          marginTop: 10,
                          marginBottom: 4,
                        }}>
                        Favorites
                      </Text>
                      {favoritedVoicesForLang.map((voice) => (
                        <TouchableRipple
                          key={`fav-${voice.identifier}`}
                          onPress={() => setVoiceId(voice.identifier)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 6,
                            paddingLeft: 8,
                          }}>
                          <>
                            <RadioButton
                              value={voice.identifier}
                              status={voiceId === voice.identifier ? "checked" : "unchecked"}
                              onPress={() => setVoiceId(voice.identifier)}
                            />
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text>{voice.name}</Text>
                              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                                {voice.quality === "Default" ? "Standard" : voice.quality} · {voice.language}
                              </Text>
                            </View>
                            <IconButton
                              icon={testingVoiceId === voice.identifier ? "loading" : "play-circle-outline"}
                              size={22}
                              disabled={testingVoiceId !== null}
                              onPress={() => testVoice(voice.identifier)}
                            />
                          </>
                        </TouchableRipple>
                      ))}
                      <Divider style={{ marginVertical: 8 }} />
                    </>
                  )}
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: favoritedVoicesForLang.length === 0 ? 10 : 0,
                      marginBottom: 4,
                    }}>
                    {favoritedVoicesForLang.length > 0
                      ? "All Voices"
                      : "Voices"}
                  </Text>
                  <TouchableRipple
                    onPress={() => setVoiceId(undefined)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 6,
                      paddingLeft: 8,
                    }}>
                    <>
                      <RadioButton
                        value=""
                        status={!voiceId ? "checked" : "unchecked"}
                        onPress={() => setVoiceId(undefined)}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text>Default</Text>
                      </View>
                      <IconButton
                        icon={testingVoiceId === "default" ? "loading" : "play-circle-outline"}
                        size={22}
                        disabled={testingVoiceId !== null}
                        onPress={() => testVoice(undefined)}
                      />
                    </>
                  </TouchableRipple>
                  {otherVoicesForLang.map((voice) => (
                    <TouchableRipple
                      key={voice.identifier}
                      onPress={() => setVoiceId(voice.identifier)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 6,
                        paddingLeft: 8,
                      }}>
                      <>
                        <RadioButton
                          value={voice.identifier}
                          status={voiceId === voice.identifier ? "checked" : "unchecked"}
                          onPress={() => setVoiceId(voice.identifier)}
                        />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text>{voice.name}</Text>
                          <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                            {voice.quality === "Default" ? "Standard" : voice.quality} · {voice.language}
                          </Text>
                        </View>
                        <IconButton
                          icon={testingVoiceId === voice.identifier ? "loading" : "play-circle-outline"}
                          size={22}
                          disabled={testingVoiceId !== null}
                          onPress={() => testVoice(voice.identifier)}
                        />
                      </>
                    </TouchableRipple>
                  ))}
                </>
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View style={{ padding: 16, gap: 8 }}>
                <Button
                  mode="contained"
                  style={{ width: "100%" }}
                  onPress={handleSave}>
                  Save
                </Button>
                <Button
                  style={{ width: "100%" }}
                  onPress={() => setMode("list")}>
                  Back
                </Button>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
