import { PrefContext } from "@/contexts/PrefContext";
import { useContext } from "react";

export const usePrefContext = () => {
  const context = useContext(PrefContext);
  return context;
};
