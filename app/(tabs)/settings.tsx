import { RootState } from "@/store";
import { setPitch, setRate } from "@/store/preferences";
import { coreStyles } from "@/styles";
import * as WebBrowser from "expo-web-browser";
import { TouchableOpacity, View } from "react-native";
import { Button, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function Settings() {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);
  const theme = useTheme();
  return (
    <View style={coreStyles.container}>
      <SafeAreaView style={coreStyles.container}>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 30,
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
          <Divider style={{ marginVertical: 30 }} />
          <Text
            style={{
              fontSize: 30,
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
              borderColor: theme.colors.primary,
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
              Made with ❤️ by DaniB
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
