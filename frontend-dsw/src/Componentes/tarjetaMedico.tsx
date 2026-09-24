import {

Card,
CardContent,
Typography,
Button

} from "@mui/material";

export interface DoctorCardData {
    id: number | string;
    nombre: string;
    apellido: string;
    especialidad: string;
    matricula: number | string;
    email: string;
    telefono: string;
}

interface DoctorCardProps {
    doctor: DoctorCardData;
}

export default function tarjetaMedico({ doctor }: DoctorCardProps){

    return(

        <Card>

            <CardContent>

                <Typography variant="h6">

                     {doctor.nombre} {doctor.apellido}

                </Typography>

                <Typography>

                    {doctor.especialidad}

                </Typography>

                <Typography>

                    Matrícula: {doctor.matricula}

                </Typography>

                <Typography>

                    {doctor.email}

                </Typography>

                <Typography>

                    {doctor.telefono}

                </Typography>

                <Button

                    variant="contained"

                    className="mt-4"

                >

                    Reservar turno

                </Button>

            </CardContent>

        </Card>

    )

}
