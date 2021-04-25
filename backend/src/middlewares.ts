import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, RequestHandler, Response } from "express";
import * as jwt from "jsonwebtoken";
import { DataStoredInToken, RequestWithUserID, UserTypesEnum } from "./types";
import logger from "./logging/Logger";

export function dtoValid<T>(
  type: any,
  skipMissingProperties = false,
): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    const message: string[] = [];
    validate(plainToClass(type, req.body), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          errors.map((error: ValidationError) => {
            message.push(Object.values(error.constraints).join(", "));
          });
          return res.status(400).json({
            message: "dto_validation_error",
            error: message,
          });
        } else {
          next();
        }
      })
      .catch((err: any) => {
        logger.warn(`DTO VALIDATION ERROR | ${err}`);
        return res
          .status(400)
          .json({ message: "dto_validation_error", error: message });
      });
  };
}

export function isAuth(
  req: RequestWithUserID,
  res: Response,
  next: NextFunction,
) {
  if (
    req.path === "/login" ||
    req.path === "/register" ||
    req.path === "/forget-password"
  ) {
    return next();
  }

  const authHeader = req.get("Authorization");
  // const sessionId = req.get("X-Session-Id");
  const secret = process.env.JWT_SECRET;

  if (!authHeader) {
    logger.warn(`UN-AUTHORIZED ACCESS | ${req.path}`);
    return res.status(401).json({
      message: "un_authorized_access",
    });
  }
  const token = authHeader.split(" ")[1];

  let decodedToken: any;

  try {
    decodedToken = jwt.verify(token, secret) as DataStoredInToken;
  } catch (err) {
    logger.warn(`UN-AUTHORIZED ACCESS | TOKEN ERROR | ${req.path}`);
    return res.status(401).json({ message: "something_wrong", error: err });
  }

  if (!decodedToken) {
    logger.warn(`UN-AUTHORIZED ACCESS | TOKEN ERROR | ${req.path}`);
    return res.status(401).json({
      message: "un_authorized_access",
    });
  }

  req.userId = decodedToken.userId;
  req.userType = decodedToken.userType;
  req.sessionId = "";

  next();
}

export function isAdmin(
  req: RequestWithUserID,
  res: Response,
  next: NextFunction,
) {
  if (req.userType !== UserTypesEnum.ADMIN) {
    return res.status(401).json({
      message: "un_authorized_access",
    });
  }

  next();
}

export function headers(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, Authorization",
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
}
