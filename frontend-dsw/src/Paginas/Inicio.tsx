import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Card from "../Componentes/Card";

// Hardcodeados (datos de ejemplo, no son un número real del sanatorio).
const TELEFONO_FIJO = "011-4782-3956";
const TELEFONO_WHATSAPP = "011-15-6294-7183";

export default function Inicio() {
  const [modalTelefonicoAbierto, setModalTelefonicoAbierto] = useState(false);

  return (
    <>
      <div className="flex justify-center items-center pt-20 pr-1.5 min-h-screen">
        <div className="flex flex-col md:flex-row justify-center gap-6 max-w-6xl w-full">

          <Card
            title="Reserva Online"
            description="Reserva un turno"
            href="/reserva"
          />

          <Card
            title="Reserva Turnos Telefonicamente"
            description="Por telefono o Whatsapp"
            onClick={() => setModalTelefonicoAbierto(true)}
          />

          <Card
            title="Ver Turnos Reservados"
            description="Tus turnos ya reservados"
            href="/mis-turnos?pendientes=1"
          />

        </div>
      </div>

      <Dialog
        open={modalTelefonicoAbierto}
        onClose={() => setModalTelefonicoAbierto(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          Reservá tu turno por teléfono
          <IconButton onClick={() => setModalTelefonicoAbierto(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pb: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <PhoneIcon color="primary" />
              <Typography>
                Teléfono fijo: <strong>{TELEFONO_FIJO}</strong>
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <WhatsAppIcon sx={{ color: "#25D366" }} />
              <Typography>
                WhatsApp: <strong>{TELEFONO_WHATSAPP}</strong>
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
