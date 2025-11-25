import { getDevToolsEnabled, setDevtoolsEnabled } from "@/store/preferences";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import {
  Appbar,
  Divider,
  Icon,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function About() {
  const navigator = useNavigation();
  const theme = useTheme();

  const [touches, setTouches] = useState(0);

  const devToolsEnabled = useSelector(getDevToolsEnabled);

  const dispatch = useDispatch();

  const handleTouch = () => {
    setTouches((prev) => prev + 1);
    if (touches >= 10) {
      dispatch(setDevtoolsEnabled(true));
    }
  };
  return (
    <View>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            if (navigator.canGoBack()) {
              navigator.goBack();
            }
          }}
        />
        <Appbar.Content title="About Danis Voice App" />
      </Appbar.Header>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginVertical: 10,
          paddingHorizontal: 10,
          textAlign: "center",
        }}>
        Thank you for using Danis Voice App!
      </Text>
      <Divider style={{ marginVertical: 10 }} />
      <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 10 }}>
        I made this app when I was on voice rest and could not find a single app
        that did what I needed. This app is and will always be free.{" "}
        {
          "I don't want to show ads because I feel like they detract from the user experience."
        }
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10, paddingHorizontal: 10 }}>
        The web version is available at https://voice.db.rocks
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10, paddingHorizontal: 10 }}>
        The iOS and Android versions are available on their respective app
        stores.
      </Text>
      <Divider style={{ marginVertical: 10 }} />
      <Text
        style={{
          fontSize: 16,
          marginBottom: 10,
          paddingHorizontal: 10,
          textAlign: "center",
        }}>
        If you have any feedback or feature requests, please reach out to
        support@db.rocks
      </Text>
      <Text
        style={{
          fontSize: 16,
          paddingHorizontal: 10,
          fontWeight: "bold",
          textAlign: "center",
        }}>
        {"We're glad you're here!"}
      </Text>
      <View
        style={{
          alignItems: "center",
          marginTop: 20,
          flexDirection: "row",
          justifyContent: "center",
          gap: 5,
        }}>
        <Icon source="heart" color={theme.colors.tertiary} size={30} />
        <Text
          onPress={() => {
            handleTouch();
          }}
          style={{
            fontSize: 25,
            fontWeight: "bold",
          }}>
          DB
        </Text>
      </View>
      <Divider
        style={{
          marginVertical: 10,
        }}
      />
      {devToolsEnabled && (
        <View
          style={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 20,
            gap: 10,
          }}>
          <Text>Experiments enabled:</Text>
          <Switch
            value={devToolsEnabled}
            onValueChange={(value: boolean) => {
              setTouches(0);
              dispatch(setDevtoolsEnabled(value));
            }}
          />
        </View>
      )}
    </View>
  );
}
