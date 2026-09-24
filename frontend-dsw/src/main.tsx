import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

import "./main.css";
import App from "./App.tsx";
import ResponsiveAppBar from "./Componentes/navBar";
import { AuthProvider } from "./Contextos/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <AuthProvider>
          <ResponsiveAppBar />
          <div className="min-h-screen bg-[url('/bgtemporal.jpg')] bg-cover bg-center bg-fixed">
            <App />
          </div>
        </AuthProvider>
      </LocalizationProvider>
    </BrowserRouter>
  </StrictMode>
);