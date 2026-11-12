import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ImageCarousel = ({ images, alt, slug }) => {
    const [index, setIndex] = useState(0);
    const total = images.length;

    const prev = (e) => {
        e.stopPropagation();
        setIndex((i) => (i - 1 + total) % total);
    };
    const next = (e) => {
        e.stopPropagation();
        setIndex((i) => (i + 1) % total);
    };

    return (
        <div className="h-52 relative overflow-hidden group" data-testid={`carousel-${slug}`}>
            {images.map((src, i) => (
                <img
                    key={src + i}
                    src={src}
                    alt={`${alt} — fotografía ${i + 1}`}
                    loading="lazy"
                    data-testid={i === index ? `carousel-image-${slug}` : undefined}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
                />
            ))}
            {total > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Fotografía anterior"
                        data-testid={`carousel-prev-${slug}`}
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFDF9]/80 backdrop-blur-sm text-[#14213D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F77F00] hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Fotografía siguiente"
                        data-testid={`carousel-next-${slug}`}
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFDF9]/80 backdrop-blur-sm text-[#14213D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F77F00] hover:text-white"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Ir a fotografía ${i + 1}`}
                                data-testid={`carousel-dot-${slug}-${i}`}
                                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                                className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-[#F77F00]" : "bg-white/60 hover:bg-white"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
