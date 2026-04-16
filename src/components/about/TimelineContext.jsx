import { createContext, useContext } from "react";

export const TimelineContext = createContext(null);

export function useTimeline() {
  return useContext(TimelineContext);
}
