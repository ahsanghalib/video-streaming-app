import { SetStateAction, useState } from "react";
import * as yup from "yup";

export type FormErrors<T> = {
  [K in keyof T]: string | "";
};

type useFormType<T> = {
  initValues: T;
  initErrors: FormErrors<T>;
  validateSchema: any;
  setValues: (value: SetStateAction<T>) => void;
  values: T;
};

export function useForm<T>({
  initErrors,
  initValues,
  values,
  setValues,
  validateSchema,
}: useFormType<T>) {
  const [formErrors, setFormErrors] = useState<FormErrors<T>>(initErrors);

  const handleChange = (event: any) => {
    const name = event.target.name;

    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setValues({
      ...values,
      [name]: value,
    });
    setFormErrors(initErrors);
  };

  const changeMaskInput = (value: any, fieldName: string) => {
    setValues({
      ...values,
      [fieldName]: value,
    });
  };

  const changeSwitch = (value: any, fieldName: string) => {
    setValues({
      ...values,
      [fieldName]: value,
    });
  };

  const selectChange = (value: any, fieldName: string) => {
    setValues({
      ...values,
      [fieldName]: value,
    });
  };

  const cascaderSelect = (value: string[], fieldName: string[]) => {
    const fieldValues = fieldName.reduce((acc: any, cur: any, index: any) => {
      return { ...acc, [cur]: value[index] };
    }, {});

    setValues({
      ...values,
      ...fieldValues,
    });
  };

  const numberChange = (value: any, fieldName: string) => {
    setValues({
      ...values,
      [fieldName]: isNaN(value) ? 0 : value,
    });
  };

  const handleBlur = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    yup
      .reach(validateSchema, name, "", "")
      .validate(value)
      .catch((err: any) => {
        setFormErrors({
          ...formErrors,
          [name]: err.message,
        });
      });
  };

  const formValidation = async (): Promise<boolean> => {
    try {
      await yup
        .reach(validateSchema, "", "", "")
        .validate(values, { abortEarly: false });
      setFormErrors({ ...initErrors });
      return true;
    } catch (err) {
      let errors = err.inner.reduce((acc: any, current: any) => {
        if (acc[current.path]) return { ...acc };
        return { ...acc, [current.path]: current.message };
      }, {});
      setFormErrors({ ...formErrors, ...errors });
      return false;
    }
  };

  const handleReset = () => setValues(initValues);

  return {
    handleChange,
    handleBlur,
    handleReset,
    formValidation,
    formErrors,
    selectChange,
    numberChange,
    cascaderSelect,
    changeMaskInput,
    changeSwitch,
  };
}
