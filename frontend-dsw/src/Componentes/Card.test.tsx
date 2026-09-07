import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Card from "./Card";

describe("Card", () => {
  it("muestra el título y la descripción recibidos por props", () => {
    render(
      <MemoryRouter>
        <Card title="Cardiología" description="Turnos disponibles" href="/reserva" />
      </MemoryRouter>
    );

    expect(screen.getByText("Cardiología")).toBeInTheDocument();
    expect(screen.getByText("Turnos disponibles")).toBeInTheDocument();
  });

  it("usa los valores por defecto cuando no se pasan props", () => {
    render(
      <MemoryRouter>
        <Card />
      </MemoryRouter>
    );

    expect(screen.getByText("titulo no definido")).toBeInTheDocument();
    expect(screen.getByText("descripción no definida")).toBeInTheDocument();
  });

  it("enlaza al href recibido", () => {
    render(
      <MemoryRouter>
        <Card title="Cardiología" href="/reserva" />
      </MemoryRouter>
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/reserva");
  });
});
