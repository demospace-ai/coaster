import React, { useEffect } from "react";
import {
  BrowserRouter, Route, Switch
} from "react-router-dom";
import { useStart } from "src/components/app/actions";
import { Header } from "src/components/header/Header";
import { Home } from 'src/components/home/Home';
import { NotFound } from 'src/components/notfound/NotFound';
import { useSelector } from "src/root/model";
import { Question } from "../question/Question";

export const App: React.FC = () => {
  const loading = useSelector(state => state.app.loading);
  const start = useStart();

  useEffect(() => {
    start();
  }, [start]);

  if (loading) {
    return <div data-testid="loading"/>
  }

  return (
    <BrowserRouter>
      <Header/>
      <Switch>
        <Route exact path='/'>
          <Home/>
        </Route>
        <Route exact path='/question/:id'>
          <Question/>
        </Route>
        <Route path='*'>
          <NotFound/>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
