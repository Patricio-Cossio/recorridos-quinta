import { Clock, TrendingUp, MapPin } from "lucide-react";

export const RoutesSection = ({ routes, museums, selectedRouteId, onSelectRoute }) => {
    const route = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (!route) return null;

    const stopNames = route.stops
        .map((slug) => museums.find((m) => m.slug === slug))
        .filter(Boolean);

    const goToMap = () => {
        document.getElementById("mapa-plano")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section id="recorridos" data-testid="routes-section" className="py-20 px-6 md:px-8 bg-[#F4F1DE]/50 border-y border-[#14213D]/10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-12">
                    <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#F77F00]">Planificador de Ruta</span>
                    <h2 className="serif-title text-4xl md:text-5xl text-[#14213D]">Selecciona tu Itinerario</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8" role="radiogroup" aria-label="Circuitos disponibles">
                    {routes.map((r) => {
                        const active = r.id === route.id;
                        return (
                            <button
                                key={r.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                data-testid={`route-option-${r.id}`}
                                onClick={() => onSelectRoute(r.id)}
                                className={`p-4 rounded-2xl border text-center cursor-pointer transition-colors ${
                                    active
                                        ? "border-[#0077B6] bg-[#EBF5FB] text-[#0077B6]"
                                        : "border-[#14213D]/20 bg-white text-[#14213D] hover:border-[#0077B6]/50"
                                }`}
                            >
                                <span className={`font-sans text-xs uppercase block font-semibold ${active ? "text-[#0077B6]/70" : "text-[#14213D]/60"}`}>
                                    {r.code}
                                </span>
                                <span className="serif-title text-xl">{r.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div data-testid="route-detail-panel" className="bg-white p-8 md:p-10 rounded-3xl border border-[#14213D]/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-8">
                            <div className="flex flex-wrap gap-4 font-sans text-xs font-bold uppercase tracking-wider" style={{ color: route.color }}>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duración: {route.duration}</span>
                                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Dificultad: {route.difficulty}</span>
                            </div>
                            <h3 className="serif-title text-3xl text-[#14213D] mt-2 mb-3">{route.title}</h3>
                            <p className="text-sm text-[#14213D]/80 leading-relaxed mb-4">{route.description}</p>
                            <div className="font-sans text-xs text-[#0077B6] font-semibold mb-6">{route.audience}</div>
                            <ol className="space-y-2 mb-6">
                                {stopNames.map((m, i) => (
                                    <li key={m.id} data-testid={`route-stop-${m.slug}`} className="flex items-center gap-3 font-sans text-xs">
                                        <span
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                                            style={{ background: m.color }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="font-semibold text-[#14213D]">{m.name}</span>
                                    </li>
                                ))}
                            </ol>
                            <button
                                type="button"
                                data-testid="route-view-map-btn"
                                onClick={goToMap}
                                className="font-sans inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                style={{ background: route.color }}
                            >
                                <MapPin className="w-4 h-4" /> Ver circuito en el mapa
                            </button>
                        </div>
                        <div className="md:col-span-4 rounded-2xl p-6 text-center" style={{ background: route.panel_bg }}>
                            <div className="font-sans text-xs uppercase text-[#14213D]/70 font-bold mb-1">Paradas Clave</div>
                            <div className="serif-title text-2xl" style={{ color: route.color }}>{route.key_stops}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
