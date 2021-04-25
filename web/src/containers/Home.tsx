import { Button } from "@material-ui/core";
import React from "react";
import { useTokenStore, useUserInfoStore } from "../stores";
import { closeWebSocket } from "../utils/createWebSocket";

interface Props {}

const Home: React.FC<Props> = () => {
  const user = useUserInfoStore((s) => s.user);

  return (
    <div>
      Home...
      {user.first_name}
      {user.last_name}
      <Button
        onClick={() => {
          useTokenStore.getState().clearTokens();
          closeWebSocket();
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default Home;
