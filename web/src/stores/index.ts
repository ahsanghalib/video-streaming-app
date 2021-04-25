import create from "zustand";
import { combine } from "zustand/middleware";
import { UserInfoType, UserTypesEnum } from "../utils/types";

/**
 * userSocketStatus
 */
type State = "connecting" | "open" | "closed" | "auth_good" | "auth_bad";

export const useSocketStatus = create(
  combine(
    {
      status: "closed" as State,
    },
    (set) => ({
      setStatus: (status: State) => set({ status }),
    })
  )
);

/**
 * userTokenStore
 */
const accessTokenKey = "token";
const expiresInKey = "expiresIn";

const getDefaultValues = () => {
  try {
    return {
      accessToken: localStorage.getItem(accessTokenKey) || "",
      expiresIn: localStorage.getItem(expiresInKey) || "",
    };
  } catch {
    return {
      accessToken: "",
      expiresIn: "",
    };
  }
};

export const useTokenStore = create(
  combine(getDefaultValues(), (set) => ({
    setTokens: (x: { accessToken: string; expiresIn: string }) => {
      try {
        localStorage.setItem(accessTokenKey, x.accessToken);
        localStorage.setItem(expiresInKey, x.expiresIn);
      } catch {}
      set(x);
    },
    clearTokens: () => {
      try {
        localStorage.removeItem(accessTokenKey);
        localStorage.removeItem(expiresInKey);
        useUserInfoStore.getState().clearUser();
      } catch {}
      set({ accessToken: "", expiresIn: "" });
    },
  }))
);

/**
 * userUserInfoStore
 */
const user: UserInfoType = {
  created_at: "",
  email: "",
  first_name: "",
  id: "",
  is_active: false,
  last_name: "",
  updated_at: "",
  user_type: UserTypesEnum.USER,
};

export const useUserInfoStore = create(
  combine(
    {
      user,
    },
    (set) => ({
      setUser: (user: UserInfoType) => set({ user }),
      clearUser: () => set({ user }),
    })
  )
);
