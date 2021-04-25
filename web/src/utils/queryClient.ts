import { QueryClient } from "react-query";
import { ShowToast } from "../components/ShowToast";

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (e: any) => {
        if (e.response.data.message) {
          ShowToast(e.response.data.message, "error");
        }
      },
    },
    queries: {
      retry: false,
      staleTime: 60 * 1000 * 5,
      onError: (e: any) => {
        if (e.response.data.message) {
          ShowToast(e.response.data.message, "error");
        }
      },
    },
  },
});
