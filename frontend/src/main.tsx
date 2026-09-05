import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app/App";
import { initializeTelegramTheme } from "./shared/telegram/theme";
import "./styles/global.css";

initializeTelegramTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
