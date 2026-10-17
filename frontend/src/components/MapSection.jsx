import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PARK_CENTER = [-33.4405, -70.6818];

const makeIcon = (museum, active) =>
    L.divIcon({
        className: "",
        html: `<div class="museum-pin ${active ? "pin-active" : ""}" style="background:${museum.color}">${museum.initials}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
    });

const MapEffects = ({ focus, routeStops }) => {
    const map = useMap();
    useEffect(() => {
        if (focus) {
            map.flyTo([focus.lat, focus.lng], 17, { duration: 1.2 });
        } else if (routeStops && routeStops.length > 0) {
            const bounds = L.latLngBounds(routeStops.map((s) => [s.lat, s.lng]));
            map.flyToBounds(bounds.pad(0.35), { duration: 1.2 });
        }
    }, [focus, routeStops, map]);
    return null;
};

export const MapSection = ({ museums, routes, selectedRouteId, onSelectRoute }) => {
    const route = routes.find((r) => r.id === selectedRouteId) || routes[0];
    const routeStops = useMemo(() => {
        if (!route) return [];
        return route.stops
            .map((slug) => museums.find((m) => m.slug === slug))
            .filter(Boolean);
    }, [route, museums]);

    const polyline = routeStops.map((m) => [m.lat, m.lng]);

    return (
        <section id="mapa-plano" data-testid="map-section" className="py-24 px-6 md:px-8 max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#0077B6]">Navegación del Predio</span>
                <h2 className="serif-title text-4xl md:text-5xl text-[#14213D] mt-2">Plano de Paradas Culturales</h2>
                <p className="font-sans text-sm text-[#14213D]/70 mt-3">
                    Toca cada pin para conocer el museo. El trazado punteado muestra el circuito seleccionado.
                </p>
            </div>

            <div className="bg-[#14213D] text-white p-6 md:p-12 rounded-3xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-7 rounded-2xl bg-white/5 p-3 border border-white/10 flex flex-col">
                        <div className="rounded-xl overflow-hidden min-h-[380px] lg:min-h-[460px] flex-1" data-testid="leaflet-map">
                            <MapContainer
                                center={PARK_CENTER}
                                zoom={16}
                                scrollWheelZoom={false}
                                style={{ height: "100%", width: "100%", minHeight: "380px" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {museums.map((m) => (
                                    <Marker
                                        key={m.id}
                                        position={[m.lat, m.lng]}
                                        icon={makeIcon(m, routeStops.some((s) => s.id === m.id))}
                                    >
                                        <Popup>
                                            <div data-testid={`map-popup-${m.slug}`}>
                                                <div className="font-bold text-[#14213D]" style={{ fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
                                                    {m.name}
                                                </div>
                                                <div style={{ color: "#14213D", opacity: 0.75, marginTop: 4 }}>{m.description}</div>
                                                <div style={{ color: m.color, fontWeight: 700, marginTop: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                                                    {m.schedule}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                {polyline.length > 1 && (
                                    <Polyline
                                        positions={polyline}
                                        pathOptions={{ color: route?.color || "#F77F00", weight: 4, dashArray: "8 6" }}
                                    />
                                )}
                                <MapEffects focus={null} routeStops={routeStops} />
                            </MapContainer>
                        </div>
                        <div className="font-sans text-xs text-white/70 mt-4 text-center">
                            Red de senderos peatonales · Accesos Metro Quinta Normal (L5) y Gruta de Lourdes (L5)
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4 font-sans flex flex-col">
                        <div className="flex gap-2 flex-wrap mb-1" data-testid="map-route-switcher">
                            {routes.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    data-testid={`map-route-btn-${r.id}`}
                                    onClick={() => onSelectRoute(r.id)}
                                    className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors border ${
                                        r.id === (route?.id || "")
                                            ? "text-white border-transparent"
                                            : "bg-white/5 text-white/70 border-white/15 hover:border-white/40"
                                    }`}
                                    style={r.id === (route?.id || "") ? { background: r.color } : {}}
                                >
                                    {r.code}
                                </button>
                            ))}
                        </div>
                        {routeStops.map((m, i) => (
                            <div
                                key={m.id}
                                data-testid={`map-stop-${m.slug}`}
                                className="p-4 rounded-xl bg-white/10 fade-in-up"
                                style={{ borderLeft: `4px solid ${m.color}`, animationDelay: `${i * 0.12}s` }}
                            >
                                <div className="text-xs font-bold uppercase" style={{ color: route?.color || "#F77F00" }}>
                                    Parada {i + 1} · {m.category}
                                </div>
                                <div className="font-bold text-base text-white">{m.name}</div>
                                <p className="text-xs text-white/70 mt-1">{m.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
