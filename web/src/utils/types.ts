import * as yup from "yup";
import { LoginFormValidation, RegisterFormValidation } from "./validations";

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

export enum UserTypesEnum {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type RegisterFormInput = yup.InferType<typeof RegisterFormValidation>;
export type LoginFormInput = yup.InferType<typeof LoginFormValidation>;

export type UserInfoType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
  user_type: UserTypesEnum;
};
