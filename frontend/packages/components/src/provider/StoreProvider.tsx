"use client";

import { createStore } from "@coaster/state";
import { User } from "@coaster/types";
import { Provider } from "react-redux";

export function StoreProvider({ initialUser, children }: { initialUser: User | undefined; children: React.ReactNode }) {
  const store = createStore(initialUser);

  return <Provider store={store}>{children}</Provider>;
}
