import { configureStore, Dispatch } from "@reduxjs/toolkit";
import { createSelectorHook, useDispatch as useReactDispatch } from "react-redux";
import { ToastDetails } from "src/components/notifications/Notifications";

export type ConnectAction = {
  type: "toast";
  toast?: ToastDetails;
};

const INITIAL_CONNECT_STATE: ConnectState = {
  toast: undefined,
};

export interface ConnectState {
  toast?: ToastDetails;
}

export const useConnectDispatch = () => useReactDispatch<Dispatch<ConnectAction>>();
export const useConnectSelector = createSelectorHook<ConnectState>();

export function connectReducer(state: ConnectState = INITIAL_CONNECT_STATE, action: ConnectAction): ConnectState {
  switch (action.type) {
    case "toast":
      return {
        ...state,
        toast: action.toast,
      };
    default:
      return state;
  }
}

export function createConnectStore() {
  return configureStore({ reducer: connectReducer });
}
