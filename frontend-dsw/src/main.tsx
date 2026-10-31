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
import { CssBaseline, ThemeProvider } from '@mui/material';
import { tema } from './tema';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={tema}>
    <CssBaseline />
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <AuthProvider>
          <ResponsiveAppBar />
          <main style={{ minHeight: 'calc(100dvh - 64px)' }}>
            <App />
          </main>
        </AuthProvider>
      </LocalizationProvider>
    </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
