import Card from "./Card";

function App() {
  return (
    <section className="min-h-screen bg-[url('./public/bgtemporal.jpg')] bg-cover bg-center flex items-center justify-center">
      <div className="p-4">
        <Card
          title="Reserva Online"
          description="Reserva un turno con uno de nuestros especialistas"
          href="/reserva"
        /> 
      </div>

      <div className="p-4">
        <Card
          title="Reserva Turnos Telefonicamente"
          description="0303-4567890"
          href="/turnos-telefonicos"
        />
      </div>

      <div className="p-4">
        <Card
          title="Ver Turnos Reservados"
          description="Tus turnos ya reservados"
          href="/turnos-reservados"
        />
      </div>
    </section>
  );
}

export default App;