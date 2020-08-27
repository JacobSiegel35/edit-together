import React from "react";
import Main from "./Main";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "react-bulma-components/dist/react-bulma-components.min.css"

export default () => {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Main} exact />
          <Route path="/:id" component={Main} exact />
        </Switch>
      </BrowserRouter>
    </div>
  );
}