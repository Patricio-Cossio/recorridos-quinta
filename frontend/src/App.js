import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { MapSection } from "./components/MapSection";
import { MuseumsGrid } from "./components/MuseumsGrid";
import { RoutesSection } from "./components/RoutesSection";
import { EvaluationSection } from "./components/EvaluationSection";
import { Banner, Footer } from "./components/Footer";
import AdminPage from "./components/AdminPage";
import { getMuseums, getRoutes, getEvaluations, getEvaluationStats } from "./api";
import "./App.css";

function Home() {
    const [museums, setMuseums] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [stats, setStats] = useState({ average: 0, count: 0 });
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMuseums(), getRoutes(), getEvaluations(), getEvaluationStats()])
            .then(([m, r, ev, st]) => {
                setMuseums(m);
                setRoutes(r);
                if (r.length > 0) setSelectedRouteId(r[0].id);
                setEvaluations(ev);
                setStats(st);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleNewEvaluation = useCallback((saved) => {
        setEvaluations((prev) => [saved, ...prev]);
        setStats((prev) => ({
            average: Math.round(((prev.average * prev.count + saved.rating) / (prev.count + 1)) * 10) / 10,
            count: prev.count + 1,
        }));
    }, []);

    return (
        <div className="min-h-screen bg-[#FFFDF9] text-[#14213D] antialiased" data-testid="app-root">
            <Toaster position="top-center" richColors />
            <Navbar />
            <Hero museumCount={museums.length} />
            <Marquee museums={museums} />
            {loading ? (
                <div className="py-24 text-center font-sans text-sm text-[#14213D]/60" data-testid="loading-indicator">
                    Cargando la guía del parque...
                </div>
            ) : (
                <>
                    <MapSection
                        museums={museums}
                        routes={routes}
                        selectedRouteId={selectedRouteId}
                        onSelectRoute={setSelectedRouteId}
                    />
                    <MuseumsGrid museums={museums} />
                    <RoutesSection
                        routes={routes}
                        museums={museums}
                        selectedRouteId={selectedRouteId}
                        onSelectRoute={setSelectedRouteId}
                    />
                    <EvaluationSection
                        routes={routes}
                        evaluations={evaluations}
                        stats={stats}
                        onNewEvaluation={handleNewEvaluation}
                    />
                    <Banner />
                </>
            )}
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
