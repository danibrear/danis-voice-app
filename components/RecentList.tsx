import { RootState } from "@/store";
import { removeText, starText, unstarText } from "@/store/storedTexts";
import { listStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { IconButton, List, useTheme } from "react-native-paper";
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
    console.log("Color scheme changed to", colorScheme);
    setIsDarkMode(colorScheme === "dark");
    setIsChangingColorScheme(true);
    setTimeout(() => {
      setIsChangingColorScheme(false);
    }, 100);
  }, [colorScheme]);

  return (
    <View style={style}>
      {!isChangingColorScheme && (
        <SwipeListView
          ref={listRef}
          keyboardShouldPersistTaps="handled"
          style={{ display: "flex", flexGrow: 1 }}
          data={recentTexts.filter((f) => {
            if (starred) {
              return f.starred;
            }
            return true;
          })}
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
            const color = item.starred ? "gold" : undefined;

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
