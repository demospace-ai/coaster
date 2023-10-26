"use client";

import { AppAction, AppState, LoginAction, LoginState, appReducer, loginReducer } from "@coaster/state";
import { User } from "@coaster/types";
import { configureStore } from "@reduxjs/toolkit";
import { createSelectorHook, useDispatch as useReactDispatch } from "react-redux";
import { combineReducers } from "redux";

export type RootAction = AppAction | LoginAction;

export interface RootState {
  app: AppState;
  login: LoginState;
}

export const useDispatch = () => useReactDispatch();
export const useSelector = createSelectorHook();

export function createStore(initialUser: User | undefined) {
  const rootReducer = combineReducers({ app: appReducer, login: loginReducer });

  return configureStore({
    reducer: rootReducer,
    preloadedState: { login: { user: initialUser, modalOpen: false, create: false } },
  });
}
