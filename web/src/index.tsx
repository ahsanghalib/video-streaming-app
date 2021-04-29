import React from "react";
import ReactDOM from "react-dom";
import { QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import App from "./App";
import "./index.css";
import "video.js/dist/video-js.css";
import { queryClient } from "./utils/queryClient";

const app = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <ToastContainer />
  </QueryClientProvider>
);

ReactDOM.render(app, document.getElementById("root"));
