import { allColors } from "@/constants/colorPatterns";
import { RootState } from "@/store";
import { setColors, setPitch, setRate } from "@/store/preferences";
import { coreStyles } from "@/styles";
import * as WebBrowser from "expo-web-browser";
import { TouchableOpacity, View } from "react-native";
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function Settings() {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();
  return (
    <View style={coreStyles.container}>
      <SafeAreaView style={coreStyles.container}>
        <View style={{ padding: 10 }}>
          <Text
            style={{
              fontSize: 25,
              marginBottom: 10,
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
              style={{ flexGrow: 1 }}
              labelStyle={{ fontWeight: "bold", fontSize: 20 }}
              mode="contained"
              onPress={() => {
                dispatch(setPitch(preferences.speechPitch - 0.1));
              }}>
              Pitch Down
            </Button>
            <Button
              style={{ flexGrow: 1 }}
              labelStyle={{ fontWeight: "bold", fontSize: 20 }}
              mode="contained"
              onPress={() => {
                dispatch(setPitch(preferences.speechPitch + 0.1));
              }}>
              Pitch Up
            </Button>
          </View>
          <Divider style={{ marginVertical: 10 }} />
          <Text
            style={{
              fontSize: 25,
              marginBottom: 10,
            }}>
            Rate: {(preferences.speechRate * 100).toFixed(0)}%
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
            }}>
            <Button
              style={{ flexGrow: 1 }}
              labelStyle={{ fontWeight: "bold", fontSize: 20 }}
              mode="contained"
              onPress={() => {
                dispatch(setRate(preferences.speechRate - 0.1));
              }}>
              Rate Down
            </Button>
            <Button
              style={{ flexGrow: 1 }}
              labelStyle={{ fontWeight: "bold", fontSize: 20 }}
              mode="contained"
              onPress={() => {
                dispatch(setRate(preferences.speechRate + 0.1));
              }}>
              Rate Up
            </Button>
          </View>
          <Divider style={{ marginVertical: 10 }} />
          <Text style={{ fontWeight: "bold" }}>
            What Colors would you like for the highlight?
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
              borderWidth: 0.5,
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
              <Icon source="heart" color={theme.colors.tertiary} size={20} /> by
              DaniB
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
