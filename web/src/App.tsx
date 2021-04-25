import React, { useLayoutEffect } from "react";
import { useQuery } from "react-query";
import { Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Register from "./containers/Register";
import { useTokenStore, useUserInfoStore } from "./stores";
import { axiosClient } from "./utils/axiosClient";
import { createWebSocket } from "./utils/createWebSocket";

interface Props {}

const App: React.FC<Props> = () => {
  const hasToken = useTokenStore((s) => !!s.accessToken);
  const user = useUserInfoStore((s) => s.user);

  useQuery("user-info", () => axiosClient().get("/userInfo"), {
    onSuccess: (res) => useUserInfoStore.getState().setUser(res.data.user),
    enabled: hasToken && user.id === "",
  });

  useLayoutEffect(() => {
    if (hasToken) {
      createWebSocket();
    }
  }, [hasToken]);

  let routes = (
    <Switch>
      <Route path="/" exact component={Login} />
      <Route path="/register" exact component={Register} />
    </Switch>
  );

  if (hasToken) {
    routes = (
      <Switch>
        <Route path="/" exact component={Home} />
      </Switch>
    );
  }

  return <Layout>{routes}</Layout>;
};

export default App;
