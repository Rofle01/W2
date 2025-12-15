"use client";

import {
    Calculator,
    Loader2,
    Settings,
    ChevronDown,
    Gem,
    Sparkles,
    Percent,
    Package,
    Layers,
    Target,
    ToggleLeft,
    ToggleRight,
    Coins
} from "lucide-react";
import SmartInput from "@/app/components/ui/SmartInput";
import {
    ELEMENTS,
    CLASS_LEVELS,
    CLARITY_LEVELS,
    TARGET_CLASS_OPTIONS,
    COR_OUTPUT_OPTIONS,
    formatCurrency
} from "./constants";

// ============================================================================
// ALCHEMY CONFIG PANEL
// ============================================================================

export default function AlchemyConfig({
    // State
    config,
    input,
    inputConfig,
    targetConfig,
    mode,
    showAdvanced,
    // Setters
    setConfig,
    setInput,
    setInputConfig,
    setTargetConfig,
    setMode,
    setShowAdvanced,
    // Actions
    onSimulate,
    isRunning,
    progress
}) {
    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleInputChange = (field, value) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleRequirementChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            requirements: { ...prev.requirements, [field]: value }
        }));
    };

    const handleRateChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            rates: { ...prev.rates, [field]: value }
        }));
    };

    const toggleElement = (element) => {
        setConfig(prev => {
            const current = prev.activeElements || [];
            if (current.includes(element)) {
                return { ...prev, activeElements: current.filter(e => e !== element) };
            } else {
                return { ...prev, activeElements: [...current, element] };
            }
        });
    };

    const toggleClarity = () => {
        setConfig(prev => ({ ...prev, upgradeClarity: !prev.upgradeClarity }));
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 mb-4">
                <button
                    onClick={() => setMode('inventory')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'inventory' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Elimdekilerle Ne Çıkar?
                </button>
                <button
                    onClick={() => setMode('target')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'target' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Hedef İçin Ne Lazım?
                </button>
            </div>

            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <Package className="w-4 h-4" />
                {mode === 'inventory' ? 'Simülasyon Ayarları' : 'Hedef Ayarları'}
            </h3>

            {/* Inventory Mode Inputs */}
            {mode === 'inventory' && (
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                    {/* Source Selector */}
                    <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                        <button
                            onClick={() => setInputConfig(prev => ({ ...prev, mode: 'cor' }))}
                            className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${inputConfig.mode === 'cor' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                        >
                            Cor Draconis
                        </button>
                        <button
                            onClick={() => setInputConfig(prev => ({ ...prev, mode: 'material' }))}
                            className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${inputConfig.mode === 'material' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                        >
                            Direkt Taş
                        </button>
                    </div>

                    {inputConfig.mode === 'cor' ? (
                        /* Cor Count Input */
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">
                                Cor Draconis Sayısı
                            </label>
                            <div className="flex items-center gap-2">
                                <Gem className="w-4 h-4 text-purple-500" />
                                <SmartInput
                                    value={input.corCount}
                                    onChange={(val) => handleInputChange("corCount", val)}
                                    min={1}
                                    className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                                    placeholder="1000"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Direct Material Input */
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Başlangıç Sınıfı</label>
                                    <select
                                        value={inputConfig.itemClass}
                                        onChange={(e) => setInputConfig(prev => ({ ...prev, itemClass: e.target.value }))}
                                        className="w-full px-2 py-1.5 text-xs text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                                    >
                                        {Object.entries(CLASS_LEVELS).map(([key, info]) => (
                                            <option key={key} value={key}>{info.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Saflık</label>
                                    <select
                                        value={inputConfig.itemClarity}
                                        onChange={(e) => setInputConfig(prev => ({ ...prev, itemClarity: e.target.value }))}
                                        className="w-full px-2 py-1.5 text-xs text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                                    >
                                        {Object.entries(CLARITY_LEVELS).map(([key, info]) => (
                                            <option key={key} value={key}>{info.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">
                                    Adet (Miktar)
                                </label>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-orange-500" />
                                    <SmartInput
                                        value={input.corCount}
                                        onChange={(val) => handleInputChange("corCount", val)}
                                        min={1}
                                        className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Target Mode Inputs */}
            {mode === 'target' && (
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                    {/* Base Element Selection */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">Taş Türü</label>
                        <select
                            value={targetConfig.baseElement}
                            onChange={(e) => setTargetConfig(prev => ({ ...prev, baseElement: e.target.value }))}
                            className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                        >
                            {Object.entries(ELEMENTS).map(([key, info]) => (
                                <option key={key} value={key}>{info.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Grade */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">Hedef Sınıf</label>
                        <select
                            value={targetConfig.targetGrade}
                            onChange={(e) => setTargetConfig(prev => ({ ...prev, targetGrade: e.target.value }))}
                            className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                        >
                            {Object.entries(CLASS_LEVELS).map(([key, info]) => (
                                <option key={key} value={key}>{info.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Clarity */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">Hedef Saflık</label>
                        <select
                            value={targetConfig.targetClarity}
                            onChange={(e) => setTargetConfig(prev => ({ ...prev, targetClarity: e.target.value }))}
                            className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                        >
                            {Object.entries(CLARITY_LEVELS).map(([key, info]) => (
                                <option key={key} value={key}>{info.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Cor Price Input */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Cor Draconis Fiyatı (Yang)
                </label>
                <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <SmartInput
                        value={input.corPrice}
                        onChange={(val) => handleInputChange("corPrice", val)}
                        min={0}
                        className="flex-1 px-3 py-2 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/50"
                        placeholder="0"
                    />
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                    Maliyet hesabı için (opsiyonel): {formatCurrency(input.corPrice)} Yang
                </p>
            </div>

            {/* Production Strategy */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-400" />
                    Üretim Stratejisi
                </h4>

                {/* Target Class */}
                <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">
                        Hedef Sınıf (Hangi seviyeye kadar?)
                    </label>
                    <select
                        value={config.targetClass}
                        onChange={(e) => handleConfigChange("targetClass", e.target.value)}
                        className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    >
                        {TARGET_CLASS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Clarity Toggle */}
                <div
                    onClick={toggleClarity}
                    className={`
                        flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                        ${config.upgradeClarity
                            ? 'bg-violet-500/20 border-violet-500/40'
                            : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                        }
                    `}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${config.upgradeClarity ? 'text-violet-400' : 'text-zinc-500'}`} />
                        <span className={`text-sm ${config.upgradeClarity ? 'text-white' : 'text-zinc-400'}`}>
                            Saflık Yükselt
                        </span>
                    </div>
                    {config.upgradeClarity ? (
                        <ToggleRight className="w-6 h-6 text-violet-400" />
                    ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                    )}
                </div>
                {config.upgradeClarity && (
                    <p className="text-xs text-violet-300/70 -mt-2 pl-1">
                        Hedef sınıftaki taşların saflığı yükseltilecek
                    </p>
                )}
            </div>

            {/* Simulation Count */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Simülasyon Sayısı: <span className="text-white font-mono">{input.simCount}</span>
                </label>
                <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={input.simCount}
                    onChange={(e) => handleInputChange("simCount", parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            {/* Advanced Settings Accordion */}
            <details
                className="bg-zinc-900/50 rounded-xl border border-zinc-800 group"
                open={showAdvanced}
                onToggle={(e) => setShowAdvanced(e.target.open)}
            >
                <summary className="p-4 cursor-pointer list-none flex items-center justify-between hover:bg-zinc-800/30 transition-colors rounded-xl">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-400">Gelişmiş Sunucu Ayarları</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 pt-0 space-y-4">

                    {/* Active Elements */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2">Aktif Elementler</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(ELEMENTS).map(([key, info]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleElement(key)}
                                    className={`
                                        px-3 py-1.5 text-xs rounded-lg border transition-all
                                        ${config.activeElements?.includes(key)
                                            ? `${info.bgColor} ${info.borderColor} text-white`
                                            : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                                        }
                                    `}
                                >
                                    {info.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cor Output */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2">Cor İçeriği (Ne atıyor?)</label>
                        <select
                            value={config.corOutput}
                            onChange={(e) => handleConfigChange("corOutput", e.target.value)}
                            className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            {COR_OUTPUT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Sınıf Birleştirme</label>
                            <SmartInput
                                value={config.requirements?.classUpgrade ?? 2}
                                onChange={(val) => handleRequirementChange("classUpgrade", val)}
                                min={2}
                                max={10}
                                className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Saflık Birleştirme</label>
                            <SmartInput
                                value={config.requirements?.clarityUpgrade ?? 2}
                                onChange={(val) => handleRequirementChange("clarityUpgrade", val)}
                                min={2}
                                max={10}
                                className="w-full px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Sınıf Şansı %</label>
                            <div className="flex items-center gap-2">
                                <SmartInput
                                    value={config.rates?.class ?? 50}
                                    onChange={(val) => handleRateChange("class", val)}
                                    min={1}
                                    max={100}
                                    className="flex-1 px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                                />
                                <Percent className="w-4 h-4 text-zinc-600" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Saflık Şansı %</label>
                            <div className="flex items-center gap-2">
                                <SmartInput
                                    value={config.rates?.clarity ?? 70}
                                    onChange={(val) => handleRateChange("clarity", val)}
                                    min={1}
                                    max={100}
                                    className="flex-1 px-2 py-1.5 text-sm font-mono text-white bg-zinc-950 border border-zinc-700 rounded-lg"
                                />
                                <Percent className="w-4 h-4 text-zinc-600" />
                            </div>
                        </div>
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
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/30"
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
                        {mode === 'inventory' ? 'Simülasyonu Başlat' : 'Maliyeti Hesapla'}
                    </>
                )}
            </button>

            {/* Progress Bar */}
            {isRunning && (
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
