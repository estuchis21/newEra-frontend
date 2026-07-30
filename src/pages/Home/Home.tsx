import "./Home.css";

export default function Home() {

    return (

        <>

            <section className="hero">

                <div className="overlay">

                    <h1>Academia New Era</h1>

                    <p>

                        Donde la pasión por la danza se convierte
                        en arte.

                    </p>

                    <button onClick={() => window.location.href = "/clases"}>

                        Conocé nuestras clases

                    </button>

                </div>

            </section>

            <section className="historia">

                <div className="container">

                    <h2>Nuestra Historia</h2>

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
                        creatividad y formar amistades que duran
                        toda la vida.

                    </p>

                    <p>

                        Hoy seguimos creciendo junto a niños,
                        adolescentes y adultos que comparten la
                        misma pasión por el movimiento.

                    </p>

                </div>

            </section>

            <section className="porque">

                <div className="container">

                    <h2>¿Por qué elegirnos?</h2>

                    <div className="cards">

                        <div className="card">

                            <h3>Profesores Capacitados</h3>

                            <p>

                                Formación constante y experiencia
                                en distintos estilos.

                            </p>

                        </div>

                        <div className="card">

                            <h3>Todas las Edades</h3>

                            <p>

                                Desde los más pequeños hasta
                                adultos mayores.

                            </p>

                        </div>

                        <div className="card">

                            <h3>Ambiente Familiar</h3>

                            <p>

                                Un espacio pensado para aprender,
                                compartir y disfrutar.

                            </p>

                        </div>

                    </div>

                </div>

            </section>

            <section className="cta">

                <h2>

                    Viví la experiencia New Era

                </h2>

                <p>

                    Encontrá la disciplina ideal para vos.

                </p>

                <button>

                    Ver Clases

                </button>

            </section>

        </>

    );

}