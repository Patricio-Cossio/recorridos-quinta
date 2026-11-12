import { useState } from "react";
import { Headphones, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { getAudioPrice, unlockAudioGuide } from "../api";

export const AudioGuide = ({ route }) => {
    const storageKey = `qm_audio_${route.id}`;
    const [unlocked, setUnlocked] = useState(() => localStorage.getItem(storageKey) === "1");
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(null);

    const openDialog = async () => {
        setOpen(true);
        setError("");
        setCode("");
        if (price === null) {
            try {
                const p = await getAudioPrice(route.id);
                setPrice(p.price);
            } catch (e) { /* precio no disponible */ }
        }
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await unlockAudioGuide(route.id, code);
            localStorage.setItem(storageKey, "1");
            setUnlocked(true);
            setOpen(false);
            toast.success("Audio guía activada. ¡Buen recorrido!");
        } catch (err) {
            const d = err.response?.data?.detail;
            setError(typeof d === "string" ? d : "No se pudo activar. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const audioSrc = `${process.env.REACT_APP_BACKEND_URL}/api/audioguides/audio/${route.id}.mp3`;

    if (unlocked) {
        return (
            <div data-testid={`audioguide-player-${route.id}`} className="w-full rounded-2xl bg-[#EBF5FB] border border-[#0077B6]/30 p-4">
                <div className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#0077B6] mb-2">
                    <Headphones className="w-4 h-4" /> Audio Guía activada · {route.code}
                </div>
                <audio controls preload="none" className="w-full" data-testid={`audio-player-${route.id}`} src={audioSrc}>
                    Tu navegador no soporta la reproducción de audio.
                </audio>
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                data-testid={`buy-audioguide-${route.id}`}
                onClick={openDialog}
                className="font-sans inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0077B6] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#005f92] transition-colors"
            >
                <Headphones className="w-4 h-4" /> Comprar Audio Guía{price ? ` · $${price.toLocaleString("es-CL")}` : ""}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#FFFDF9] rounded-3xl border-[#14213D]/10" data-testid="audioguide-dialog">
                    <DialogHeader>
                        <DialogTitle className="serif-title text-2xl text-[#14213D]">Audio Guía · {route.name}</DialogTitle>
                        <DialogDescription className="font-sans text-sm text-[#14213D]/70">
                            Narración del recorrido "{route.title}" para escuchar mientras caminas por el parque.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUnlock} className="space-y-4 font-sans" data-testid="audioguide-form">
                        <div className="flex items-center justify-between rounded-2xl bg-[#EBF5FB] px-5 py-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#0077B6]">Precio (compra simulada)</span>
                            <span className="serif-title text-2xl text-[#14213D]" data-testid="audioguide-price">
                                {price !== null ? `$${price.toLocaleString("es-CL")} CLP` : "..."}
                            </span>
                        </div>
                        <div>
                            <label htmlFor="audio-code" className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">
                                Código secreto de activación
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14213D]/40" />
                                <input
                                    id="audio-code"
                                    data-testid="audioguide-code-input"
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#14213D]/20 bg-white text-sm focus:outline-none focus:border-[#0077B6] transition-colors"
                                    placeholder="Ingresa tu código"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        {error && (
                            <div data-testid="audioguide-error" className="text-xs font-semibold text-[#D62828] bg-[#FCE8E6] rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            data-testid="audioguide-activate-btn"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-[#0077B6] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#005f92] transition-colors disabled:opacity-60"
                        >
                            {loading ? "Verificando..." : "Activar Audio Guía"}
                        </button>
                        <p className="text-[11px] text-[#14213D]/50 text-center leading-relaxed">
                            Compra simulada: no se realizará ningún cargo real. El código de activación lo entrega el administrador del sitio.
                        </p>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
