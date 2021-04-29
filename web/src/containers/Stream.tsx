import { Button } from "@material-ui/core";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";
import { useMediaStore, useTokenStore, useUserInfoStore } from "../stores";
import { wsend } from "../utils/createWebSocket";
import { Oper } from "../utils/types";

interface Props {}

const Stream: React.FC<Props> = () => {
  const { height } = useWindowSize();
  const sessionId = useTokenStore((s) => s.sessionId);
  const ref = useRef<HTMLVideoElement>(null);
  const mediaStream = useMediaStore((s) => s.mediaStream);

  const [start, setStart] = useState<boolean>(false);
  const [stop, setStop] = useState<boolean>(false);

  useLayoutEffect(() => {
    wsend({
      op: Oper.router_rtp_capabilities,
      d: {
        sessionId,
      },
    });
  }, [sessionId]);

  useEffect(() => {
    if (mediaStream) {
      if (ref.current) {
        ref.current.srcObject = mediaStream;
        setStart(true);
      }
    }
  }, [mediaStream]);

  return (
    <div>
      <div className="flex items-center justify-center flex-row flex-wrap">
        <Button
          disabled={!start}
          onClick={() => {
            wsend({
              op: Oper.start_stream,
              d: {
                sessionId: useTokenStore.getState().sessionId,
                userId: useUserInfoStore.getState().user.id,
                userName: `${useUserInfoStore.getState().user.first_name} ${
                  useUserInfoStore.getState().user.last_name
                }`,
              },
            });
            setStart(false);
            setStop(true);
          }}
        >
          Start Streaming
        </Button>
        <Button
          disabled={!stop}
          onClick={() => {
            wsend({
              op: Oper.stop_stream,
              d: {
                sessionId: useTokenStore.getState().sessionId,
                userId: useUserInfoStore.getState().user.id,
                fileName: useMediaStore.getState().fileName,
              },
            });
            setStart(true);
            setStop(false);
          }}
        >
          Stop Streaming
        </Button>
      </div>
      <div className="flex w-full justify-center items-start">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          controls
          style={{
            maxWidth: "1000px",
            maxHeight: "700px",
            width: `100%`,
            height: `${height - 250}px`,
          }}
        ></video>
      </div>
    </div>
  );
};

export default Stream;
