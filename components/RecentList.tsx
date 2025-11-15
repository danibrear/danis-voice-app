import { RootState } from "@/store";
import {
  removeText,
  starText,
  unstarText,
  updatedStoredTextValue,
  updateStoredText,
} from "@/store/storedTexts";
import { listStyles } from "@/styles";
import { StoredText } from "@/types/StoredText";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import {
  Button,
  Card,
  Icon,
  List,
  Menu,
  Modal,
  useTheme,
} from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import CustomMenu from "./CustomMenu";
import DragControl from "./DragControl";
import EditStoredTextDialog from "./EditStoredTextDialog";

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

  const isWeb = Platform.OS === "web";

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [isLongPressing, setIsLongPressing] = useState(false);

  const [selectedStoredText, setSelectedStoredText] =
    useState<StoredText | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingWeb, setIsMovingWeb] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isChangingColorScheme, setIsChangingColorScheme] = useState(false);

  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
    setIsChangingColorScheme(true);
    setTimeout(() => {
      setIsChangingColorScheme(false);
    }, 100);
  }, [colorScheme]);

  const filteredTexts = recentTexts.filter((f) => {
    if (starred) {
      return f.starred;
    }
    return true;
  });
  const shownTexts = filteredTexts.sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const parentRef = useRef<View>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePressItem = useCallback(
    (item: StoredText) => {
      if (isLongPressing) {
        return;
      }
      Keyboard.dismiss();
      onPress(item);
    },
    [isLongPressing, onPress],
  );

  const handleReorderStoredTexts = (newOrder: StoredText[]) => {
    try {
      setIsUpdating(true);
      const updatedWithOrder = newOrder.map((text, index) => ({
        ...text,
        order: index,
      }));
      // Dispatch updates for each stored text
      updatedWithOrder.forEach((text) => {
        dispatch(updateStoredText(text));
      });
    } catch (error) {
      console.error("Error updating stored texts order:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWebAction = (dir: "up" | "down", item: StoredText) => {
    const currentIndex = shownTexts.findIndex((t) => t.id === item.id);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (dir === "up" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (dir === "down" && currentIndex < shownTexts.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      const newOrder = [...shownTexts];
      const [movedItem] = newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);
      handleReorderStoredTexts(newOrder);
    }
  };

  return (
    <View
      ref={parentRef}
      style={style}
      key="recent-list-container"
      onTouchStart={(e) => {
        if (isLongPressing) {
          e.stopPropagation();
          e.preventDefault();
          setIsLongPressing(false);
        }
      }}>
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
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 10,
          justifyContent: "flex-end",
          gap: 5,
        }}>
        {/* {isWeb && (
          <View
            style={{
              flexGrow: 1,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}>
            <Button
              onPress={() => setIsMovingWeb(!isMovingWeb)}
              mode="contained">
              {isMovingWeb ? "Done" : "Move"}
            </Button>
          </View>
        )} */}
        {selectedIds.length > 0 && (
          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            onPress={() => {
              selectedIds.forEach((id) => {
                dispatch(removeText(id));
              });
              setSelectedIds([]);
              setIsSelecting(false);
            }}>
            Delete ({selectedIds.length})
          </Button>
        )}
        {isSelecting && (
          <Button
            mode="contained"
            onPress={() => {
              setIsSelecting(false);
            }}>
            <MaterialIcons name="close" size={20} />
          </Button>
        )}
        {!isSelecting && (
          <Button
            mode="contained"
            onPress={() => {
              setIsSelecting(true);
            }}>
            Select
          </Button>
        )}
      </View>
      {!isChangingColorScheme && shownTexts.length > 0 && (
        <DraggableFlatList
          keyboardShouldPersistTaps="handled"
          containerStyle={{
            flexGrow: 1,
            backgroundColor: "transparent",
          }}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                setIsRefreshing(true);
                setTimeout(() => {
                  setIsRefreshing(false);
                }, 1000);
              }}
              refreshing={isRefreshing}
            />
          }
          onDragEnd={({ data }) => {
            handleReorderStoredTexts(data);
            setIsDragging(false);
          }}
          scrollEnabled={!isDragging && !isUpdating}
          data={shownTexts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, drag, isActive }) => {
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
                title={() => {
                  return (
                    <TouchableOpacity
                      disabled={isActive || isUpdating}
                      onLongPress={(e) => {
                        const { pageX, pageY } = e.nativeEvent;
                        setMenuAnchor({ x: pageX, y: pageY });
                        setIsLongPressing(true);
                        setSelectedStoredText(item);
                      }}>
                      <Text style={listStyles.title}>{item.text}</Text>
                    </TouchableOpacity>
                  );
                }}
                onPress={
                  isLongPressing
                    ? undefined
                    : () => {
                        handlePressItem(item);
                      }
                }
                left={(props) => {
                  if (!isSelecting) {
                    if (isWeb && !isMovingWeb) {
                      return null;
                    }
                    return (
                      <DragControl
                        onWebAction={(dir) => {
                          handleWebAction(dir, item);
                        }}
                        drag={drag}
                        isActive={isActive}
                        setIsDragging={setIsDragging}
                        {...props}
                      />
                    );
                  }

                  return (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedIds.includes(item.id)) {
                          setSelectedIds((prev) =>
                            prev.filter((id) => id !== item.id),
                          );
                        } else {
                          setSelectedIds((prev) => [...prev, item.id]);
                        }
                      }}>
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
      <CustomMenu
        visible={isLongPressing}
        menuAnchor={menuAnchor}
        theme={theme}
        parentRef={parentRef}
        setIsLongPressing={setIsLongPressing}>
        <Menu.Item
          leadingIcon={(props) => (
            <Icon
              {...props}
              color={theme.colors.primary}
              source="pencil-outline"
            />
          )}
          titleStyle={{ color: theme.colors.primary }}
          onPress={() => {
            setIsEditing(true);
          }}
          title="Edit"
        />
        <Menu.Item
          leadingIcon={(props) => (
            <Icon
              {...props}
              color={theme.colors.error}
              source="trash-can-outline"
            />
          )}
          titleStyle={{ color: theme.colors.error }}
          onPress={() => {
            setIsDeleting(true);
          }}
          title="Delete"
        />
        <Menu.Item
          leadingIcon={(props) => (
            <Icon
              {...props}
              color={theme.colors.onSurface}
              source="close-circle-outline"
            />
          )}
          titleStyle={{ color: theme.colors.onSurface }}
          onPress={() => {
            setIsLongPressing(false);
          }}
          title="Cancel"
        />
      </CustomMenu>

      <EditStoredTextDialog
        storedText={selectedStoredText}
        isEditing={isEditing}
        setIsEditing={(editing) => {
          if (!editing) {
            setSelectedStoredText(null);
          }
        }}
        onCancel={() => {
          setIsEditing(false);
          setIsLongPressing(false);
        }}
        setText={(text) => {
          if (selectedStoredText) {
            dispatch(
              updatedStoredTextValue({
                id: selectedStoredText.id,
                value: text,
              }),
            );
          }
        }}
      />
      <Modal visible={isDeleting} onDismiss={() => setIsDeleting(false)}>
        <Card
          style={{
            marginHorizontal: 20,
          }}>
          <Card.Content>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 20,
                color: theme.colors.onSurface,
              }}>
              Are you sure you want to delete this phrase?
            </Text>
          </Card.Content>
          <Card.Actions
            style={{
              flexDirection: "row-reverse",
              justifyContent: "flex-start",
            }}>
            <Button
              icon="close-circle-outline"
              onPress={() => {
                setIsDeleting(false);
                setIsLongPressing(false);
              }}>
              No
            </Button>
            <Button
              icon="check-circle-outline"
              buttonColor={theme.colors.error}
              onPress={() => {
                if (selectedStoredText) {
                  dispatch(removeText(selectedStoredText.id));
                }
                setIsDeleting(false);
                setIsLongPressing(false);
              }}>
              Yes
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </View>
  );
}
