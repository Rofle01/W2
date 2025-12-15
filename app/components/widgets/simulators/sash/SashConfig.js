"use client";

import {
    Calculator,
    Loader2,
    ChevronDown,
    Coins,
    Target,
    Layers,
    Settings,
    Percent
} from "lucide-react";
import SmartInput from "@/app/components/ui/SmartInput";
import { TARGET_GRADES, formatCurrency } from "./constants";

// ============================================================================
// SASH CONFIG PANEL
// ============================================================================

export default function SashConfig({
    // State
    config,
    // Handlers
    onConfigChange,
    onRateChange,
    // Actions
    onSimulate,
    isRunning,
    progress
}) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Parametreler
            </h3>

            {/* Kumaş Fiyatı */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Kumaş Fiyatı (Yang)
                </label>
                <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <SmartInput
                        value={config.clothPrice}
                        onChange={(val) => onConfigChange("clothPrice", val)}
                        min={0}
                        step={100000}
                        className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
                        placeholder="1000000"
                    />
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                    Formatlı: {formatCurrency(config.clothPrice)} Yang
                </p>
            </div>

            {/* Gereken Kumaş Adedi */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Gereken Kumaş (Adet)
                </label>
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-500" />
                    <SmartInput
                        value={config.clothCount}
                        onChange={(val) => onConfigChange("clothCount", val)}
                        min={1}
                        max={100}
                        step={1}
                        className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                        placeholder="40"
                    />
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                    1 adet %1 kuşak için kaç kumaş lazım? (PvP: 1, Normal: 40)
                </p>
            </div>

            {/* Mode Selection */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-3">
                    Simülasyon Modu
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onConfigChange("mode", "target")}
                        className={`
                            p-3 rounded-lg border text-sm font-medium transition-all
                            ${config.mode === 'target'
                                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }
                        `}
                    >
                        <Target className="w-4 h-4 mx-auto mb-1" />
                        Hedefe Ulaş
                    </button>
                    <button
                        onClick={() => onConfigChange("mode", "budget")}
                        className={`
                            p-3 rounded-lg border text-sm font-medium transition-all
                            ${config.mode === 'budget'
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }
                        `}
                    >
                        <Layers className="w-4 h-4 mx-auto mb-1" />
                        Bütçe ile Dene
                    </button>
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                    {config.mode === 'target'
                        ? 'Hedef emişe ulaşmak için gereken maliyet'
                        : 'Mevcut kumaşla elde edilebilecek emiş'
                    }
                </p>
            </div>

            {/* Budget Mode Inputs */}
            {config.mode === 'budget' && (
                <div className="space-y-3">
                    {/* Kumaş Bütçesi */}
                    <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/30">
                        <label className="block text-xs font-medium text-orange-300 mb-2">
                            Mevcut Kumaş Bütçesi (Adet)
                        </label>
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-orange-400" />
                            <SmartInput
                                value={config.clothBudget}
                                onChange={(val) => onConfigChange("clothBudget", val)}
                                min={1}
                                className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-orange-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                placeholder="1000"
                            />
                        </div>
                        <p className="text-xs text-orange-400/70 mt-2">
                            Bu kadar kumaşla kaç emiş yapabilirsin?
                        </p>
                    </div>
                    {/* Emiş Sınırı (Hardcap) */}
                    <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                        <label className="block text-xs font-medium text-red-300 mb-2">
                            Maks. Emiş Sınırı (Sunucu Cap)
                        </label>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-red-400" />
                            <SmartInput
                                value={config.absorptionCap}
                                onChange={(val) => onConfigChange("absorptionCap", val)}
                                min={1}
                                max={100}
                                className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-red-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                placeholder="25"
                            />
                            <span className="text-red-400 font-bold">%</span>
                        </div>
                        <p className="text-xs text-red-400/70 mt-2">
                            Sunucunun izin verdiği maksimum emiş (örn: %25 veya %30)
                        </p>
                    </div>
                </div>
            )}

            {/* Target Mode - Target Grade Selection */}
            {config.mode === 'target' && (
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <label className="block text-xs font-medium text-zinc-400 mb-2">
                        Hedef Emiş Oranı
                    </label>
                    <div className="relative">
                        <select
                            value={config.targetGrade}
                            onChange={(e) => onConfigChange("targetGrade", parseInt(e.target.value))}
                            className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 cursor-pointer"
                        >
                            {TARGET_GRADES.map(grade => (
                                <option key={grade.value} value={grade.value}>
                                    {grade.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Simulation Count */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Simülasyon Sayısı: <span className="text-white font-mono">{config.simCount?.toLocaleString() || 5000}</span>
                </label>
                <input
                    type="range"
                    min={1000}
                    max={50000}
                    step={1000}
                    value={config.simCount}
                    onChange={(e) => onConfigChange("simCount", parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>1K</span>
                    <span>25K</span>
                    <span>50K</span>
                </div>
            </div>

            {/* Advanced Settings - Accordion */}
            <details className="bg-zinc-900/50 rounded-xl border border-zinc-800 group">
                <summary className="p-4 cursor-pointer list-none flex items-center justify-between hover:bg-zinc-800/30 transition-colors rounded-xl">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-400">Şans Oranları (%)</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 pt-0 space-y-3">
                    {/* 1 -> 5 Rate */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1">1 ➝ 5</label>
                            <SmartInput
                                value={config.rates?.grade1 ?? 90}
                                onChange={(val) => onRateChange("grade1", val)}
                                min={1}
                                max={100}
                                step={1}
                                className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                            />
                        </div>
                        <Percent className="w-4 h-4 text-zinc-600" />
                    </div>
                    {/* 5 -> 10 Rate */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1">5 ➝ 10</label>
                            <SmartInput
                                value={config.rates?.grade2 ?? 80}
                                onChange={(val) => onRateChange("grade2", val)}
                                min={1}
                                max={100}
                                step={1}
                                className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                            />
                        </div>
                        <Percent className="w-4 h-4 text-zinc-600" />
                    </div>
                    {/* 10 -> Hakim Rate */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1">10 ➝ Hakim</label>
                            <SmartInput
                                value={config.rates?.grade3 ?? 70}
                                onChange={(val) => onRateChange("grade3", val)}
                                min={1}
                                max={100}
                                step={1}
                                className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                            />
                        </div>
                        <Percent className="w-4 h-4 text-zinc-600" />
                    </div>
                    {/* Upgrade Rate */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1">Emiş Upgrade</label>
                            <SmartInput
                                value={config.rates?.upgrade ?? 50}
                                onChange={(val) => onRateChange("upgrade", val)}
                                min={1}
                                max={100}
                                step={1}
                                className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                            />
                        </div>
                        <Percent className="w-4 h-4 text-zinc-600" />
                    </div>
                </div>
            </details>

            {/* Simulate Button */}
            <button
                onClick={onSimulate}
                disabled={isRunning}
                className={`
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200
                    ${isRunning
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-900/30"
                    }
                `}
            >
                {isRunning ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Hesaplanıyor... {progress}%
                    </>
                ) : (
                    <>
                        <Calculator className="w-5 h-5" />
                        Simülasyonu Başlat
                    </>
                )}
            </button>

            {/* Progress Bar */}
            {isRunning && (
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
