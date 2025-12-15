"use client";

import { useState, useCallback } from "react";
import { Gem } from "lucide-react";
import { usePersistentState } from "../../../hooks/usePersistentState";
import { useWorker } from "../../../hooks/useWorker";

// Import Sub-Components
import AlchemyConfig from "./alchemy/AlchemyConfig";
import AlchemyResults from "./alchemy/AlchemyResults";

// Import Constants
import {
    DEFAULT_CONFIG,
    DEFAULT_INPUT,
    DEFAULT_INPUT_CONFIG,
    DEFAULT_TARGET_CONFIG
} from "./alchemy/constants";

// ============================================================================
// MAIN CONTROLLER COMPONENT
// ============================================================================

export default function AlchemyPanel() {
    // Persistent state
    const [config, setConfig] = usePersistentState("alchemy-config-v2", DEFAULT_CONFIG);
    const [input, setInput] = usePersistentState("alchemy-input-v2", DEFAULT_INPUT);
    const [inputConfig, setInputConfig] = usePersistentState("alchemy-input-config-v2", DEFAULT_INPUT_CONFIG);
    const [mode, setMode] = useState('inventory'); // 'inventory' | 'target'
    const [targetConfig, setTargetConfig] = usePersistentState("alchemy-target-config-v1", DEFAULT_TARGET_CONFIG);

    // Worker
    const { run, result, progress, isRunning } = useWorker("/workers/alchemy.worker.js");

    // UI state
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleSimulate = useCallback(() => {
        if (mode === 'inventory') {
            run({
                action: "run_simulation",
                inputConfig: inputConfig,
                corCount: input.corCount,
                corPrice: input.corPrice,
                simCount: input.simCount,
                config: config
            });
        } else {
            run({
                action: "calculate_target_cost",
                targetConfig: targetConfig,
                corPrice: input.corPrice,
                simCount: Math.min(input.simCount, 50), // Cap at 50 for performance
                config: config
            });
        }
    }, [run, input, config, mode, targetConfig, inputConfig]);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 p-6 border-b border-zinc-800 bg-zinc-950/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-900/30 rounded-xl border border-purple-500/30">
                            <Gem className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Ejderha Simyası</h2>
                            <p className="text-xs text-zinc-500">Dragon Soul Alchemy Simülasyonu</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - 2 Column Layout */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Config & Settings */}
                    <div>
                        <AlchemyConfig
                            // State
                            config={config}
                            input={input}
                            inputConfig={inputConfig}
                            targetConfig={targetConfig}
                            mode={mode}
                            showAdvanced={showAdvanced}
                            // Setters
                            setConfig={setConfig}
                            setInput={setInput}
                            setInputConfig={setInputConfig}
                            setTargetConfig={setTargetConfig}
                            setMode={setMode}
                            setShowAdvanced={setShowAdvanced}
                            // Actions
                            onSimulate={handleSimulate}
                            isRunning={isRunning}
                            progress={progress}
                        />
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:col-span-2">
                        <AlchemyResults
                            result={result}
                            mode={mode}
                            inputConfig={inputConfig}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
