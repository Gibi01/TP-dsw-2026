import { Routes, Route } from "react-router-dom";

import Inicio from "./Paginas/Inicio";
import Doctores from "./Paginas/Doctores";
import Especialidades from "./Paginas/Especialidades";
import Registro from "./Paginas/Registro";
import Login from "./Paginas/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/reserva" element={<Especialidades />} />
      <Route path="/doctores" element={<Doctores />} />
      <Route path="/especialidades" element={<Especialidades />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
