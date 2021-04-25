import logger from "../../logging/Logger";
import * as bcrypt from "bcryptjs";
import { Response } from "express";
import { RequestWithUserID } from "../../types";
import { LoginDto, RegisterDto } from "../../dto";
import { UserEntity } from "../../entity/UserEntity";
import { createToken } from "../../utils";

const UserController = {
  register: async (req: RequestWithUserID, res: Response) => {
    try {
      let data: RegisterDto = req.body;

      if (data.password !== data.confirm_password) {
        return res
          .status(400)
          .json({ message: "Confirm password & password don't match" });
      }

      const check_user_email = await UserEntity.findOne({
        where: { email: data.email.trim() },
      });

      if (check_user_email) {
        return res.status(400).json({ message: "Email already exists." });
      }

      const hash_password = await bcrypt.hash(data.password, 12);

      const result = await UserEntity.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        user_type: data.user_type,
        password: hash_password,
        is_active: true,
      }).save();

      result.password = "";

      return res.status(200).json({
        ...createToken(result.id, result.user_type),
        message: "record_added",
        user: result,
      });
    } catch (err) {
      logger.error(err.toString());
      return res
        .status(400)
        .json({ message: "Something went wrong...", error: err.toString() });
    }
  },

  login: async (req: RequestWithUserID, res: Response) => {
    try {
      let data: LoginDto = req.body;

      const user = await UserEntity.findOne({
        where: { email: data.email, is_active: true },
      });

      if (!user) {
        return res.status(400).json({ message: "Bad Credentials" });
      }

      const check_password = await bcrypt.compare(data.password, user.password);
      if (!check_password) {
        return res.status(400).json({ message: "Bad Credentials" });
      }

      user.password = "";
      return res
        .status(200)
        .json({ ...createToken(user.id, user.user_type), user: user });
    } catch (err) {
      logger.error(err.toString());
      return res
        .status(400)
        .json({ message: "Something went wrong...", error: err.toString() });
    }
  },

  userInfo: async (req: RequestWithUserID, res: Response) => {
    try {
      let id = req.userId;

      const user = await UserEntity.findOne({ where: { id: id } });
      if (!user) {
        return res.status(400).json({ message: "Invalid User ID" });
      }

      user.password = "";
      return res.status(200).json({ user });
    } catch (err) {
      logger.error(err.toString());
      return res
        .status(400)
        .json({ message: "Something went wrong...", error: err.toString() });
    }
  },
};

export default UserController;
