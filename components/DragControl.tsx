import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { ScaleDecorator } from "react-native-draggable-flatlist";

export default function DragControl({
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
    <ScaleDecorator>
      <TouchableOpacity
        disabled={isActive}
        onLongPress={() => {
          setIsDragging(true);
          drag();
        }}
        onPressOut={() => {
          setIsDragging(false);
        }}
        onPressIn={() => {
          setIsDragging(true);
          drag();
        }}
        style={{
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
        }}>
        <MaterialIcons name="drag-indicator" size={25} {...props} />
      </TouchableOpacity>
    </ScaleDecorator>
  );
}
