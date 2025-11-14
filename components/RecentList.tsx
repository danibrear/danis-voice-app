import { useRecentContext } from "@/hooks/useRecentContext";
import { listStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  List,
  useTheme,
} from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
export default function RecentList({
  starred,
  onPress,
}: {
  onPress: (item: StoredText) => void;
  starred?: boolean;
}) {
  const {
    recentTexts,
    isLoading: isLoadingRecentWords,
    starText,
    unstarText,
    removeText,
    reload,
  } = useRecentContext();

  const theme = useTheme();

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoadingRecentWords) {
    return <ActivityIndicator />;
  }
  return (
    <View>
      <SwipeListView
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
                  removeText(item.id);
                }}
                style={[listStyles.iconButtonDelete]}
              />
            </View>
          );
        }}
        renderItem={({ item }) => {
          const icon = item.starred ? "star" : "star-outline";
          const color = item.starred ? "gold" : undefined;
          return (
            <List.Item
              style={[
                listStyles.listItem,
                {
                  backgroundColor: theme.colors.background,
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
                    if (item.starred) {
                      unstarText(item.id);
                    } else {
                      starText(item.id);
                    }
                  }}>
                  <List.Icon color={color} icon={icon} />
                </TouchableOpacity>
              )}
            />
          );
        }}
      />
    </View>
  );
}
