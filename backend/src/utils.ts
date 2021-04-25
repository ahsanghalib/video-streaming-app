import { DataStoredInToken, TokenData, UserTypesEnum } from "./types";
import logger from "./logging/Logger";
import * as jwt from "jsonwebtoken";

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8DkTTTBgTDZ2TbpXgtZSwYuk4Pzy6dpXr3A5vgxkT9dZrMx7CtnUvHKyTMpNMkptXg35WBNfvsDP54xM";

export function createToken(
  userId: string,
  userType: UserTypesEnum,
): TokenData {
  const expiresIn = 3600 * 24 * 24;
  const secret = JWT_SECRET;
  const dataStoredInToken: DataStoredInToken = {
    userId: userId,
    userType: userType,
  };

  const token = jwt.sign(dataStoredInToken, secret, {
    expiresIn,
    algorithm: "HS512",
    issuer: "VideoApplication",
    noTimestamp: true,
  });

  const accessToken = "Bearer " + token;
  logger.info(`JWT_TOKEN_CREATED | ${userId} |${accessToken}`);
  return { expiresIn, accessToken };
}
