import { MaterialIcons } from "@expo/vector-icons";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  isTranslating: boolean;
  onPress: () => void;
};

export default function TranslateButton({ isTranslating, onPress }: Props) {
  const theme = useTheme();
  return (
    <IconButton
      onPress={onPress}
      mode={isTranslating ? "contained" : undefined}
      containerColor={isTranslating ? theme.colors.tertiary : undefined}
      icon={(props) => (
        <MaterialIcons
          name="translate"
          {...props}
          color={isTranslating ? theme.colors.onTertiary : "white"}
        />
      )}
    />
  );
}
