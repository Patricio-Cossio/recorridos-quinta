export const Marquee = ({ museums }) => {
    const names = museums.length
        ? museums.map((m) => m.short_name)
        : ["Museo Ferroviario", "Historia Natural", "Arte Contemporáneo", "Ciencia y Tecnología", "Pabellón Artequín", "Museo de la Memoria", "Biblioteca de Santiago"];
    const items = [...names, ...names];
    return (
        <div data-testid="museum-marquee" className="border-y border-[#14213D]/10 bg-[#FAF0CA] py-4 text-[#14213D] overflow-hidden">
            <div className="mq gap-10 items-center font-sans text-xs font-bold uppercase tracking-widest">
                {items.map((n, i) => (
                    <span key={i} className="flex items-center gap-10">
                        <span>{n}</span>
                        <span className="text-[#D62828]">/</span>
                    </span>
                ))}
            </div>
        </div>
    );
};
