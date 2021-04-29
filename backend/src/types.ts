import { Request } from "express";

export interface RequestWithUserID extends Request {
  userId: string;
  userType: UserTypesEnum;
  sessionId: string;
}

export interface TokenData {
  expiresIn: number;
  accessToken: string;
}

export interface DataStoredInToken {
  userId: string;
  userType: UserTypesEnum;
}

export enum UserTypesEnum {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type WsParam = {
  op: Oper;
  d: any;
};

export enum Oper {
  error = "error",
  session_id = "session_id",
  router_rtp_capabilities = "router_rtp_capabilities",
  create_transport = "create_transport",
  connect_transport = "connect_transport",
  produce = "produce",
  close_webrtc = "close_webrtc",
  start_stream = "start_stream",
  stop_stream = "stop_stream",
  streaming_sessions = "streaming_sessions",
  get_streaming_sessions = "get_streaming_sessions",
}
