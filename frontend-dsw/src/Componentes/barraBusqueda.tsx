import {
    Grid,
    MenuItem,
    TextField
} from "@mui/material";

export default function DoctorFilters(props:any){

    return(

        <Grid container spacing={2} className="mb-8">

            <Grid size={{xs:12, md:6}}>

                <TextField

                    fullWidth

                    label="Buscar médico"

                    value={props.busqueda}

                    onChange={(e)=>props.setBusqueda(e.target.value)}

                />

            </Grid>

            <Grid size={{xs:12, md:3}}>

                <TextField

                    select

                    fullWidth

                    label="Especialidad"

                    value={props.especialidad}

                    onChange={(e)=>props.setEspecialidad(e.target.value)}

                >

                    <MenuItem value="">Todas</MenuItem>

                    <MenuItem value="Cardiología">Cardiología</MenuItem>

                    <MenuItem value="Pediatría">Pediatría</MenuItem>

                    <MenuItem value="Dermatología">Dermatología</MenuItem>

                </TextField>

            </Grid>

            <Grid size={{xs:12, md:3}}>

                <TextField

                    select

                    fullWidth

                    label="Ordenar"

                    value={props.orden}

                    onChange={(e)=>props.setOrden(e.target.value)}

                >

                    <MenuItem value="apellido">

                        Apellido

                    </MenuItem>

                    <MenuItem value="nombre">

                        Nombre

                    </MenuItem>

                    <MenuItem value="especialidad">

                        Especialidad

                    </MenuItem>

                </TextField>

            </Grid>

        </Grid>

    )

}