import { Button } from "@material-ui/core";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useMediaStore, useTokenStore, useUserInfoStore } from "../stores";
import { closeWebSocket, wsend } from "../utils/createWebSocket";
import { Oper } from "../utils/types";

interface Props {}

const Headers: React.FC<Props> = () => {
  const user = useUserInfoStore((s) => s.user);
  const history = useHistory();
  const location = useLocation();

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-4">
      <div className="flex flex-row flex-wrap items-center gap-4">
        <div className="text-l font-semibold">
          {user.first_name} {user.last_name} ({user.email})
        </div>
        {location.pathname === "/stream" ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              history.push("/");
              wsend({
                op: Oper.close_webrtc,
                d: {
                  sessionId: useTokenStore.getState().sessionId,
                  userId: useUserInfoStore.getState().user.id,
                  fileName: useMediaStore.getState().fileName,
                },
              });
            }}
          >
            Back
          </Button>
        ) : location.pathname === "/" ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/stream")}
            >
              Go Live!
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/")}
            >
              Home
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/stream")}
            >
              Go Live!
            </Button>
          </>
        )}
      </div>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          useTokenStore.getState().clearTokens();
          closeWebSocket();
          history.push("/");
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default Headers;
