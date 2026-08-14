import { Routes, Route } from "react-router-dom";

import Inicio from "./Paginas/Inicio";
import Doctores from "./Paginas/doctores";
import DoctorDetalle from "./Paginas/DoctorDetalle";
import Especialidades from "./Paginas/Especialidades";
import Registro from "./Paginas/Registro";
import Login from "./Paginas/Login";
import RecuperarPassword from "./Paginas/RecuperarPassword";
import MisTurnos from "./Paginas/MisTurnos";
import RutaPrivada from "./Componentes/RutaPrivada";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/reserva" element={<Especialidades />} />
      <Route path="/doctores" element={<Doctores />} />
      <Route path="/doctores/:matricula" element={<DoctorDetalle />} />
      <Route path="/especialidades" element={<Especialidades />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route
        path="/mis-turnos"
        element={
          <RutaPrivada>
            <MisTurnos />
          </RutaPrivada>
        }
      />
    </Routes>
  );
}

export default App;
