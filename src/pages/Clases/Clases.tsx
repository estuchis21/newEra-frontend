import {
    useEffect,
    useState
} from "react";

import type { Disciplina } from "../../types/disciplina";

import "./Clases.css";


import {
    obtenerDisciplinas,
} from "../../services/disciplinas.service";


export default function Clases(){


    const [
        disciplinas,
        setDisciplinas
    ] = useState<Disciplina[]>([]);



    useEffect(()=>{


        async function cargar(){

            try{

                const data =
                    await obtenerDisciplinas();


                setDisciplinas(data);


            }catch(error){

                console.error(
                    error
                );

            }

        }


        cargar();


    },[]);



    return (

        <section className="clases">


            <div className="clases-header">


                <h1>
                    Nuestras Clases
                </h1>


                <p>
                    Encontrá la disciplina ideal para vos.
                    Tenemos propuestas para todas las edades
                    y niveles.
                </p>


            </div>



            <div className="grid-clases">


                {
                    disciplinas.map(
                        (item)=>(
                            
                            <div
                                className="card-clase"
                                key={
                                    item.id_disciplina
                                }
                            >

                                <h2>
                                    {
                                        item.disciplina
                                    }
                                </h2>


                                <p>
                                    {
                                        item.descripcion
                                    }
                                </p>


                                <button>
                                    Inscribirme
                                </button>


                            </div>

                        )
                    )
                }


            </div>


        </section>

    );

}