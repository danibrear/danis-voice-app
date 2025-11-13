import { formStyles } from "@/styles";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

export const PrimaryButton = (props: TouchableOpacityProps) => {
  const renderChildren = () => {
    if (props.children) {
      if (typeof props.children === "string") {
        return (
          <Text
            style={[
              formStyles.buttonText,
              {
                color: "white",
              },
            ]}>
            {props.children}
          </Text>
        );
      }
      return props.children;
    }
  };
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[formStyles.primaryButton, props.style]}>
      {renderChildren()}
    </TouchableOpacity>
  );
};
export const OutlineButton = (props: TouchableOpacityProps) => {
  const renderChildren = () => {
    if (props.children) {
      if (typeof props.children === "string") {
        return (
          <Text
            style={[
              formStyles.buttonText,
              {
                color: "#007bff",
              },
            ]}>
            {props.children}
          </Text>
        );
      }
      return props.children;
    }
  };
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[formStyles.outlineButton, props.style]}>
      {renderChildren()}
    </TouchableOpacity>
  );
};

type ButtonProps = TouchableOpacityProps & {
  variant?: "primary" | "outline";
};

export default function Button(props: ButtonProps) {
  if (props.variant === "outline") {
    return <OutlineButton {...props} />;
  }
  return <PrimaryButton {...props} />;
}
