import { LogoMark } from "./Logo";

const BANNER_IMG = "https://images.pexels.com/photos/38313214/pexels-photo-38313214.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export const Banner = () => (
    <div className="px-6 md:px-8 max-w-6xl mx-auto pb-16">
        <div className="h-60 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 drift">
                <img
                    src={BANNER_IMG}
                    alt="Alameda histórica de palmeras del Parque Quinta Normal"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    data-testid="banner-image"
                />
            </div>
            <div className="absolute inset-0 bg-[#14213D]/60 flex items-center justify-center text-center p-6 text-white">
                <div>
                    <span className="font-sans text-xs uppercase font-bold tracking-widest text-[#FAF0CA]">
                        Pulmón Verde de Santiago Poniente
                    </span>
                    <h4 className="serif-title text-3xl mt-1">Más de 35 hectáreas de historia y naturaleza</h4>
                </div>
            </div>
        </div>
    </div>
);

export const Footer = () => (
    <footer data-testid="site-footer" className="bg-[#14213D] text-white py-12 px-6 md:px-8 border-t border-white/10 font-sans">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/60">
            <div className="flex items-center gap-3">
                <LogoMark className="w-7 h-7 text-[#F77F00]" />
                <span className="font-bold text-white uppercase tracking-wider">Quinta Matucana · Guía de Museos</span>
            </div>
            <div>Acceso principal por Estación Quinta Normal · Línea 5 Metro</div>
            <div>Patrimonio cultural de Santiago de Chile</div>
        </div>
    </footer>
);
