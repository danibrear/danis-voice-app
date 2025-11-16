import { useState } from "react";
import { Dimensions, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type CustomMenuProps = {
  menuAnchor: { x: number; y: number } | null;
  setIsLongPressing: (value: boolean) => void;
  children?: React.ReactNode | React.ReactNode[];
  visible?: boolean;
  parentRef?: React.RefObject<View | null>;
};

const { height, width } = Dimensions.get("window");

export default function CustomMenu(props: CustomMenuProps) {
  const { menuAnchor, visible } = props;

  const theme = useTheme();
  const [menuWidth, setMenuWidth] = useState(0);
  const [menuHeight, setMenuHeight] = useState(0);
  const safeAreaInsets = useSafeAreaInsets();

  const [parentOffset, setParentOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [parentSize, setParentSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  if (!menuAnchor || !visible) {
    return null;
  }
  const x = menuAnchor.x ?? 0;
  const y = menuAnchor.y ?? 0;
  const px = parentOffset ? parentOffset.x : 0;
  const py = parentOffset ? parentOffset.y : 0;
  const pw = parentSize ? parentSize.width + px : width;
  const ph = parentSize ? parentSize.height + py : height;
  const left = Math.max(
    menuWidth / 2,
    Math.min(x + menuWidth / 2, px + pw - menuWidth / 2),
  );

  const top = Math.max(safeAreaInsets.top, Math.min(y, py + ph - menuHeight));
  return (
    <View
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onLayout={(e) => {
        props.parentRef?.current?.measureInWindow((x, y, w, h) => {
          setParentOffset({ x, y });
          setParentSize({ width: w, height: h });
        });
        setMenuWidth(e.nativeEvent.layout.width);
        setMenuHeight(e.nativeEvent.layout.height);
      }}
      style={{
        position: "absolute",
        top,
        left,
        transform: [{ translateX: -100 }, { translateY: -50 }],
        backgroundColor: theme.colors.surface,
        padding: 10,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
      {props.children}
    </View>
  );
}
