import React, { useState } from "react";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";
import { CusButton, CusTextField } from "../components/StyledComponents";
import { useForm } from "../hooks/useForm";
import { useTokenStore, useUserInfoStore } from "../stores";
import { axiosClient } from "../utils/axiosClient";
import { LoginFormInitErrors, LoginFormInitValues } from "../utils/formInits";
import { LoginFormInput } from "../utils/types";
import { LoginFormValidation } from "../utils/validations";

interface Props {}

const Login: React.FC<Props> = () => {
  const { setTokens } = useTokenStore();
  const { setUser } = useUserInfoStore();
  
  const mutation = useMutation(
    (input: LoginFormInput) => axiosClient().post("/login", input),
    {
      onSuccess: (res) => {
        setTokens({
          accessToken: res.data.accessToken,
          expiresIn: res.data.expiresIn,
        });
        setUser(res.data.user);
      },
    }
  );

  const [formValues, setFormValues] = useState<LoginFormInput>(
    LoginFormInitValues
  );

  const form = useForm({
    initErrors: LoginFormInitErrors,
    initValues: LoginFormInitValues,
    setValues: setFormValues,
    validateSchema: LoginFormValidation,
    values: formValues,
  });

  const handleSubmit = async () => {
    const valid = await form.formValidation();
    if (!valid) return;
    mutation.mutate(formValues);
  };

  return (
    <div className="flex items-center min-h-screen">
      <div className="max-w-md m-auto bg-white p-6 shadow-md rounded">
        <div className="text-xl font-bold">Login</div>
        <form>
          <CusTextField
            id="email"
            label={"Email"}
            name="email"
            variant="standard"
            margin={"dense"}
            value={formValues.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            helperText={
              form.formErrors.email !== "" ? form.formErrors.email : " "
            }
            error={form.formErrors.email !== ""}
          />
          <CusTextField
            id="password"
            name="password"
            label={"Password"}
            variant="standard"
            margin={"dense"}
            type={"password"}
            value={formValues.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            helperText={
              form.formErrors.password !== "" ? form.formErrors.password : " "
            }
            error={form.formErrors.password !== ""}
          />
          <br />
          <br />
          <div className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CusButton
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={mutation.isLoading}
              >
                Login
              </CusButton>
            </div>
            <div>
              or <Link to="/register">Register a new Account</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
