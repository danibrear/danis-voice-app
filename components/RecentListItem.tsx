import { removeText, starText, unstarText } from "@/store/storedTexts";
import { listStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { MaterialIcons } from "@expo/vector-icons";
import {
  GestureResponderEvent,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// TODO: need to fix this once this has fully been removed
import { Swipeable } from "react-native-gesture-handler";
import { List, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import DragControl from "./DragControl";

export default function RecentListItem({
  item,
  isDarkMode,
  bgColor,
  color,
  icon,
  isSelecting,
  isLongPressing,
  setIsLongPressing,
  selectedIds,
  onSelectItem,
  handlePressItem,
  setSelectedStoredText,
  drag,
  isActive,
  setIsDragging,
}: {
  item: StoredText;
  isDarkMode: boolean;
  bgColor: string;
  color: string;
  icon: string;
  isSelecting: boolean;
  isLongPressing: boolean;
  setIsLongPressing: (val: boolean) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  handlePressItem: (item: StoredText) => void;
  setSelectedStoredText: (item: StoredText) => void;
  onSelectItem: (e: GestureResponderEvent) => void;
  drag: () => void;
  isActive: boolean;
  setIsDragging: (dragging: boolean) => void;
}) {
  const dispatch = useDispatch();

  const isWeb = Platform.OS === "web";

  const theme = useTheme();

  return (
    <Swipeable
      onEnded={(e) => {
        const endValue = e.nativeEvent.translationX as number;
        if (endValue < -100) {
          dispatch(removeText(item.id));
        }
      }}
      overshootFriction={1}
      renderRightActions={() => (
        <View>
          <Text />
        </View>
      )}>
      <List.Item
        onLongPress={(_e) => {
          setIsLongPressing(true);
          setSelectedStoredText(item);
        }}
        onPress={
          isLongPressing || isSelecting
            ? undefined
            : () => {
                handlePressItem(item);
              }
        }
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
        left={(props) => {
          if (!isSelecting) {
            return (
              <DragControl
                drag={drag}
                isActive={isActive}
                setIsDragging={setIsDragging}
                {...props}
              />
            );
          }

          return (
            <TouchableOpacity onPress={onSelectItem}>
              <MaterialIcons
                name={
                  selectedIds.includes(item.id)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={25}
                {...props}
              />
            </TouchableOpacity>
          );
        }}
        right={() => (
          <>
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
            {isWeb && (
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  dispatch(removeText(item.id));
                }}>
                <List.Icon
                  color={theme.colors.onSurface}
                  icon="trash-can-outline"
                />
              </TouchableOpacity>
            )}
          </>
        )}
      />
    </Swipeable>
  );
}
