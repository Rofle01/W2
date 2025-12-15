"use client";

import {
    Settings,
    Package,
    Calculator,
    Loader2
} from "lucide-react";
import SmartInput from "@/app/components/ui/SmartInput";

// ============================================================================
// CONSTANTS
// ============================================================================

const MATERIALS = {
    blessing_scroll: { name: 'Kutsama Kağıdı', color: 'text-yellow-400' },
    magic_stone: { name: 'Büyülü Metal', color: 'text-blue-400' },
    ritual_stone: { name: 'Ritüel Taşı', color: 'text-purple-400' },
    blacksmith_book: { name: 'Demirci El Kitabı', color: 'text-orange-400' }
};

const DEFAULT_BONUSES = {
    blessing_scroll: 0,
    magic_stone: 5,
    ritual_stone: 10,
    blacksmith_book: 15
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ConfigPanel({
    config,
    inventory,
    materialBonuses,
    prices,
    input,
    isRunning,
    progress,
    onConfigChange,
    onInventoryChange,
    onPriceChange,
    onBonusChange,
    onInputChange,
    onSimulate
}) {
    return (
        <div className="space-y-4">
            {/* Server Config Section */}
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Sunucu Ayarları
            </h3>

            {/* Calc Mode */}
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Bonus Hesaplama
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onConfigChange("calcMode", "additive")}
                        className={`p-2 text-xs rounded-lg border transition-all ${config.calcMode === 'additive'
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}
                    >
                        Düz (+%10)
                    </button>
                    <button
                        onClick={() => onConfigChange("calcMode", "multiplicative")}
                        className={`p-2 text-xs rounded-lg border transition-all ${config.calcMode === 'multiplicative'
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}
                    >
                        Oransal (x1.1)
                    </button>
                </div>
            </div>

            {/* Pity System */}
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Pity Sistemi
                </label>
                <select
                    value={config.pitySystem}
                    onChange={(e) => onConfigChange("pitySystem", e.target.value)}
                    className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                >
                    <option value="none">Yok</option>
                    <option value="incremental">Artan (Her yanışta +%5)</option>
                    <option value="hard">Garanti (X yanışta %100)</option>
                </select>
            </div>

            {/* Inventory & Bonuses Grid */}
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mt-4">
                <Package className="w-4 h-4" />
                Envanter & Bonuslar
            </h3>

            <div className="space-y-3">
                {Object.entries(MATERIALS).map(([id, mat]) => (
                    <div key={id} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold ${mat.color}`}>{mat.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {/* Stock Input */}
                            <div>
                                <label className="block text-[10px] text-zinc-500 mb-1">Adet</label>
                                <SmartInput
                                    value={inventory[id] || 0}
                                    onChange={(val) => onInventoryChange(id, val)}
                                    min={0}
                                    className="w-full px-2 py-1 text-xs font-mono text-white bg-zinc-950 border border-zinc-700 rounded"
                                />
                            </div>
                            {/* Bonus Input */}
                            <div>
                                <label className="block text-[10px] text-zinc-500 mb-1">Şans %</label>
                                <SmartInput
                                    value={materialBonuses[id] !== undefined ? materialBonuses[id] : (DEFAULT_BONUSES[id] || 0)}
                                    onChange={(val) => onBonusChange(id, val)}
                                    min={0}
                                    max={100}
                                    className="w-full px-2 py-1 text-xs font-mono text-green-400 bg-zinc-950 border border-zinc-700 rounded border-green-500/20"
                                />
                            </div>
                            {/* Price Input */}
                            <div>
                                <label className="block text-[10px] text-zinc-500 mb-1">Birim Fiyat</label>
                                <SmartInput
                                    value={prices[id] || 0}
                                    onChange={(val) => onPriceChange(id, val)}
                                    min={0}
                                    className="w-full px-2 py-1 text-xs font-mono text-yellow-400 bg-zinc-950 border border-zinc-700 rounded border-yellow-500/20"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simulation Range */}
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Başlangıç</label>
                        <SmartInput
                            value={input.startLevel}
                            onChange={(val) => onInputChange("startLevel", val)}
                            min={0}
                            max={8}
                            className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Hedef</label>
                        <SmartInput
                            value={input.targetLevel}
                            onChange={(val) => onInputChange("targetLevel", val)}
                            min={1}
                            max={9}
                            className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Sim Count */}
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Simülasyon: {input.simCount?.toLocaleString() || 1000}
                </label>
                <input
                    type="range"
                    min={100}
                    max={10000}
                    step={100}
                    value={input.simCount || 1000}
                    onChange={(e) => onInputChange("simCount", parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg accent-orange-500"
                />
            </div>

            {/* Simulate Button */}
            <button
                onClick={onSimulate}
                disabled={isRunning}
                className={`
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all
                    ${isRunning
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg"
                    }
                `}
            >
                {isRunning ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Simüle Ediliyor... {progress}%
                    </>
                ) : (
                    <>
                        <Calculator className="w-5 h-5" />
                        Simülasyonu Başlat
                    </>
                )}
            </button>
        </div>
    );
}

// Export MATERIALS for use in other components
export { MATERIALS, DEFAULT_BONUSES };
