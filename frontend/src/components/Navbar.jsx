import { Logo } from "./Logo";

const links = [
    { href: "#museos", label: "Colecciones" },
    { href: "#mapa-plano", label: "Mapa del Parque" },
    { href: "#recorridos", label: "Circuitos" },
    { href: "#evaluacion", label: "Calificar" },
];

export const Navbar = () => (
    <nav data-testid="main-nav" className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#14213D]/10 px-6 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <a href="#inicio" data-testid="nav-logo" className="flex items-center gap-3 shrink-0">
                <Logo />
                <div>
                    <span className="serif-title text-xl md:text-2xl tracking-tight text-[#14213D] block leading-none">QUINTA MATUCANA</span>
                    <span className="text-[10px] tracking-widest uppercase text-[#14213D]/60 font-sans">Eje Patrimonial Santiago</span>
                </div>
            </a>
            <div className="hidden md:flex items-center gap-8 text-xs font-sans tracking-widest uppercase text-[#14213D]/70 font-semibold">
                {links.map((l) => (
                    <a key={l.href} href={l.href} data-testid={`nav-link-${l.href.slice(1)}`} className="hover:text-[#0077B6] transition-colors">
                        {l.label}
                    </a>
                ))}
            </div>
            <a
                href="#evaluacion"
                data-testid="nav-evaluate-btn"
                className="font-sans px-5 py-2.5 rounded-full bg-[#14213D] text-[#FFFDF9] font-medium text-xs tracking-wider uppercase hover:bg-[#0077B6] transition-colors shrink-0"
            >
                Evaluar Ruta
            </a>
        </div>
    </nav>
);
