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
  connect = "connect",
}
