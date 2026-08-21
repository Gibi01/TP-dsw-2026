import {

Card,
CardContent,
Typography,
Button

} from "@mui/material";

export default function tarjetaMedico({doctor}){

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