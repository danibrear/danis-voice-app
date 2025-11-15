import { View, ViewProps } from "react-native";
import { useTheme } from "react-native-paper";

export default function ThemedView(props: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      style={[{ backgroundColor: theme.colors.background }, props.style]}
    />
  );
}
