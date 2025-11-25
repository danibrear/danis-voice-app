import { FontAwesome } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import * as NavigationBar from "expo-status-bar";
import React, { useEffect } from "react";
import { Icon, useTheme } from "react-native-paper";
export default function TabLayout() {
  const theme = useTheme();

  const pathName = usePathname();

  useEffect(() => {
    if (pathName.startsWith("/chat")) {
      NavigationBar.setStatusBarStyle("light");
    } else {
      NavigationBar.setStatusBarStyle("auto");
    }
  }, [pathName]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Phrases",
          tabBarIcon: ({ color }) => (
            <Icon size={23} source="format-list-bulleted" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => {
            return <Icon size={23} source="message" color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={23} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
