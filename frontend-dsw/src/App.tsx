import { Routes, Route } from "react-router-dom";

import Inicio from "./Paginas/Inicio";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/reserva" element={<h1>Reserva</h1>} />
    </Routes>
  );
}

export default App;