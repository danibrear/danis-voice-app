import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderStyle: "solid",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 3,
    fontSize: 16,
    fontWeight: "bold",
  },

  primaryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    display: "flex",
    flexGrow: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
