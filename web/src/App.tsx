import React, { useEffect, useLayoutEffect } from "react";
import { useQuery } from "react-query";
import { Redirect, Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./containers/Home";
import Live from "./containers/Live";
import Login from "./containers/Login";
import Register from "./containers/Register";
import Stream from "./containers/Stream";
import { useTokenStore, useUserInfoStore } from "./stores";
import { axiosClient } from "./utils/axiosClient";
import { closeWebSocket, createWebSocket } from "./utils/createWebSocket";

interface Props {}

const App: React.FC<Props> = () => {
  const hasToken = useTokenStore((s) => !!s.accessToken);

  const { isError } = useQuery(
    "user-info",
    () => axiosClient().get("/userInfo"),
    {
      onSuccess: (res) => useUserInfoStore.getState().setUser(res.data.user),
      enabled: hasToken,
    }
  );

  useLayoutEffect(() => {
    if (hasToken) {
      createWebSocket();
    }
  }, [hasToken]);

  useEffect(() => {
    if (isError) {
      useTokenStore.getState().clearTokens();
      closeWebSocket();
    }
  }, [isError]);

  let routes = (
    <Switch>
      <Route path="/" exact component={Login} />
      <Route path="/register" exact component={Register} />
      <Redirect to="/" />
    </Switch>
  );

  if (hasToken) {
    routes = (
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/stream" exact component={Stream} />
        <Route path="/live/:id" exact component={Live} />
      </Switch>
    );
  }

  return <Layout>{routes}</Layout>;
};

export default App;
