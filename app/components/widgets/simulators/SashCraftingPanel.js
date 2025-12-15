"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, History } from "lucide-react";
import { usePersistentState } from "../../../hooks/usePersistentState";
import { useWorker } from "../../../hooks/useWorker";

// Import Sub-Components
import SashConfig from "./sash/SashConfig";
import SashResults from "./sash/SashResults";

// Import Constants
import { DEFAULT_CONFIG } from "./sash/constants";

// ============================================================================
// MAIN CONTROLLER COMPONENT
// ============================================================================

export default function SashCraftingPanel() {
    // Persistent State
    const [config, setConfig] = usePersistentState("sash-simulator-config", DEFAULT_CONFIG);
    const [history, setHistory] = usePersistentState("sash-simulator-history", []);

    // Worker Hook
    const { run, status, result, progress, isRunning } = useWorker("/workers/sash.worker.js");

    // Local State
    const [showHistory, setShowHistory] = useState(true);

    // Ref to track last processed result (prevents duplicate entries in StrictMode)
    const lastResultRef = useRef(null);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleConfigChange = useCallback((field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, [setConfig]);

    const handleRateChange = useCallback((rateKey, value) => {
        setConfig(prev => ({
            ...prev,
            rates: {
                ...prev.rates,
                [rateKey]: value
            }
        }));
    }, [setConfig]);

    const handleSimulate = useCallback(() => {
        if (config.mode === 'budget') {
            run({
                action: "run_simulation",
                mode: 'budget',
                clothPrice: config.clothPrice,
                clothCount: config.clothCount,
                clothBudget: config.clothBudget,
                absorptionCap: config.absorptionCap,
                simCount: config.simCount,
                rates: config.rates
            });
        } else {
            run({
                action: "run_simulation",
                mode: 'target',
                clothPrice: config.clothPrice,
                clothCount: config.clothCount,
                targetGrade: config.targetGrade,
                simCount: config.simCount,
                rates: config.rates
            });
        }
    }, [run, config]);

    // Effect: Add result to history when complete (with deduplication)
    useEffect(() => {
        if (status === "complete" && result && result.duration) {
            // Use duration as a unique identifier for this result
            const resultKey = `${result.avgCost}-${result.duration}`;

            if (lastResultRef.current !== resultKey) {
                lastResultRef.current = resultKey;

                const newEntry = {
                    id: Date.now(),
                    date: Date.now(),
                    config: { ...config },
                    result: { ...result }
                };
                setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Max 50 records
            }
        }
    }, [status, result, config, setHistory]);

    const handleRestore = useCallback((item) => {
        setConfig(item.config);
    }, [setConfig]);

    const handleDeleteHistory = useCallback((id) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, [setHistory]);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
    }, [setHistory]);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">
                                Kuşak Maliyet Simülasyonu
                            </h1>
                            <p className="text-xs text-zinc-500">
                                Monte Carlo yöntemiyle ortalama maliyet hesaplama
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                            ${showHistory
                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                            }
                        `}
                    >
                        <History className="w-4 h-4" />
                        Geçmiş
                    </button>
                </div>
            </header>

            {/* Main Content - 3 Column Layout */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Config */}
                    <div>
                        <SashConfig
                            config={config}
                            onConfigChange={handleConfigChange}
                            onRateChange={handleRateChange}
                            onSimulate={handleSimulate}
                            isRunning={isRunning}
                            progress={progress}
                        />
                    </div>

                    {/* Right Column - Results (2 spans) */}
                    <div className="lg:col-span-2">
                        <SashResults
                            result={result}
                            history={history}
                            showHistory={showHistory}
                            onRestore={handleRestore}
                            onDeleteHistory={handleDeleteHistory}
                            onClearHistory={handleClearHistory}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
