import { StyleSheet } from "react-native";
export const listStyles = StyleSheet.create({
  topBar: {
    height: 75,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarText: {
    color: "#ffffff",
    fontSize: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    height: 40,
    flex: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  listItem: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  iconButtonDelete: {
    marginTop: 10,
    borderRadius: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  hiddenContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  button: {
    backgroundColor: "#0067ee",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 24,
    color: "#888",
  },
});
