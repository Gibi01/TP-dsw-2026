import Card from "./Card";
import "./App.css";

function App() {
  return (
    <>

      <div className="flex flex-col justify-center max-h-full max-w-full h-15 bg-[#f2f8f9]">
        <a href="https://www.youtube.com/watch?v=u5NqO2v_xnY" className="text-[#8d6700] hover:text-[#ffcc00]">
          Labura Juan
        </a>
      </div>
      <section className="min-h-screen bg-[url('./bgtemporal.jpg')] bg-cover bg-center">
        <div className="flex justify-center pt-20 pr-1.5">
          <div className="flex flex-col md:flex-row justify-center gap-6 max-w-6xl w-full ">
            <Card
              title="Reserva Online"
              description="Reserva un turno "
              href="/reserva"
            />
            <Card
              title="Reserva Turnos Telefonicamente"
              description="Por telefono o Whatsapp"
              href="/turnos-telefonicos"
            />
            <Card
              title="Ver Turnos Reservados"
              description="Tus turnos ya reservados"
              href="/turnos-reservados"
            />
          </div>
        </div>
      </section>
    </>
  );
}



export default App;