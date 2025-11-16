import { View, ViewProps } from "react-native";

export type CrossViewProps = ViewProps & {
  onClick?: (e: Event) => void;
};

export default function CrossView(props: CrossViewProps) {
  return <View {...props} />;
}
