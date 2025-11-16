import { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomMenuProps } from "./CustomMenu";

const { height, width } = Dimensions.get("window");
export default function CustomMenu(props: CustomMenuProps) {
  const { menuAnchor, visible, parentRef } = props;
  const theme = useTheme();
  const menuWidth = 150;
  const menuHeight = 100;
  const safeAreaInsets = useSafeAreaInsets();

  const [parentOffset, setParentOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [parentSize, setParentSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const thisRef = useRef(null);

  useEffect(() => {
    parentRef?.current?.measureInWindow((x, y, w, h) => {
      setParentOffset({ x, y });
      setParentSize({ width: w, height: h });
    });
  }, [parentRef]);
  if (!menuAnchor || !visible) {
    return null;
  }
  const x = menuAnchor.x ?? 0;
  const y = menuAnchor.y ?? 0;
  const px = parentOffset ? parentOffset.x : 0;
  const py = parentOffset ? parentOffset.y : 0;
  const left = Math.min(
    x - px - menuWidth / 4,
    Math.max(
      x - px - menuWidth,
      (parentSize ? parentSize.width : width) - menuWidth,
    ),
  );
  const top = Math.max(
    safeAreaInsets.top,
    Math.min(y - py, (parentSize ? parentSize.height : height) - menuHeight),
  );
  console.log(
    "top",
    top,
    "left",
    left,
    "menuHeight",
    menuHeight,
    "menuWidth",
    menuWidth,
  );
  return (
    <div
      ref={thisRef}
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        height: `${menuHeight}px`,
        width: `${menuWidth}px`,
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.onSurface}`,
        borderRadius: "8px",
        zIndex: 1000,
      }}>
      {props.children}
    </div>
  );
}
