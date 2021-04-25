import * as yup from "yup";

export const LoginFormValidation = yup.object({
  email: yup.string().required("Required").email("Wrong email address"),
  password: yup.string().required("Required"),
});

export const RegisterFormValidation = yup.object({
  first_name: yup.string().required("Required"),
  last_name: yup.string().required("Required"),
  email: yup.string().required("Required").email("Wrong email address"),
  password: yup.string().required("Required").min(6, "Min 6 charaters"),
  confirm_password: yup.string().required("Required").min(6, "Min 6 charaters"),
});
