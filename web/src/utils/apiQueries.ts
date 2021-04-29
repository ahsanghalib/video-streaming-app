const baseUrl =
  process.env.NODE_ENV === "production"
    ? `${window.location.host}`
    : `${window.location.hostname}:4000`;

export const apiBaseUrl = `${
  window.location.protocol === "https:" ? "https" : "http"
}://${baseUrl}/api`;

export const wsBaseUrl = `${
  window.location.protocol === "https:" ? "wss" : "ws"
}://${baseUrl}/socket`;
