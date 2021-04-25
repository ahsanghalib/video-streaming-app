import { FormErrors } from "../hooks/useForm";
import { LoginFormInput, RegisterFormInput } from "./types";

export const LoginFormInitValues: LoginFormInput = {
  email: "",
  password: "",
};

export const LoginFormInitErrors: FormErrors<LoginFormInput> = {
  email: "",
  password: "",
};

export const RegisterFormInitValues: RegisterFormInput = {
  confirm_password: "",
  first_name: "",
  last_name: "",
  password: "",
  email: "",
};

export const RegisterFormInitErrors: FormErrors<RegisterFormInput> = {
  confirm_password: "",
  first_name: "",
  last_name: "",
  password: "",
  email: "",
};
