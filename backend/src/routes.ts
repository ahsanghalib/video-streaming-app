import express, { Request, Response } from "express";
import UserController from "./controllers/api/UserController";
import { LoginDto, RegisterDto } from "./dto";
import { dtoValid, isAuth } from "./middlewares";

const routes = express.Router();

routes.post("/login", dtoValid(LoginDto), UserController.login);
routes.post("/register", dtoValid(RegisterDto), UserController.register);
routes.get("/userInfo", isAuth, UserController.userInfo);

routes.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "api is working... video streaming application",
    date: new Date().toUTCString(),
  });
});

export default routes;
