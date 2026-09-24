// src/Componentes/CalendarioTurnos.tsx
// calendario para elegir la fecha de un turno. pinta de gris mas oscuro (y deshabilita)
// los dias sin ningun horario libre, ademas de los dias anteriores a hoy
import { useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";

// dia del calendario con estilo propio: gris mas oscuro para los que estan deshabilitados
// (pasados o sin disponibilidad), asi se distinguen de los que si se pueden elegir
function DiaCalendario(props: PickerDayProps) {
  const esDiaDisponible = !props.disabled && !props.selected && !props.outsideCurrentMonth;

  return (
    <PickerDay
      {...props}
      sx={
        props.disabled && !props.outsideCurrentMonth
          ? { bgcolor: "grey.500", color: "common.white" }
          : esDiaDisponible
            ? {
                border: 2,
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
              }
            : undefined
      }
    />
  );
}

interface Props {
  fecha: string; // YYYY-MM-DD
  onCambiarFecha: (fecha: string) => void;
  fechasConTurnos: Set<string>;
  onCambiarMes: (anio: number, mes: number) => void;
}

export default function CalendarioTurnos({
  fecha,
  onCambiarFecha,
  fechasConTurnos,
  onCambiarMes,
}: Props) {
  const hoy = dayjs().startOf("day");
  const valor = dayjs(fecha);

  useEffect(() => {
    onCambiarMes(valor.year(), valor.month() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StaticDatePicker
      value={valor}
      onChange={(nuevaFecha: Dayjs | null) => {
        if (nuevaFecha) onCambiarFecha(nuevaFecha.format("YYYY-MM-DD"));
      }}
      onMonthChange={(mes: Dayjs) => onCambiarMes(mes.year(), mes.month() + 1)}
      displayStaticWrapperAs="desktop"
      minDate={hoy}
      shouldDisableDate={(dia: Dayjs) =>
        dia.isBefore(hoy, "day") || !fechasConTurnos.has(dia.format("YYYY-MM-DD"))
      }
      slots={{ day: DiaCalendario }}
    />
  );
}
