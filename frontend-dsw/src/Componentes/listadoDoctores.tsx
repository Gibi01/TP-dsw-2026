import DoctorCard from "./tarjetaMedico";
import type { DoctorCardData } from "./tarjetaMedico";

interface DoctorListProps {
    doctores: DoctorCardData[];
}

export default function DoctorList({ doctores }: DoctorListProps){

    return(

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {

                doctores.map((d) => (

                    <DoctorCard

                        key={d.id}

                        doctor={d}

                    />

                ))

            }

        </div>

    )

}
