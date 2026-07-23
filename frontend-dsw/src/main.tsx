import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./main.css";
import App from "./App.tsx";
import ResponsiveAppBar from "./Componentes/navBar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ResponsiveAppBar />
      <App />
    </BrowserRouter>
  </StrictMode>
);