import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Trash2, Upload, LogOut, ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { loginAdmin, logoutAdmin, getMe, getMuseums, uploadMuseumImage, deleteMuseumImage } from "../api";

const formatApiError = (detail) => {
    if (detail == null) return "Ocurrió un error. Intenta nuevamente.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
};

export default function AdminPage() {
    const [user, setUser] = useState(null); // null = verificando, false = no autenticado
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [museums, setMuseums] = useState([]);
    const [uploading, setUploading] = useState("");

    useEffect(() => {
        getMe()
            .then((u) => setUser(u))
            .catch(() => setUser(false));
    }, []);

    useEffect(() => {
        if (user) getMuseums().then(setMuseums).catch(() => {});
    }, [user]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const u = await loginAdmin(email, password);
            setUser(u);
            toast.success("Sesión iniciada");
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail));
        }
    };

    const handleLogout = async () => {
        await logoutAdmin().catch(() => {});
        setUser(false);
        toast.success("Sesión cerrada");
    };

    const handleUpload = async (slug, file) => {
        if (!file) return;
        setUploading(slug);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const updated = await uploadMuseumImage(slug, fd);
            setMuseums((prev) => prev.map((m) => (m.slug === slug ? updated : m)));
            toast.success("Fotografía agregada al carrusel");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail));
        } finally {
            setUploading("");
        }
    };

    const handleDelete = async (slug, url) => {
        try {
            const updated = await deleteMuseumImage(slug, url);
            setMuseums((prev) => prev.map((m) => (m.slug === slug ? updated : m)));
            toast.success("Fotografía eliminada");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail));
        }
    };

    if (user === null) {
        return (
            <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center font-sans text-sm text-[#14213D]/60" data-testid="admin-loading">
                Verificando sesión...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center px-6" data-testid="admin-login-page">
                <Toaster position="top-center" richColors />
                <div className="w-full max-w-md bg-white rounded-3xl border border-[#14213D]/10 shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Logo />
                        <div>
                            <span className="serif-title text-2xl text-[#14213D] block leading-none">Panel de Administración</span>
                            <span className="text-[10px] tracking-widest uppercase text-[#14213D]/60 font-sans">Quinta Matucana</span>
                        </div>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4 font-sans" data-testid="admin-login-form">
                        <div>
                            <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">Correo</label>
                            <input
                                id="admin-email"
                                data-testid="admin-email-input"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#14213D]/20 bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#0077B6] transition-colors"
                                placeholder="admin@quintamatucana.cl"
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-[#14213D]/70 mb-2">Contraseña</label>
                            <input
                                id="admin-password"
                                data-testid="admin-password-input"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#14213D]/20 bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#0077B6] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && (
                            <div data-testid="admin-login-error" className="text-xs font-semibold text-[#D62828] bg-[#FCE8E6] rounded-xl px-4 py-3">{error}</div>
                        )}
                        <button
                            type="submit"
                            data-testid="admin-login-btn"
                            className="w-full py-4 rounded-xl bg-[#0077B6] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#005f92] transition-colors"
                        >
                            Ingresar
                        </button>
                        <Link to="/" data-testid="admin-back-link" className="block text-center text-xs text-[#14213D]/60 hover:text-[#0077B6] transition-colors">
                            Volver al sitio
                        </Link>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDF9] text-[#14213D]" data-testid="admin-panel">
            <Toaster position="top-center" richColors />
            <nav className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#14213D]/10 px-6 md:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <div>
                            <span className="serif-title text-xl tracking-tight block leading-none">Administrador de Fotografías</span>
                            <span className="text-[10px] tracking-widest uppercase text-[#14213D]/60 font-sans">{user.email}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 font-sans">
                        <Link to="/" data-testid="admin-home-link" className="px-4 py-2 rounded-full border border-[#14213D]/20 text-xs font-bold uppercase tracking-wider hover:border-[#14213D] transition-colors flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Sitio
                        </Link>
                        <button
                            type="button"
                            data-testid="admin-logout-btn"
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-full bg-[#14213D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D62828] transition-colors flex items-center gap-1.5"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Salir
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 md:px-8 py-12">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#D62828]">Carruseles de los Museos</span>
                <h1 className="serif-title text-4xl mt-1 mb-2">Gestiona las fotografías</h1>
                <p className="font-sans text-sm text-[#14213D]/70 mb-10 max-w-2xl">
                    Sube imágenes JPG, PNG o WebP (máx. 8 MB). Se agregan al final del carrusel de cada museo.
                    La primera imagen es la fotografía principal de la tarjeta.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {museums.map((m) => (
                        <div key={m.id} data-testid={`admin-museum-${m.slug}`} className="bg-white rounded-3xl border border-[#14213D]/10 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="font-sans text-[10px] font-bold tracking-widest uppercase" style={{ color: m.color }}>{m.category}</span>
                                    <h3 className="serif-title text-xl">{m.short_name}</h3>
                                </div>
                                <label
                                    data-testid={`upload-label-${m.slug}`}
                                    className={`font-sans inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${uploading === m.slug ? "opacity-60 pointer-events-none" : ""}`}
                                    style={{ background: m.color }}
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    {uploading === m.slug ? "Subiendo..." : "Subir foto"}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        data-testid={`upload-input-${m.slug}`}
                                        onChange={(e) => { handleUpload(m.slug, e.target.files[0]); e.target.value = ""; }}
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {(m.images && m.images.length ? m.images : [m.image]).map((url, i) => (
                                    <div key={url + i} className="relative group rounded-xl overflow-hidden aspect-square border border-[#14213D]/10">
                                        <img src={url} alt={`${m.short_name} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" data-testid={`admin-image-${m.slug}-${i}`} />
                                        {i === 0 && (
                                            <span className="absolute top-1 left-1 bg-[#F77F00] text-white text-[8px] font-sans font-bold uppercase px-1.5 py-0.5 rounded-full">Principal</span>
                                        )}
                                        <button
                                            type="button"
                                            aria-label={`Eliminar fotografía ${i + 1} de ${m.short_name}`}
                                            data-testid={`delete-image-${m.slug}-${i}`}
                                            onClick={() => handleDelete(m.slug, url)}
                                            className="absolute inset-0 bg-[#D62828]/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="font-sans text-[11px] text-[#14213D]/50 mt-3">
                                {(m.images && m.images.length) || 1} imagen{(m.images && m.images.length) !== 1 ? "es" : ""} en el carrusel
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
