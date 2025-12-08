"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    LayoutGrid,
    Sword,
    Tractor, // For 'Farm'
    TrendingUp,
    Terminal,
    Play,
    Clock,
    Cpu,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

// Utility for Tailwind class merging
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// ============================================================================
// COMPONENTS
// ============================================================================

// 1. TOOLBELT ITEM (Left Menu)
function ToolbeltItem({ id, icon: Icon, isActive, onClick, label }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "relative group w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300",
                isActive
                    ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
            )}
        >
            <Icon className="w-5 h-5" />

            {/* Tooltip */}
            <div className="absolute left-14 bg-black/90 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {label}
            </div>

            {/* Active Indicator */}
            {isActive && (
                <motion.div
                    layoutId="active-indicator"
                    className="absolute -left-1 w-1 h-6 bg-blue-500 rounded-r-full"
                />
            )}
        </button>
    );
}

// 2. STAGE PANEL (Main Content Area)
function StagePanel({ activeTool, onRunSimulation, progress, status }) {
    return (
        <motion.div
            layoutId="main-stage"
            className="w-full h-full bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative"
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>

            <AnimatePresence mode="wait">
                {activeTool === 'boss-sim' && (
                    <motion.div
                        key="boss-sim"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        className="flex-1 flex flex-col items-center justify-center p-12"
                    >
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl max-w-md w-full">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-500/20">
                                <Sword className="w-8 h-8 text-blue-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-white text-center mb-2">Boss Simülasyonu</h2>
                            <p className="text-white/40 text-center text-sm mb-8">
                                Arka planda ağır matematiksel işlem yapan Web Worker demosu.
                            </p>

                            <button
                                onClick={onRunSimulation}
                                disabled={status === 'running'}
                                className={cn(
                                    "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
                                    status === 'running'
                                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25 active:scale-95"
                                )}
                            >
                                {status === 'running' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Hesaplanıyor...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        Simülasyonu Başlat
                                    </>
                                )}
                            </button>

                            {/* Progress Bar inside Card */}
                            <div className="mt-8 space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className={status === 'completed' ? "text-green-400" : "text-white/40"}>
                                        {status === 'idle' && "Hazır"}
                                        {status === 'running' && "İşleniyor..."}
                                        {status === 'completed' && "Tamamlandı"}
                                    </span>
                                    <span className="text-white/60">%{progress}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-300",
                                            status === 'completed' ? "bg-green-500" : "bg-blue-500"
                                        )}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTool === 'farm-plan' && (
                    <motion.div
                        key="farm-plan"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex items-center justify-center text-white/20 font-black text-6xl tracking-tighter"
                    >
                        FARM PLAN
                    </motion.div>
                )}

                {activeTool === 'market-analiz' && (
                    <motion.div
                        key="market-analiz"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex items-center justify-center text-white/20 font-black text-6xl tracking-tighter"
                    >
                        MARKET
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export default function WorkstationLayout() {
    const [activeTool, setActiveTool] = useState('boss-sim');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle | running | completed
    const [logs, setLogs] = useState([]);

    const workerRef = useRef(null);

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/simulation.worker.js', import.meta.url));

        workerRef.current.onmessage = (event) => {
            const { type, progress, result, duration, message } = event.data;

            if (type === 'progress') {
                setProgress(progress);
            } else if (type === 'complete') {
                setProgress(100);
                setStatus('completed');
                addLog('success', `İşlem Tamamlandı: ${result.toFixed(2)} (Süre: ${duration}ms)`);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const addLog = (type, message) => {
        setLogs(prev => [{ id: Date.now(), type, message }, ...prev].slice(0, 50));
    };

    const runSimulation = () => {
        if (status === 'running') return;

        setStatus('running');
        setProgress(0);
        addLog('info', 'Simülasyon başlatılıyor...');

        // Send message to worker
        workerRef.current.postMessage({
            action: 'start_simulation',
            loopCount: 50000000 // Heavy enough to notice
        });
    };

    return (
        <div className="h-screen w-full bg-black text-white p-4 grid gap-4 grid-cols-[80px_1fr] grid-rows-[1fr_200px] overflow-hidden font-sans selection:bg-blue-500/30">

            {/* 1. LEFT TOOLBELT */}
            <aside className="row-span-2 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col items-center py-6 gap-4">
                <div className="mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LayoutGrid className="text-white w-6 h-6" />
                    </div>
                </div>

                <div className="w-8 h-[1px] bg-white/10 mb-2" />

                <ToolbeltItem
                    id="boss-sim"
                    icon={Sword}
                    isActive={activeTool === 'boss-sim'}
                    onClick={setActiveTool}
                    label="Boss Simülasyonu"
                />
                <ToolbeltItem
                    id="farm-plan"
                    icon={Tractor}
                    isActive={activeTool === 'farm-plan'}
                    onClick={setActiveTool}
                    label="Çiftlik Planı"
                />
                <ToolbeltItem
                    id="market-analiz"
                    icon={TrendingUp}
                    isActive={activeTool === 'market-analiz'}
                    onClick={setActiveTool}
                    label="Piyasa Analizi"
                />
            </aside>

            {/* 2. MAIN STAGE */}
            <main className="col-start-2 row-start-1 min-h-0">
                <StagePanel
                    activeTool={activeTool}
                    onRunSimulation={runSimulation}
                    progress={progress}
                    status={status}
                />
            </main>

            {/* 3. TIMELINE / LOGS */}
            <footer className="col-start-2 row-start-2 bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-black/20">
                    <Terminal className="w-4 h-4 text-white/40" />
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">System Logs</span>
                    <div className="ml-auto flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-green-500 font-mono">ONLINE</span>
                    </div>
                </div>

                {/* Log Content */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    "flex items-center gap-3",
                                    log.type === 'error' ? "text-red-400" :
                                        log.type === 'success' ? "text-green-400" : "text-white/60"
                                )}
                            >
                                <span className="text-white/20 text-[10px]">
                                    {new Date(log.id).toLocaleTimeString()}
                                </span>
                                {log.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> :
                                    log.type === 'error' ? <AlertCircle className="w-3 h-3" /> :
                                        <Clock className="w-3 h-3 text-white/20" />}

                                <span>{log.message}</span>
                            </motion.div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-white/20 italic">Sistem hazır. Log kaydı bekleniyor...</div>
                        )}
                    </AnimatePresence>
                </div>
            </footer>

        </div>
    );
}
