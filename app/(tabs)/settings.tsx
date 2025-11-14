import { coreStyles } from "@/styles";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePrefContext } from "@/hooks/usePrefContext";
import { Button, Divider, Text } from "react-native-paper";

export default function Settings() {
  const { preferences, setPitch, setRate } = usePrefContext();
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
                setPitch(preferences.speechPitch - 0.1);
              }}>
              Pitch Down
            </Button>
            <Button
              style={{ flexGrow: 1 }}
              labelStyle={{ fontWeight: "bold", fontSize: 20 }}
              mode="contained"
              onPress={() => {
                setPitch(preferences.speechPitch + 0.1);
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
                setRate(preferences.speechRate - 0.1);
              }}>
              Rate Down
            </Button>
            <Button
              style={{ flexGrow: 1 }}
              labelStyle={{ fontWeight: "bold", fontSize: 20 }}
              mode="contained"
              onPress={() => {
                setRate(preferences.speechRate + 0.1);
              }}>
              Rate Up
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
