"use client";

import { createStore } from "@coaster/state";
import { Provider } from "react-redux";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = createStore();

  return <Provider store={store}>{children}</Provider>;
}
