import React, { useState } from "react";
import { useMutation } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { CusButton, CusTextField } from "../components/StyledComponents";
import { useForm } from "../hooks/useForm";
import { useTokenStore, useUserInfoStore } from "../stores";
import { axiosClient } from "../utils/axiosClient";
import {
  RegisterFormInitErrors,
  RegisterFormInitValues,
} from "../utils/formInits";
import { RegisterFormInput } from "../utils/types";
import { RegisterFormValidation } from "../utils/validations";

interface Props {}

const Register: React.FC<Props> = () => {
  const { setTokens } = useTokenStore();
  const { setUser } = useUserInfoStore();
  const history = useHistory();

  const mutation = useMutation(
    (input: RegisterFormInput) => axiosClient().post("/register", input),
    {
      onSuccess: (res) => {
        setTokens({
          accessToken: res.data.accessToken,
          expiresIn: res.data.expiresIn,
        });
        setUser(res.data.user);
        history.replace("/");
      },
    }
  );

  const [formValues, setFormValues] = useState<RegisterFormInput>(
    RegisterFormInitValues
  );

  const form = useForm({
    initErrors: RegisterFormInitErrors,
    initValues: RegisterFormInitValues,
    setValues: setFormValues,
    validateSchema: RegisterFormValidation,
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
        <div className="text-xl font-bold">Register</div>
        <form>
          <CusTextField
            id="first_name"
            label={"First name"}
            name="first_name"
            variant="standard"
            margin={"dense"}
            value={formValues.first_name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            helperText={
              form.formErrors.first_name !== ""
                ? form.formErrors.first_name
                : " "
            }
            error={form.formErrors.first_name !== ""}
          />

          <CusTextField
            id="last_name"
            label={"First name"}
            name="last_name"
            variant="standard"
            margin={"dense"}
            value={formValues.last_name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            helperText={
              form.formErrors.last_name !== "" ? form.formErrors.last_name : " "
            }
            error={form.formErrors.last_name !== ""}
          />
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
          <CusTextField
            id="confirm_password"
            name="confirm_password"
            label={"Confirm password"}
            variant="standard"
            margin={"dense"}
            type={"password"}
            value={formValues.confirm_password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            helperText={
              form.formErrors.confirm_password !== ""
                ? form.formErrors.confirm_password
                : " "
            }
            error={form.formErrors.confirm_password !== ""}
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
                Register
              </CusButton>
            </div>
            <div>
              or <Link to="/">Already registered.</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
