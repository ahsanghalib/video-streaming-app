import { toast, TypeOptions } from "react-toastify";

export const ShowToast = (m: string, t: TypeOptions, progress?: boolean) =>
  toast(m, {
    type: t,
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: progress ? false : true,
    closeOnClick: true,
    draggable: false,
  });
