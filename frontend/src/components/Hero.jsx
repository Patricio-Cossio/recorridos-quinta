const HERO_IMG = "https://images.pexels.com/photos/15062958/pexels-photo-15062958.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export const Hero = ({ museumCount }) => (
    <header id="inicio" data-testid="hero-section" className="pt-14 pb-20 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#D62828] mb-4 block">
                    Santiago Poniente · Circuito Cultural
                </span>
                <h1 className="serif-title text-5xl md:text-7xl leading-[1.05] text-[#14213D] mb-6">
                    <span className="ln"><span>EL GRAN PARQUE DE</span></span>
                    <span className="ln"><span className="italic text-[#0077B6]">LOS MUSEOS CHILENOS</span></span>
                </h1>
                <p className="text-base text-[#14213D]/80 leading-relaxed mb-8 max-w-xl">
                    Descubre el Museo Ferroviario con sus trenes patrimoniales, la ballena del Museo de Historia Natural
                    y los pabellones artísticos en un solo destino. Planifica tu visita, elige un circuito y recorre el
                    pulmón cultural de Santiago Poniente.
                </p>
                <div className="flex flex-wrap gap-4 font-sans text-xs">
                    <a
                        href="#mapa-plano"
                        data-testid="hero-map-cta"
                        className="px-6 py-3.5 rounded-full bg-[#F77F00] text-white font-bold tracking-wider uppercase hover:bg-[#d96e00] transition-colors"
                    >
                        Explorar Mapa y Rutas
                    </a>
                    <a
                        href="#museos"
                        data-testid="hero-museums-cta"
                        className="px-6 py-3.5 rounded-full border border-[#14213D]/20 text-[#14213D] font-bold tracking-wider uppercase hover:border-[#14213D] transition-colors"
                    >
                        Ver {museumCount || "9"} Museos
                    </a>
                </div>
            </div>

            <div className="lg:col-span-5">
                <div className="slot-arch h-[440px] relative d2-wipe shadow-2xl border-4 border-white">
                    <div className="absolute inset-0 drift">
                        <img
                            src={HERO_IMG}
                            alt="Locomotora a vapor patrimonial del Museo Ferroviario de Santiago"
                            className="w-full h-full object-cover"
                            data-testid="hero-image"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14213D] via-[#14213D]/40 to-transparent p-6 flex flex-col justify-end text-white">
                        <span className="font-sans text-[11px] uppercase tracking-widest text-[#F77F00] font-bold">Pieza Destacada</span>
                        <h3 className="serif-title text-2xl">Locomotora Tipo 80</h3>
                        <p className="font-sans text-xs text-white/80 mt-1">
                            Joyas de la maestranza ferroviaria chilena preservadas en su parque.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </header>
);
