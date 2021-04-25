import logger from "../../logging/Logger";
import { Oper, WsParam } from "../../types";

export const handleSocketResponse = async (json: WsParam) => {
  const { op, d } = json;

  switch (op) {
    case "connect":
      return await connectUser(d);
    default:
      logger.error(`WEBSOCKET | UNKOWN MESSAGE | ${JSON.stringify(json)}`);
      return {
        op: Oper.error,
        d: {
          message: "Unknown Socket Message",
        },
      };
  }
};

const connectUser = async (d: any) => {
  return {
    op: Oper.connect,
    d: {
      accessToken: "test",
    },
  };
};
