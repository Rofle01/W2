"use client";

import { useState, useCallback, useMemo } from "react";
import { Hammer, Search, Trash2 } from "lucide-react";
import { usePersistentState } from "../../../hooks/usePersistentState";
import { useWorker } from "../../../hooks/useWorker";
import { useSharedWidgetData } from "../../../hooks/useSharedWidgetData";
import SmartInput from "@/app/components/ui/SmartInput";

// Import Sub-Components
import ConfigPanel, { MATERIALS, DEFAULT_BONUSES } from "./blacksmith/ConfigPanel";
import StrategyTable, { DEFAULT_STRATEGY } from "./blacksmith/StrategyTable";
import ResultsPanel, { formatCurrency } from "./blacksmith/ResultsPanel";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG = {
    calcMode: 'additive',      // 'additive' or 'multiplicative'
    pitySystem: 'none',        // 'none', 'incremental', 'hard'
    fallbackToRaw: false       // If no materials, use raw (destroy on fail)
};

const DEFAULT_INVENTORY = {
    blessing_scroll: 50,
    magic_stone: 10,
    ritual_stone: 5,
    blacksmith_book: 2
};

const DEFAULT_PRICES = {
    blessing_scroll: 1000000,
    magic_stone: 5000000,
    ritual_stone: 15000000,
    blacksmith_book: 50000000
};

const DEFAULT_INPUT = {
    startLevel: 0,
    targetLevel: 9,
    simCount: 1000
};

// ============================================================================
// MAIN COMPONENT (Controller)
// ============================================================================

export default function BlacksmithPanel() {
    // State for modal
    const [activeModalLevel, setActiveModalLevel] = useState(null);

    // Persistent state
    const [config, setConfig] = usePersistentState("blacksmith-config-v1", DEFAULT_CONFIG);
    const [inventory, setInventory] = usePersistentState("blacksmith-inventory-v1", DEFAULT_INVENTORY);
    const [materialBonuses, setMaterialBonuses] = usePersistentState("blacksmith-bonuses-v1", DEFAULT_BONUSES);
    const [prices, setPrices] = usePersistentState("blacksmith-prices-v1", DEFAULT_PRICES);
    const [strategy, setStrategy] = usePersistentState("blacksmith-strategy-v1", DEFAULT_STRATEGY);
    const [input, setInput] = usePersistentState("blacksmith-input-v1", DEFAULT_INPUT);

    // Get live market data
    const { marketItems } = useSharedWidgetData();

    // Compute market prices map for worker (itemId -> price)
    const marketPrices = useMemo(() => {
        return marketItems.reduce((acc, item) => ({
            ...acc,
            [item.id]: item.price || 0
        }), {});
    }, [marketItems]);

    // Worker
    const { run, result, progress, isRunning } = useWorker("/workers/blacksmith.worker.js");

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleInputChange = useCallback((field, value) => {
        setInput(prev => ({ ...prev, [field]: value }));
    }, [setInput]);

    const handleConfigChange = useCallback((field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, [setConfig]);

    const handleInventoryChange = useCallback((material, value) => {
        setInventory(prev => ({ ...prev, [material]: value }));
    }, [setInventory]);

    const handlePriceChange = useCallback((material, value) => {
        setPrices(prev => ({ ...prev, [material]: value }));
    }, [setPrices]);

    const handleBonusChange = useCallback((material, value) => {
        setMaterialBonuses(prev => ({ ...prev, [material]: value }));
    }, [setMaterialBonuses]);

    const handleStrategyChange = useCallback((level, field, value) => {
        setStrategy(prev => ({
            ...prev,
            [level]: { ...prev[level], [field]: value }
        }));
    }, [setStrategy]);

    const handleSimulate = useCallback(() => {
        run({
            action: "run_simulation",
            startLevel: input.startLevel,
            targetLevel: input.targetLevel,
            inventory: inventory,
            prices: prices,
            marketPrices: marketPrices,
            config: config,
            strategy: strategy,
            materialBonuses: materialBonuses,
            simCount: input.simCount
        });
    }, [run, input, inventory, config, strategy, prices, materialBonuses, marketPrices]);

    // Generate level range for strategy table
    const levelRange = useMemo(() => {
        const range = [];
        for (let i = input.startLevel; i < input.targetLevel; i++) {
            range.push(i);
        }
        return range;
    }, [input.startLevel, input.targetLevel]);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 p-4 border-b border-zinc-800 bg-zinc-950/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-900/30 rounded-xl border border-orange-500/30">
                            <Hammer className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Demirci Simülasyonu</h2>
                            <p className="text-xs text-zinc-500">Strateji bazlı yükseltme analizi</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - 3 Column Layout */}
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">

                    {/* LEFT PANEL - Config & Inventory */}
                    <div>
                        <ConfigPanel
                            config={config}
                            inventory={inventory}
                            materialBonuses={materialBonuses}
                            prices={prices}
                            input={input}
                            isRunning={isRunning}
                            progress={progress}
                            onConfigChange={handleConfigChange}
                            onInventoryChange={handleInventoryChange}
                            onPriceChange={handlePriceChange}
                            onBonusChange={handleBonusChange}
                            onInputChange={handleInputChange}
                            onSimulate={handleSimulate}
                        />
                    </div>

                    {/* CENTER PANEL - Strategy Table */}
                    <div className="lg:col-span-2">
                        <StrategyTable
                            levelRange={levelRange}
                            strategy={strategy}
                            config={config}
                            onStrategyChange={handleStrategyChange}
                            onOpenMaterials={setActiveModalLevel}
                        />
                    </div>

                    {/* RIGHT PANEL - Results */}
                    <div>
                        <ResultsPanel
                            result={result}
                            targetLevel={input.targetLevel}
                        />
                    </div>
                </div>
            </div>

            {/* Materials Modal */}
            {activeModalLevel !== null && (
                <MaterialsModal
                    level={activeModalLevel}
                    strategy={strategy[activeModalLevel]}
                    marketItems={marketItems}
                    onClose={() => setActiveModalLevel(null)}
                    onUpdate={(newMaterials) => handleStrategyChange(activeModalLevel, 'requiredMaterials', newMaterials)}
                />
            )}
        </div>
    );
}

// ============================================================================
// MATERIALS MODAL (Kept inline for simplicity)
// ============================================================================

function MaterialsModal({ level, strategy, marketItems, onClose, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState("");
    const currentMaterials = strategy?.requiredMaterials || [];

    // Filter items
    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        return marketItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [searchTerm, marketItems]);

    const handleAdd = (item) => {
        const exists = currentMaterials.find(m => m.itemId === item.id);
        if (exists) return;
        onUpdate([...currentMaterials, { itemId: item.id, count: 1 }]);
        setSearchTerm("");
    };

    const handleRemove = (itemId) => {
        onUpdate(currentMaterials.filter(m => m.itemId !== itemId));
    };

    const handleCountChange = (itemId, count) => {
        onUpdate(currentMaterials.map(m =>
            m.itemId === itemId ? { ...m, count } : m
        ));
    };

    const totalCost = currentMaterials.reduce((acc, m) => {
        const item = marketItems.find(i => i.id === m.itemId);
        return acc + ((item?.price || 0) * m.count);
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-sm font-bold text-white">Ekstra Materyaller</h3>
                        <p className="text-xs text-zinc-500">+{level} ➜ +{level + 1} için gerekli malzemeler</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Materyal Ara..."
                            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />

                        {/* Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                {searchResults.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleAdd(item)}
                                        className="w-full flex items-center justify-between p-2 hover:bg-zinc-800 border-b border-zinc-800/50 last:border-0 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-300">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-yellow-500">{formatCurrency(item.price)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Materials List */}
                    <div className="space-y-2">
                        {currentMaterials.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                                Henüz materyal eklenmedi.
                            </div>
                        ) : (
                            currentMaterials.map(mat => {
                                const item = marketItems.find(i => i.id === mat.itemId);
                                return (
                                    <div key={mat.itemId} className="flex items-center gap-2 p-2 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-zinc-300 truncate">
                                                {item?.name || "Bilinmeyen Ürün"}
                                            </div>
                                            <div className="text-[10px] text-yellow-500 font-mono">
                                                {formatCurrency(item?.price)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-16">
                                                <SmartInput
                                                    value={mat.count}
                                                    onChange={(val) => handleCountChange(mat.itemId, val)}
                                                    min={1}
                                                    className="w-full px-2 py-1 text-right text-xs bg-zinc-900 border border-zinc-700 rounded text-white"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemove(mat.itemId)}
                                                className="p-1.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-zinc-400">Toplam Ek Maliyet</span>
                        <span className="text-sm font-bold text-yellow-400 font-mono">{formatCurrency(totalCost)}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
}
