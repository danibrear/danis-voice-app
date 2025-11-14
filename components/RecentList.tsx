import { RootState } from "@/store";
import { removeText, starText, unstarText } from "@/store/storedTexts";
import { listStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { Icon, IconButton, List, useTheme } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SwipeListView } from "react-native-swipe-list-view";
import { useDispatch, useSelector } from "react-redux";
export default function RecentList({
  starred,
  onPress,
  style,
}: {
  onPress: (item: StoredText) => void;
  starred?: boolean;
  style?: ViewStyle;
}) {
  const { recentTexts } = useSelector((state: RootState) => state.storedTexts);

  const theme = useTheme();

  const dispatch = useDispatch();

  const colorScheme = useColorScheme();

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const listRef = useRef<SwipeListView<StoredText>>(null);

  const [isChangingColorScheme, setIsChangingColorScheme] = useState(false);

  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
    setIsChangingColorScheme(true);
    setTimeout(() => {
      setIsChangingColorScheme(false);
    }, 100);
  }, [colorScheme]);

  const shownTexts = recentTexts.filter((f) => {
    if (starred) {
      return f.starred;
    }
    return true;
  });

  return (
    <View style={style}>
      {shownTexts.length === 0 && (
        <View style={[listStyles.emptyContainer]}>
          <Animated.View
            entering={FadeInUp.duration(700)
              .delay(500)
              .springify()
              .damping(15)
              .mass(0.5)}
            style={{
              flexDirection: "row",
              gap: 15,
              backgroundColor: isDarkMode
                ? theme.colors.backdrop
                : "rgba(255, 255, 255, 0.8)",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
              borderBottomWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              borderColor: isDarkMode ? "#444" : "#ccc",
            }}>
            <Icon
              size={75}
              source="emoticon-sad-outline"
              color={theme.colors.tertiary}
            />
            <View>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: isDarkMode ? "#dbdbdb" : "#555",
                  marginBottom: 10,
                }}>
                No{starred ? " starred" : ""} phrases
              </Text>

              <Text
                style={{
                  color: theme.colors.tertiary,
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 10,
                }}>
                {!starred
                  ? "Use the box below to add some"
                  : "Tap the star icon on phrases"}
              </Text>
            </View>
          </Animated.View>
        </View>
      )}
      {!isChangingColorScheme && shownTexts.length > 0 && (
        <SwipeListView
          ref={listRef}
          keyboardShouldPersistTaps="handled"
          style={{
            display: "flex",
            flexGrow: 1,
            backgroundColor: "transparent",
          }}
          data={shownTexts}
          keyExtractor={(item) => item.id}
          rightOpenValue={-75}
          renderHiddenItem={({ item }) => {
            return (
              <View style={listStyles.hiddenContainer}>
                <IconButton
                  icon="trash-can-outline"
                  iconColor="#c93c3c"
                  size={50}
                  onPress={() => {
                    dispatch(removeText(item.id));
                  }}
                  style={[listStyles.iconButtonDelete]}
                />
              </View>
            );
          }}
          renderItem={({ item }) => {
            const icon = item.starred ? "star" : "star-outline";
            const color = item.starred ? theme.colors.tertiary : undefined;

            const bgColor = isDarkMode ? theme.colors.background : "#fff";

            return (
              <List.Item
                style={[
                  listStyles.listItem,
                  {
                    backgroundColor: bgColor,
                    borderBottomColor: isDarkMode ? "#555" : "#ccc",
                    borderBottomWidth: 0.5,
                  },
                ]}
                titleStyle={listStyles.title}
                title={item.text}
                onPress={() => {
                  onPress(item);
                }}
                right={() => (
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      if (item.starred) {
                        dispatch(unstarText(item.id));
                      } else {
                        dispatch(starText(item.id));
                      }
                    }}>
                    <List.Icon color={color} icon={icon} />
                  </TouchableOpacity>
                )}
              />
            );
          }}
        />
      )}
    </View>
  );
}
