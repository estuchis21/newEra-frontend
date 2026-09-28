import "./Home.css";

import video1 from "../../assets/7817370-uhd-2160-4096-25fps_HQvysRiE.mp4";
import video2 from "../../assets/13583133_2160_3840_25fps.mp4";
import video3 from "../../assets/8929228-hd_1080_1920_30fps.mp4";


export default function Home() {

    return (

        <>


            {/* HERO */}

            <section className="hero">

                <div className="overlay">

                    <h1>
                        Academia New Era
                    </h1>


                    <p>
                        Donde la pasión por la danza
                        se convierte en arte.
                    </p>


                    <button
                        onClick={() => window.location.href="/clases"}
                    >
                        Conocé nuestras clases
                    </button>


                </div>


            </section>





            {/* HISTORIA */}


            <section className="historia">


                <div className="container">


                    <h2>
                        Nuestra Historia
                    </h2>



                    <p>
                        Academia New Era nació con un sueño:
                        crear un espacio donde cada persona pudiera
                        descubrir el poder de la danza.
                    </p>



                    <p>
                        Desde nuestros comienzos buscamos brindar
                        formación artística de calidad en un ambiente
                        cálido, inclusivo y lleno de energía.
                    </p>



                    <p>
                        Creemos que bailar no es solamente aprender
                        pasos. Es desarrollar disciplina, confianza,
                        creatividad y formar amistades.
                    </p>


                </div>


            </section>






            {/* VIDEOS ZIG ZAG */}



            <section className="videos">

                <h2>
                    Nuestra pasión en movimiento
                </h2>


                <div className="video-row">

                    <video autoPlay muted loop playsInline>
                        <source src={video1} type="video/mp4" />
                    </video>

                    <div className="video-text">

                        <h3>
                            Viví la pasión por la danza
                        </h3>

                        <p>
                            Cada clase es una experiencia llena
                            de energía, música y movimiento.
                        </p>

                    </div>

                </div>



                <div className="video-row reverse">

                    <video autoPlay muted loop playsInline>
                        <source src={video2} type="video/mp4" />
                    </video>

                    <div className="video-text">

                        <h3>
                            Profesores apasionados
                        </h3>

                        <p>
                            Aprendé con profesionales que te
                            acompañan en cada paso.
                        </p>

                    </div>

                </div>



                <div className="video-row">

                    <video autoPlay muted loop playsInline>
                        <source src={video3} type="video/mp4" />
                    </video>

                    <div className="video-text">

                        <h3>
                            Shows y competencias
                        </h3>

                        <p>
                            Formá parte de eventos y experiencias
                            únicas junto a la comunidad New Era.
                        </p>

                    </div>

                </div>


            </section>
            {/* PORQUE ELEGIRNOS */}



            <section className="porque">


                <div className="container">


                    <h2>
                        ¿Por qué elegirnos?
                    </h2>



                    <div className="cards">



                        <div className="card">


                            <h3>
                                Profesores Capacitados
                            </h3>


                            <p>
                                Formación constante y experiencia
                                en distintos estilos de danza.
                            </p>


                        </div>






                        <div className="card">


                            <h3>
                                Todas las edades
                            </h3>


                            <p>
                                Clases para niños,
                                adolescentes y adultos.
                            </p>


                        </div>






                        <div className="card">


                            <h3>
                                Ambiente Familiar
                            </h3>


                            <p>
                                Un espacio donde aprender,
                                disfrutar y hacer amigos.
                            </p>


                        </div>



                    </div>


                </div>


            </section>







            {/* CTA */}



            <section className="cta">


                <h2>
                    Viví la experiencia New Era
                </h2>



                <p>
                    Encontrá la disciplina ideal para vos.
                </p>



                <button
                    onClick={() => window.location.href="/clases"}
                >
                    Ver Clases
                </button>


            </section>


        </>

    );

}