import { View } from "react-native";
import { IconButton } from "react-native-paper";

export default function DragControlWeb({
  drag,
  isActive,
  setIsDragging,
  onWebAction,
  ...props
}: {
  drag: () => void;
  isActive: boolean;
  onWebAction?: (direction: "up" | "down") => void;
  setIsDragging: (dragging: boolean) => void;
}) {
  return (
    <View style={{ gap: 0, flexDirection: "row", flexShrink: 1 }}>
      <IconButton
        icon="chevron-up"
        mode="contained"
        size={15}
        style={{ height: 20, width: 20, padding: 0, margin: 0 }}
        disabled={isActive}
        onPress={() => {
          onWebAction?.("up");
        }}
        {...props}
      />
      <IconButton
        mode="contained"
        icon="chevron-down"
        size={15}
        style={{ height: 20, width: 20, padding: 0, margin: 0 }}
        disabled={isActive}
        onPress={() => {
          onWebAction?.("down");
        }}
        {...props}
      />
    </View>
  );
}
