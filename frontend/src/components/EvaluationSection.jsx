import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { postEvaluation } from "../api";

const StarRating = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1.5 pt-1" data-testid="star-rating" role="radiogroup" aria-label="Calificación global">
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = (hover || value) >= n;
                return (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                        data-testid={`star-${n}`}
                        onClick={() => onChange(n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-125"
                    >
                        <Star
                            className="w-7 h-7"
                            fill={filled ? "#F77F00" : "transparent"}
                            color={filled ? "#F77F00" : "rgba(20,33,61,0.25)"}
                            strokeWidth={2}
                        />
                    </button>
                );
            })}
        </div>
    );
};

const Stars = ({ n }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-3.5 h-3.5" fill={i <= n ? "#F77F00" : "transparent"} color={i <= n ? "#F77F00" : "rgba(20,33,61,0.25)"} />
        ))}
    </div>
);

export const EvaluationSection = ({ routes, evaluations, stats, onNewEvaluation }) => {
    const [name, setName] = useState("");
    const [route, setRoute] = useState("");
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [sending, setSending] = useState(false);

    const routeOptions = [
        ...routes.map((r) => `${r.code}: ${r.name}`),
        "Recorrido Espontáneo",
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Selecciona una calificación en estrellas");
            return;
        }
        setSending(true);
        try {
            const saved = await postEvaluation({ name, route, rating, comment });
            toast.success("¡Gracias! Tu evaluación fue publicada en el muro de testimonios.");
            setName(""); setRoute(""); setRating(0); setComment("");
            onNewEvaluation(saved);
        } catch (err) {
            toast.error("No pudimos guardar tu evaluación. Intenta nuevamente.");
        } finally {
            setSending(false);
        }
    };

    return (
        <section id="evaluacion" data-testid="evaluation-section" className="py-24 px-6 md:px-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                    <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#0077B6]">Participación Ciudadana</span>
                    <h2 className="serif-title text-4xl text-[#14213D] mt-1 mb-4">Evalúa tu Experiencia</h2>
                    <p className="text-sm text-[#14213D]/75 leading-relaxed mb-6">
                        Tu valoración sobre los tiempos, la limpieza de los senderos y la atención en cada museo ayuda a
                        mejorar la guía comunitaria del parque. Cada evaluación se publica de inmediato en el muro de testimonios.
                    </p>

                    {stats.count > 0 && (
                        <div data-testid="evaluation-stats" className="flex items-center gap-4 mb-6 font-sans">
                            <div className="serif-title text-5xl text-[#F77F00]">{stats.average}</div>
                            <div className="text-xs text-[#14213D]/70">
                                <Stars n={Math.round(stats.average)} />
                                <div className="mt-1">{stats.count} evaluación{stats.count !== 1 ? "es" : ""} publicada{stats.count !== 1 ? "s" : ""}</div>
                            </div>
                        </div>
                    )}

                    <div data-testid="testimonials-wall" className="p-6 rounded-2xl bg-[#FAF0CA]/50 border border-[#FAF0CA] max-h-96 overflow-y-auto space-y-4">
                        <div className="font-sans text-xs font-bold uppercase text-[#14213D]/70">Testimonios de Visitantes</div>
                        {evaluations.length === 0 ? (
                            <p className="text-xs text-[#14213D]/80 italic">
                                Aún no hay valoraciones. Envía tu evaluación y se publicará aquí de inmediato.
                            </p>
                        ) : (
                            evaluations.map((ev) => (
                                <div key={ev.id} data-testid={`testimonial-${ev.id}`} className="border-b border-[#14213D]/10 pb-3 last:border-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-sans text-xs font-bold text-[#14213D]">{ev.name}</span>
                                        <Stars n={ev.rating} />
                                    </div>
                                    <div className="font-sans text-[10px] uppercase tracking-wider text-[#0077B6] font-semibold mt-0.5">{ev.route}</div>
                                    <p className="text-xs text-[#14213D]/80 mt-1 leading-relaxed">{ev.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#14213D]/10 shadow-lg font-sans">
                    <form className="space-y-5" onSubmit={handleSubmit} data-testid="evaluation-form">
                        <div>
                            <label htmlFor="eval-name" className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">
                                Nombre y Apellido
                            </label>
                            <input
                                id="eval-name"
                                data-testid="eval-name-input"
                                type="text"
                                required
                                minLength={2}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#14213D]/20 bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#0077B6] transition-colors"
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="eval-route" className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">
                                    Circuito Realizado
                                </label>
                                <select
                                    id="eval-route"
                                    data-testid="eval-route-select"
                                    required
                                    value={route}
                                    onChange={(e) => setRoute(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#14213D]/20 bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#0077B6] transition-colors"
                                >
                                    <option value="" disabled>Selecciona un circuito</option>
                                    {routeOptions.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">
                                    Calificación Global
                                </span>
                                <StarRating value={rating} onChange={setRating} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="eval-comment" className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">
                                Comentario de la visita
                            </label>
                            <textarea
                                id="eval-comment"
                                data-testid="eval-comment-input"
                                rows={3}
                                required
                                minLength={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#14213D]/20 bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#0077B6] transition-colors"
                                placeholder="Comparte qué exposición te gustó más o recomendaciones para otros visitantes"
                            />
                        </div>

                        <button
                            type="submit"
                            data-testid="eval-submit-btn"
                            disabled={sending}
                            className="w-full py-4 rounded-xl bg-[#0077B6] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#005f92] transition-colors disabled:opacity-60"
                        >
                            {sending ? "Guardando..." : "Guardar Calificación y Reseña"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};
