import React from "react";
import ReactDOM from "react-dom/client";     // React 18+
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const container = document.getElementById("root");
// React 18 이상
const root = ReactDOM.createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);