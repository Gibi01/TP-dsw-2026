import DoctorCard from "./tarjetaMedico";

export default function DoctorList({doctores}){

    return(

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {

                doctores.map(d=>(

                    <DoctorCard

                        key={d.id}

                        doctor={d}

                    />

                ))

            }

        </div>

    )

}