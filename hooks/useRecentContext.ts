import { StoredTextContext } from "@/contexts/StoredTextContext";
import { useContext } from "react";

export const useRecentContext = () => {
  const context = useContext(StoredTextContext);

  return context;
};
