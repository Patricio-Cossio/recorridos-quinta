import { ImageCarousel } from "./ImageCarousel";

export const MuseumsGrid = ({ museums }) => (
    <section id="museos" data-testid="museums-section" className="py-20 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#D62828]">Catálogo Patrimonial</span>
                <h2 className="serif-title text-4xl md:text-5xl text-[#14213D] mt-1">Los Museos del Parque</h2>
            </div>
            <span className="font-sans text-xs text-[#14213D]/60 mt-4 md:mt-0">
                Acceso peatonal por Av. Matucana y Av. Portales
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {museums.map((m, i) => (
                <article
                    key={m.id}
                    data-testid={`museum-card-${m.slug}`}
                    className="relative rounded-3xl border border-[#14213D]/10 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow fade-in-up flex flex-col"
                    style={{ animationDelay: `${(i % 3) * 0.12}s` }}
                >
                    <ImageCarousel
                        images={m.images && m.images.length ? m.images : [m.image]}
                        alt={m.name}
                        slug={m.slug}
                    />
                    <div
                        className="absolute top-4 left-4 font-sans text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase z-10"
                        style={{ background: m.color }}
                    >
                        {m.badge}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                        <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-[#14213D]/50 mb-1">
                            {m.category}
                        </span>
                        <h3 className="serif-title text-2xl text-[#14213D] mb-2">{m.short_name}</h3>
                        <p className="text-xs text-[#14213D]/70 leading-relaxed mb-3">{m.detail}</p>
                        <div className="mt-auto pt-2 space-y-1">
                            <span className="block font-sans text-[11px] font-semibold text-[#0077B6]">
                                {m.schedule}
                            </span>
                            <span className="block font-sans text-[11px] text-[#14213D]/60">
                                {m.access}
                            </span>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    </section>
);
