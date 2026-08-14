import { useEffect, useMemo, useState } from "react";
import DoctorList from "../components/DoctorList";
import DoctorFilters from "../components/DoctorFilters";
import { Doctor } from "../types/Doctor";

export default function DoctorsPage() {

    const [doctores, setDoctores] = useState<Doctor[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [especialidad, setEspecialidad] = useState("");
    const [orden, setOrden] = useState("apellido");

    useEffect(() => {

        // posteriormente viene del backend

        setDoctores([
            {
                id:1,
                nombre:"Juan",
                apellido:"Pérez",
                especialidad:"Cardiología",
                matricula:"123",
                email:"juan@mail.com",
                telefono:"341..."
            },
            {
                id:2,
                nombre:"Ana",
                apellido:"Gómez",
                especialidad:"Pediatría",
                matricula:"456",
                email:"ana@mail.com",
                telefono:"341..."
            }
        ])

    },[]);

    const doctoresFiltrados = useMemo(() => {

        let lista=[...doctores];

        if(busqueda){

            lista=lista.filter(d=>{

                const texto=`${d.nombre} ${d.apellido}`.toLowerCase();

                return texto.includes(busqueda.toLowerCase());

            })

        }

        if(especialidad){

            lista=lista.filter(d=>d.especialidad===especialidad);

        }

        lista.sort((a,b)=>{

            switch(orden){

                case "nombre":
                    return a.nombre.localeCompare(b.nombre);

                case "apellido":
                    return a.apellido.localeCompare(b.apellido);

                case "especialidad":
                    return a.especialidad.localeCompare(b.especialidad);

                default:
                    return 0;

            }

        })

        return lista;

    },[doctores,busqueda,especialidad,orden]);

    return(

        <div className="max-w-7xl mx-auto p-8">

            <DoctorFilters

                busqueda={busqueda}
                setBusqueda={setBusqueda}

                especialidad={especialidad}
                setEspecialidad={setEspecialidad}

                orden={orden}
                setOrden={setOrden}

            />

            <DoctorList doctores={doctoresFiltrados}/>

        </div>

    )

}