import { Device, Producer, Transport } from "mediasoup-client/lib/types";
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
      sessionId: "",
    };
  } catch {
    return {
      accessToken: "",
      expiresIn: "",
      sessionId: "",
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
    setSessionId: (sessionId: string) => set({ sessionId: sessionId }),
    clearTokens: () => {
      try {
        localStorage.removeItem(accessTokenKey);
        localStorage.removeItem(expiresInKey);
        useUserInfoStore.getState().clearUser();
      } catch {}
      set({ accessToken: "", expiresIn: "", sessionId: "" });
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

/**
 * Media Store
 */
// const getDevice = () => {
//   try {
//     let handlerName = detectDevice();
//     if (!handlerName) {
//       console.warn(
//         "mediasoup does not recognize this device, so ben has defaulted it to Chrome74"
//       );
//       handlerName = "Chrome74";
//     }
//     return new Device({ handlerName });
//   } catch {
//     return null;
//   }
// };

type facingModeType = "user" | "environment";

export const useMediaStore = create(
  combine(
    {
      mediaStream: null as MediaStream | null,
      sendTransport: null as Transport | null,
      producers: [] as Producer[],
      device: null as Device | null,
      facingMode: "user" as facingModeType,
      fileName: null as string | null,
    },
    (set) => ({
      nullify: () =>
        set({
          sendTransport: null,
          mediaStream: null,
          producers: [],
          device: null,
          facingMode: "user",
          fileName: null,
        }),
      set,
    })
  )
);

/**
 * mediasoup connection state
 */
export type ConnectionState =
  | "new"
  | "connecting"
  | "connected"
  | "failed"
  | "disconnected"
  | "closed";

export const useMediaSoupConnectionState = create(
  combine(
    {
      status: "closed" as ConnectionState,
    },
    (set) => ({
      setStatus: (status: ConnectionState) => set({ status }),
    })
  )
);

/**
 * streaming users
 */

type StreamingUsers = Array<{
  userId: string;
  userName: string;
  fileName: string;
}>;

export const useStreamingUsers = create(
  combine(
    {
      streamUsers: [] as StreamingUsers,
    },
    (set) => ({
      setStreamUsers: (streamUsers: StreamingUsers) => set({ streamUsers }),
    })
  )
);
