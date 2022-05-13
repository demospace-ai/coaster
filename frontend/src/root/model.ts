import { configureStore } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import { createSelectorHook, useDispatch as useReactDispatch } from 'react-redux';
import { combineReducers } from 'redux';
import { AppAction, appReducer, AppState } from 'src/app/model';
import { SearchAction, searchReducer, SearchState } from 'src/components/search/model';
import { LoginAction, loginReducer, LoginState } from 'src/pages/login/model';


export type RootAction = AppAction | LoginAction | SearchAction;

export interface RootState {
  app: AppState;
  login: LoginState;
  search: SearchState;
}

export const useDispatch = () => useReactDispatch<Dispatch<RootAction>>();
export const useSelector = createSelectorHook<RootState>();

export function createStore() {
  const rootReducer = combineReducers({ app: appReducer, login: loginReducer, search: searchReducer });

  return configureStore({ reducer: rootReducer });
}